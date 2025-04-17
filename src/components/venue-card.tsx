
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationIcon, ArrowRightIcon } from "@/utils/iconMapping";
import { Venue, Sport, VenueSport } from "@/types/venue";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface VenueCardProps {
  venue: Venue;
  selectedSportId?: string;
  className?: string;
}

export function VenueCard({ venue, selectedSportId, className }: VenueCardProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        // Get all sports for this venue
        const { data: venueSportsData, error: venueSportsError } = await supabase
          .from('venue_sports')
          .select('sport_id')
          .eq('venue_id', venue.id);
        
        if (venueSportsError) throw venueSportsError;
        
        if (venueSportsData && venueSportsData.length > 0) {
          const sportIds = venueSportsData.map(vs => vs.sport_id);
          
          // Get details for these sports
          const { data: sportsData, error: sportsError } = await supabase
            .from('sports')
            .select('*')
            .in('id', sportIds);
          
          if (sportsError) throw sportsError;
          
          setSports(sportsData || []);
        }
      } catch (error) {
        console.error("Error fetching sports for venue:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSports();
  }, [venue.id]);

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg rounded-2xl", className)}>
      <div className="aspect-video overflow-hidden rounded-t-2xl">
        <img 
          src={venue.image || '/placeholder.svg'} 
          alt={venue.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-1">{venue.name}</h3>
        <div className="flex items-center text-gray-500 mb-3">
          <LocationIcon className="h-4 w-4 mr-1 text-sports-blue" />
          <span className="text-sm">{venue.address}</span>
        </div>
        <div className="mb-3">
          <p className="text-sm text-gray-500">Available Sports:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {isLoading ? (
              <span className="text-sm text-gray-500">Loading sports...</span>
            ) : sports.length === 0 ? (
              <span className="text-sm text-gray-500">No sports available</span>
            ) : (
              sports.map((sport) => (
                <span 
                  key={sport.id} 
                  className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-gray-100 to-gray-50 rounded-full shadow-sm"
                >
                  {sport.name}
                </span>
              ))
            )}
          </div>
        </div>
        <Link 
          to={`/slots?venueId=${venue.id}${selectedSportId ? `&sportId=${selectedSportId}` : ''}`}
        >
          <Button className="w-full bg-gradient-to-r from-sports-blue to-sports-blue/90 rounded-xl shadow-sm hover:shadow-md">
            View Slots
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
