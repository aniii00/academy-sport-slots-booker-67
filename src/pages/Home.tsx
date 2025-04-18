import { PageHeader } from "@/components/ui/page-header";
import { SportCard } from "@/components/sport-card";
import { VenueCard } from "@/components/venue-card";
import { SmartRecommendations } from "@/components/smart-recommendations";
import { Button } from "@/components/ui/button";
import { SportBackground } from "@/components/ui/sport-background";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sport, Venue } from "@/types/venue";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingQuotes } from "@/components/floating-quotes";

export default function Home() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bannerImages = [
    "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images//photo_2025-04-18%2016.33.55.jpeg",
    "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images//9e730ba6b383eafb35b15c2524847618.jpg",
    "https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images//2025-04-18%2016.33.39.jpg",
  ];
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .limit(4);

        if (venueError) throw venueError;

        const { data: sportData, error: sportError } = await supabase
          .from('sports')
          .select('*');

        if (sportError) throw sportError;

        setVenues(venueData || []);
        setSports(sportData || []);
      } catch (error) {
        console.error("Error fetching home data:", error);
        toast.error("Failed to load home page data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  return (
    <div className="space-y-12 pb-8">
      <SportBackground>
        <section className="relative py-24 px-4 md:px-8 rounded-3xl overflow-hidden shadow-lg transition-all hover:shadow-xl">
          <img
            src={bannerImages[currentBanner]}
            alt="sports banner"
            className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-sports-blue/70 z-10"></div>
          <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 text-white">
            <div className="text-center md:text-left md:max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in leading-tight tracking-tight uppercase">
                Book Your Turf. Rule Your Game.
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed italic">
                Access elite sports venues across Delhi — train smart, play hard, and stay ahead.
              </p>
              <Link to="/venue">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg bg-white text-sports-blue hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Book Now
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </SportBackground>

      {user && (
        <section className="rounded-3xl p-8 bg-gradient-to-r from-sports-lightBlue to-white shadow-lg transition-all hover:shadow-xl">
          <SmartRecommendations />
        </section>
      )}

      <section className="rounded-3xl p-8 bg-gradient-to-r from-sports-lightOrange to-white shadow-lg transition-all hover:shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-sports-orange mb-2">Popular Sports</h2>
            <p className="text-gray-600">Choose your game and own your grind</p>
          </div>
          <Link to="/venue">
            <Button 
              variant="outline" 
              className="rounded-full border-sports-orange text-sports-orange hover:bg-sports-orange hover:text-white transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {sports.map((sport) => (
              <SportCard key={sport.id} sport={sport} className="transition-all duration-300 hover:scale-105" />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl p-8 bg-gradient-to-r from-gray-50 to-white shadow-lg transition-all hover:shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Venues</h2>
            <p className="text-gray-600">Train where the top players train</p>
          </div>
          <Link to="/venue">
            <Button 
              variant="outline" 
              className="rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
            >
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2l"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {venues.map((venue) => (
              <VenueCard 
                key={venue.id} 
                venue={venue} 
                className="transition-all duration-300 hover:scale-105"
              />
            ))}
          </div>
        )}
      </section>

      <FloatingQuotes />
    </div>
  );
}
