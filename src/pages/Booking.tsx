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
import { 
  centers, 
  sports, 
  generateTimeSlots, 
  TimeSlot 
} from "@/data/mockData";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Booking } from "@/types/booking";

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slotId = searchParams.get('slotId');
  const { user } = useAuth();
  
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (slotId) {
      const allSlots = generateTimeSlots();
      const foundSlot = allSlots.find(s => s.id === slotId);
      if (foundSlot && foundSlot.available) {
        setSlot(foundSlot);
      } else {
        toast.error("This slot is not available for booking");
        navigate("/slots");
      }
    } else {
      navigate("/slots");
    }
  }, [slotId, navigate]);
  
  const center = slot ? centers.find(c => c.id === slot.centerId) : null;
  const sport = slot ? sports.find(s => s.id === slot.sportId) : null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to book a slot");
      navigate("/auth");
      return;
    }

    if (!slot || !center || !sport) {
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
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          center_name: center.name,
          sport_type: sport.name,
          slot_time: new Date(slot.date + 'T' + slot.startTime).toISOString(),
          status: 'confirmed'
        });
      
      if (error) {
        console.error("Booking error:", error);
        toast.error("Failed to save booking: " + error.message);
        setIsSubmitting(false);
        return;
      }
      
      toast.success("Booking confirmed! You'll receive details on your phone.");
      navigate("/booking-success");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!slot || !center || !sport) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Loading booking details...</h3>
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
        backTo={`/slots?centerId=${center.id}&sportId=${sport.id}`}
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
                <h4 className="font-medium">Center</h4>
                <div className="flex items-start">
                  <LocationIcon className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-lg">{center.name}</p>
                    <p className="text-gray-500">{center.address}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Date & Time</h4>
                <div className="flex items-center">
                  <TimeIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <p>{formattedDate}, {slot.startTime} - {slot.endTime}</p>
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
