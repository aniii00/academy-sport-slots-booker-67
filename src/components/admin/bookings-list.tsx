
import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/types/booking";
import { Venue, Sport } from "@/types/venue";
import { toast } from "@/components/ui/sonner";
import { PencilIcon } from "lucide-react";

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [users, setUsers] = useState<{id: string, email: string}[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching bookings...");
        
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            venues:venue_id (
              name,
              location
            ),
            sports:sport_id (
              name
            ),
            profiles:user_id (
              email
            )
          `);

        if (bookingsError) {
          console.error("Error fetching bookings:", bookingsError);
          throw bookingsError;
        }

        console.log("Fetched bookings:", bookingsData);
        
        // Safely map data to the Booking type - handle possible profile errors
        const typedBookings: Booking[] = bookingsData?.map(booking => {
          // Check if profiles is a valid object with an email property or handle the error case
          const profileData = 
            booking.profiles && typeof booking.profiles === 'object' && !('error' in booking.profiles)
              ? booking.profiles 
              : { email: `Unknown (${booking.user_id.substring(0, 8)})` };
          
          return {
            ...booking,
            venues: booking.venues || { name: "Unknown", location: "Unknown" },
            sports: booking.sports || { name: "Unknown" },
            profiles: profileData
          };
        }) || [];
        
        setBookings(typedBookings);
      } catch (error) {
        console.error("Error processing bookings:", error);
        toast.error("Failed to load bookings data");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchVenuesAndSports = async () => {
      // Fetch venues
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .select('*');
      
      if (venueError) {
        console.error("Error fetching venues:", venueError);
        toast.error("Failed to load venues");
        return;
      }
      
      setVenues(venueData || []);
      
      // Fetch sports
      const { data: sportData, error: sportError } = await supabase
        .from('sports')
        .select('*');
      
      if (sportError) {
        console.error("Error fetching sports:", sportError);
        toast.error("Failed to load sports");
        return;
      }
      
      setSports(sportData || []);
      
      // Fetch users with direct approach to avoid recursion issues
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email');
        
        if (profilesError) {
          throw profilesError;
        }
        
        if (profilesData && profilesData.length > 0) {
          setUsers(profilesData);
        } else {
          console.log("No user profiles found, using fallback method");
          // Create a fallback approach
          const userIdsInBookings = [...new Set(bookings.map(booking => booking.user_id))];
          const fallbackUsers = userIdsInBookings.map(id => ({ 
            id, 
            email: `User ${id.substring(0, 8)}` 
          }));
          setUsers(fallbackUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Using fallback method to load users");
        
        // Use a minimal set of users based on bookings
        try {
          const uniqueUserIds = [...new Set(bookings.map(booking => booking.user_id))];
          const fallbackUsers = uniqueUserIds.map(id => ({ id, email: `User ${id.substring(0, 8)}` }));
          setUsers(fallbackUsers);
        } catch (fallbackError) {
          console.error("Error creating fallback users:", fallbackError);
        }
      }
    };

    fetchBookings();
    fetchVenuesAndSports();

    // Set up real-time subscription for bookings
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'bookings' },
          (payload) => {
            console.log("Booking changed:", payload);
            fetchBookings();
          })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking.phone?.includes(searchTerm) || false) ||
      (booking.venues?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking.sports?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking?.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingBooking) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          venue_id: editingBooking.venue_id,
          sport_id: editingBooking.sport_id,
          slot_time: editingBooking.slot_time,
          user_id: editingBooking.user_id,
          status: editingBooking.status
        })
        .eq('id', editingBooking.id);
      
      if (error) throw error;
      
      toast.success("Booking updated successfully");
      setIsEditDialogOpen(false);
      
      // Update the booking in the local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === editingBooking.id ? editingBooking : booking
        )
      );
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-md w-full" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-md w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="p-8 text-center border rounded-md bg-gray-50">
          <p className="text-lg text-gray-500">No bookings found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or adding some bookings</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Venue & Sport</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.full_name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {booking.profiles?.email || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.venues?.name || "Unknown Venue"}</div>
                      <div className="text-sm text-gray-500">{booking.venues?.location || "Unknown Location"}</div>
                      <div className="text-sm text-gray-500">{booking.sports?.name || "Unknown Sport"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.slot_time ? format(new Date(booking.slot_time), "PPp") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        booking.status === 'confirmed' ? 'default' :
                        booking.status === 'cancelled' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {booking.status || "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{booking.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditClick(booking)}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          
          {editingBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">
                  Customer
                </Label>
                <div className="col-span-3">{editingBooking.full_name}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="venue" className="text-right">
                  Venue
                </Label>
                <Select 
                  value={editingBooking.venue_id} 
                  onValueChange={(value) => setEditingBooking({...editingBooking, venue_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sport" className="text-right">
                  Sport
                </Label>
                <Select 
                  value={editingBooking.sport_id} 
                  onValueChange={(value) => setEditingBooking({...editingBooking, sport_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">
                  User
                </Label>
                <Select 
                  value={editingBooking.user_id} 
                  onValueChange={(value) => setEditingBooking({...editingBooking, user_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={editingBooking.status} 
                  onValueChange={(value) => setEditingBooking({...editingBooking, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
