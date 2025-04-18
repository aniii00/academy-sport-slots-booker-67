
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format, parse, isValid } from "date-fns";
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
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to book a slot");
      navigate("/auth", { replace: true });
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
        setError(null);
        console.log("Fetching slot with ID:", slotId);
        
        // First, check if this is a temp ID (for newly generated slots)
        if (slotId.startsWith('temp-')) {
          // Extract details from the temp ID - handle dashes in UUIDs properly
          const tempParts = slotId.split('-');
          if (tempParts.length < 6) {
            throw new Error("Invalid temporary slot ID format");
          }
          
          // Extract the venue ID and sport ID
          // Format: temp-venueID-sportID-date-time
          let venueIdParts = [];
          let sportIdParts = [];
          let dateIndex = 0;
          
          // UUID format has 5 sections separated by dashes (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
          // First UUID starts at index 1 (after "temp-")
          for (let i = 1; i < tempParts.length - 2; i++) {
            // Try to extract venue ID first (assuming it's the first UUID after "temp-")
            if (venueIdParts.length < 5) {
              venueIdParts.push(tempParts[i]);
              if (venueIdParts.length === 5) {
                dateIndex = i + 1; // Mark where we expect to find the sport ID
              }
            }
            // Then extract sport ID (which comes after venue ID)
            else if (sportIdParts.length < 5) {
              sportIdParts.push(tempParts[i]);
              if (sportIdParts.length === 5) {
                dateIndex = i + 1; // Mark where we expect to find the date
              }
            }
          }
          
          // Reconstruct UUIDs
          const venueId = venueIdParts.join('-');
          const sportId = sportIdParts.join('-');
          
          // Extract date and time
          const date = tempParts[tempParts.length - 2];
          const time = tempParts[tempParts.length - 1];
          
          console.log("Extracted venue ID:", venueId);
          console.log("Extracted sport ID:", sportId);
          console.log("Date:", date);
          console.log("Time:", time);
          
          // Validate extracted data
          if (!venueId || !sportId || !date || !time) {
            throw new Error("Failed to extract slot details from ID");
          }
          
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
          // Safely calculate end time
          let endTime;
          try {
            // Parse the time string into a Date object (using a dummy date)
            const timeObj = parse(time, 'HH:mm:ss', new Date());
            // Add 30 minutes
            timeObj.setMinutes(timeObj.getMinutes() + 30);
            // Format back to string
            endTime = format(timeObj, 'HH:mm:ss');
          } catch (timeError) {
            console.error("Time parsing error:", timeError);
            // Fallback simple calculation for end time
            const [hours, minutes] = time.split(':').map(Number);
            const endMinutes = (minutes + 30) % 60;
            const endHours = hours + Math.floor((minutes + 30) / 60);
            endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;
          }
          
          const tempSlot: Slot = {
            id: slotId,
            venue_id: venueId,
            sport_id: sportId,
            date: date,
            start_time: time,
            end_time: endTime,
            price: 0, // Will be determined later
            available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setSlot(tempSlot);
          setVenue(venueData);
          setSport(sportData);
          
          // Determine price based on venue pricing rules
          const { data: pricingData, error: pricingError } = await supabase
            .from('venue_pricing')
            .select('*')
            .eq('venue_id', venueId);
          
          if (pricingError) throw pricingError;
          
          // Default price if no pricing rules match
          let price = 500;
          
          if (pricingData && pricingData.length > 0) {
            // Try to determine the day of week from the date
            let dayOfWeek;
            try {
              // Parse the date string into a Date object
              const dateObj = new Date(date);
              if (!isNaN(dateObj.getTime())) {
                dayOfWeek = format(dateObj, 'EEEE').toLowerCase();
              }
            } catch (dateError) {
              console.error("Error parsing date:", dateError);
              // Continue with default price if date parsing fails
            }

            if (dayOfWeek) {
              // Determine if morning or evening based on time
              const hourNum = parseInt(time.split(':')[0], 10);
              const isMorning = hourNum < 12;
              
              // Filter by morning/evening
              const filteredPricing = pricingData.filter(p => p.is_morning === isMorning);
              
              // First try day-specific pricing
              const daySpecificPricing = filteredPricing.find(p => p.day_group.toLowerCase() === dayOfWeek);
              if (daySpecificPricing) {
                price = daySpecificPricing.price;
              } else {
                // Day group (weekday vs weekend)
                const isWeekend = ['friday', 'saturday', 'sunday'].includes(dayOfWeek);
                
                if (isWeekend) {
                  const pricing = filteredPricing.find(p => p.day_group === 'friday-sunday');
                  if (pricing) price = pricing.price;
                } else {
                  const pricing = filteredPricing.find(p => p.day_group === 'monday-thursday');
                  if (pricing) price = pricing.price;
                }
                
                // Fallback to general pricing
                if (price === 500) {
                  const generalPricing = filteredPricing.find(p => p.day_group === 'monday-sunday');
                  if (generalPricing) price = generalPricing.price;
                }
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
        setError(error.message || "Failed to load booking details");
        toast.error("Failed to load booking details");
        setTimeout(() => {
          navigate("/slots");
        }, 2000);
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
      // Properly format the date and time for a timestamp without timezone
      // Format should be: YYYY-MM-DD HH:MM:SS
      let slotDateTime;
      
      try {
        // Make sure we have a valid date and time
        if (!slot.date || !slot.start_time) {
          throw new Error("Missing date or time information");
        }
        
        // Ensure date is in YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.date)) {
          throw new Error(`Invalid date format: ${slot.date}`);
        }
        
        const dateStr = slot.date;
        const timeStr = slot.start_time;
        
        // Combine date and time into proper format
        slotDateTime = `${dateStr} ${timeStr}`;
        
        // Validate the format
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(slotDateTime)) {
          throw new Error(`Invalid date/time format: ${slotDateTime}`);
        }
        
        console.log("Slot date/time for database:", slotDateTime);
      } catch (dateError) {
        console.error("Date construction error:", dateError);
        // Use current date as fallback
        const now = new Date();
        slotDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');
        console.log("Using fallback date/time:", slotDateTime);
      }
      
      const booking = {
        user_id: user.id,
        venue_id: venue.id,
        sport_id: sport.id,
        slot_id: slot.id.startsWith('temp-') ? null : slot.id,
        slot_time: slotDateTime,
        status: 'confirmed',
        full_name: name,
        phone: phone,
        amount: slot.price || 0
      };
      
      console.log("Creating booking with data:", booking);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
      
      if (error) {
        console.error("Booking error:", error);
        
        // Check if it's a date/time format error
        if (error.message.includes("date/time") || error.message.includes("out of range")) {
          toast.error("Failed to save booking: Invalid date/time format. Please try a different slot.");
        } else {
          toast.error("Failed to save booking: " + error.message);
        }
        return;
      }
      
      console.log("Booking created successfully:", data);
      
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
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Error: {error}</h3>
        <Button onClick={() => navigate("/slots")} className="mt-4">
          Return to Slots
        </Button>
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
  
  // Format date for display with proper error handling
  let formattedDate = "Invalid date";
  try {
    // For the display on the booking page, make sure we parse and format correctly
    const dateObj = new Date(slot.date);
    
    if (!isNaN(dateObj.getTime())) {
      // This formats to: "Saturday, April 19, 2025"
      formattedDate = format(dateObj, "EEEE, MMMM d, yyyy");
    } else {
      throw new Error(`Unable to parse date: ${slot.date}`);
    }
  } catch (dateError) {
    console.error("Error formatting date:", dateError);
    formattedDate = slot.date; // Fallback to the raw date
  }
  
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
