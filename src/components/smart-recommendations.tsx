import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPinIcon, ClockIcon, StarIcon } from "lucide-react";
import { centers, sports, generateTimeSlots, Center, Sport, TimeSlot } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

// Mock user preferences (in a real app, this would come from user profile/database)
const mockUserPreferences = {
  location: "Mumbai",
  favoriteSportId: "sport-2", // Badminton
  pastBookings: ["center-1", "center-3"]
};

export function SmartRecommendations() {
  const { user } = useAuth();
  const [locationBasedCenters, setLocationBasedCenters] = useState<Center[]>([]);
  const [favoriteSlots, setFavoriteSlots] = useState<TimeSlot[]>([]);
  const [previousCenters, setPreviousCenters] = useState<Center[]>([]);

  useEffect(() => {
    // Get centers based on user's location
    const centersInLocation = centers.filter(center => 
      center.city === mockUserPreferences.location
    ).slice(0, 2); // Limit to 2 recommendations
    setLocationBasedCenters(centersInLocation);
    
    // Get slots for favorite sport
    const allSlots = generateTimeSlots();
    const slotsForFavoriteSport = allSlots.filter(slot => 
      slot.sportId === mockUserPreferences.favoriteSportId && 
      slot.available
    ).slice(0, 2); // Limit to 2 recommendations
    setFavoriteSlots(slotsForFavoriteSport);
    
    // Get previously booked centers
    const previouslyBookedCenters = centers.filter(center => 
      mockUserPreferences.pastBookings.includes(center.id)
    ).slice(0, 2); // Limit to 2 recommendations
    setPreviousCenters(previouslyBookedCenters);
  }, []);

  // Get sport object for favorite sport
  const favoriteSport = sports.find(sport => sport.id === mockUserPreferences.favoriteSportId);
  
  // Only render if user is signed in
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Smart Recommendations</h2>
      
      {/* Near Your Location */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-sports-lightBlue to-sports-lightBlue/70 shadow-sm">
            <MapPinIcon className="h-5 w-5 text-sports-blue" />
          </div>
          <h3 className="text-lg font-semibold">Near Your Location</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locationBasedCenters.length > 0 ? (
            locationBasedCenters.map(center => (
              <Link key={center.id} to={`/slots?centerId=${center.id}`}>
                <Card className="transition-all hover:shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{center.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{center.location}, {center.city}</p>
                    <Button variant="outline" size="sm" className="w-full mt-2 rounded-lg shadow-sm hover:shadow-md">
                      View Slots
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">No centers found near your location</p>
          )}
        </div>
      </div>
      
      {/* For Your Favorite Sport */}
      {favoriteSport && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-sports-lightOrange to-sports-lightOrange/70 shadow-sm">
              <StarIcon className="h-5 w-5 text-sports-orange" />
            </div>
            <h3 className="text-lg font-semibold">For Your Favorite Sport: {favoriteSport.name}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteSlots.length > 0 ? (
              favoriteSlots.map(slot => {
                const center = centers.find(c => c.id === slot.centerId);
                return (
                  <Link key={slot.id} to={`/booking?slotId=${slot.id}`}>
                    <Card className="transition-all hover:shadow-lg rounded-xl overflow-hidden">
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{favoriteSport.name} at {center?.name}</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <ClockIcon className="h-4 w-4 mr-1 text-sports-blue" />
                          {slot.date} • {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="font-medium text-sports-orange">₹{slot.price}</span>
                          <Button size="sm" className="rounded-lg shadow-sm hover:shadow-md">Book Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No available slots for your favorite sport</p>
            )}
          </div>
        </div>
      )}
      
      {/* Based on Past Bookings */}
      {previousCenters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 shadow-sm">
              <ClockIcon className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold">Based on Your Previous Bookings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousCenters.map(center => (
              <Link key={center.id} to={`/slots?centerId=${center.id}`}>
                <Card className="transition-all hover:shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{center.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{center.location}, {center.city}</p>
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
    </div>
  );
}
