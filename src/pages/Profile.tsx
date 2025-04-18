
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon, LogOutIcon, RefreshCwIcon, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types/booking";
import { format, parseISO } from "date-fns";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching bookings for user ID:", user?.id);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          venues (name),
          sports (name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        setError(error.message);
        toast({
          title: "Error fetching bookings",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Bookings fetched:", data);
      
      // Transform the data to include amount (default to 0 if not present)
      const bookingsWithAmount = (data as any[])?.map(booking => ({
        ...booking,
        amount: booking.amount || 0
      })) || [];
      
      setBookings(bookingsWithAmount);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      setError(error.message);
      toast({
        title: "Error fetching bookings",
        description: error.message || "Could not fetch bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      setIsSigningOut(false);
    }
  };

  // Helper function to format dates properly for timestamp without timezone
  const formatBookingDate = (dateTimeStr: string) => {
    try {
      if (!dateTimeStr) return "Invalid date";
      
      // If the date comes in Postgres timestamp format (YYYY-MM-DD HH:MM:SS)
      if (dateTimeStr.includes(' ') && dateTimeStr.includes(':')) {
        // Split into date and time parts
        const [datePart] = dateTimeStr.split(' ');
        // Parse the date part only
        const date = new Date(`${datePart}T00:00:00`);
        if (!isNaN(date.getTime())) {
          return format(date, 'EEEE, MMMM d, yyyy');
        }
      }
      
      // If it's in ISO 8601 format with T (e.g., from JavaScript Date)
      if (dateTimeStr.includes('T')) {
        const date = parseISO(dateTimeStr);
        if (!isNaN(date.getTime())) {
          return format(date, 'EEEE, MMMM d, yyyy');
        }
      }
      
      // Last resort - try to parse the entire string
      const date = new Date(dateTimeStr);
      if (!isNaN(date.getTime())) {
        return format(date, 'EEEE, MMMM d, yyyy');
      }
      
      return "Invalid date";
    } catch (e) {
      console.error("Error formatting date:", e, dateTimeStr);
      return "Date format error";
    }
  };
  
  const formatBookingTime = (dateTimeStr: string) => {
    try {
      if (!dateTimeStr) return "Invalid time";
      
      // If the date comes in Postgres timestamp format (YYYY-MM-DD HH:MM:SS)
      if (dateTimeStr.includes(' ') && dateTimeStr.includes(':')) {
        // Split into date and time parts
        const [, timePart] = dateTimeStr.split(' ');
        if (timePart) {
          // Handle time format (HH:MM:SS) to 12-hour format
          const [hours, minutes] = timePart.split(':').map(Number);
          const isPM = hours >= 12;
          const displayHours = hours % 12 || 12;
          return `${displayHours}:${String(minutes).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
        }
      }
      
      // If it's in ISO 8601 format with T (e.g., from JavaScript Date)
      if (dateTimeStr.includes('T')) {
        const date = parseISO(dateTimeStr);
        if (!isNaN(date.getTime())) {
          return format(date, 'h:mm a');
        }
      }
      
      // Last resort - try to parse the entire string
      const date = new Date(dateTimeStr);
      if (!isNaN(date.getTime())) {
        return format(date, 'h:mm a');
      }
      
      return "Invalid time";
    } catch (e) {
      console.error("Error formatting time:", e, dateTimeStr);
      return "Time format error";
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Please log in to view your profile</h3>
        <Button 
          onClick={() => navigate("/auth")} 
          className="mt-4"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <PageHeader 
        title="Profile" 
        action={
          <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </Button>
        }
      />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  <UserIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{profile?.first_name || ""} {profile?.last_name || ""}</CardTitle>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Your Bookings
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchBookings}
              disabled={isLoading}
            >
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={fetchBookings}>Try Again</Button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">No bookings found.</p>
                <Button variant="outline" onClick={() => navigate('/slots')}>
                  Browse Available Slots
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">
                            {booking.sports?.name} at {booking.venues?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatBookingDate(booking.slot_time)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatBookingTime(booking.slot_time)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            className="mb-2"
                          >
                            {booking.status}
                          </Badge>
                          <p className="font-medium">₹{booking.amount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
