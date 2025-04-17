
import { supabase } from './client';

export const updateVenueImages = async () => {
  const venues = [
    {
      id: 'venue1_id', // Replace with actual venue ID
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
    },
    {
      id: 'venue2_id', // Replace with actual venue ID
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
    },
    {
      id: 'venue3_id', // Replace with actual venue ID
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
    }
  ];

  for (const venue of venues) {
    const { error } = await supabase
      .from('venues')
      .update({ image: venue.image })
      .eq('id', venue.id);

    if (error) {
      console.error(`Error updating venue ${venue.id}:`, error);
    }
  }
};
