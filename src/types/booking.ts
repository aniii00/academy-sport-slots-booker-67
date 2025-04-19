
export interface Booking {
  id: string;
  user_id: string;
  venue_id: string;
  sport_id: string;
  slot_id: string | null;
  slot_time: string;
  status: string;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
  amount: number;
  venues?: { 
    name: string;
    location: string;
    [key: string]: any;
  };
  sports?: {
    name: string;
    [key: string]: any;
  };
  profiles?: {
    email?: string;  // Make email optional
    [key: string]: any;
  } | null;  // Explicitly allow profiles to be null
}
