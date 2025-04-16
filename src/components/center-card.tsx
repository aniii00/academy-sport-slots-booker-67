
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationIcon, ArrowRightIcon } from "@/utils/iconMapping";
import { Center, Sport, sports } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface CenterCardProps {
  center: Center;
  selectedSportId?: string;
  className?: string;
}

export function CenterCard({ center, selectedSportId, className }: CenterCardProps) {
  // Get sport names for this center
  const centerSports = center.sports.map(
    sportId => sports.find(s => s.id === sportId)?.name || ""
  ).filter(Boolean);

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <div className="aspect-video overflow-hidden">
        <img 
          src={center.image} 
          alt={center.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{center.name}</h3>
        <div className="flex items-center text-gray-500 mb-3">
          <LocationIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{center.address}</span>
        </div>
        <div className="mb-3">
          <p className="text-sm text-gray-500">Available Sports:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {centerSports.map((sport, index) => (
              <span 
                key={index} 
                className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
        <Link 
          to={`/slots?centerId=${center.id}${selectedSportId ? `&sportId=${selectedSportId}` : ''}`}
        >
          <Button className="w-full bg-sports-blue hover:bg-sports-blue/90">
            View Slots
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
