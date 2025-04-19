
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EditIcon, DeleteIcon } from "@/utils/iconMapping";
import { centers, sports } from "@/data/mockData";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Venue } from "@/types/venue";
import { toast } from "@/components/ui/sonner";

export function VenuesTab() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sportsList, setSportsList] = useState<{ id: string, name: string }[]>([]);
  const [venueSports, setVenueSports] = useState<{[venueId: string]: string[]}>({}); 

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setVenues(data || []);
        
        // Fetch sports for each venue
        for (const venue of data || []) {
          const { data: venueSportData, error: venueSportError } = await supabase
            .from('venue_sports')
            .select('sport_id')
            .eq('venue_id', venue.id);
          
          if (!venueSportError && venueSportData) {
            const sportIds = venueSportData.map(item => item.sport_id);
            setVenueSports(prev => ({
              ...prev,
              [venue.id]: sportIds
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Failed to load venues");
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchSports = async () => {
      try {
        const { data, error } = await supabase
          .from('sports')
          .select('id, name');
        
        if (error) throw error;
        setSportsList(data || []);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };
    
    fetchVenues();
    fetchSports();
  }, []);

  const getSportNamesForVenue = (venueId: string) => {
    const sportIds = venueSports[venueId] || [];
    return sportIds
      .map(id => sportsList.find(sport => sport.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-md w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all venues</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Sports</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No venues found
              </TableCell>
            </TableRow>
          ) : (
            venues.map((venue) => (
              <TableRow key={venue.id}>
                <TableCell className="font-medium">{venue.name}</TableCell>
                <TableCell>{venue.location}</TableCell>
                <TableCell>{venue.address}</TableCell>
                <TableCell>
                  {getSportNamesForVenue(venue.id)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <DeleteIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
