
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { VenueCard } from "@/components/venue-card";
import { FilterBar, FilterState } from "@/components/filter-bar";
import { supabase } from "@/integrations/supabase/client";
import { Venue, Sport } from "@/types/venue";
import { toast } from "@/components/ui/sonner";

export default function Venue() {
  const [searchParams] = useSearchParams();
  const initialSportId = searchParams.get('sportId') || undefined;
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch venues and sports from Supabase
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch venues
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*');
        
        if (venueError) throw venueError;
        
        // Fetch sports
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*');
        
        if (sportError) throw sportError;
        
        // Fetch venue_sports relationships
        const { data: venueSportData, error: venueSportError } = await supabase
          .from('venue_sports')
          .select('*');
        
        if (venueSportError) throw venueSportError;
        
        // Process data
        setVenues(venueData || []);
        setFilteredVenues(venueData || []);
        setSports(sportData || []);
        
        // Set initial sport filter if sportId is in URL
        if (initialSportId) {
          const sport = sportData?.find(s => s.id === initialSportId);
          if (sport) {
            setSelectedSport(sport);
            
            // Filter venues by sport
            const venuesWithSport = venueSportData
              ?.filter(vs => vs.sport_id === initialSportId)
              .map(vs => vs.venue_id);
            
            setFilteredVenues(venueData?.filter(v => venuesWithSport?.includes(v.id)) || []);
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
      
      // Filter by sport
      if (filters.sportId) {
        const { data: venueSportData, error } = await supabase
          .from('venue_sports')
          .select('venue_id')
          .eq('sport_id', filters.sportId);
        
        if (error) throw error;
        
        const sportVenueIds = venueSportData.map(vs => vs.venue_id);
        filtered = filtered.filter(venue => sportVenueIds.includes(venue.id));
        
        const sport = sports.find(s => s.id === filters.sportId);
        if (sport) setSelectedSport(sport);
        else setSelectedSport(undefined);
      } else {
        setSelectedSport(undefined);
      }
      
      // Filter by location
      if (filters.location) {
        filtered = filtered.filter(venue => venue.location === filters.location);
      }
      
      // Filter by search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(venue => 
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
  
  return (
    <div>
      <PageHeader 
        title={selectedSport ? `${selectedSport.name} Venues` : "All Venues"}
        subtitle={selectedSport 
          ? `Find venues offering ${selectedSport.name}`
          : "Browse all our sports venues across locations"
        }
        showBackButton={!!selectedSport}
      />
      
      <FilterBar onFilterChange={handleFilterChange} className="mb-6" />
      
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
            <VenueCard 
              key={venue.id} 
              venue={venue} 
              selectedSportId={selectedSport?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
