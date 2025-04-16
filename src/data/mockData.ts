
// Mock data for Prashant Academy sports booking app

export interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Center {
  id: string;
  name: string;
  location: string;
  city: string;
  address: string;
  sports: string[];
  image: string;
}

export interface TimeSlot {
  id: string;
  centerId: string;
  sportId: string;
  startTime: string;
  endTime: string;
  date: string;
  price: number; // in INR
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  timeSlotId: string;
  centerId: string;
  sportId: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'pending';
}

// Sports data
export const sports: Sport[] = [
  {
    id: "sport-1",
    name: "Swimming",
    icon: "swim",
    description: "Indoor and outdoor swimming pools with professional trainers"
  },
  {
    id: "sport-2",
    name: "Badminton",
    icon: "badminton",
    description: "Professional badminton courts with equipment rental available"
  },
  {
    id: "sport-3",
    name: "Basketball",
    icon: "basketball",
    description: "Full-size basketball courts with coaching sessions"
  },
  {
    id: "sport-4",
    name: "Tennis",
    icon: "tennis",
    description: "Clay and hard tennis courts with professional trainers"
  },
  {
    id: "sport-5",
    name: "Cricket",
    icon: "cricket",
    description: "Cricket nets and grounds with equipment and coaching"
  },
  {
    id: "sport-6",
    name: "Football",
    icon: "football",
    description: "Full-size football fields with coaching programs"
  }
];

// Centers data
export const centers: Center[] = [
  {
    id: "center-1",
    name: "Prashant Academy Bandra",
    location: "Bandra",
    city: "Mumbai",
    address: "24, Hill Road, Bandra West, Mumbai - 400050",
    sports: ["sport-1", "sport-2", "sport-3"],
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742"
  },
  {
    id: "center-2",
    name: "Prashant Academy Powai",
    location: "Powai",
    city: "Mumbai",
    address: "Central Avenue, Hiranandani Gardens, Powai, Mumbai - 400076",
    sports: ["sport-2", "sport-4", "sport-5"],
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625"
  },
  {
    id: "center-3",
    name: "Prashant Academy Andheri",
    location: "Andheri",
    city: "Mumbai",
    address: "JVPD Scheme, Andheri West, Mumbai - 400049",
    sports: ["sport-1", "sport-3", "sport-6"],
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742"
  },
  {
    id: "center-4",
    name: "Prashant Academy Juhu",
    location: "Juhu",
    city: "Mumbai",
    address: "Juhu Beach Road, Juhu, Mumbai - 400049",
    sports: ["sport-1", "sport-4", "sport-6"],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
  },
  {
    id: "center-5",
    name: "Prashant Academy Dadar",
    location: "Dadar",
    city: "Mumbai",
    address: "Shivaji Park, Dadar West, Mumbai - 400028",
    sports: ["sport-2", "sport-3", "sport-5"],
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625"
  },
  {
    id: "center-6",
    name: "Prashant Academy Pune Central",
    location: "Koregaon Park",
    city: "Pune",
    address: "North Main Road, Koregaon Park, Pune - 411001",
    sports: ["sport-1", "sport-2", "sport-3", "sport-4"],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
  }
];

// Generate time slots for the current and next 7 days
export const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTimes = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const endTimes = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  
  // Generate slots for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    // For each center
    centers.forEach(center => {
      // For each sport in the center
      center.sports.forEach(sportId => {
        // For each time slot
        for (let i = 0; i < startTimes.length; i++) {
          // Randomly set some slots as unavailable
          const available = Math.random() > 0.3;
          
          // Random price between 300 and 1500 INR
          const price = Math.floor(Math.random() * (1500 - 300 + 1) + 300);
          
          slots.push({
            id: `slot-${center.id}-${sportId}-${dateStr}-${i}`,
            centerId: center.id,
            sportId: sportId,
            startTime: startTimes[i],
            endTime: endTimes[i],
            date: dateStr,
            price: price,
            available: available
          });
        }
      });
    });
  }
  
  return slots;
};

// Mock bookings
export const bookings: Booking[] = [
  {
    id: "booking-1",
    userId: "user-1",
    userName: "Raj Sharma",
    phone: "9876543210",
    timeSlotId: "slot-center-1-sport-1-2023-04-15-2",
    centerId: "center-1",
    sportId: "sport-1",
    bookingDate: "2023-04-10",
    status: "confirmed"
  },
  {
    id: "booking-2",
    userId: "user-2",
    userName: "Priya Patel",
    phone: "8765432109",
    timeSlotId: "slot-center-2-sport-2-2023-04-16-3",
    centerId: "center-2",
    sportId: "sport-2",
    bookingDate: "2023-04-11",
    status: "confirmed"
  }
];

// City data for filtering
export const cities = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai", "Hyderabad"];

// Function to get available slots for a specific center and sport
export const getAvailableSlots = (centerId: string, sportId: string, date?: string) => {
  const allSlots = generateTimeSlots();
  return allSlots.filter(slot => 
    slot.centerId === centerId && 
    slot.sportId === sportId && 
    slot.available &&
    (date ? slot.date === date : true)
  );
};

// Function to get sports available at a center
export const getSportsForCenter = (centerId: string) => {
  const center = centers.find(c => c.id === centerId);
  if (!center) return [];
  
  return center.sports.map(sportId => 
    sports.find(sport => sport.id === sportId)
  ).filter(Boolean) as Sport[];
};

// Function to get centers offering a specific sport
export const getCentersForSport = (sportId: string) => {
  return centers.filter(center => 
    center.sports.includes(sportId)
  );
};
