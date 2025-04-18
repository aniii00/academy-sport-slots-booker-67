import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Slot, Venue, Sport } from "@/types/venue";
import { TimeIcon, PriceIcon } from "@/utils/iconMapping";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

interface SlotCardProps {
  slot: Slot;
  className?: string;
}

export function SlotCard({ slot, className }: SlotCardProps) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sport, setSport] = useState<Sport | null>(null);
  const [isBooked, setIsBooked] = useState(!slot.available);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', slot.venue_id)
          .single();
        
        if (venueError) throw venueError;
        setVenue(venueData);
        
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*')
          .eq('id', slot.sport_id)
          .single();
        
        if (sportError) throw sportError;
        setSport(sportData);
        
        if (slot.id.startsWith('temp-')) {
          try {
            const dateStr = slot.date.includes('-') 
              ? slot.date 
              : `${slot.date.substring(0, 4)}-${slot.date.substring(4, 6)}-${slot.date.substring(6, 8)}`;
              
            const timeStr = slot.start_time.includes(':') 
              ? slot.start_time 
              : `${slot.start_time.substring(0, 2)}:${slot.start_time.substring(2, 4)}:${slot.start_time.length > 4 ? slot.start_time.substring(4, 6) : '00'}`;
              
            const slotDateTime = `${dateStr}T${timeStr}`;
            
            const testDate = new Date(slotDateTime);
            if (!isValid(testDate)) {
              throw new Error("Invalid date format");
            }
            
            const { data: existingBookings, error: bookingsError } = await supabase
              .from('bookings')
              .select('*')
              .eq('venue_id', slot.venue_id)
              .eq('sport_id', slot.sport_id)
              .eq('slot_time', slotDateTime);
            
            if (bookingsError) throw bookingsError;
            
            if (existingBookings && existingBookings.length > 0) {
              setIsBooked(true);
            }
          } catch (error) {
            console.error("Error checking bookings:", error);
          }
        }
        
        const bookingChannel = supabase
          .channel('booking-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings'
            },
            (payload: any) => {
              if (payload.new && 
                  payload.new.venue_id === slot.venue_id && 
                  payload.new.sport_id === slot.sport_id) {
                  
                if (slot.id.startsWith('temp-')) {
                  try {
                    const dateStr = slot.date.includes('-') 
                      ? slot.date 
                      : `${slot.date.substring(0, 4)}-${slot.date.substring(4, 6)}-${slot.date.substring(6, 8)}`;
                      
                    const timeStr = slot.start_time.includes(':') 
                      ? slot.start_time 
                      : `${slot.start_time.substring(0, 2)}:${slot.start_time.substring(2, 4)}:${slot.start_time.length > 4 ? slot.start_time.substring(4, 6) : '00'}`;
                      
                    const slotDateTime = `${dateStr}T${timeStr}`;
                    
                    if (payload.new.slot_time === slotDateTime) {
                      setIsBooked(true);
                    }
                  } catch (error) {
                    console.error("Error checking slot match:", error);
                  }
                } 
                else if (payload.new.slot_id === slot.id) {
                  setIsBooked(true);
                }
              }
            }
          )
          .subscribe();
          
        const slotChannel = supabase
          .channel('slot-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'slots',
              filter: `id=eq.${slot.id}`
            },
            (payload: any) => {
              if (!slot.id.startsWith('temp-')) {
                setIsBooked(!payload.new.available);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(bookingChannel);
          supabase.removeChannel(slotChannel);
        };
      } catch (error) {
        console.error("Error fetching slot details:", error);
        toast.error("Error loading slot details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
  }, [slot.venue_id, slot.sport_id, slot.id, slot.date, slot.start_time]);
  
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
  
  let formattedDate;
  try {
    const dateStr = slot.date.includes('-') 
      ? slot.date 
      : `${slot.date.substring(0, 4)}-${slot.date.substring(4, 6)}-${slot.date.substring(6, 8)}`;
    
    const isoDateStr = `${dateStr}T00:00:00Z`;
    const dateObj = parseISO(isoDateStr);
    
    if (!isValid(dateObj)) {
      throw new Error("Invalid date");
    }
    
    formattedDate = formatDateForDisplay(isoDateStr, "EEE, dd MMM yyyy");
  } catch (error) {
    console.error("Date formatting error:", error, slot.date);
    formattedDate = "Invalid date";
  }

  const slotId = encodeURIComponent(slot.id);
  const bookingUrl = `/booking?slotId=${slotId}`;

  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-lg rounded-2xl", 
        isBooked ? "opacity-75" : "hover:scale-102",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{sport?.name}</h3>
            <p className="text-sm text-gray-500">{venue?.name}</p>
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
        
        <div className="flex justify-between items-center">
          {isBooked ? (
            <Badge 
              variant="secondary" 
              className="w-full justify-center py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              Already Booked
            </Badge>
          ) : (
            <Link to={bookingUrl} className="w-full">
              <Button 
                className="w-full rounded-xl shadow-sm hover:shadow-md bg-gradient-to-r from-sports-blue to-sports-blue/90 hover:scale-102 transition-all"
              >
                Book Now
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
