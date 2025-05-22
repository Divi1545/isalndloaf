import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Revenue summary component
const RevenueSummary = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue (MTD)</p>
              <p className="text-3xl font-bold mt-1">$24,680</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-600">+8.3%</span>
                <span className="text-xs text-muted-foreground ml-1">vs. last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform Commission</p>
              <p className="text-3xl font-bold mt-1">$2,925</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-600">+12.1%</span>
                <span className="text-xs text-muted-foreground ml-1">vs. last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
              <p className="text-3xl font-bold mt-1">$6,890</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-amber-600">10 vendors</span>
                <span className="text-xs text-muted-foreground ml-1">to be processed</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Revenue by Category component
const RevenueByCategory = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium text-lg mb-4">Revenue by Category</h3>
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
      </CardContent>
    </Card>
  );
};

// Commission Settings component
const CommissionSettings = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium text-lg mb-4">Platform Commission Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Accommodation Rate (%)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                <Input defaultValue="10" className="pl-7" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Transport Rate (%)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                <Input defaultValue="12" className="pl-7" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tours & Activities Rate (%)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                <Input defaultValue="15" className="pl-7" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Wellness Rate (%)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                <Input defaultValue="10" className="pl-7" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Processing Fee (%)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              <Input defaultValue="2.5" className="pl-7" />
            </div>
          </div>
          <Button className="w-full">Update Commission Rates</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Top Earning Vendors component
const TopEarningVendors = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium text-lg mb-4">Top Earning Vendors</h3>
        <div className="space-y-4">
          {[
            { rank: 1, name: 'Beach Paradise Villa', revenue: '$12,628', growth: '+8.5%', category: 'Accommodation' },
            { rank: 2, name: 'Island Adventures', revenue: '$8,450', growth: '+12.3%', category: 'Tours' },
            { rank: 3, name: 'Mountain Retreat', revenue: '$9,125', growth: '+5.8%', category: 'Accommodation' },
            { rank: 4, name: 'Coastal Scooters', revenue: '$5,920', growth: '+15.2%', category: 'Transport' },
            { rank: 5, name: 'Serenity Spa', revenue: '$7,340', growth: '-2.1%', category: 'Wellness' },
          ].map((vendor, index) => (
            <div key={index} className="flex items-center p-3 rounded-md border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium">{vendor.rank}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{vendor.name}</p>
                <p className="text-xs text-muted-foreground">{vendor.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{vendor.revenue}</p>
                <p className={`text-xs ${vendor.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {vendor.growth}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Vendor Payout List component
const VendorPayoutList = () => {
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  
  const toggleSelectAll = () => {
    if (selectedPayouts.length === vendors.length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(vendors.map(v => v.id));
    }
  };
  
  const toggleSelectVendor = (id: string) => {
    if (selectedPayouts.includes(id)) {
      setSelectedPayouts(selectedPayouts.filter(p => p !== id));
    } else {
      setSelectedPayouts([...selectedPayouts, id]);
    }
  };
  
  // Sample vendor data
  const vendors = [
    { id: 'V-1001', name: 'Beach Paradise Villa', amount: '$1,150.25', period: 'May 2025', status: 'pending' },
    { id: 'V-1002', name: 'Island Adventures', amount: '$850.75', period: 'May 2025', status: 'pending' },
    { id: 'V-1003', name: 'Coastal Scooters', amount: '$420.50', period: 'May 2025', status: 'pending' },
    { id: 'V-1004', name: 'Mountain Retreat', amount: '$920.30', period: 'May 2025', status: 'pending' },
    { id: 'V-1005', name: 'Serenity Spa', amount: '$680.15', period: 'May 2025', status: 'pending' },
  ];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Pending Vendor Payouts</h3>
          <Button disabled={selectedPayouts.length === 0} size="sm">
            Process Selected
          </Button>
        </div>
        
        <div className="border rounded-md">
          <div className="flex items-center p-4 border-b bg-slate-50">
            <div className="pr-4">
              <input 
                type="checkbox" 
                checked={selectedPayouts.length === vendors.length} 
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded"
              />
            </div>
            <div className="grid grid-cols-5 w-full text-sm font-medium">
              <div>Vendor</div>
              <div>Vendor ID</div>
              <div>Amount</div>
              <div>Period</div>
              <div>Status</div>
            </div>
          </div>
          
          {vendors.map((vendor, index) => (
            <div key={index} className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50">
              <div className="pr-4">
                <input 
                  type="checkbox" 
                  checked={selectedPayouts.includes(vendor.id)} 
                  onChange={() => toggleSelectVendor(vendor.id)}
                  className="h-4 w-4 rounded"
                />
              </div>
              <div className="grid grid-cols-5 w-full text-sm">
                <div className="font-medium">{vendor.name}</div>
                <div>{vendor.id}</div>
                <div>{vendor.amount}</div>
                <div>{vendor.period}</div>
                <div>
                  <Badge className="bg-amber-100 text-amber-800">
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Payment Method Distribution component
const PaymentMethodDistribution = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium text-lg mb-4">Payment Method Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-8 border-blue-500 flex items-center justify-center mb-2">
              <span className="text-lg font-bold">68%</span>
            </div>
            <p className="text-sm font-medium">Credit Card</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-8 border-green-500 flex items-center justify-center mb-2">
              <span className="text-lg font-bold">22%</span>
            </div>
            <p className="text-sm font-medium">PayPal</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-8 border-amber-500 flex items-center justify-center mb-2">
              <span className="text-lg font-bold">10%</span>
            </div>
            <p className="text-sm font-medium">Bank Transfer</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RevenueManagement = () => {
  const [timeframe, setTimeframe] = useState('thisMonth');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Revenue Management</h1>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
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
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            Export Report
          </Button>
        </div>
      </div>
      
      <RevenueSummary />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payouts">Vendor Payouts</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <RevenueByCategory />
            <TopEarningVendors />
          </div>
          <PaymentMethodDistribution />
        </TabsContent>
        
        <TabsContent value="payouts" className="mt-6">
          <VendorPayoutList />
        </TabsContent>
        
        <TabsContent value="commission" className="mt-6">
          <CommissionSettings />
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-lg mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Booking ID</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Payment Method</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'T-50123', bookingId: 'B-3001', customer: 'Sarah Johnson', amount: '$449.97', method: 'Credit Card', status: 'completed', date: '2025-04-10' },
                      { id: 'T-50124', bookingId: 'B-3002', customer: 'Michael Chen', amount: '$449.97', method: 'PayPal', status: 'completed', date: '2025-04-12' },
                      { id: 'T-50125', bookingId: 'B-3004', customer: 'James Taylor', amount: '$999.95', method: 'Credit Card', status: 'completed', date: '2025-04-18' },
                      { id: 'T-50126', bookingId: 'B-3006', customer: 'Akira Tanaka', amount: '$89.97', method: 'Credit Card', status: 'completed', date: '2025-04-25' },
                      { id: 'T-50127', bookingId: 'B-3005', customer: 'Sophie Dubois', amount: '$149.95', method: 'Credit Card', status: 'pending', date: '2025-04-22' },
                    ].map((transaction, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 text-sm">{transaction.id}</td>
                        <td className="py-3 px-4 text-sm">{transaction.bookingId}</td>
                        <td className="py-3 px-4 text-sm">{transaction.customer}</td>
                        <td className="py-3 px-4 text-sm">{transaction.amount}</td>
                        <td className="py-3 px-4 text-sm">{transaction.method}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge className={`${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-lg mb-4">Available Reports</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {[
                  { title: 'Monthly Revenue Report', icon: 'bar-chart-2', description: 'Detailed breakdown of all revenue streams by month' },
                  { title: 'Vendor Performance', icon: 'trending-up', description: 'Analysis of vendor performance metrics and revenue' },
                  { title: 'Commission Analysis', icon: 'percent', description: 'Breakdown of commission earnings by category and vendor' },
                  { title: 'Payment Method Report', icon: 'credit-card', description: 'Distribution of payment methods and transaction success rates' },
                  { title: 'Geographical Revenue', icon: 'map', description: 'Revenue distribution by customer country and region' },
                  { title: 'Booking Revenue Forecast', icon: 'trending-up', description: 'Projected revenue based on current booking patterns' },
                ].map((report, index) => (
                  <div key={index} className="border rounded-md p-4 flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {report.icon === 'bar-chart-2' && (
                            <>
                              <line x1="18" y1="20" x2="18" y2="10"></line>
                              <line x1="12" y1="20" x2="12" y2="4"></line>
                              <line x1="6" y1="20" x2="6" y2="14"></line>
                            </>
                          )}
                          {report.icon === 'trending-up' && (
                            <>
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                              <polyline points="17 6 23 6 23 12"></polyline>
                            </>
                          )}
                          {report.icon === 'percent' && (
                            <>
                              <line x1="19" y1="5" x2="5" y2="19"></line>
                              <circle cx="6.5" cy="6.5" r="2.5"></circle>
                              <circle cx="17.5" cy="17.5" r="2.5"></circle>
                            </>
                          )}
                          {report.icon === 'credit-card' && (
                            <>
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                              <line x1="1" y1="10" x2="23" y2="10"></line>
                            </>
                          )}
                          {report.icon === 'map' && (
                            <>
                              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                              <line x1="8" y1="2" x2="8" y2="18"></line>
                              <line x1="16" y1="6" x2="16" y2="22"></line>
                            </>
                          )}
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{report.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                      <Button variant="link" className="h-6 p-0 mt-2 text-sm">Download PDF</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueManagement;