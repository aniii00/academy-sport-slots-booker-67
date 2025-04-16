
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { CenterCard } from "@/components/center-card";
import { FilterBar, FilterState } from "@/components/filter-bar";
import { centers, Center, sports, Sport } from "@/data/mockData";

export default function Centers() {
  const [searchParams] = useSearchParams();
  const initialSportId = searchParams.get('sportId') || undefined;
  
  const [filteredCenters, setFilteredCenters] = useState<Center[]>(centers);
  const [selectedSport, setSelectedSport] = useState<Sport | undefined>(
    initialSportId ? sports.find(s => s.id === initialSportId) : undefined
  );
  
  useEffect(() => {
    // Set initial sport based on URL parameter
    if (initialSportId) {
      const sport = sports.find(s => s.id === initialSportId);
      if (sport) setSelectedSport(sport);
    }
  }, [initialSportId]);
  
  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...centers];
    
    // Filter by sport
    if (filters.sportId) {
      filtered = filtered.filter(center => 
        center.sports.includes(filters.sportId as string)
      );
      const sport = sports.find(s => s.id === filters.sportId);
      if (sport) setSelectedSport(sport);
      else setSelectedSport(undefined);
    } else {
      setSelectedSport(undefined);
    }
    
    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(center => center.city === filters.city);
    }
    
    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(center => center.location === filters.location);
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(center => 
        center.name.toLowerCase().includes(term) || 
        center.location.toLowerCase().includes(term) ||
        center.city.toLowerCase().includes(term)
      );
    }
    
    setFilteredCenters(filtered);
  };
  
  return (
    <div>
      <PageHeader 
        title={selectedSport ? `${selectedSport.name} Centers` : "All Centers"}
        subtitle={selectedSport 
          ? `Find centers offering ${selectedSport.name}`
          : "Browse all our sports centers across locations"
        }
        showBackButton={!!selectedSport}
      />
      
      <FilterBar onFilterChange={handleFilterChange} className="mb-6" />
      
      {filteredCenters.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No centers found</h3>
          <p className="text-gray-500">Try adjusting your filters to find more centers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <CenterCard 
              key={center.id} 
              center={center} 
              selectedSportId={selectedSport?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
