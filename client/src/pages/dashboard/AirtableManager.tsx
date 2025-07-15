import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Database, Users, Calendar, CreditCard, BarChart3, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AirtableVendor {
  id: string;
  name: string;
  category: string;
  instagram: string;
  commissionRate: string;
  location: string;
  airtableId: string;
}

interface AirtableBooking {
  id: string;
  vendorId: string;
  customerName: string;
  email: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  status: string;
  airtableId: string;
}

interface AirtablePayment {
  id: string;
  bookingId: string;
  vendorId: string;
  amount: number;
  status: string;
  dueDate: string;
  airtableId: string;
}

interface DailyReport {
  date: string;
  totalBookings: number;
  totalRevenue: number;
  newVendors: number;
  cancelledBookings: number;
  airtableId: string;
}

export default function AirtableManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Connection test query
  const { data: connectionTest, isLoading: testLoading } = useQuery({
    queryKey: ["/api/business/test"],
    refetchInterval: 30000 // Test connection every 30 seconds
  });

  // Data queries
  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/business/vendors"]
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/business/bookings"]
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/business/payments"]
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/business/reports"]
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async (syncType: string) => {
      const response = await apiRequest("POST", "/api/business/sync", { syncType });
      return response.json();
    },
    onSuccess: (data, syncType) => {
      toast({
        title: "Data Refreshed",
        description: `${syncType} data refreshed with ${data.count} records`,
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/business/${syncType}`] });
    },
    onError: (error) => {
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh data",
        variant: "destructive",
      });
    },
  });

  const handleSync = (syncType: string) => {
    syncMutation.mutate(syncType);
  };

  const ConnectionStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {testLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : connectionTest?.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={`font-medium ${
            connectionTest?.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {testLoading ? 'Testing connection...' : 
             connectionTest?.success ? 'Connected' : 'Connection Failed'}
          </span>
        </div>
        {connectionTest?.message && (
          <p className="text-sm text-muted-foreground mt-2">
            {connectionTest.message}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const DataOverview = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {vendorsData?.count || 0}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => handleSync('vendors')}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {bookingsData?.count || 0}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => handleSync('bookings')}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {paymentsData?.count || 0}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => handleSync('payments')}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reports</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {reportsData?.count || 0}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => handleSync('reports')}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Refresh'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const VendorsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Vendors from Airtable</CardTitle>
        <CardDescription>
          Real-time vendor data synchronized from your Airtable base
        </CardDescription>
      </CardHeader>
      <CardContent>
        {vendorsLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Instagram</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorsData?.data?.map((vendor: AirtableVendor) => (
                <TableRow key={vendor.airtableId}>
                  <TableCell className="font-mono text-sm">{vendor.id}</TableCell>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{vendor.category}</Badge>
                  </TableCell>
                  <TableCell>{vendor.location}</TableCell>
                  <TableCell>{vendor.commissionRate}</TableCell>
                  <TableCell className="text-blue-600">{vendor.instagram}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const BookingsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Bookings from Database</CardTitle>
        <CardDescription>
          Live booking data with customer details and status tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsData?.data?.map((booking: AirtableBooking) => (
                <TableRow key={booking.airtableId}>
                  <TableCell className="font-mono text-sm">{booking.id}</TableCell>
                  <TableCell className="font-mono text-sm">{booking.vendorId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm text-muted-foreground">{booking.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{booking.guests}</TableCell>
                  <TableCell>{booking.checkIn}</TableCell>
                  <TableCell>{booking.checkOut}</TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.status === 'Confirmed' ? 'default' :
                      booking.status === 'Pending' ? 'secondary' :
                      'destructive'
                    }>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const PaymentsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Payments from Database</CardTitle>
        <CardDescription>
          Financial transactions and payment status tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Vendor ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsData?.data?.map((payment: AirtablePayment) => (
                <TableRow key={payment.airtableId}>
                  <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                  <TableCell className="font-mono text-sm">{payment.bookingId}</TableCell>
                  <TableCell className="font-mono text-sm">{payment.vendorId}</TableCell>
                  <TableCell className="font-medium">
                    LKR {payment.amount?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      payment.status === 'Paid' ? 'default' :
                      payment.status === 'Pending' ? 'secondary' :
                      'destructive'
                    }>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const ReportsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>Daily Reports from Database</CardTitle>
        <CardDescription>
          Business intelligence and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reportsLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>New Vendors</TableHead>
                <TableHead>Cancelled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsData?.data?.map((report: DailyReport) => (
                <TableRow key={report.airtableId}>
                  <TableCell className="font-medium">{report.date}</TableCell>
                  <TableCell>{report.totalBookings}</TableCell>
                  <TableCell className="font-medium">
                    LKR {report.totalRevenue?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>{report.newVendors}</TableCell>
                  <TableCell className="text-red-600">{report.cancelledBookings}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Data Manager</h1>
          <p className="text-muted-foreground">
            Real-time business data from your PostgreSQL database
          </p>
        </div>
        <Button
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/business"] });
            toast({ title: "Refreshing all data..." });
          }}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh All
        </Button>
      </div>

      <ConnectionStatus />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DataOverview />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorsTable />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTable />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsTable />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}