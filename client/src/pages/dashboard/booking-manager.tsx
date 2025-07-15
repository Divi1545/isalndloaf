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
import { Link, useLocation } from "wouter";

export default function BookingManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingTab, setBookingTab] = useState("upcoming");
  const [_, setLocation] = useLocation();
  
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
  
  // Use real bookings data from API
  const realBookings = bookings || [];
  
  // Debug logs to track the issue
  console.log('=== BOOKING MANAGER DEBUG ===');
  console.log('Total bookings from API:', realBookings.length);
  console.log('Loading state:', isLoading);
  console.log('Bookings data:', realBookings);
  console.log('Search query:', searchQuery);
  console.log('Current tab:', bookingTab);
  
  // Filter bookings based on tab and search query
  const filteredBookings = realBookings.filter(booking => {
    const matchesSearch = !searchQuery || 
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toString().includes(searchQuery);
    
    if (bookingTab === "upcoming") {
      return booking.status !== "completed" && booking.status !== "cancelled" && matchesSearch;
    } else if (bookingTab === "past") {
      return (booking.status === "completed" || booking.status === "cancelled") && matchesSearch;
    } else if (bookingTab === "all") {
      return matchesSearch;
    } else {
      return matchesSearch;
    }
  });
  
  // Additional debug logs
  console.log('Filtered bookings:', filteredBookings.length);
  console.log('Filtered bookings data:', filteredBookings);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Date range filter clicked');
                  alert('Date range filter coming soon!');
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Date Range
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Filter clicked');
                  alert('Advanced filter options coming soon!');
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setLocation("/dashboard/add-booking")}
              >
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
                <TableCell>{booking.serviceName || `Service #${booking.serviceId}`}</TableCell>
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('View booking clicked:', booking.id);
                        alert(`View booking #${booking.id} - ${booking.customerName}\nStatus: ${booking.status}\nAmount: ${formatCurrency(booking.totalPrice)}`);
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Edit booking clicked:', booking.id);
                        alert(`Edit booking #${booking.id} functionality coming soon!`);
                      }}
                    >
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
