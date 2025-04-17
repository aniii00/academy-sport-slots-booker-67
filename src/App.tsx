import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Centers from "./pages/Centers";
import Slots from "./pages/Slots";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/centers" element={<Centers />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/verify" element={<VerifyEmail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
