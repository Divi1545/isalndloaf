import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface VehicleBookingFormProps {
  onSuccess: () => void;
}

const VehicleBookingForm = ({ onSuccess }: VehicleBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: '',
    pickupLocation: '',
    pickupDate: '2025-06-01',
    returnDate: '2025-06-03',
    withDriver: false,
    priceRate: 'day', // 'hour' or 'day'
    basePrice: '50',
    taxRate: '8',
    discount: '0',
    source: 'direct',
    notes: '',
    status: 'pending'
  });

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(formData.basePrice) || 0;
    const taxRate = parseFloat(formData.taxRate) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    // For demo, we'll use a fixed duration of 2 days / 48 hours
    const units = formData.priceRate === 'day' ? 2 : 48;
    const subtotal = basePrice * units;
    
    // Add driver fee if applicable (20% extra for this example)
    const driverFee = formData.withDriver ? subtotal * 0.2 : 0;
    
    const baseSubtotal = subtotal + driverFee;
    const taxAmount = (baseSubtotal * taxRate) / 100;
    const discountAmount = (baseSubtotal * discount) / 100;
    
    const total = baseSubtotal + taxAmount - discountAmount;
    
    return total.toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, this would submit to an API
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select 
              value={formData.vehicleType} 
              onValueChange={(value) => handleChange('vehicleType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="scooter">Scooter</SelectItem>
                <SelectItem value="boat">Boat</SelectItem>
                <SelectItem value="jetski">Jet Ski</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input 
              id="pickupLocation" 
              value={formData.pickupLocation} 
              onChange={(e) => handleChange('pickupLocation', e.target.value)}
              placeholder="Enter pickup location"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickupDate">Pickup Date</Label>
              <Input 
                id="pickupDate" 
                type="date" 
                value={formData.pickupDate} 
                onChange={(e) => handleChange('pickupDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="returnDate">Return Date</Label>
              <Input 
                id="returnDate" 
                type="date" 
                value={formData.returnDate} 
                onChange={(e) => handleChange('returnDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="withDriver">With Driver</Label>
            <Switch 
              id="withDriver"
              checked={formData.withDriver}
              onCheckedChange={(checked) => handleChange('withDriver', checked)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="priceRate">Price Rate</Label>
            <Select 
              value={formData.priceRate} 
              onValueChange={(value) => handleChange('priceRate', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select price rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Per Hour</SelectItem>
                <SelectItem value="day">Per Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
          <div>
            <Label htmlFor="basePrice">Base Price (per {formData.priceRate})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input 
                id="basePrice" 
                type="text" 
                className="pl-7" 
                value={formData.basePrice} 
                onChange={(e) => handleChange('basePrice', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <div className="relative">
                <Input 
                  id="taxRate" 
                  type="text" 
                  value={formData.taxRate} 
                  onChange={(e) => handleChange('taxRate', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <div className="relative">
                <Input 
                  id="discount" 
                  type="text" 
                  value={formData.discount} 
                  onChange={(e) => handleChange('discount', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="source">Booking Source</Label>
            <Select 
              value={formData.source} 
              onValueChange={(value) => handleChange('source', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select booking source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct (Website/Phone)</SelectItem>
                <SelectItem value="partner">Partner Agency</SelectItem>
                <SelectItem value="walkin">Walk-in</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Booking Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select booking status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          placeholder="Add any special requests or notes here" 
          value={formData.notes} 
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Total Price</h3>
              <p className="text-sm text-muted-foreground">
                Including taxes, discounts, and {formData.withDriver ? 'driver fee' : 'no driver'}
              </p>
            </div>
            <div className="text-xl font-bold">${calculateTotal()}</div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
          {isSubmitting ? 'Creating...' : 'Create Booking'}
        </Button>
      </div>
    </form>
  );
};

export default VehicleBookingForm;