import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Analytics dashboard component according to the checklist
const AnalyticsDashboard = () => {
  // Monthly booking revenue data
  const revenueData = [
    { name: 'Jan', revenue: 24000 },
    { name: 'Feb', revenue: 26000 },
    { name: 'Mar', revenue: 32000 },
    { name: 'Apr', revenue: 45000 },
    { name: 'May', revenue: 58000 },
    { name: 'Jun', revenue: 67000 },
    { name: 'Jul', revenue: 72000 },
    { name: 'Aug', revenue: 65000 },
    { name: 'Sep', revenue: 53000 },
    { name: 'Oct', revenue: 42000 },
    { name: 'Nov', revenue: 38000 },
    { name: 'Dec', revenue: 48000 },
  ];

  // Vendor performance data
  const vendorPerformanceData = [
    { name: 'Beach Paradise Villa', value: 45, color: '#8884d8' },
    { name: 'Island Adventures', value: 25, color: '#82ca9d' },
    { name: 'Coastal Scooters', value: 15, color: '#ffc658' },
    { name: 'Seafood Delight', value: 10, color: '#ff8042' },
    { name: 'Wellness Retreat', value: 5, color: '#0088fe' },
  ];

  // Category distribution data
  const categoryData = [
    { name: 'Stay', bookings: 580 },
    { name: 'Vehicle', bookings: 250 },
    { name: 'Ticket', bookings: 400 },
    { name: 'Wellness', bookings: 150 },
    { name: 'Food', bookings: 220 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Export Data
          </button>
        </div>
      </div>

      {/* Monthly Booking Revenue Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Booking Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `$${value / 1000}k`}
                  domain={[0, 'dataMax + 10000']} 
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendor Performance Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vendorPerformanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {vendorPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional metrics and stats */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Average Booking Value</div>
              <div className="text-2xl font-bold">$345.28</div>
              <div className="text-xs text-green-600 mt-1">+12.5% vs last year</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Conversion Rate</div>
              <div className="text-2xl font-bold">18.4%</div>
              <div className="text-xs text-green-600 mt-1">+2.1% vs last year</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Repeat Booking Rate</div>
              <div className="text-2xl font-bold">24.7%</div>
              <div className="text-xs text-red-600 mt-1">-1.3% vs last year</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;