
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type Profile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTriedFetchingProfile, setHasTriedFetchingProfile] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);
      
      // Direct query approach to avoid recursion 
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // Only show toast error if this is not the first attempt 
        // This prevents showing errors during initial load
        if (hasTriedFetchingProfile) {
          toast.error('Error loading user profile');
        }
        
        setHasTriedFetchingProfile(true);
        return;
      }

      if (profileData) {
        console.log('Profile fetched successfully:', profileData);
        console.log('User role:', profileData.role);
        setProfile(profileData);
        setHasTriedFetchingProfile(true);
      } else {
        console.log('No profile found for user:', userId);
        setHasTriedFetchingProfile(true);
        
        // Only show this message if we've already tried once to prevent confusion during initial load
        if (hasTriedFetchingProfile) {
          toast.error('User profile not found');
        }
      }
    } catch (error) {
      console.error('Error in profile fetch function:', error);
      // Only show toast error if this is not the first attempt
      if (hasTriedFetchingProfile) {
        toast.error('Error loading user profile');
      }
      setHasTriedFetchingProfile(true);
    }
  };

  useEffect(() => {
    const handleAuthChange = (event: string, currentSession: Session | null) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Use a delay to prevent potential recursion with auth state changes
        setTimeout(() => {
          fetchProfile(currentSession.user.id);
        }, 100);
      } else {
        setProfile(null);
        setHasTriedFetchingProfile(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update isLoading state when profile fetch completes
  useEffect(() => {
    if (user && hasTriedFetchingProfile) {
      setIsLoading(false);
    }
  }, [user, hasTriedFetchingProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setHasTriedFetchingProfile(false);
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Make sure the isAdmin value is correctly computed
  const isAdmin = profile?.role === "admin";
  
  // Debug log for admin status
  useEffect(() => {
    console.log("Auth context state updated:", {
      isAdmin,
      profileRole: profile?.role,
      hasProfile: !!profile,
      isLoading,
      hasTriedFetchingProfile
    });
  }, [profile, isAdmin, isLoading, hasTriedFetchingProfile]);

  const value = {
    user,
    session,
    profile,
    isAdmin,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
