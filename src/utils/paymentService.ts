
import { loadScript } from "./helpers";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  amount: number;
  currency?: string;
  name: string;
  description: string;
  bookingId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
}

export const initializeRazorpay = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js")
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

export const makePayment = async (options: PaymentOptions): Promise<any> => {
  const res = await initializeRazorpay();

  if (!res) {
    alert("Razorpay SDK failed to load. Please check your internet connection.");
    return;
  }

  // Development API Key (Replace with environment variable in production)
  const razorpayKey = "rzp_test_YourTestKeyHere";

  const paymentOptions = {
    key: razorpayKey,
    amount: options.amount * 100, // Razorpay takes amount in paisa
    currency: options.currency || "INR",
    name: options.name,
    description: options.description,
    order_id: options.bookingId,
    handler: function (response: any) {
      // Handle successful payment
      const paymentId = response.razorpay_payment_id;
      const orderId = response.razorpay_order_id;
      const signature = response.razorpay_signature;
      
      return {
        paymentId,
        orderId,
        signature,
        success: true
      };
    },
    prefill: {
      name: options.customerName,
      email: options.customerEmail || "",
      contact: options.customerPhone,
    },
    theme: {
      color: "#0070DC",
    },
    modal: {
      ondismiss: function() {
        console.log("Payment modal closed");
      }
    }
  };

  const paymentObject = new window.Razorpay(paymentOptions);
  paymentObject.open();
  
  return new Promise((resolve) => {
    paymentObject.on("payment.success", (response: any) => {
      resolve({ success: true, data: response });
    });
    
    paymentObject.on("payment.error", (error: any) => {
      resolve({ success: false, error });
    });
  });
};

// For UPI payments
export const generateUpiLink = (options: {
  amount: number;
  vpa: string;
  name: string;
  bookingId: string;
}) => {
  const { amount, vpa, name, bookingId } = options;
  
  // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tr=REFERENCE&cu=CURRENCY
  return `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount}&tr=${bookingId}&cu=INR`;
};
