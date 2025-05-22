import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Transactions page according to the checklist
const TransactionHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const { toast } = useToast();
  
  // Sample transactions data for demonstration
  const transactions = [
    {
      id: 'TRX-2025-001',
      vendorId: 'V-1001',
      vendorName: 'Beach Paradise Villa',
      amount: 384.97,
      bookingId: 'B-3001',
      status: 'completed',
      date: '2025-04-15',
      paymentMethod: 'Direct deposit',
      commission: 38.50
    },
    {
      id: 'TRX-2025-002',
      vendorId: 'V-1002',
      vendorName: 'Island Adventures',
      amount: 127.46,
      bookingId: 'B-3005',
      status: 'pending',
      date: '2025-04-18',
      paymentMethod: 'Bank transfer',
      commission: 19.12
    },
    {
      id: 'TRX-2025-003',
      vendorId: 'V-1003',
      vendorName: 'Coastal Scooters',
      amount: 76.47,
      bookingId: 'B-3006',
      status: 'completed',
      date: '2025-04-22',
      paymentMethod: 'Direct deposit',
      commission: 9.18
    },
    {
      id: 'TRX-2025-004',
      vendorId: 'V-1001',
      vendorName: 'Beach Paradise Villa',
      amount: 850.00,
      bookingId: 'B-3002',
      status: 'completed',
      date: '2025-04-25',
      paymentMethod: 'Direct deposit',
      commission: 85.00
    },
    {
      id: 'TRX-2025-005',
      vendorId: 'V-1004',
      vendorName: 'Wellness Retreat',
      amount: 305.99,
      bookingId: 'B-3007',
      status: 'failed',
      date: '2025-04-27',
      paymentMethod: 'Bank transfer',
      commission: 45.90
    },
    {
      id: 'TRX-2025-006',
      vendorId: 'V-1005',
      vendorName: 'Seafood Delight',
      amount: 210.50,
      bookingId: 'B-3008',
      status: 'pending',
      date: '2025-04-30',
      paymentMethod: 'Direct deposit',
      commission: 31.58
    }
  ];

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      transaction.status === statusFilter;
    
    // In a real implementation, we would add date range filtering
    
    return matchesSearch && matchesStatus;
  });

  // Handle CSV export (reusing the report download logic from AdminDashboard)
  const handleExportCSV = async () => {
    try {
      toast({
        title: "Preparing export",
        description: "Your transaction data is being prepared for download"
      });
      
      // Here we could call a real API endpoint that generates the CSV based on filters
      // For demo, we'll use our existing report endpoint
      const response = await fetch('/api/reports/generate');
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'islandloaf_transactions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export complete",
        description: "Transaction data has been downloaded successfully",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your transaction data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <Button onClick={handleExportCSV}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" x2="12" y1="15" y2="3"></line>
          </svg>
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Payouts & Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search by ID, vendor or booking..."
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Vendor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Commission</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Booking ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 text-sm">{transaction.id}</td>
                    <td className="px-4 py-3 text-sm">{transaction.vendorName}</td>
                    <td className="px-4 py-3 text-sm">${transaction.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">${transaction.commission.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{transaction.bookingId}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={`${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                        ''
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">View details</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </Button>
                        {transaction.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Process</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="3" x2="21" y1="9" y2="9"></line>
                  <path d="m9 16 3-3 3 3"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-1">No transactions found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Transactions</div>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Amount</div>
              <div className="text-2xl font-bold">
                ${transactions.reduce((sum, tr) => sum + tr.amount, 0).toFixed(2)}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Commission</div>
              <div className="text-2xl font-bold">
                ${transactions.reduce((sum, tr) => sum + tr.commission, 0).toFixed(2)}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Pending Payments</div>
              <div className="text-2xl font-bold">
                ${transactions
                  .filter(tr => tr.status === 'pending')
                  .reduce((sum, tr) => sum + tr.amount, 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;