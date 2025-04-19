
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationIcon, ArrowRightIcon } from "@/utils/iconMapping";
import { Venue, Sport } from "@/types/venue";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const backgroundColors = [
  'bg-gradient-to-br from-green-50 to-green-100',
  'bg-gradient-to-br from-blue-50 to-blue-100',
  'bg-gradient-to-br from-purple-50 to-purple-100',
  'bg-gradient-to-br from-yellow-50 to-yellow-100',
  'bg-gradient-to-br from-pink-50 to-pink-100',
];

interface VenueCardProps {
  venue: Venue;
  selectedSportId?: string;
  className?: string;
}

export function VenueCard({ venue, selectedSportId, className }: VenueCardProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get a random background color based on venue id
  const backgroundColorIndex = venue.id.charCodeAt(0) % backgroundColors.length;
  const backgroundColor = backgroundColors[backgroundColorIndex];

  React.useEffect(() => {
    const fetchSports = async () => {
      try {
        const { data: venueSportsData, error: venueSportsError } = await supabase
          .from('venue_sports')
          .select('sport_id')
          .eq('venue_id', venue.id);
        
        if (venueSportsError) throw venueSportsError;
        
        if (venueSportsData && venueSportsData.length > 0) {
          const sportIds = venueSportsData.map(vs => vs.sport_id);
          
          const { data: sportsData, error: sportsError } = await supabase
            .from('sports')
            .select('*')
            .in('id', sportIds);
          
          if (sportsError) throw sportsError;
          
          setSports(sportsData || []);
        }
      } catch (error) {
        console.error("Error fetching sports for venue:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSports();
  }, [venue.id]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="shadow-lg rounded-2xl transition-all duration-300"
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border-none rounded-2xl",
        backgroundColor,
        "hover:shadow-xl",
        className
      )}>
        <div className="aspect-video overflow-hidden rounded-t-2xl">
          <motion.img 
            src={venue.image || '/placeholder.svg'} 
            alt={venue.name} 
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <CardContent className="p-5">
          <h3 className="font-semibold text-lg mb-1">{venue.name}</h3>
          <div className="flex items-center text-gray-500 mb-3">
            <LocationIcon className="h-4 w-4 mr-1 text-sports-blue" />
            <span className="text-sm">{venue.address}</span>
          </div>
          <div className="mb-3">
            <p className="text-sm text-gray-500">Available Sports:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {isLoading ? (
                <span className="text-sm text-gray-500">Loading sports...</span>
              ) : sports.length === 0 ? (
                <span className="text-sm text-gray-500">No sports available</span>
              ) : (
                sports.map((sport) => (
                  <span 
                    key={sport.id} 
                    className="inline-block px-2 py-1 text-xs bg-white/50 backdrop-blur-sm rounded-full shadow-sm"
                  >
                    {sport.name}
                  </span>
                ))
              )}
            </div>
          </div>
          <Link 
            to={`/slots?venueId=${venue.id}${selectedSportId ? `&sportId=${selectedSportId}` : ''}`}
          >
            <Button 
              className={cn(
                "w-full rounded-xl shadow-sm hover:shadow-md group",
                "bg-white/70 backdrop-blur-sm text-sports-blue hover:bg-white/90",
                "border border-sports-blue/20 transition-all duration-300"
              )}
            >
              View Slots
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

