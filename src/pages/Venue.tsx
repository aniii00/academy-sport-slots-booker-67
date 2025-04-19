
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { VenueCard } from "@/components/venue-card";
import { supabase } from "@/integrations/supabase/client";
import type { Venue, Sport } from "@/types/venue";
import { toast } from "@/components/ui/sonner";
import { motion } from "framer-motion";

export default function Venue() {
  const [searchParams] = useSearchParams();
  const initialSportId = searchParams.get('sportId') || undefined;
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch venues
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*');
        
        if (venueError) throw venueError;
        
        // Fetch sports
        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*');
        
        if (sportError) throw sportError;
        
        setVenues(venueData || []);
        setSports(sportData || []);
        
        // Set initial sport filter if sportId is in URL
        if (initialSportId) {
          const sport = sportData?.find(s => s.id === initialSportId);
          if (sport) {
            setSelectedSport(sport);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load venues and sports");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [initialSportId]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader 
        title={selectedSport ? `${selectedSport.name} Venues` : "All Venues"}
        subtitle={selectedSport 
          ? `Find venues offering ${selectedSport.name}`
          : "Browse all our sports venues across locations"
        }
        showBackButton={!!selectedSport}
        className="bg-white/50 backdrop-blur-sm"
      />
      
      {isLoading ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Loading venues...</h3>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No venues found</h3>
          <p className="text-gray-500">Try adjusting your filters to find more venues</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
        >
          {venues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <VenueCard 
                venue={venue} 
                selectedSportId={selectedSport?.id}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
