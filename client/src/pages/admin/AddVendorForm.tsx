import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const AddVendorForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    businessName: '',
    email: '',
    businessType: '',
    categories: {
      stay: false,
      vehicle: false,
      tickets: false,
      wellness: false,
      tours: false,
      products: false
    }
  });
  
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createVendorMutation = useMutation({
    mutationFn: async (vendorData: any) => {
      const response = await apiRequest('POST', '/api/vendors', vendorData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Vendor created successfully",
        description: `${data.fullName} has been added to the platform`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      setLocation('/admin/vendors');
    },
    onError: (error: any) => {
      toast({
        title: "Error creating vendor",
        description: error.message || "Failed to create vendor",
        variant: "destructive"
      });
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: checked
      }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.username || !formData.password || !formData.fullName || !formData.businessName || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Convert categories to array format
    const categoriesAllowed = Object.keys(formData.categories).filter(
      key => formData.categories[key as keyof typeof formData.categories]
    );
    
    const vendorData = {
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      businessName: formData.businessName,
      email: formData.email,
      businessType: formData.businessType,
      categoriesAllowed
    };
    
    createVendorMutation.mutate(vendorData);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-4 p-0 h-auto" 
          onClick={() => window.location.href = "/dashboard"}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Vendor</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter business name"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="businessType">Business Type</Label>
                <Select 
                  value={formData.businessType}
                  onValueChange={(value) => handleSelectChange('businessType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel / Resort</SelectItem>
                    <SelectItem value="villa">Villa / Homestay</SelectItem>
                    <SelectItem value="transport">Transport Company</SelectItem>
                    <SelectItem value="tour">Tour Operator</SelectItem>
                    <SelectItem value="wellness">Wellness Center</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Booking Categories Access</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="stay"
                    checked={formData.categories.stay}
                    onCheckedChange={(checked) => 
                      handleCategoryChange('stay', checked as boolean)
                    }
                  />
                  <label
                    htmlFor="stay"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Stay
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="vehicle"
                    checked={formData.categories.vehicle}
                    onCheckedChange={(checked) => 
                      handleCategoryChange('vehicle', checked as boolean)
                    }
                  />
                  <label
                    htmlFor="vehicle"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Vehicle
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tickets"
                    checked={formData.categories.tickets}
                    onCheckedChange={(checked) => 
                      handleCategoryChange('tickets', checked as boolean)
                    }
                  />
                  <label
                    htmlFor="tickets"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tickets
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="wellness"
                    checked={formData.categories.wellness}
                    onCheckedChange={(checked) => 
                      handleCategoryChange('wellness', checked as boolean)
                    }
                  />
                  <label
                    htmlFor="wellness"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Wellness
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="tours"
                    checked={formData.categories.tours}
                    onCheckedChange={(checked) => 
                      handleCategoryChange('tours', checked as boolean)
                    }
                  />
                  <label
                    htmlFor="tours"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tours
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="products"
                    checked={formData.categories.products}
                    onCheckedChange={(checked) => 
                      handleCategoryChange('products', checked as boolean)
                    }
                  />
                  <label
                    htmlFor="products"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Products
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin/vendors")}
                disabled={createVendorMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createVendorMutation.isPending}>
                {createVendorMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Vendor"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddVendorForm;