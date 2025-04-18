import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { VenueCard } from "@/components/venue-card";
import { FilterBar, FilterState } from "@/components/filter-bar";
import { supabase } from "@/integrations/supabase/client";
import type { Venue, Sport } from "@/types/venue";
import { toast } from "@/components/ui/sonner";

const backgroundImages: Record<string, string> = {
  "Box Cricket": "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/bf5eba969b22e1cf97c9a1443218210e.jpg",
  "Box Football": "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/8a8deeb0809e534ecad138a22389e1ad.jpg",
};

export default function Venue() {
  const [searchParams] = useSearchParams();
  const initialSportId = searchParams.get('sportId') || undefined;

  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [duplicates, setDuplicates] = useState<{ [key: string]: Venue[] }>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: venueData, error: venueError } = await supabase.from("venues").select("*");
        if (venueError) throw venueError;

        const { data: sportData, error: sportError } = await supabase.from("sports").select("*");
        if (sportError) throw sportError;

        const { data: venueSportData, error: venueSportError } = await supabase.from("venue_sports").select("*");
        if (venueSportError) throw venueSportError;

        setVenues(venueData || []);
        setFilteredVenues(venueData || []);
        setSports(sportData || []);

        const duplicateVenues: { [key: string]: Venue[] } = {};
        venueData?.forEach((venue) => {
          if (!duplicateVenues[venue.name]) duplicateVenues[venue.name] = [];
          duplicateVenues[venue.name].push(venue);
        });

        const actualDuplicates: { [key: string]: Venue[] } = {};
        Object.entries(duplicateVenues).forEach(([name, venues]) => {
          if (venues.length > 1) actualDuplicates[name] = venues;
        });

        setDuplicates(actualDuplicates);

        if (initialSportId) {
          const sport = sportData?.find((s) => s.id === initialSportId);
          if (sport) {
            setSelectedSport(sport);
            const venuesWithSport = venueSportData?.filter((vs) => vs.sport_id === initialSportId).map((vs) => vs.venue_id);
            setFilteredVenues(venueData?.filter((v) => venuesWithSport?.includes(v.id)) || []);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load venues and sports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialSportId]);

  const handleFilterChange = async (filters: FilterState) => {
    try {
      let filtered = [...venues];

      if (filters.sportId) {
        const { data: venueSportData, error } = await supabase.from("venue_sports").select("venue_id").eq("sport_id", filters.sportId);
        if (error) throw error;

        const sportVenueIds = venueSportData.map((vs) => vs.venue_id);
        filtered = filtered.filter((venue) => sportVenueIds.includes(venue.id));

        const sport = sports.find((s) => s.id === filters.sportId);
        setSelectedSport(sport || undefined);
      } else {
        setSelectedSport(undefined);
      }

      if (filters.location) {
        filtered = filtered.filter((venue) => venue.location === filters.location);
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (venue) =>
            venue.name.toLowerCase().includes(term) ||
            venue.location.toLowerCase().includes(term) ||
            venue.address.toLowerCase().includes(term)
        );
      }

      setFilteredVenues(filtered);
    } catch (error: any) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters");
    }
  };

  const handleRemoveDuplicate = async (venueId: string) => {
    try {
      await supabase.from("venue_sports").delete().eq("venue_id", venueId);
      await supabase.from("venue_timings").delete().eq("venue_id", venueId);
      await supabase.from("venue_pricing").delete().eq("venue_id", venueId);
      await supabase.from("venues").delete().eq("id", venueId);

      setVenues((prev) => prev.filter((v) => v.id !== venueId));
      setFilteredVenues((prev) => prev.filter((v) => v.id !== venueId));

      setDuplicates((prev) => {
        const updated = { ...prev };
        Object.entries(updated).forEach(([name, venues]) => {
          updated[name] = venues.filter((v) => v.id !== venueId);
          if (updated[name].length <= 1) delete updated[name];
        });
        return updated;
      });

      toast.success("Duplicate venue removed successfully");
    } catch (error: any) {
      console.error("Error removing duplicate:", error);
      toast.error("Failed to remove duplicate venue");
    }
  };

  const backgroundImage = selectedSport?.name && backgroundImages[selectedSport.name];

  return (
    <div
      className={`relative transition-all duration-700 min-h-screen p-4 ${
        backgroundImage ? "bg-cover bg-center" : "bg-gray-50"
      }`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      }}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50 z-0" />}
      <div className="relative z-10">
        <PageHeader
          title={selectedSport ? `${selectedSport.name} Venues` : "All Venues"}
          subtitle={
            selectedSport
              ? `Find venues offering ${selectedSport.name}`
              : "Browse all our sports venues across locations"
          }
          showBackButton={!!selectedSport}
        />

        <FilterBar onFilterChange={handleFilterChange} className="mb-6" />

        {Object.keys(duplicates).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="text-amber-800 font-semibold mb-2">Duplicate Venues Detected</h3>
            {Object.entries(duplicates).map(([name, dupes]) => (
              <div key={name} className="mb-4">
                <p className="font-medium">{name} ({dupes.length} instances)</p>
                <div className="mt-2 grid gap-2">
                  {dupes.map((venue) => (
                    <div key={venue.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <p className="text-sm font-mono text-gray-600">ID: {venue.id}</p>
                        <p className="text-sm">{venue.address}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveDuplicate(venue.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Loading venues...</h3>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No venues found</h3>
            <p className="text-gray-500">Try adjusting your filters to find more venues</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} selectedSportId={selectedSport?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

