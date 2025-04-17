
export interface Venue {
  id: string;
  name: string;
  location: string;
  address: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VenueSport {
  id: string;
  venue_id: string;
  sport_id: string;
  created_at: string;
  updated_at: string;
}

export interface VenueTiming {
  id: string;
  venue_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_morning: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenuePricing {
  id: string;
  venue_id: string;
  day_group: string;
  time_range: string;
  is_morning: boolean;
  price: number;
  per_duration: string;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: string;
  venue_id: string;
  sport_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  available: boolean;
  created_at: string;
  updated_at: string;
}
