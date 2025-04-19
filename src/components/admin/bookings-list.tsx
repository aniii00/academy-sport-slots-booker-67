
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking.phone?.includes(searchTerm) || false) ||
      (booking.venues?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking.sports?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      // Use optional chaining and fallback to an empty string if profiles is null
      (booking.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
