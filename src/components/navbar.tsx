
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  HomeIcon, 
  ListIcon, 
  CalendarIcon, 
  LoginIcon, 
  SettingsIcon 
} from "@/utils/iconMapping";

export function Navbar() {
  const { user, isAdmin } = useAuth();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="container px-4 mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-sports-blue">Prashant Academy</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-sports-blue">Home</Link>
            <Link to="/centers" className="text-gray-600 hover:text-sports-blue">Centers</Link>
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-sports-blue">Admin</Link>
            )}
          </nav>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="hidden md:inline-flex"
              >
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" className="hidden md:inline-flex">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
