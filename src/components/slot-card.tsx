
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Slot, Venue, Sport } from "@/types/venue";
import { TimeIcon, PriceIcon } from "@/utils/iconMapping";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SlotCardProps {
  slot: Slot;
  className?: string;
}

export function SlotCard({ slot, className }: SlotCardProps) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sport, setSport] = useState<Sport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Get venue info
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', slot.venue_id)
          .single();
        
        if (venueError) throw venueError;
        setVenue(venueData);
        
        // Get sport info
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*')
          .eq('id', slot.sport_id)
          .single();
        
        if (sportError) throw sportError;
        setSport(sportData);
      } catch (error) {
        console.error("Error fetching slot details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
  }, [slot.venue_id, slot.sport_id]);
  
  if (isLoading) {
    return (
      <Card className={cn("transition-all hover:shadow-lg rounded-2xl animate-pulse", className)}>
        <CardContent className="p-5">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!venue || !sport) return null;
  
  // Format date
  const formattedDate = format(new Date(slot.date), "EEE, dd MMM yyyy");

  return (
    <Card className={cn("transition-all hover:shadow-lg rounded-2xl", className)}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{sport.name}</h3>
            <p className="text-sm text-gray-500">{venue.name}</p>
          </div>
          <div className="flex items-center text-sports-orange font-semibold bg-sports-lightOrange/50 px-3 py-1 rounded-full">
            <PriceIcon className="h-4 w-4 mr-1" />
            <span>₹{slot.price}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium">{formattedDate}</p>
          <div className="flex items-center text-gray-500">
            <TimeIcon className="h-4 w-4 mr-1 text-sports-blue" />
            <span className="text-sm">{slot.start_time} - {slot.end_time}</span>
          </div>
        </div>
        
        <Link to={`/booking?slotId=${slot.id}`}>
          <Button 
            className={cn(
              "w-full rounded-xl shadow-sm hover:shadow-md",
              slot.available 
                ? "bg-gradient-to-r from-sports-blue to-sports-blue/90" 
                : "bg-gray-200 text-gray-500"
            )}
            disabled={!slot.available}
          >
            {slot.available ? "Book Now" : "Not Available"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
