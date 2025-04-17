
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPinIcon, ClockIcon, StarIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { Venue, Sport } from "@/types/venue";

// Define types for the time slots and preferences
interface TimeSlot {
  id: string;
  centerId: string;
  sportId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  available: boolean;
}

interface UserPreferences {
  favorite_sports: string[];
  preferred_timing: string[];
  venue_type: string;
}

export function SmartRecommendations() {
  const { user, profile } = useAuth();
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [recommendedVenues, setRecommendedVenues] = useState<Venue[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [previousBookings, setPreviousBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user preferences and make recommendations
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch user preferences
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (preferencesError) throw preferencesError;
        
        if (preferencesData) {
          setUserPreferences(preferencesData);
          
          // Fetch recommended venues based on preferences
          if (preferencesData.favorite_sports && preferencesData.favorite_sports.length > 0) {
            const { data: venueData, error: venueError } = await supabase
              .from('venue_sports')
              .select('venue_id, venues(*)')
              .in('sport_id', preferencesData.favorite_sports)
              .limit(2);
              
            if (venueError) throw venueError;
            
            if (venueData) {
              const venues = venueData.map(item => item.venues).filter(Boolean);
              setRecommendedVenues(venues);
            }
          }
          
          // Fetch previous bookings
          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select('*, venues(*), sports(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(2);
            
          if (bookingError) throw bookingError;
          setPreviousBookings(bookingData || []);
          
          // Fetch available slots for favorite sports
          if (preferencesData.favorite_sports && preferencesData.favorite_sports.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const { data: slotData, error: slotError } = await supabase
              .from('slots')
              .select('*, venues(*), sports(*)')
              .in('sport_id', preferencesData.favorite_sports)
              .gte('date', today)
              .eq('available', true)
              .order('date', { ascending: true })
              .limit(2);
              
            if (slotError) throw slotError;
            setAvailableSlots(slotData || []);
          }
        }
      } catch (error: any) {
        console.error("Error fetching recommendations:", error);
        toast.error("Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Only show recommendations for logged-in users
  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Sign in to get personalized recommendations</h3>
        <p className="text-muted-foreground mb-4">
          We'll help you find the perfect sports venue based on your preferences.
        </p>
        <Link to="/auth">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Smart Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Smart Recommendations</h2>
      
      {/* Near Your Location */}
      {recommendedVenues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-sports-lightBlue to-sports-lightBlue/70 shadow-sm">
              <MapPinIcon className="h-5 w-5 text-sports-blue" />
            </div>
            <h3 className="text-lg font-semibold">Based on Your Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedVenues.map((venue) => (
              <Link key={venue.id} to={`/slots?centerId=${venue.id}`}>
                <Card className="transition-all hover:shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{venue.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{venue.location}</p>
                    <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg shadow-sm hover:shadow-md">
                      View Slots
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Available Slots */}
      {availableSlots.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-sports-lightOrange to-sports-lightOrange/70 shadow-sm">
              <StarIcon className="h-5 w-5 text-sports-orange" />
            </div>
            <h3 className="text-lg font-semibold">Available Slots for Your Favorite Sports</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSlots.map((slot) => (
              <Link key={slot.id} to={`/booking?slotId=${slot.id}`}>
                <Card className="transition-all hover:shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{slot.sports.name} at {slot.venues.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <ClockIcon className="h-4 w-4 mr-1 text-sports-blue" />
                      {slot.date} • {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-medium text-sports-orange">₹{slot.price}</span>
                      <Button size="sm" className="rounded-lg shadow-sm hover:shadow-md">Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Based on Past Bookings */}
      {previousBookings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 shadow-sm">
              <ClockIcon className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold">Based on Your Previous Bookings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousBookings.map((booking) => (
              <Link key={booking.id} to={`/slots?centerId=${booking.venue_id}`}>
                <Card className="transition-all hover:shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{booking.venues?.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{booking.venues?.location}</p>
                    <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg shadow-sm hover:shadow-md">
                      Book Again
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* No recommendations yet */}
      {!recommendedVenues.length && !availableSlots.length && !previousBookings.length && (
        <div className="text-center py-6">
          <p className="text-gray-500">No recommendations available yet. Start by setting your preferences and making bookings.</p>
        </div>
      )}
    </div>
  );
}
