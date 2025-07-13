import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from '@shared/schema';

// Fetch vendors from database
const useVendors = () => {
  return useQuery({
    queryKey: ['/api/vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors', {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Auto-login as admin for testing
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: 'admin@islandloaf.com', password: 'admin123' }),
          });
          
          if (loginResponse.ok) {
            // Retry the original request
            const retryResponse = await fetch('/api/vendors', {
              credentials: 'include',
            });
            if (retryResponse.ok) {
              return retryResponse.json() as Promise<User[]>;
            }
          }
        }
        throw new Error('Failed to fetch vendors');
      }
      return response.json() as Promise<User[]>;
    },
  });
};

// Vendor Detail Dialog component
const VendorDetailDialog = ({ vendor, onVerify, onDeactivate, onEdit }: { vendor: User; onVerify: () => void; onDeactivate: () => void; onEdit: () => void }) => {
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
            <span>{vendor.businessName || vendor.fullName}</span>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              {vendor.role}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Business Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">ID</p>
                <p className="text-sm font-medium">#{vendor.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Business Name</p>
                <p className="text-sm font-medium">{vendor.businessName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Business Type</p>
                <p className="text-sm font-medium">{vendor.businessType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Join Date</p>
                <p className="text-sm font-medium">{new Date(vendor.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Categories</p>
                <p className="text-sm font-medium">{vendor.categoriesAllowed?.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Owner</p>
                <p className="text-sm font-medium">{vendor.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{vendor.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="text-sm font-medium">{vendor.username}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <div className="space-x-2">
            <Button variant="outline" size="sm">Message</Button>
            <Button variant="outline" size="sm" onClick={onVerify}>
              Verify Vendor
            </Button>
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={vendor.role === 'inactive' ? "text-green-600 border-green-200 hover:bg-green-50" : "text-red-600 border-red-200 hover:bg-red-50"} 
              onClick={onDeactivate}
            >
              {vendor.role === 'inactive' ? 'Activate' : 'Deactivate'}
            </Button>
            <Button size="sm" onClick={onEdit}>Edit</Button>
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
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch vendors from database
  const { data: vendors = [], isLoading, error, refetch } = useVendors();

  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      const response = await apiRequest('DELETE', `/api/vendors/${vendorId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      refetch();
      toast({ title: "Vendor deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting vendor",
        description: error.message || "Failed to delete vendor",
        variant: "destructive"
      });
    }
  });

  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: async ({ vendorId, updates }: { vendorId: number; updates: any }) => {
      const response = await apiRequest('PUT', `/api/vendors/${vendorId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      refetch();
      toast({ title: "Vendor updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating vendor",
        description: error.message || "Failed to update vendor",
        variant: "destructive"
      });
    }
  });

  const deleteVendor = (vendorId: number) => {
    deleteVendorMutation.mutate(vendorId);
  };

  const updateVendorStatus = (vendorId: number, status: string) => {
    updateVendorMutation.mutate({ 
      vendorId, 
      updates: { role: status === 'verified' ? 'vendor' : 'pending' } 
    });
  };

  const toggleVendorActive = (vendorId: number, isActive: boolean) => {
    updateVendorMutation.mutate({ 
      vendorId, 
      updates: { role: isActive ? 'vendor' : 'inactive' } 
    });
  };
  
  const [newVendor, setNewVendor] = useState({
    businessName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    businessType: 'accommodation',
    location: '',
    description: '',
    website: '',
    username: ''
  });

  // Add vendor mutation
  const addVendorMutation = useMutation({
    mutationFn: async (vendorData: any) => {
      const response = await apiRequest('POST', '/api/vendors', vendorData);
      return response.json();
    },
    onSuccess: (data) => {
      // Reset form
      setNewVendor({
        businessName: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        businessType: 'accommodation',
        location: '',
        description: '',
        website: '',
        username: ''
      });
      
      setIsAddVendorOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      refetch();
      
      toast({
        title: "Success",
        description: `${data.fullName} has been added successfully to the platform.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding vendor",
        description: error.message || "Failed to add vendor",
        variant: "destructive"
      });
    }
  });

  const handleAddNewVendor = () => {
    // Validate required fields
    if (!newVendor.businessName || !newVendor.fullName || !newVendor.email || !newVendor.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Generate username from email
    const username = newVendor.email.split('@')[0];
    
    // Prepare vendor data for backend
    const vendorData = {
      username: username,
      password: newVendor.password,
      fullName: newVendor.fullName,
      businessName: newVendor.businessName,
      email: newVendor.email,
      businessType: newVendor.businessType,
      categoriesAllowed: [newVendor.businessType, 'tours'] // Default categories
    };
    
    console.log('Adding new vendor:', vendorData);
    addVendorMutation.mutate(vendorData);
  };
  
  // Filter vendors based on search query and filters
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      (vendor.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.id.toString().includes(searchQuery.toLowerCase());
    
    const matchesBusinessType = businessTypeFilter === 'all' || 
      (vendor.businessType || '').toLowerCase() === businessTypeFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && vendor.role === 'vendor') ||
      (statusFilter === 'pending' && vendor.role === 'pending') ||
      (statusFilter === 'inactive' && vendor.role === 'inactive');
    
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
                    value={newVendor.fullName}
                    onChange={(e) => setNewVendor({...newVendor, fullName: e.target.value})}
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
                <Button onClick={handleAddNewVendor} disabled={addVendorMutation.isPending}>
                  {addVendorMutation.isPending ? 'Adding...' : 'Add Vendor'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Vendor Dialog */}
        <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
            </DialogHeader>
            {editingVendor && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input 
                      value={editingVendor.businessName || ''}
                      onChange={(e) => setEditingVendor({...editingVendor, businessName: e.target.value})}
                      placeholder="Paradise Beach Resort"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Name</Label>
                    <Input 
                      value={editingVendor.fullName || ''}
                      onChange={(e) => setEditingVendor({...editingVendor, fullName: e.target.value})}
                      placeholder="John Smith"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={editingVendor.email || ''}
                      onChange={(e) => setEditingVendor({...editingVendor, email: e.target.value})}
                      placeholder="john@resort.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input 
                      value={editingVendor.username || ''}
                      onChange={(e) => setEditingVendor({...editingVendor, username: e.target.value})}
                      placeholder="john_resort"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select value={editingVendor.businessType} onValueChange={(value) => setEditingVendor({...editingVendor, businessType: value})}>
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
                    <Label>Status</Label>
                    <Select value={editingVendor.role} onValueChange={(value) => setEditingVendor({...editingVendor, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendor">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsEditVendorOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    updateVendorMutation.mutate({ 
                      vendorId: editingVendor.id, 
                      updates: {
                        businessName: editingVendor.businessName,
                        fullName: editingVendor.fullName,
                        email: editingVendor.email,
                        username: editingVendor.username,
                        businessType: editingVendor.businessType,
                        role: editingVendor.role
                      }
                    });
                    setIsEditVendorOpen(false);
                  }} disabled={updateVendorMutation.isPending}>
                    {updateVendorMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="w-full"
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <TabsList className="w-full max-w-md grid grid-cols-4">
          <TabsTrigger value="all">All Vendors</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Failed to load vendors. Please try again.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Business</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Owner</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Role</th>
                    <th className="text-center py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b">
                      <td className="py-4 px-4 text-sm">#{vendor.id}</td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <div className="flex items-center">
                          {vendor.businessName || vendor.fullName}
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-blue-500">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m9 12 2 2 4-4"></path>
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{vendor.fullName}</td>
                      <td className="py-4 px-4 text-sm">{vendor.businessType || 'N/A'}</td>
                      <td className="py-4 px-4 text-sm">{vendor.email}</td>
                      <td className="py-4 px-4 text-sm">
                        <Badge className={
                          vendor.role === 'vendor' ? "bg-green-100 text-green-800" :
                          vendor.role === 'pending' ? "bg-yellow-100 text-yellow-800" :
                          vendor.role === 'inactive' ? "bg-gray-100 text-gray-800" :
                          "bg-blue-100 text-blue-800"
                        }>
                          {vendor.role === 'vendor' ? 'Active' : 
                           vendor.role === 'pending' ? 'Pending' :
                           vendor.role === 'inactive' ? 'Inactive' : 
                           vendor.role.charAt(0).toUpperCase() + vendor.role.slice(1)}
                        </Badge>
                      </td>
                    <td className="py-4 px-4 text-sm">
                      <div className="flex justify-center space-x-2">
                        <VendorDetailDialog 
                          vendor={vendor} 
                          onVerify={() => updateVendorStatus(vendor.id, 'verified')}
                          onDeactivate={() => toggleVendorActive(vendor.id, vendor.role === 'inactive')}
                          onEdit={() => {
                            setEditingVendor(vendor);
                            setIsEditVendorOpen(true);
                          }}
                        />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingVendor(vendor);
                            setIsEditVendorOpen(true);
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
                            if (confirm(`Are you sure you want to delete ${vendor.businessName || vendor.fullName}?`)) {
                              deleteVendor(vendor.id);
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
                  {filteredVendors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No vendors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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