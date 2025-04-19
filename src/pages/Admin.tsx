
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookingsList } from "@/components/admin/bookings-list";
import { CentersTab } from "@/components/admin/centers-tab";
import { SportsTab } from "@/components/admin/sports-tab";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("bookings");
  const { user, profile, isAdmin } = useAuth();
  
  if (!user) {
    toast.error("You must be logged in to access the admin panel");
    return <Navigate to="/auth" replace />;
  }
  
  if (!isAdmin) {
    toast.error("You do not have permission to access the admin panel");
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Admin Panel" 
        subtitle="Manage bookings, centers, and sports"
      />
      
      <Tabs defaultValue="bookings" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="centers">Centers</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-6">
          <BookingsList />
        </TabsContent>
        
        <TabsContent value="centers" className="mt-6">
          <CentersTab />
        </TabsContent>
        
        <TabsContent value="sports" className="mt-6">
          <SportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
