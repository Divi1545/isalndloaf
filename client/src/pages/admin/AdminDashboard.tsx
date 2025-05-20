import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Create a basic stat card component for the admin dashboard
const StatCard = ({ title, value, icon, iconColor, iconBgColor, trend, subtitle }: {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  trend?: { value: string; isPositive: boolean };
  subtitle?: string;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.value}
                </span>
                {subtitle && <span className="text-xs text-muted-foreground ml-1">{subtitle}</span>}
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColor}>
              {icon === 'users' && (
                <>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </>
              )}
              {icon === 'dollar-sign' && (
                <>
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </>
              )}
              {icon === 'calendar' && (
                <>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </>
              )}
              {icon === 'trending-up' && (
                <>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </>
              )}
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Handle additional admin actions when needed
  useEffect(() => {
    // Clear any persisted vendor ID when returning to the dashboard
    localStorage.removeItem("vendorId");
  }, []);
  
  // Handle report generation
  const handleGenerateReport = () => {
    toast({
      title: "Generating report",
      description: "Your report is being prepared and will download shortly"
    });
    
    // In a real app, this would fetch from API
    // For this demo, simulate a download after a short delay
    setTimeout(() => {
      // Create a blob representing a PDF file
      const reportData = new Blob(
        ['IslandLoaf Admin Report: ' + new Date().toLocaleDateString()], 
        { type: 'application/pdf' }
      );
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(reportData);
      const a = document.createElement('a');
      a.href = url;
      a.download = `islandloaf_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      toast({
        title: "Report downloaded",
        description: "Your report has been generated successfully",
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleGenerateReport}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Generate Report
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          title="Total Vendors"
          value="18"
          icon="users"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          trend={{ value: "+3", isPositive: true }}
          subtitle="vs. last month"
        />
        <StatCard 
          title="Platform Revenue"
          value="$24,680"
          icon="dollar-sign"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend={{ value: "+15.8%", isPositive: true }}
          subtitle="vs. last month"
        />
        <StatCard 
          title="Total Bookings"
          value="1,423"
          icon="calendar"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{ value: "+12.4%", isPositive: true }}
          subtitle="vs. last month"
        />
        <StatCard 
          title="Customer Growth"
          value="22.5%"
          icon="trending-up"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          trend={{ value: "+3.2%", isPositive: true }}
          subtitle="vs. last month"
        />
      </div>
      
      <Tabs defaultValue="vendors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendors" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-semibold">Vendor Management</h3>
                <div className="flex items-center gap-3">
                  <Input 
                    placeholder="Search vendors..." 
                    className="w-full md:w-64"
                  />
                  <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="stays">Accommodation</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="tours">Tours & Activities</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      // Store current state in localStorage for navigation
                      localStorage.setItem("adminAction", "addVendor");
                      window.location.href = "/dashboard";
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Add Vendor
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Vendor ID</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Business Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Owner</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'V-1001', name: 'Beach Paradise Villa', owner: 'Island Vendor', type: 'Accommodation', revenue: '$12,628', status: 'active' },
                      { id: 'V-1002', name: 'Island Adventures', owner: 'John Smith', type: 'Tours', revenue: '$8,450', status: 'active' },
                      { id: 'V-1003', name: 'Coastal Scooters', owner: 'Maria Rodriguez', type: 'Transport', revenue: '$5,920', status: 'active' },
                      { id: 'V-1004', name: 'Serenity Spa', owner: 'Raj Patel', type: 'Wellness', revenue: '$7,340', status: 'pending' },
                      { id: 'V-1005', name: 'Mountain Retreat', owner: 'Sarah Johnson', type: 'Accommodation', revenue: '$9,125', status: 'active' },
                    ].map((vendor, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-4 px-4 text-sm">{vendor.id}</td>
                        <td className="py-4 px-4 text-sm font-medium">{vendor.name}</td>
                        <td className="py-4 px-4 text-sm">{vendor.owner}</td>
                        <td className="py-4 px-4 text-sm">{vendor.type}</td>
                        <td className="py-4 px-4 text-sm">{vendor.revenue}</td>
                        <td className="py-4 px-4 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            vendor.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                          }`}>
                            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                localStorage.setItem("adminAction", "editVendor");
                                localStorage.setItem("vendorId", vendor.id);
                                window.location.href = "/dashboard";
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                              </svg>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                localStorage.setItem("adminAction", "viewVendor");
                                localStorage.setItem("vendorId", vendor.id);
                                window.location.href = "/dashboard";
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
                                  toast({
                                    title: "Vendor deleted",
                                    description: `${vendor.name} has been removed from the platform`,
                                  });
                                  // In a real app, this would make an API call
                                  console.log("Vendor deleted:", vendor.id);
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
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
                <div className="text-sm text-muted-foreground">Showing 5 of 18 vendors</div>
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
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Platform Bookings</h3>
                <div className="flex items-center gap-3">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" x2="12" y1="15" y2="3"></line>
                    </svg>
                    Export Data
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Booking ID</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Vendor</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Service</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Dates</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Commission</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'B-3001', customer: 'Sarah Johnson', vendor: 'Beach Paradise Villa', service: 'Beach Villa', dates: 'May 20-23, 2025', total: '$449.97', commission: '$44.99', status: 'confirmed' },
                      { id: 'B-3002', customer: 'Michael Chen', vendor: 'Beach Paradise Villa', service: 'Beach Villa', dates: 'May 25-28, 2025', total: '$449.97', commission: '$44.99', status: 'confirmed' },
                      { id: 'B-3003', customer: 'Emma Williams', vendor: 'Beach Paradise Villa', service: 'Garden Room', dates: 'Jun 1-5, 2025', total: '$359.96', commission: '$35.99', status: 'pending' },
                      { id: 'B-3004', customer: 'James Taylor', vendor: 'Beach Paradise Villa', service: 'Ocean View Suite', dates: 'Jun 10-15, 2025', total: '$999.95', commission: '$99.99', status: 'confirmed' },
                      { id: 'B-3005', customer: 'Sophie Dubois', vendor: 'Beach Paradise Villa', service: 'Beach Villa', dates: 'Jun 20-25, 2025', total: '$749.95', commission: '$74.99', status: 'pending' },
                    ].map((booking, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 text-sm">{booking.id}</td>
                        <td className="py-3 px-4 text-sm">{booking.customer}</td>
                        <td className="py-3 px-4 text-sm">{booking.vendor}</td>
                        <td className="py-3 px-4 text-sm">{booking.service}</td>
                        <td className="py-3 px-4 text-sm">{booking.dates}</td>
                        <td className="py-3 px-4 text-sm">{booking.total}</td>
                        <td className="py-3 px-4 text-sm">{booking.commission}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Revenue Management</h3>
                <div className="flex items-center gap-3">
                  <Select defaultValue="thisMonth">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="lastMonth">Last Month</SelectItem>
                      <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-4">Platform Commission Settings</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Accommodation Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          <Input defaultValue="10" className="pl-7" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Transport Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          <Input defaultValue="12" className="pl-7" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tours & Activities Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          <Input defaultValue="15" className="pl-7" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Wellness Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          <Input defaultValue="10" className="pl-7" />
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">Update Commission Rates</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-4">Revenue Breakdown by Category</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Accommodation</p>
                          <p className="text-sm font-medium">$14,280 (58%)</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: '58%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Tours & Activities</p>
                          <p className="text-sm font-medium">$5,920 (24%)</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-green-500" style={{ width: '24%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Transport</p>
                          <p className="text-sm font-medium">$2,470 (10%)</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-amber-500" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="text-sm font-medium">Wellness</p>
                          <p className="text-sm font-medium">$2,010 (8%)</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-purple-500" style={{ width: '8%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-6">Platform Settings</h3>
              
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-4">General Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Maintenance Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Put the platform in maintenance mode. All users will see a maintenance message.
                        </p>
                      </div>
                      <Switch id="maintenance-mode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow New Registrations</p>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable new vendor registrations.
                        </p>
                      </div>
                      <Switch id="allow-registrations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Vendor Approval Required</p>
                        <p className="text-sm text-muted-foreground">
                          Require admin approval for new vendor accounts.
                        </p>
                      </div>
                      <Switch id="vendor-approval" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-4">Payment Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Automatic Payouts</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically process payouts on the 1st of each month.
                        </p>
                      </div>
                      <Switch id="auto-payouts" defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Payout Method</label>
                      <Select defaultValue="bank">
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Processing Fee</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        <Input defaultValue="2.5" className="pl-7" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;