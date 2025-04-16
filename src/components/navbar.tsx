
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  HomeIcon, 
  ListIcon, 
  CalendarIcon, 
  LoginIcon, 
  SettingsIcon 
} from "@/utils/iconMapping";
import { useState } from "react";

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  
  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
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
            <Button
              variant="ghost"
              onClick={toggleAdmin}
              className="hidden md:inline-flex"
            >
              {isAdmin ? "Exit Admin" : "Admin Login"}
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden">
                  <ListIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="py-4">
                  <h2 className="text-lg font-semibold mb-4">Menu</h2>
                  <div className="flex flex-col gap-2">
                    <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100">
                      <HomeIcon className="h-5 w-5" />
                      <span>Home</span>
                    </Link>
                    <Link to="/centers" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100">
                      <CalendarIcon className="h-5 w-5" />
                      <span>Find Centers</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100">
                        <SettingsIcon className="h-5 w-5" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      onClick={toggleAdmin}
                      className="flex items-center justify-start gap-2 px-4 py-2 h-auto font-normal"
                    >
                      <LoginIcon className="h-5 w-5" />
                      <span>{isAdmin ? "Exit Admin" : "Admin Login"}</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
