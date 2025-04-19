
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

export const BookingsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const fetchBookings = async () => {
    console.log("Fetching bookings for admin view");
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        venues:venue_id (name, location),
        sports:sport_id (name),
        profiles:user_id (email)
      `)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Failed to fetch bookings");
    }
    
    console.log("Bookings fetched successfully:", data?.length || 0, "bookings");
    return data as Booking[];
  };
  
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: fetchBookings
  });
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking.phone?.includes(searchTerm) || false) ||
      (booking.venues?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (booking.sports?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      // Use optional chaining and nullish coalescing for safely handling profiles
      (booking.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  useEffect(() => {
    console.log("BookingsList component mounted");
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Bookings Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search" className="mb-2 block">Search</Label>
            <Input
              id="search"
              placeholder="Search by name, phone, venue or sport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Label htmlFor="status" className="mb-2 block">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
            <p>Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            Error loading bookings. Please try again later.
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No bookings found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      <div>{booking.full_name}</div>
                      <div className="text-sm text-gray-500">{booking.phone}</div>
                      <div className="text-xs text-gray-400">{booking.profiles?.email || 'No email'}</div>
                    </TableCell>
                    <TableCell>{booking.venues?.name || 'Unknown venue'}</TableCell>
                    <TableCell>{booking.sports?.name || 'Unknown sport'}</TableCell>
                    <TableCell>
                      {booking.slot_time ? format(new Date(booking.slot_time), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </TableCell>
                    <TableCell>₹{booking.amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
