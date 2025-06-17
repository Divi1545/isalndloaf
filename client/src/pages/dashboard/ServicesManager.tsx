import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, DollarSign, Image, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  airtableId: string;
  vendorId: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  availability: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    serviceName: '',
    category: '',
    description: '',
    price: '',
    currency: 'LKR',
    imageUrl: '',
    availability: 'Available'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: () => apiRequest('GET', '/api/services')
  });

  // Fetch vendors for dropdown
  const { data: vendorsData } = useQuery({
    queryKey: ['/api/airtable/vendors'],
    queryFn: () => apiRequest('GET', '/api/airtable/vendors')
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: (serviceData: any) => apiRequest('POST', '/api/services', serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsDialogOpen(false);
      setFormData({
        vendorId: '',
        serviceName: '',
        category: '',
        description: '',
        price: '',
        currency: 'LKR',
        imageUrl: '',
        availability: 'Available'
      });
      toast({
        title: "Service Created",
        description: "New service has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createServiceMutation.mutate(formData);
  };

  const services = servicesData?.data || [];
  const vendors = vendorsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services Catalog</h1>
          <p className="text-muted-foreground">
            Manage tourism services and offerings across all vendors
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Select Vendor</Label>
                  <Select 
                    value={formData.vendorId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose vendor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                      <SelectItem value="Tours">Tours</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Activities">Activities</SelectItem>
                      <SelectItem value="Wellness">Wellness</SelectItem>
                      <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                  placeholder="Enter service name..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the service..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LKR">LKR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select 
                    value={formData.availability} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Limited">Limited</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createServiceMutation.isPending}
                >
                  {createServiceMutation.isPending ? "Creating..." : "Create Service"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service: Service) => (
          <Card key={service.id} className="overflow-hidden">
            {service.imageUrl ? (
              <div className="h-48 bg-gray-200">
                <img 
                  src={service.imageUrl} 
                  alt={service.serviceName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                <Badge variant={service.availability === 'Available' ? 'default' : 'secondary'}>
                  {service.availability}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{service.category}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                {service.description.length > 100 
                  ? `${service.description.substring(0, 100)}...` 
                  : service.description
                }
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-lg font-semibold text-primary">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {service.currency} {Number(service.price).toLocaleString()}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Vendor: {service.vendorId}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first tourism service
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </Card>
      )}
    </div>
  );
}