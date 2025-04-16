
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { shareInvoice } from "@/utils/helpers";
import { PriceIcon, EmailIcon, WhatsAppIcon } from "@/utils/iconMapping";

interface InvoiceCardProps {
  invoiceData: {
    invoiceNumber: string;
    date: string;
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    bookingId: string;
    paymentId: string;
    sportName: string;
    centerName: string;
    bookingTime: string;
  };
}

export function InvoiceCard({ invoiceData }: InvoiceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(invoiceData.customerEmail || "");
  
  const handleShareViaWhatsApp = async () => {
    try {
      const result = await shareInvoice({
        ...invoiceData,
        phone: invoiceData.customerPhone,
      }, "whatsapp");
      
      if (result) {
        toast.success("Invoice shared via WhatsApp");
      } else {
        toast.error("Failed to share invoice");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  
  const handleShareViaEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    try {
      const result = await shareInvoice({
        ...invoiceData,
        email,
      }, "email");
      
      if (result) {
        toast.success("Invoice sent to your email");
        setIsOpen(false);
      } else {
        toast.error("Failed to send invoice");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-sports-blue to-sports-blue/90 text-white rounded-t-2xl">
        <CardTitle className="text-center">Invoice</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Invoice Number</span>
          <span className="font-medium">{invoiceData.invoiceNumber}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span>{invoiceData.date}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Customer</span>
          <span>{invoiceData.customerName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Booking ID</span>
          <span>{invoiceData.bookingId}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Payment ID</span>
          <span className="text-sm font-mono">{invoiceData.paymentId}</span>
        </div>
        
        <div className="pt-4 mt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Booking Details</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl text-sm">
            <p><span className="font-medium">Sport:</span> {invoiceData.sportName}</p>
            <p><span className="font-medium">Center:</span> {invoiceData.centerName}</p>
            <p><span className="font-medium">Time:</span> {invoiceData.bookingTime}</p>
          </div>
        </div>
        
        <div className="pt-4 mt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount</span>
            <div className="flex items-center text-xl font-bold text-sports-orange">
              <PriceIcon className="h-5 w-5 mr-1" />
              <span>₹{invoiceData.amount}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={handleShareViaWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
          >
            <WhatsAppIcon className="h-5 w-5" />
            <span>WhatsApp</span>
          </Button>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex-1 flex items-center justify-center gap-2"
              >
                <EmailIcon className="h-5 w-5" />
                <span>Email</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Send Invoice via Email</DialogTitle>
                <DialogDescription>
                  Enter your email address to receive the invoice
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleShareViaEmail}>Send Invoice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Button variant="outline" className="w-full">
          Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
