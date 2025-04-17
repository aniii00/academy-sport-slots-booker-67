
export interface Booking {
  id: string;
  user_id: string;
  center_name: string;
  sport_type: string;
  slot_time: string;
  status: string;
  created_at: string;
  updated_at: string;
  venue_id?: string;
  sport_id?: string;
  slot_id?: string;
}
