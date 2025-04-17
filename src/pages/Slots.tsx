import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format, addDays } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { SlotCard } from "@/components/slot-card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@/utils/iconMapping";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Venue, Sport, Slot, VenuePricing } from "@/types/venue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Slots() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');
  const sportId = searchParams.get('sportId');
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*');
        
        if (venueError) throw venueError;
        setVenues(venueData || []);
        
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*');
        
        if (sportError) throw sportError;
        setSports(sportData || []);
        
        if (venueId) {
          const venue = venueData?.find(v => v.id === venueId) || null;
          setSelectedVenue(venue);
        }
        
        if (sportId) {
          const sport = sportData?.find(s => s.id === sportId) || null;
          setSelectedSport(sport);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load venues and sports");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [venueId, sportId]);
  
  useEffect(() => {
    const fetchAvailableSports = async () => {
      if (!selectedVenue) {
        setAvailableSports([]);
        return;
      }
      
      try {
        const { data: venueSportsData, error: venueSportsError } = await supabase
          .from('venue_sports')
          .select('sport_id')
          .eq('venue_id', selectedVenue.id);
        
        if (venueSportsError) throw venueSportsError;
        
        if (venueSportsData && venueSportsData.length > 0) {
          const sportIds = venueSportsData.map(vs => vs.sport_id);
          
          const availableSportsList = sports.filter(sport => sportIds.includes(sport.id));
          setAvailableSports(availableSportsList);
          
          if (selectedSport && !sportIds.includes(selectedSport.id)) {
            setSelectedSport(availableSportsList.length > 0 ? availableSportsList[0] : null);
          }
        } else {
          setAvailableSports([]);
        }
      } catch (error) {
        console.error("Error fetching available sports:", error);
        toast.error("Failed to load available sports for this venue");
      }
    };
    
    fetchAvailableSports();
  }, [selectedVenue, sports, selectedSport]);
  
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedVenue || !selectedSport) {
        setSlots([]);
        return;
      }
      
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        const { data: existingSlots, error: slotsError } = await supabase
          .from('slots')
          .select('*')
          .eq('venue_id', selectedVenue.id)
          .eq('sport_id', selectedSport.id)
          .eq('date', formattedDate);
        
        if (slotsError) throw slotsError;
        
        if (existingSlots && existingSlots.length > 0) {
          setSlots(existingSlots);
        } else {
          await generateSlotsForDate(selectedVenue.id, selectedSport.id, date);
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        toast.error("Failed to load available slots");
      }
    };
    
    fetchSlots();
  }, [selectedVenue, selectedSport, date]);
  
  const generateSlotsForDate = async (venueId: string, sportId: string, selectedDate: Date) => {
    try {
      const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: timingsData, error: timingsError } = await supabase
        .from('venue_timings')
        .select('*')
        .eq('venue_id', venueId)
        .eq('day_of_week', dayOfWeek);
      
      if (timingsError) throw timingsError;
      
      if (!timingsData || timingsData.length === 0) {
        toast.info(`No timings available for ${format(selectedDate, 'EEEE')}`);
        setSlots([]);
        return;
      }
      
      const { data: pricingData, error: pricingError } = await supabase
        .from('venue_pricing')
        .select('*')
        .eq('venue_id', venueId);
      
      if (pricingError) throw pricingError;
      
      if (!pricingData || pricingData.length === 0) {
        toast.error("No pricing information available");
        setSlots([]);
        return;
      }
      
      const generatedSlots: Slot[] = [];
      
      for (const timing of timingsData) {
        const startTime = new Date(`1970-01-01T${timing.start_time}`);
        const endTime = new Date(`1970-01-01T${timing.end_time}`);
        
        if (endTime <= startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }
        
        let currentTime = new Date(startTime);
        while (currentTime < endTime) {
          const slotStartTime = format(currentTime, 'HH:mm:00');
          
          currentTime.setMinutes(currentTime.getMinutes() + 30);
          const slotEndTime = format(currentTime, 'HH:mm:00');
          
          const price = getSlotPrice(pricingData, dayOfWeek, slotStartTime, timing.is_morning);
          
          generatedSlots.push({
            id: `temp-${venueId}-${sportId}-${formattedDate}-${slotStartTime}`,
            venue_id: venueId,
            sport_id: sportId,
            date: formattedDate,
            start_time: slotStartTime,
            end_time: slotEndTime,
            price,
            available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
      
      setSlots(generatedSlots);
    } catch (error) {
      console.error("Error generating slots:", error);
      toast.error("Failed to generate slots for this date");
    }
  };
  
  const getSlotPrice = (
    pricingData: VenuePricing[], 
    dayOfWeek: string, 
    slotTime: string,
    isMorning: boolean
  ): number => {
    const filteredPricing = pricingData.filter(p => p.is_morning === isMorning);
    
    const daySpecificPricing = filteredPricing.find(p => p.day_group.toLowerCase() === dayOfWeek);
    if (daySpecificPricing) {
      return daySpecificPricing.price;
    }
    
    const isWeekend = ['friday', 'saturday', 'sunday'].includes(dayOfWeek);
    
    let applicablePricing: VenuePricing | undefined;
    
    if (isWeekend) {
      applicablePricing = filteredPricing.find(p => 
        p.day_group === 'friday-sunday' && 
        isTimeInRange(slotTime, p.time_range)
      );
    } else {
      applicablePricing = filteredPricing.find(p => 
        p.day_group === 'monday-thursday' && 
        isTimeInRange(slotTime, p.time_range)
      );
    }
    
    if (!applicablePricing) {
      applicablePricing = filteredPricing.find(p => 
        isTimeInRange(slotTime, p.time_range)
      );
    }
    
    if (!applicablePricing) {
      applicablePricing = filteredPricing.find(p => 
        p.day_group === 'monday-sunday'
      );
    }
    
    return applicablePricing?.price || 500;
  };
  
  const isTimeInRange = (time: string, range: string): boolean => {
    const [rangeStart, rangeEnd] = range.split('-');
    const timeNum = parseInt(time.split(':')[0]);
    const startNum = parseInt(rangeStart);
    let endNum = parseInt(rangeEnd);
    
    if (endNum < startNum) {
      endNum += 24;
    }
    
    return timeNum >= startNum && timeNum < endNum;
  };
  
  return (
    <div>
      <PageHeader 
        title="Available Slots" 
        subtitle={selectedVenue ? `at ${selectedVenue.name}` : "Select a venue and sport"}
        showBackButton
        backTo="/venue"
      />
      
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Venue</label>
          <Select 
            value={selectedVenue?.id} 
            onValueChange={(value) => {
              const venue = venues.find(v => v.id === value);
              setSelectedVenue(venue || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Select Sport</label>
          <Select 
            value={selectedSport?.id} 
            onValueChange={(value) => {
              const sport = sports.find(s => s.id === value);
              setSelectedSport(sport || null);
            }}
            disabled={!selectedVenue || availableSports.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a sport" />
            </SelectTrigger>
            <SelectContent>
              {availableSports.map((sport) => (
                <SelectItem key={sport.id} value={sport.id}>
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={!selectedVenue || !selectedSport}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => setDate(newDate || new Date())}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0)) || date > addDays(new Date(), 30)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Loading...</h3>
        </div>
      ) : selectedVenue && selectedSport ? (
        slots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <SlotCard 
                key={slot.id} 
                slot={slot} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No slots available</h3>
            <p className="text-gray-500">Try selecting a different date or sport</p>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Select a venue and sport</h3>
          <p className="text-gray-500">Choose a venue and sport to view available slots</p>
        </div>
      )}
    </div>
  );
}
