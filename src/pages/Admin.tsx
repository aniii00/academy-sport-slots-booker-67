
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditIcon, DeleteIcon, AddIcon } from "@/utils/iconMapping";
import { bookings, centers, sports } from "@/data/mockData";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("centers");
  
  return (
    <div>
      <PageHeader 
        title="Admin Panel" 
        subtitle="Manage centers, slots, and bookings"
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <AddIcon className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {activeTab === "centers" ? "Add New Center" : 
                   activeTab === "sports" ? "Add New Sport" : 
                   "Add New Booking"}
                </DialogTitle>
              </DialogHeader>
              
              {activeTab === "centers" && <CenterForm />}
              {activeTab === "sports" && <SportForm />}
              {activeTab === "bookings" && <BookingForm />}
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="mb-8">
        <Tabs defaultValue="centers" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="centers">Centers</TabsTrigger>
            <TabsTrigger value="sports">Sports</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="centers">
            <CentersTab />
          </TabsContent>
          
          <TabsContent value="sports">
            <SportsTab />
          </TabsContent>
          
          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{centers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sports.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tab Components
function CentersTab() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all centers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Sports</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {centers.map((center) => (
            <TableRow key={center.id}>
              <TableCell className="font-medium">{center.name}</TableCell>
              <TableCell>{center.location}</TableCell>
              <TableCell>{center.city}</TableCell>
              <TableCell>
                {center.sports.map(sportId => 
                  sports.find(s => s.id === sportId)?.name
                ).join(", ")}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <DeleteIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SportsTab() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all sports</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sports.map((sport) => (
            <TableRow key={sport.id}>
              <TableCell className="font-medium">{sport.name}</TableCell>
              <TableCell>{sport.description}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <DeleteIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BookingsTab() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of all bookings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Center</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const center = centers.find(c => c.id === booking.centerId);
            const sport = sports.find(s => s.id === booking.sportId);
            
            return (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.userName}</TableCell>
                <TableCell>{booking.phone}</TableCell>
                <TableCell>{center?.name || "Unknown"}</TableCell>
                <TableCell>{sport?.name || "Unknown"}</TableCell>
                <TableCell>{booking.bookingDate}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.status === "confirmed" ? "bg-green-100 text-green-800" : 
                    booking.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-red-100 text-red-800"
                  }`}>
                    {booking.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <DeleteIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Form Components
function CenterForm() {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Center Name</Label>
        <Input id="name" placeholder="Enter center name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" placeholder="Enter location" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" placeholder="Enter city" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input id="address" placeholder="Enter full address" />
      </div>
      <div className="pt-4">
        <Button className="w-full">Add Center</Button>
      </div>
    </div>
  );
}

function SportForm() {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Sport Name</Label>
        <Input id="name" placeholder="Enter sport name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="Enter sport description" />
      </div>
      <div className="pt-4">
        <Button className="w-full">Add Sport</Button>
      </div>
    </div>
  );
}

function BookingForm() {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Customer Name</Label>
        <Input id="name" placeholder="Enter customer name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="Enter phone number" />
      </div>
      <div className="pt-4">
        <Button className="w-full">Add Booking</Button>
      </div>
    </div>
  );
}
