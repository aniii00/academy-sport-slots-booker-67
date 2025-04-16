
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { SlotCard } from "@/components/slot-card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@/utils/iconMapping";
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
import { 
  centers, 
  sports, 
  getSportsForCenter, 
  generateTimeSlots, 
  TimeSlot 
} from "@/data/mockData";

export default function Slots() {
  const [searchParams] = useSearchParams();
  const centerId = searchParams.get('centerId');
  const sportId = searchParams.get('sportId');
  
  const [selectedCenter, setSelectedCenter] = useState(
    centerId ? centers.find(c => c.id === centerId) : null
  );
  
  const [selectedSport, setSelectedSport] = useState(
    sportId ? sports.find(s => s.id === sportId) : null
  );
  
  const [availableSports, setAvailableSports] = useState(
    selectedCenter ? getSportsForCenter(selectedCenter.id) : []
  );
  
  const [date, setDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  
  // Load slots when center, sport, or date changes
  useEffect(() => {
    if (selectedCenter && selectedSport) {
      const allSlots = generateTimeSlots();
      const dateStr = format(date, "yyyy-MM-dd");
      
      const filtered = allSlots.filter(slot => 
        slot.centerId === selectedCenter.id && 
        slot.sportId === selectedSport.id &&
        slot.date === dateStr
      );
      
      setSlots(filtered);
    }
  }, [selectedCenter, selectedSport, date]);
  
  // Update available sports when center changes
  useEffect(() => {
    if (selectedCenter) {
      const sports = getSportsForCenter(selectedCenter.id);
      setAvailableSports(sports);
      
      // If current sport is not available at this center, reset it
      if (selectedSport && !selectedCenter.sports.includes(selectedSport.id)) {
        setSelectedSport(sports.length > 0 ? sports[0] : null);
      }
    }
  }, [selectedCenter]);
  
  // If we have centerId but no sportId, select the first sport
  useEffect(() => {
    if (selectedCenter && !selectedSport && availableSports.length > 0) {
      setSelectedSport(availableSports[0]);
    }
  }, [selectedCenter, selectedSport, availableSports]);
  
  return (
    <div>
      <PageHeader 
        title="Available Slots" 
        subtitle={selectedCenter ? `at ${selectedCenter.name}` : "Select a center and sport"}
        showBackButton
        backTo="/centers"
      />
      
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Center Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Center</label>
          <Select 
            value={selectedCenter?.id} 
            onValueChange={(value) => {
              const center = centers.find(c => c.id === value);
              setSelectedCenter(center || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a center" />
            </SelectTrigger>
            <SelectContent>
              {centers.map((center) => (
                <SelectItem key={center.id} value={center.id}>
                  {center.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Sport Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Sport</label>
          <Select 
            value={selectedSport?.id} 
            onValueChange={(value) => {
              const sport = sports.find(s => s.id === value);
              setSelectedSport(sport || null);
            }}
            disabled={!selectedCenter || availableSports.length === 0}
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
        
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={!selectedCenter || !selectedSport}
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
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {selectedCenter && selectedSport ? (
        slots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <SlotCard key={slot.id} slot={slot} />
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
          <h3 className="text-xl font-semibold mb-2">Select a center and sport</h3>
          <p className="text-gray-500">Choose a center and sport to view available slots</p>
        </div>
      )}
    </div>
  );
}
