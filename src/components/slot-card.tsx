
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TimeSlot, Sport, Center, sports, centers } from "@/data/mockData";
import { TimeIcon, PriceIcon } from "@/utils/iconMapping";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SlotCardProps {
  slot: TimeSlot;
  className?: string;
}

export function SlotCard({ slot, className }: SlotCardProps) {
  // Get sport and center info
  const sport = sports.find(s => s.id === slot.sportId);
  const center = centers.find(c => c.id === slot.centerId);
  
  if (!sport || !center) return null;
  
  // Format date
  const formattedDate = format(new Date(slot.date), "EEE, dd MMM yyyy");

  return (
    <Card className={cn("transition-all hover:shadow-lg rounded-2xl", className)}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{sport.name}</h3>
            <p className="text-sm text-gray-500">{center.name}</p>
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
            <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
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
