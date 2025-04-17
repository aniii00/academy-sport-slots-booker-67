
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon, LogOutIcon, RefreshCwIcon, SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types/booking";
import { PreferencesDialog } from "@/components/preferences/PreferencesDialog";
import { useState, useEffect, useCallback } from "react";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchSports();
  }, [user]);

  const fetchSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*');
      if (error) throw error;
      setSports(data || []);
    } catch (error: any) {
      console.error("Error fetching sports:", error);
    }
  };

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
      setBookings(data || []);
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

  const userName = profile?.first_name || profile?.last_name 
    ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
    : 'User';
  
  const userInitials = userName !== 'User' 
    ? `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() 
    : 'U';

  return (
    <div className="container max-w-4xl mx-auto p-4">
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
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle>{userName}</CardTitle>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)}
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Your Sports Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.has_set_preferences ? (
                  sports
                    .filter(sport => 
                      profile.favorite_sports?.includes(sport.id)
                    )
                    .map(sport => (
                      <Badge key={sport.id} variant="secondary">
                        {sport.name}
                      </Badge>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">No preferences set</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Bookings</CardTitle>
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
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchBookings}
                >
                  Try Again
                </Button>
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No bookings found.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{booking.venues?.name} - {booking.sports?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Slot: {new Date(booking.slot_time).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {booking.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
        sports={sports}
      />
    </div>
  );
}
