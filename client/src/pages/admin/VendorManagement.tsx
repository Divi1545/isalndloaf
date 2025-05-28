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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Sample vendor data
const vendors = [
  { 
    id: 'V-1001', 
    name: 'Beach Paradise Villa', 
    owner: 'Island Vendor', 
    email: 'vendor@islandloaf.com',
    phone: '+94 76 123 4567',
    business: 'Accommodation', 
    revenue: '$12,628', 
    status: 'active',
    verified: true,
    joinDate: '2024-01-15',
    location: 'Mirissa, Sri Lanka',
    rating: 4.8,
    listings: 3,
    completedBookings: 78,
    description: 'Luxury beachfront villas with private pools and stunning ocean views. Perfect for couples and families looking for privacy and comfort.'
  },
  { 
    id: 'V-1002', 
    name: 'Island Adventures', 
    owner: 'John Smith', 
    email: 'john@islandadventures.com',
    phone: '+94 77 234 5678',
    business: 'Tours', 
    revenue: '$8,450', 
    status: 'active',
    verified: true,
    joinDate: '2024-02-10',
    location: 'Unawatuna, Sri Lanka',
    rating: 4.6,
    listings: 5,
    completedBookings: 124,
    description: 'Exciting guided tours including whale watching, jungle safaris, and cultural heritage trips around southern Sri Lanka.'
  },
  { 
    id: 'V-1003', 
    name: 'Coastal Scooters', 
    owner: 'Maria Rodriguez', 
    email: 'maria@coastalscooters.com',
    phone: '+94 75 345 6789',
    business: 'Transport', 
    revenue: '$5,920', 
    status: 'active',
    verified: true,
    joinDate: '2024-02-25',
    location: 'Galle, Sri Lanka',
    rating: 4.5,
    listings: 2,
    completedBookings: 210,
    description: 'Scooter and motorcycle rentals with delivery to hotels and villas. Free helmets and safety gear included with all rentals.'
  },
  { 
    id: 'V-1004', 
    name: 'Serenity Spa', 
    owner: 'Raj Patel', 
    email: 'raj@serenityspa.com',
    phone: '+94 71 456 7890',
    business: 'Wellness', 
    revenue: '$7,340', 
    status: 'pending',
    verified: false,
    joinDate: '2024-03-05',
    location: 'Weligama, Sri Lanka',
    rating: null,
    listings: 1,
    completedBookings: 0,
    description: 'Traditional Ayurvedic treatments and modern spa services in a serene environment. Specializing in traditional Sri Lankan wellness techniques.'
  },
  { 
    id: 'V-1005', 
    name: 'Mountain Retreat', 
    owner: 'Sarah Johnson', 
    email: 'sarah@mountainretreat.com',
    phone: '+94 78 567 8901',
    business: 'Accommodation', 
    revenue: '$9,125', 
    status: 'active',
    verified: true,
    joinDate: '2024-01-20',
    location: 'Ella, Sri Lanka',
    rating: 4.7,
    listings: 2,
    completedBookings: 55,
    description: 'Secluded mountain cabins with panoramic views of tea plantations and waterfalls. Perfect for hiking enthusiasts and nature lovers.'
  },
];

// Vendor Detail Dialog component
const VendorDetailDialog = ({ vendor }: { vendor: typeof vendors[0] }) => {
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span>{vendor.name}</span>
            {vendor.verified && (
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                Verified
              </Badge>
            )}
            <Badge className={`ml-2 ${
              vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Business Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">ID</p>
                <p className="text-sm font-medium">{vendor.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Business Type</p>
                <p className="text-sm font-medium">{vendor.business}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium">{vendor.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Join Date</p>
                <p className="text-sm font-medium">{new Date(vendor.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm">{vendor.description}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Owner</p>
                <p className="text-sm font-medium">{vendor.owner}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{vendor.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{vendor.phone}</p>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">Performance</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-sm font-medium">{vendor.revenue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Listings</p>
                <p className="text-sm font-medium">{vendor.listings}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed Bookings</p>
                <p className="text-sm font-medium">{vendor.completedBookings}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <p className="text-sm font-medium">{vendor.rating ? `${vendor.rating}/5.0` : 'No ratings yet'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <div className="space-x-2">
            <Button variant="outline" size="sm">Message</Button>
            <Button variant="outline" size="sm">
              {vendor.verified ? 'Remove Verification' : 'Verify Vendor'}
            </Button>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              {vendor.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button size="sm">Edit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const VendorManagement = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const { toast } = useToast();
  
  const [newVendor, setNewVendor] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    businessType: 'accommodation',
    location: '',
    description: '',
    website: ''
  });

  const handleAddNewVendor = () => {
    // Add the new vendor to the system
    console.log('Adding new vendor:', newVendor);
    
    // Reset form
    setNewVendor({
      businessName: '',
      ownerName: '',
      email: '',
      phone: '',
      password: '',
      businessType: 'accommodation',
      location: '',
      description: '',
      website: ''
    });
    
    setIsAddVendorOpen(false);
    
    toast({
      title: "Success",
      description: "New vendor has been added successfully and will be reviewed for approval."
    });
  };
  
  // Filter vendors based on search query and filters
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBusinessType = businessTypeFilter === 'all' || 
      vendor.business.toLowerCase() === businessTypeFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || 
      vendor.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesBusinessType && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
        <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
          <DialogTrigger asChild>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Add New Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input 
                    value={newVendor.businessName}
                    onChange={(e) => setNewVendor({...newVendor, businessName: e.target.value})}
                    placeholder="Paradise Beach Resort"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input 
                    value={newVendor.ownerName}
                    onChange={(e) => setNewVendor({...newVendor, ownerName: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                    placeholder="owner@business.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                    placeholder="+94 76 123 4567"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  type="password"
                  value={newVendor.password}
                  onChange={(e) => setNewVendor({...newVendor, password: e.target.value})}
                  placeholder="Set a password for vendor login"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select value={newVendor.businessType} onValueChange={(value) => setNewVendor({...newVendor, businessType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accommodation">Accommodation</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="tours">Tours & Activities</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                      <SelectItem value="dining">Dining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    value={newVendor.location}
                    onChange={(e) => setNewVendor({...newVendor, location: e.target.value})}
                    placeholder="Mirissa, Sri Lanka"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Website (Optional)</Label>
                <Input 
                  value={newVendor.website}
                  onChange={(e) => setNewVendor({...newVendor, website: e.target.value})}
                  placeholder="https://www.business.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Business Description</Label>
                <Textarea 
                  value={newVendor.description}
                  onChange={(e) => setNewVendor({...newVendor, description: e.target.value})}
                  placeholder="Describe your business services and offerings..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddVendorOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNewVendor}>
                  Add Vendor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="w-full"
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="all">All Vendors</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[300px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-4">
              <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Business Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="tours">Tours</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Business</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b">
                    <td className="py-4 px-4 text-sm">{vendor.id}</td>
                    <td className="py-4 px-4 text-sm font-medium">
                      <div className="flex items-center">
                        {vendor.name}
                        {vendor.verified && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-blue-500">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m9 12 2 2 4-4"></path>
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">{vendor.owner}</td>
                    <td className="py-4 px-4 text-sm">{vendor.business}</td>
                    <td className="py-4 px-4 text-sm">{vendor.revenue}</td>
                    <td className="py-4 px-4 text-sm">
                      <Badge className={`${
                        vendor.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                      }`}>
                        {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <div className="flex justify-center space-x-2">
                        <VendorDetailDialog vendor={vendor} />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            // Navigate to edit vendor page
                            setLocation(`/admin/vendors/edit/${vendor.id}`);
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
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
                              // Add delete functionality here
                              console.log(`Deleting vendor: ${vendor.id}`);
                            }
                          }}
                        >
                          <span className="sr-only">Delete</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="text-sm text-muted-foreground">Showing {filteredVendors.length} of {vendors.length} vendors</div>
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

export default VendorManagement;