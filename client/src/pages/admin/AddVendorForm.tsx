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
import { ArrowLeft } from "lucide-react";

const AddVendorForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: '',
    categories: {
      stay: false,
      vehicle: false,
      tickets: false,
      wellness: false
    },
    commission: '10',
    status: 'active'
  });
  
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
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
    
    // Convert categories to array format
    const categoriesAllowed = Object.keys(formData.categories).filter(
      key => formData.categories[key as keyof typeof formData.categories]
    );
    
    const vendorData = {
      ...formData,
      categories_allowed: categoriesAllowed
    };
    
    // In a real app, this would make an API call
    console.log("Creating vendor:", vendorData);
    
    toast({
      title: "Vendor created successfully",
      description: `${formData.name} has been added to the platform`
    });
    
    // Redirect back to admin dashboard after a short delay
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
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
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter business address"
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
              
              <div className="space-y-3">
                <Label htmlFor="commission">Platform Commission (%)</Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Booking Categories Access</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
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
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Vendor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddVendorForm;