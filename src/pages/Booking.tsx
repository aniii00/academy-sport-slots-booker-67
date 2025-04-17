import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TimeIcon, 
  PriceIcon, 
  LocationIcon, 
  UserIcon, 
  PhoneIcon 
} from "@/utils/iconMapping";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Slot, Venue, Sport } from "@/types/venue";
import type { Booking } from "@/types/booking";

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slotId = searchParams.get('slotId');
  const { user } = useAuth();
  
  const [slot, setSlot] = useState<Slot | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sport, setSport] = useState<Sport | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to book a slot");
      navigate("/auth");
      return;
    }

    const fetchSlotDetails = async () => {
      if (!slotId) {
        toast.error("No slot selected");
        navigate("/venue");
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching slot with ID:", slotId);
        
        // First, check if this is a temp ID (for newly generated slots)
        if (slotId.startsWith('temp-')) {
          // Extract details from the temp ID - handle dashes in UUIDs properly
          const tempParts = slotId.split('-');
          if (tempParts.length < 6) {
            throw new Error("Invalid temporary slot ID format");
          }
          
          // Reconstruct venue ID and sport ID properly
          // Format: temp-venueID-sportID-date-time
          // Where venueID and sportID might contain dashes themselves
          const prefix = tempParts[0]; // "temp"
          
          // Extract the date and time (last two parts)
          const time = tempParts[tempParts.length - 1];
          const date = tempParts[tempParts.length - 2];
          
          // Everything between "temp-" and the date is the venue ID and sport ID
          // We need to determine where venue ID ends and sport ID starts
          // This is complex due to UUIDs having dashes
          
          // For simplicity, let's assume the venue ID is the first UUID after "temp-"
          // and the sport ID is the second UUID
          let venueId = "";
          let sportId = "";
          let uuidCount = 0;
          let currentUuid = "";
          
          for (let i = 1; i < tempParts.length - 2; i++) {
            currentUuid += (currentUuid.length > 0 ? '-' : '') + tempParts[i];
            
            // A complete UUID has 5 parts (4 dashes)
            if (currentUuid.split('-').length === 5) {
              if (uuidCount === 0) {
                venueId = currentUuid;
              } else if (uuidCount === 1) {
                sportId = currentUuid;
              }
              uuidCount++;
              currentUuid = "";
            }
          }
          
          if (!venueId || !sportId) {
            throw new Error("Could not extract venue ID or sport ID from temp slot ID");
          }
          
          console.log("Extracted venue ID:", venueId);
          console.log("Extracted sport ID:", sportId);
          
          // Get venue info
          const { data: venueData, error: venueError } = await supabase
            .from('venues')
            .select('*')
            .eq('id', venueId)
            .single();
          
          if (venueError) throw venueError;
          
          // Get sport info
          const { data: sportData, error: sportError } = await supabase
            .from('sports')
            .select('*')
            .eq('id', sportId)
            .single();
          
          if (sportError) throw sportError;
          
          // Create slot object from temp ID
          const endTime = new Date(`1970-01-01T${time}`);
          endTime.setMinutes(endTime.getMinutes() + 30);
          
          const tempSlot: Slot = {
            id: slotId,
            venue_id: venueId,
            sport_id: sportId,
            date: date,
            start_time: time,
            end_time: format(endTime, 'HH:mm:00'),
            price: 0, // Will be determined later
            available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setSlot(tempSlot);
          setVenue(venueData);
          setSport(sportData);
          
          // Determine price
          const { data: pricingData, error: pricingError } = await supabase
            .from('venue_pricing')
            .select('*')
            .eq('venue_id', venueId);
          
          if (pricingError) throw pricingError;
          
          const dayOfWeek = format(new Date(date), 'EEEE').toLowerCase();
          const isMorning = parseInt(time.split(':')[0]) < 12;
          
          // Logic to determine price based on pricing rules
          let price = 500; // Default
          
          if (pricingData && pricingData.length > 0) {
            // Filter by morning/evening
            const filteredPricing = pricingData.filter(p => p.is_morning === isMorning);
            
            // First try day-specific pricing
            const daySpecificPricing = filteredPricing.find(p => p.day_group.toLowerCase() === dayOfWeek);
            if (daySpecificPricing) {
              price = daySpecificPricing.price;
            } else {
              // Day group (weekday vs weekend)
              const isWeekend = ['friday', 'saturday', 'sunday'].includes(dayOfWeek);
              const hourNum = parseInt(time.split(':')[0]);
              
              if (isWeekend) {
                if (hourNum >= 16 && hourNum < 19) {
                  const pricing = filteredPricing.find(p => p.day_group === 'friday-sunday' && p.time_range === '16:00-19:00');
                  if (pricing) price = pricing.price;
                } else if (hourNum >= 19) {
                  const pricing = filteredPricing.find(p => p.day_group === 'friday-sunday' && p.time_range === '19:00-00:00');
                  if (pricing) price = pricing.price;
                }
              } else {
                if (hourNum >= 16 && hourNum < 19) {
                  const pricing = filteredPricing.find(p => p.day_group === 'monday-thursday' && p.time_range === '16:00-19:00');
                  if (pricing) price = pricing.price;
                } else if (hourNum >= 19) {
                  const pricing = filteredPricing.find(p => p.day_group === 'monday-thursday' && p.time_range === '19:00-00:00');
                  if (pricing) price = pricing.price;
                }
              }
              
              // Fallback to general pricing
              if (price === 500) {
                const generalPricing = filteredPricing.find(p => p.day_group === 'monday-sunday');
                if (generalPricing) price = generalPricing.price;
              }
            }
          }
          
          // Update slot with determined price
          tempSlot.price = price;
          setSlot({...tempSlot});
        } else {
          // For non-temp IDs, try fetching directly from the database
          console.log("Fetching regular slot from database");
          const { data: slotData, error: slotError } = await supabase
            .from('slots')
            .select('*')
            .eq('id', slotId)
            .single();
          
          if (slotError) {
            console.error("Slot fetch error:", slotError);
            throw slotError;
          }
          
          if (!slotData.available) {
            toast.error("This slot is not available for booking");
            navigate("/slots");
            return;
          }
          
          setSlot(slotData);
          
          // Get venue info
          const { data: venueData, error: venueError } = await supabase
            .from('venues')
            .select('*')
            .eq('id', slotData.venue_id)
            .single();
          
          if (venueError) throw venueError;
          setVenue(venueData);
          
          // Get sport info
          const { data: sportData, error: sportError } = await supabase
            .from('sports')
            .select('*')
            .eq('id', slotData.sport_id)
            .single();
          
          if (sportError) throw sportError;
          setSport(sportData);
        }
      } catch (error: any) {
        console.error("Error fetching slot:", error);
        toast.error("Failed to load booking details");
        navigate("/slots");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSlotDetails();
  }, [slotId, navigate, user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to book a slot");
      navigate("/auth");
      return;
    }

    if (!slot || !venue || !sport) {
      toast.error("Invalid slot selection");
      return;
    }
    
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const slotDateTime = new Date(`${slot.date}T${slot.start_time}`);
      
      const booking = {
        user_id: user.id,
        venue_id: venue.id,
        sport_id: sport.id,
        slot_id: slot.id.startsWith('temp-') ? null : slot.id,
        slot_time: slotDateTime.toISOString(),
        status: 'confirmed',
        full_name: name,
        phone: phone
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
      
      if (error) {
        console.error("Booking error:", error);
        toast.error("Failed to save booking: " + error.message);
        return;
      }
      
      // If this is a real slot (not temporary), update its availability
      if (!slot.id.startsWith('temp-')) {
        await supabase
          .from('slots')
          .update({ available: false })
          .eq('id', slot.id);
      }
      
      toast.success("Booking confirmed! You'll receive details on your phone.");
      navigate("/booking-success");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Loading booking details...</h3>
      </div>
    );
  }
  
  if (!slot || !venue || !sport) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Invalid booking details</h3>
        <Button onClick={() => navigate("/slots")} className="mt-4">
          Return to Slots
        </Button>
      </div>
    );
  }
  
  const formattedDate = format(new Date(slot.date), "EEEE, MMMM d, yyyy");
  
  return (
    <div>
      <PageHeader 
        title="Complete Your Booking" 
        subtitle="Enter your details to confirm the reservation"
        showBackButton
        backTo={`/slots?venueId=${venue.id}&sportId=${sport.id}`}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Sport</h4>
                <p className="text-lg">{sport.name}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Venue</h4>
                <div className="flex items-start">
                  <LocationIcon className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-lg">{venue.name}</p>
                    <p className="text-gray-500">{venue.address}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Date & Time</h4>
                <div className="flex items-center">
                  <TimeIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <p>{formattedDate}, {slot.start_time} - {slot.end_time}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Total Amount</h4>
                  <div className="flex items-center text-xl font-bold text-sports-orange">
                    <PriceIcon className="h-5 w-5 mr-1" />
                    <span>₹{slot.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="name" 
                      placeholder="Enter your full name" 
                      className="pl-10" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="phone" 
                      placeholder="Enter your phone number" 
                      className="pl-10" 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end pt-4 border-t">
              <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
