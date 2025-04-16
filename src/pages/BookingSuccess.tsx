
import { Link, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckIcon, HomeIcon } from "@/utils/iconMapping";
import { InvoiceCard } from "@/components/invoice-card";

export default function BookingSuccess() {
  const location = useLocation();
  const bookingData = location.state?.bookingData;
  
  // If no booking data is provided, redirect to home
  if (!bookingData) {
    return <Navigate to="/" replace />;
  }
  
  // Format date for invoice
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckIcon className="h-16 w-16 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Your booking has been successfully confirmed. A confirmation message has been sent to your phone number.
        </p>
      </div>
      
      <div className="mb-8">
        <InvoiceCard 
          invoiceData={{
            invoiceNumber: bookingData.invoiceNumber,
            date: today,
            amount: bookingData.amount,
            customerName: bookingData.name,
            customerPhone: bookingData.phone,
            customerEmail: bookingData.email,
            bookingId: bookingData.id,
            paymentId: bookingData.paymentId,
            sportName: bookingData.sportName,
            centerName: bookingData.centerName,
            bookingTime: bookingData.time,
          }}
        />
      </div>
      
      <div className="flex flex-col gap-4">
        <Link to="/">
          <Button className="w-full bg-gradient-to-r from-sports-blue to-sports-blue/90">
            <HomeIcon className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </Link>
        
        <Link to="/centers">
          <Button variant="outline" className="w-full">
            Book Another Slot
          </Button>
        </Link>
      </div>
    </div>
  );
}
