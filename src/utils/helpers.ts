
export const loadScript = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const generateInvoiceNumber = () => {
  const prefix = "INV";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const shareInvoice = async (invoice: any, method: "whatsapp" | "email") => {
  const message = `Thank you for booking with SportSpot!\n\nInvoice #${invoice.invoiceNumber}\nAmount: ₹${invoice.amount}\nDate: ${invoice.date}\nBooking ID: ${invoice.bookingId}\n\nVisit our app for more details.`;
  
  if (method === "whatsapp") {
    // Open WhatsApp with prefilled message
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${invoice.phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    return true;
  } else if (method === "email" && invoice.email) {
    // For email we would typically use a server-side service
    // Here we'll just simulate success
    console.log("Email would be sent to:", invoice.email);
    console.log("Email content:", message);
    return true;
  }
  
  return false;
};
