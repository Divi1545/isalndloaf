import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Sample booking data
const bookings = [
  { 
    id: 'B-3001', 
    customer: { 
      name: 'Sarah Johnson', 
      email: 'sarah@example.com', 
      phone: '+1 555-123-4567', 
      country: 'United States' 
    },
    vendor: 'Beach Paradise Villa', 
    vendorId: 'V-1001',
    service: 'Beach Villa', 
    dates: { 
      checkin: '2025-05-20', 
      checkout: '2025-05-23' 
    },
    guests: 2,
    total: '$449.97', 
    commission: '$44.99', 
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit card',
    createdAt: '2025-04-10T15:30:00Z',
    notes: '',
    specialRequests: 'Ocean view room if possible. Late check-in around 9pm.'
  },
  { 
    id: 'B-3002', 
    customer: { 
      name: 'Michael Chen', 
      email: 'mchen@example.com', 
      phone: '+65 9123 4567', 
      country: 'Singapore' 
    },
    vendor: 'Beach Paradise Villa', 
    vendorId: 'V-1001',
    service: 'Beach Villa', 
    dates: { 
      checkin: '2025-05-25', 
      checkout: '2025-05-28' 
    },
    guests: 3,
    total: '$449.97', 
    commission: '$44.99', 
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'PayPal',
    createdAt: '2025-04-12T09:15:00Z',
    notes: '',
    specialRequests: ''
  },
  { 
    id: 'B-3003', 
    customer: { 
      name: 'Emma Williams', 
      email: 'emma.w@example.com', 
      phone: '+44 20 1234 5678', 
      country: 'United Kingdom' 
    },
    vendor: 'Beach Paradise Villa', 
    vendorId: 'V-1001',
    service: 'Garden Room', 
    dates: { 
      checkin: '2025-06-01', 
      checkout: '2025-06-05' 
    },
    guests: 2,
    total: '$359.96', 
    commission: '$35.99', 
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'bank transfer',
    createdAt: '2025-04-15T11:45:00Z',
    notes: 'Awaiting bank transfer confirmation',
    specialRequests: 'Gluten-free breakfast options needed.'
  },
  { 
    id: 'B-3004', 
    customer: { 
      name: 'James Taylor', 
      email: 'jamest@example.com', 
      phone: '+61 2 1234 5678', 
      country: 'Australia' 
    },
    vendor: 'Beach Paradise Villa', 
    vendorId: 'V-1001',
    service: 'Ocean View Suite', 
    dates: { 
      checkin: '2025-06-10', 
      checkout: '2025-06-15' 
    },
    guests: 4,
    total: '$999.95', 
    commission: '$99.99', 
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit card',
    createdAt: '2025-04-18T14:20:00Z',
    notes: '',
    specialRequests: 'Airport pickup requested. Flight #QF450 arriving at 14:30.'
  },
  { 
    id: 'B-3005', 
    customer: { 
      name: 'Sophie Dubois', 
      email: 'sophie.d@example.com', 
      phone: '+33 1 23 45 67 89', 
      country: 'France' 
    },
    vendor: 'Island Adventures', 
    vendorId: 'V-1002',
    service: 'Whale Watching Tour', 
    dates: { 
      checkin: '2025-06-20', 
      checkout: '2025-06-20' 
    },
    guests: 2,
    total: '$149.95', 
    commission: '$22.49', 
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'credit card',
    createdAt: '2025-04-22T08:30:00Z',
    notes: 'Credit card authorization pending',
    specialRequests: 'French-speaking guide requested if available.'
  },
  { 
    id: 'B-3006', 
    customer: { 
      name: 'Akira Tanaka', 
      email: 'akira.t@example.com', 
      phone: '+81 3 1234 5678', 
      country: 'Japan' 
    },
    vendor: 'Coastal Scooters', 
    vendorId: 'V-1003',
    service: 'Scooter Rental - 3 Days', 
    dates: { 
      checkin: '2025-06-25', 
      checkout: '2025-06-28' 
    },
    guests: 1,
    total: '$89.97', 
    commission: '$10.80', 
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit card',
    createdAt: '2025-04-25T10:15:00Z',
    notes: '',
    specialRequests: 'Delivery to Cinnamon Hotel.'
  },
];

// Booking detail dialog component
const BookingDetailDialog = ({ booking }: { booking: typeof bookings[0] }) => {
  const [status, setStatus] = useState(booking.status);
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus);
  const [notes, setNotes] = useState(booking.notes);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">View details</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span>Booking {booking.id}</span>
            <Badge className={`ml-2 ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              ''
            }`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            <Badge className={`ml-2 ${
              booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Booking Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="text-sm font-medium">{booking.service} ({booking.vendor})</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dates</p>
                <p className="text-sm font-medium">
                  {formatDate(booking.dates.checkin)} to {formatDate(booking.dates.checkout)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Guests</p>
                <p className="text-sm font-medium">{booking.guests}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-sm font-medium">{booking.total}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Commission</p>
                <p className="text-sm font-medium">{booking.commission}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="text-sm font-medium">{booking.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium">{new Date(booking.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">Special Requests</h3>
            <p className="text-sm border p-2 rounded-md min-h-[60px]">
              {booking.specialRequests || 'No special requests'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium">{booking.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{booking.customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{booking.customer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Country</p>
                <p className="text-sm font-medium">{booking.customer.country}</p>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">Booking Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-gray-500">Admin Notes</p>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes here..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center mt-6">
          <div>
            <Button variant="outline" size="sm" className="mr-2">Email Customer</Button>
            <Button variant="outline" size="sm">Email Vendor</Button>
          </div>
          <div>
            <Button variant="outline" size="sm" className="mr-2">Cancel</Button>
            <Button size="sm">Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const BookingManagement = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);
  const { toast } = useToast();

  const [newBooking, setNewBooking] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vendorId: '',
    serviceType: 'accommodation',
    serviceName: '',
    checkinDate: '',
    checkoutDate: '',
    guests: 1,
    totalAmount: '',
    specialRequests: ''
  });

  const handleCreateBooking = () => {
    // Process the booking creation
    console.log('Creating new booking:', newBooking);
    
    // Reset form
    setNewBooking({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      vendorId: '',
      serviceType: 'accommodation',
      serviceName: '',
      checkinDate: '',
      checkoutDate: '',
      guests: 1,
      totalAmount: '',
      specialRequests: ''
    });
    
    setIsCreateBookingOpen(false);
    
    toast({
      title: "Success",
      description: "New booking has been created successfully."
    });
  };
  
  // Filter bookings based on search query and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      booking.status === statusFilter;
    
    const matchesVendor = vendorFilter === 'all' || 
      booking.vendorId === vendorFilter;
    
    // For demo purposes, we're not implementing actual date filtering logic
    const matchesDateRange = true;
    
    return matchesSearch && matchesStatus && matchesVendor && matchesDateRange;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            Export Data
          </Button>
          <Dialog open={isCreateBookingOpen} onOpenChange={setIsCreateBookingOpen}>
            <DialogTrigger asChild>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.29 7 12 12 20.71 7"></polyline>
                  <line x1="12" x2="12" y1="22" y2="12"></line>
                </svg>
                Create Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input 
                      value={newBooking.customerName}
                      onChange={(e) => setNewBooking({...newBooking, customerName: e.target.value})}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Email</Label>
                    <Input 
                      type="email"
                      value={newBooking.customerEmail}
                      onChange={(e) => setNewBooking({...newBooking, customerEmail: e.target.value})}
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      value={newBooking.customerPhone}
                      onChange={(e) => setNewBooking({...newBooking, customerPhone: e.target.value})}
                      placeholder="+1 555-123-4567"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Vendor</Label>
                    <Select value={newBooking.vendorId} onValueChange={(value) => setNewBooking({...newBooking, vendorId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="V-1001">Beach Paradise Villa</SelectItem>
                        <SelectItem value="V-1002">Island Adventures</SelectItem>
                        <SelectItem value="V-1003">Coastal Scooters</SelectItem>
                        <SelectItem value="V-1004">Serenity Spa</SelectItem>
                        <SelectItem value="V-1005">Mountain Retreat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select value={newBooking.serviceType} onValueChange={(value) => setNewBooking({...newBooking, serviceType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="tours">Tours & Activities</SelectItem>
                        <SelectItem value="wellness">Wellness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input 
                    value={newBooking.serviceName}
                    onChange={(e) => setNewBooking({...newBooking, serviceName: e.target.value})}
                    placeholder="Ocean View Suite, Island Tour, etc."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Check-in Date</Label>
                    <Input 
                      type="date"
                      value={newBooking.checkinDate}
                      onChange={(e) => setNewBooking({...newBooking, checkinDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out Date</Label>
                    <Input 
                      type="date"
                      value={newBooking.checkoutDate}
                      onChange={(e) => setNewBooking({...newBooking, checkoutDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Guests</Label>
                    <Input 
                      type="number"
                      min="1"
                      value={newBooking.guests}
                      onChange={(e) => setNewBooking({...newBooking, guests: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Total Amount ($)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={newBooking.totalAmount}
                      onChange={(e) => setNewBooking({...newBooking, totalAmount: e.target.value})}
                      placeholder="299.99"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Special Requests (Optional)</Label>
                  <Textarea 
                    value={newBooking.specialRequests}
                    onChange={(e) => setNewBooking({...newBooking, specialRequests: e.target.value})}
                    placeholder="Any special requirements or requests..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateBookingOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBooking}>
                    Create Booking
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="w-full"
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <TabsList className="w-full max-w-md grid grid-cols-4">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search by ID, customer or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[300px]"
              />
            </div>
            <div className="flex flex-wrap w-full md:w-auto gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  <SelectItem value="V-1001">Beach Paradise Villa</SelectItem>
                  <SelectItem value="V-1002">Island Adventures</SelectItem>
                  <SelectItem value="V-1003">Coastal Scooters</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="nextWeek">Next Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Vendor</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Dates</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Commission</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="py-3 px-4 text-sm">{booking.id}</td>
                    <td className="py-3 px-4 text-sm">{booking.customer.name}</td>
                    <td className="py-3 px-4 text-sm">{booking.vendor}</td>
                    <td className="py-3 px-4 text-sm">{booking.service}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {new Date(booking.dates.checkin).toLocaleDateString()} - {new Date(booking.dates.checkout).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">{booking.total}</td>
                    <td className="py-3 px-4 text-sm">{booking.commission}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <Badge className={`${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          ''
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        <Badge className={`${
                          booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex justify-center space-x-2">
                        <BookingDetailDialog booking={booking} />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setLocation(`/admin/bookings/edit/${booking.id}`);
                          }}
                        >
                          <span className="sr-only">Edit</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                          </svg>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            console.log(`More options for booking: ${booking.id}`);
                          }}
                        >
                          <span className="sr-only">More options</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">Showing {filteredBookings.length} of {bookings.length} bookings</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;