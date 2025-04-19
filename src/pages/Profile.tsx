
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
import { formatDateString, formatTimeWithTimezone, calculateEndTime } from "@/lib/utils";

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
                {bookings.map((booking) => {
                  // Log the original slot_time to debug timezone issues
                  console.log(`Original slot_time for booking ${booking.id}:`, booking.slot_time);
                  
                  // Format date and time with consistent timezone handling
                  const formattedDate = formatDateString(booking.slot_time, 'EEE, dd MMM yyyy');
                  const startTime = formatTimeWithTimezone(booking.slot_time);
                  const endTime = calculateEndTime(booking.slot_time, 30);
                  
                  // Log the formatted times to validate
                  console.log(`Formatted times for booking ${booking.id}:`, {
                    formattedDate,
                    startTime,
                    endTime,
                  });
                  
                  return (
                    <Card key={booking.id} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-lg mb-1">
                              {booking.sports?.name} at {booking.venues?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formattedDate}
                            </p>
                            <p className="text-sm text-gray-600">
                              {startTime} - {endTime}
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
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
