
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { makePayment, generateUpiLink } from "@/utils/paymentService";
import { toast } from "@/components/ui/sonner";
import { PriceIcon, TimeIcon } from "@/utils/iconMapping";
import { formatCurrency } from "@/utils/helpers";

interface PaymentFormProps {
  amount: number;
  bookingDetails: {
    id: string;
    date: string;
    time: string;
    sportName: string;
    centerName: string;
  };
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  onPaymentSuccess: (paymentInfo: any) => void;
  onPaymentCancel: () => void;
}

export function PaymentForm({
  amount,
  bookingDetails,
  customerInfo,
  onPaymentSuccess,
  onPaymentCancel,
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState("");
  
  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    
    try {
      const result = await makePayment({
        amount: amount,
        name: "SportSpot",
        description: `Booking for ${bookingDetails.sportName} at ${bookingDetails.centerName}`,
        bookingId: bookingDetails.id,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
      });
      
      if (result && result.success) {
        toast.success("Payment successful! Your booking is confirmed.");
        onPaymentSuccess({
          paymentId: result.data?.razorpay_payment_id,
          amount: amount,
          method: "razorpay",
          timestamp: new Date().toISOString(),
        });
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleUpiPayment = () => {
    if (!upiId) {
      toast.error("Please enter your UPI ID");
      return;
    }
    
    try {
      // Generate UPI intent URL
      const upiLink = generateUpiLink({
        amount: amount,
        vpa: upiId,
        name: "SportSpot",
        bookingId: bookingDetails.id,
      });
      
      // Open UPI app
      window.location.href = upiLink;
      
      // In a real app, you'd need to verify payment status
      // Here we'll simulate success
      toast.success("Payment initiated. Please complete payment in your UPI app.");
      
      // We'd typically wait for webhook confirmation here
      // For demo, we'll simulate success
      setTimeout(() => {
        onPaymentSuccess({
          paymentId: `UPI-${Date.now()}`,
          amount: amount,
          method: "upi",
          timestamp: new Date().toISOString(),
        });
      }, 3000);
    } catch (error) {
      toast.error("UPI payment failed. Please try again.");
      console.error("UPI error:", error);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Choose your preferred payment method to confirm your booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2 px-4 bg-sports-lightBlue/30 rounded-xl">
            <span className="font-medium">Booking Amount</span>
            <span className="text-xl font-bold text-sports-blue flex items-center">
              <PriceIcon className="h-5 w-5 mr-1" />
              {formatCurrency(amount)}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <div className="flex gap-2">
              <TimeIcon className="h-4 w-4 text-sports-blue" />
              <span>
                {bookingDetails.date}, {bookingDetails.time}
              </span>
            </div>
            <div className="mt-1">
              {bookingDetails.sportName} at {bookingDetails.centerName}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="razorpay" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
            <TabsTrigger value="upi">UPI Payment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="razorpay" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Securely pay using credit/debit card, net banking, or UPI via Razorpay
              </p>
              <Button 
                onClick={handleRazorpayPayment} 
                className="w-full bg-gradient-to-r from-sports-blue to-sports-blue/90"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="upi" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="upiId">Your UPI ID</Label>
                <Input 
                  id="upiId" 
                  placeholder="example@upi" 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your UPI ID (e.g., name@okbank, phone@upi)
                </p>
              </div>
              
              <Button 
                onClick={handleUpiPayment} 
                className="w-full bg-gradient-to-r from-sports-blue to-sports-blue/90 mt-4"
                disabled={!upiId.trim() || isProcessing}
              >
                Pay with UPI
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Button variant="outline" onClick={onPaymentCancel}>
          Cancel Payment
        </Button>
      </CardFooter>
    </Card>
  );
}
