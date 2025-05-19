import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, Calendar, Filter } from "lucide-react";

export default function BookingManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingTab, setBookingTab] = useState("upcoming");
  
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/bookings'],
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Sample bookings data for demonstration
  const sampleBookings = [
    {
      id: 1,
      serviceId: 1,
      serviceName: "Ocean View Villa",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      startDate: "2023-01-12T00:00:00.000Z",
      endDate: "2023-01-16T00:00:00.000Z",
      status: "confirmed",
      totalPrice: 1200,
      type: "stays"
    },
    {
      id: 2,
      serviceId: 2,
      serviceName: "Jeep Rental",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      startDate: "2023-01-10T00:00:00.000Z",
      endDate: "2023-01-13T00:00:00.000Z",
      status: "pending",
      totalPrice: 280,
      type: "vehicles"
    },
    {
      id: 3,
      serviceId: 3,
      serviceName: "Island Tour Package",
      customerName: "Bob Johnson",
      customerEmail: "bob@example.com",
      startDate: "2023-01-14T00:00:00.000Z",
      endDate: "2023-01-14T00:00:00.000Z",
      status: "confirmed",
      totalPrice: 350,
      type: "tours"
    },
    {
      id: 4,
      serviceId: 1,
      serviceName: "Ocean View Villa",
      customerName: "Alice Williams",
      customerEmail: "alice@example.com",
      startDate: "2022-12-20T00:00:00.000Z",
      endDate: "2022-12-27T00:00:00.000Z",
      status: "completed",
      totalPrice: 1750,
      type: "stays"
    },
    {
      id: 5,
      serviceId: 4,
      serviceName: "Spa Treatment",
      customerName: "Mike Brown",
      customerEmail: "mike@example.com",
      startDate: "2023-01-05T00:00:00.000Z",
      endDate: "2023-01-05T00:00:00.000Z",
      status: "cancelled",
      totalPrice: 120,
      type: "wellness"
    }
  ];
  
  // Filter bookings based on tab and search query
  const filteredBookings = sampleBookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (bookingTab === "upcoming") {
      return booking.status !== "completed" && booking.status !== "cancelled" && matchesSearch;
    } else if (bookingTab === "past") {
      return (booking.status === "completed" || booking.status === "cancelled") && matchesSearch;
    } else {
      return matchesSearch;
    }
  });

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Booking Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search bookings by name, email, or service..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="default" size="sm">
                + New Booking
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="upcoming" onValueChange={setBookingTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming & Active</TabsTrigger>
              <TabsTrigger value="past">Past Bookings</TabsTrigger>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="m-0">
              <BookingTable bookings={filteredBookings} />
            </TabsContent>
            
            <TabsContent value="past" className="m-0">
              <BookingTable bookings={filteredBookings} />
            </TabsContent>
            
            <TabsContent value="all" className="m-0">
              <BookingTable bookings={filteredBookings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface BookingTableProps {
  bookings: any[];
}

function BookingTable({ bookings }: BookingTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No bookings found
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">#{booking.id}</TableCell>
                <TableCell>{booking.serviceName}</TableCell>
                <TableCell>
                  <div>{booking.customerName}</div>
                  <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                </TableCell>
                <TableCell>
                  {formatDate(booking.startDate)} 
                  {booking.startDate !== booking.endDate && ` - ${formatDate(booking.endDate)}`}
                </TableCell>
                <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
