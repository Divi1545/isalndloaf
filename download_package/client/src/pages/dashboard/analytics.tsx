import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Download, BarChart3, PieChart, LineChart, Filter } from "lucide-react";
import { format, subMonths } from "date-fns";
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import StatCard from "@/components/dashboard/stat-card";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Format dates for display
  const formattedStartDate = format(startDate, "MMM d, yyyy");
  const formattedEndDate = format(endDate, "MMM d, yyyy");
  
  // Mock revenue data
  const revenueData = [
    { name: "Jan", revenue: 4000, bookings: 24 },
    { name: "Feb", revenue: 3000, bookings: 18 },
    { name: "Mar", revenue: 5000, bookings: 28 },
    { name: "Apr", revenue: 2780, bookings: 16 },
    { name: "May", revenue: 1890, bookings: 12 },
    { name: "Jun", revenue: 2390, bookings: 15 },
    { name: "Jul", revenue: 3490, bookings: 21 },
    { name: "Aug", revenue: 4000, bookings: 24 },
    { name: "Sep", revenue: 2000, bookings: 13 },
    { name: "Oct", revenue: 2780, bookings: 17 },
    { name: "Nov", revenue: 1890, bookings: 11 },
    { name: "Dec", revenue: 4000, bookings: 24 }
  ];
  
  // Mock service type breakdown
  const serviceTypeData = [
    { name: "Stays", value: 65, color: "#3A7CA5" },
    { name: "Vehicles", value: 15, color: "#81C3D7" },
    { name: "Tours", value: 10, color: "#F5C765" },
    { name: "Wellness", value: 7, color: "#9966CC" },
    { name: "Other", value: 3, color: "#ADB5BD" }
  ];
  
  // Mock booking source data
  const bookingSourceData = [
    { name: "Direct", value: 65, color: "#3A7CA5" },
    { name: "Partners", value: 20, color: "#81C3D7" },
    { name: "Social", value: 10, color: "#9966CC" },
    { name: "Other", value: 5, color: "#ADB5BD" }
  ];
  
  // Mock booking status data
  const bookingStatusData = [
    { name: "Completed", bookings: 42, color: "#3A7CA5" },
    { name: "Confirmed", bookings: 28, color: "#4CAF50" },
    { name: "Pending", bookings: 18, color: "#F5C765" },
    { name: "Cancelled", bookings: 12, color: "#EF5350" }
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">Analytics & Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedStartDate} - {formattedEndDate}
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Total Revenue"
          value="$32,845.00"
          icon="ri-money-dollar-circle-line"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend={{ value: "8.2% vs previous period", isPositive: true }}
        />
        
        <StatCard
          title="Total Bookings"
          value="178"
          icon="ri-calendar-check-line"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{ value: "4.3% vs previous period", isPositive: true }}
        />
        
        <StatCard
          title="Average Booking Value"
          value="$184.52"
          icon="ri-line-chart-line"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          trend={{ value: "3.7% vs previous period", isPositive: true }}
        />
        
        <StatCard
          title="Commission Paid"
          value="$3,284.50"
          icon="ri-percent-line"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          subtitle="10% platform fee"
        />
      </div>
      
      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Revenue Trend</CardTitle>
              <Select 
                defaultValue={timeframe} 
                onValueChange={(value: "week" | "month" | "year") => setTimeframe(value)}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#E9ECEF' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      domain={[0, 'dataMax + 5']}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue ($)"
                      stroke="#3A7CA5"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bookings"
                      name="Bookings"
                      stroke="#F5C765"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Service Type Breakdown */}
        <div>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Service Breakdown</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Filter className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px] flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={serviceTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {serviceTypeData.map((entry, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: entry.color }}
                      ></span>
                      <span className="text-neutral-700 mr-1">{entry.name}:</span>
                      <span className="font-medium">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Sources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Booking Sources</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingSourceData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {bookingSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Booking Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Booking Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingStatusData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" radius={[4, 4, 0, 0]}>
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
