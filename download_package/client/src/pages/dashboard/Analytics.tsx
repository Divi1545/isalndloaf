import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueChart from "@/components/dashboard/revenue-chart";
import BookingSources from "@/components/dashboard/booking-sources";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Sample data
const revenueData = [
  { date: "Jan", revenue: 2400 },
  { date: "Feb", revenue: 3000 },
  { date: "Mar", revenue: 2800 },
  { date: "Apr", revenue: 3600 },
  { date: "May", revenue: 4200 },
  { date: "Jun", revenue: 4800 },
  { date: "Jul", revenue: 5400 },
  { date: "Aug", revenue: 6200 },
  { date: "Sep", revenue: 5800 },
  { date: "Oct", revenue: 4900 },
  { date: "Nov", revenue: 5200 },
  { date: "Dec", revenue: 7100 }
];

const bookingSources = [
  { name: "Direct", percentage: 40, color: "#4f46e5" },
  { name: "IslandLoaf.com", percentage: 25, color: "#0891b2" },
  { name: "Partner Sites", percentage: 20, color: "#16a34a" },
  { name: "Social Media", percentage: 15, color: "#ea580c" }
];

const funnelData = [
  { name: "Views", value: 2450 },
  { name: "Inquiries", value: 1250 },
  { name: "Bookings", value: 356 },
  { name: "Completed", value: 325 }
];

const customerData = [
  { country: "United Kingdom", count: 120 },
  { country: "United States", count: 98 },
  { country: "Germany", count: 75 },
  { country: "France", count: 62 },
  { country: "Australia", count: 54 },
  { country: "Canada", count: 43 },
  { country: "Netherlands", count: 38 },
  { country: "Others", count: 85 }
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <div className="flex items-center space-x-2">
          <Select defaultValue="year">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                <RevenueChart data={revenueData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Booking Sources</h3>
                <BookingSources sources={bookingSources} />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Booking Funnel</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={funnelData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Customer Demographics</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={customerData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="country" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                <Button variant="ghost" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M11 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"></path>
                    <polygon points="15 2 19 6 15 10 15 2"></polygon>
                    <path d="M13 6H2"></path>
                    <path d="M13 10H2"></path>
                    <path d="M19 14H2"></path>
                    <path d="M19 18H2"></path>
                  </svg>
                  View Report
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Metric</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Current</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Previous</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Change</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: 'Average Booking Value', current: '$259.80', previous: '$238.45', change: '+8.95%', status: 'positive' },
                      { metric: 'Occupancy Rate', current: '76.3%', previous: '68.4%', change: '+7.9%', status: 'positive' },
                      { metric: 'Average Length of Stay', current: '4.2 days', previous: '3.8 days', change: '+0.4 days', status: 'positive' },
                      { metric: 'Cancellation Rate', current: '6.2%', previous: '5.5%', change: '+0.7%', status: 'negative' },
                      { metric: 'Customer Satisfaction', current: '4.7/5', previous: '4.6/5', change: '+0.1', status: 'positive' },
                    ].map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-4 px-4 text-sm font-medium">{row.metric}</td>
                        <td className="py-4 px-4 text-sm">{row.current}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{row.previous}</td>
                        <td className={`py-4 px-4 text-sm ${row.status === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                          {row.change}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {row.status === 'positive' ? (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <polyline points="18 15 12 9 6 15"></polyline>
                              </svg>
                              Improving
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                              Declining
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-4 space-y-5">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    width={500}
                    height={300}
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                <div className="mt-4">
                  <p className="text-3xl font-bold">$65,428</p>
                  <p className="text-sm text-muted-foreground mt-1">Past 12 months</p>
                  <div className="mt-4 flex items-center">
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                      +18.3%
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">vs last year</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
                <div className="mt-4">
                  <p className="text-3xl font-bold">$259.80</p>
                  <p className="text-sm text-muted-foreground mt-1">Past 12 months</p>
                  <div className="mt-4 flex items-center">
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                      +8.95%
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">vs last year</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Commission Paid</h3>
                <div className="mt-4">
                  <p className="text-3xl font-bold">$7,851</p>
                  <p className="text-sm text-muted-foreground mt-1">Past 12 months</p>
                  <div className="mt-4 flex items-center">
                    <span className="text-amber-600 text-sm font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      +22.1%
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">vs last year</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-4 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Booking Sources</h3>
                <BookingSources sources={bookingSources} />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={[
                        { status: 'Completed', value: 325 },
                        { status: 'Confirmed', value: 68 },
                        { status: 'Pending', value: 42 },
                        { status: 'Cancelled', value: 27 }
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0891b2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Booking Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Month</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Bookings</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Avg. Stay</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                      <tr key={month} className="border-b">
                        <td className="py-3 px-4 text-sm font-medium">{month}</td>
                        <td className="py-3 px-4 text-sm text-right">{Math.floor(Math.random() * 40) + 10}</td>
                        <td className="py-3 px-4 text-sm text-right">${(Math.random() * 5000 + 2000).toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-right">{(Math.random() * 3 + 2).toFixed(1)} days</td>
                        <td className="py-3 px-4 text-sm text-right">{Math.floor(Math.random() * 30 + 65)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="mt-4 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Customer Demographics</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={customerData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="country" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Customer Types</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={[
                        { type: 'Families', count: 187 },
                        { type: 'Couples', count: 142 },
                        { type: 'Solo Travelers', count: 98 },
                        { type: 'Business', count: 45 },
                        { type: 'Groups', count: 32 }
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Total Spent</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Bookings</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Sarah Johnson', location: 'London, UK', spent: '$2,845', bookings: 4, lastVisit: 'May 15, 2023' },
                      { name: 'Michael Chen', location: 'New York, USA', spent: '$2,290', bookings: 3, lastVisit: 'Aug 22, 2023' },
                      { name: 'Emma Williams', location: 'Berlin, Germany', spent: '$1,780', bookings: 2, lastVisit: 'Dec 3, 2023' },
                      { name: 'James Taylor', location: 'Sydney, Australia', spent: '$1,650', bookings: 2, lastVisit: 'Jan 18, 2024' },
                      { name: 'Sophie Dubois', location: 'Paris, France', spent: '$1,420', bookings: 2, lastVisit: 'Nov 5, 2023' },
                    ].map((customer, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 text-sm font-medium">{customer.name}</td>
                        <td className="py-3 px-4 text-sm">{customer.location}</td>
                        <td className="py-3 px-4 text-sm">{customer.spent}</td>
                        <td className="py-3 px-4 text-sm">{customer.bookings}</td>
                        <td className="py-3 px-4 text-sm">{customer.lastVisit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;