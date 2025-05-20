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
    transmission: 'Automatic',
    fuelType: 'Petrol',
    pickupLocation: '',
    dropoffLocation: '',
    withDriver: true,
    pickupDate: '2025-05-21',
    dropoffDate: '2025-05-24',
    pricePerDay: '8000',
    taxPercent: '8',
    extraKMCharge: '50',
    discounts: {
      longRental: '1000'
    },
    notes: '',
    status: 'pending'
  });

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value
      }
    });
  };

  const calculateTotal = () => {
    const pricePerDay = parseInt(formData.pricePerDay) || 0;
    const taxPercent = parseInt(formData.taxPercent) || 0;
    const longRentalDiscount = parseInt(formData.discounts.longRental) || 0;
    
    // Calculate days (sample calculation)
    const pickup = new Date(formData.pickupDate);
    const dropoff = new Date(formData.dropoffDate);
    const days = Math.max(1, Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 3600 * 24)));
    
    const subtotal = pricePerDay * days;
    const taxAmount = (subtotal * taxPercent) / 100;
    
    // Apply discount only for rentals of 3+ days
    const discountAmount = days >= 3 ? longRentalDiscount : 0;
    
    const total = subtotal + taxAmount - discountAmount;
    
    return total.toLocaleString();
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
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="tuktuk">Tuk Tuk</SelectItem>
                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                <SelectItem value="scooter">Scooter</SelectItem>
                <SelectItem value="boat">Boat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select 
                value={formData.transmission} 
                onValueChange={(value) => handleChange('transmission', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select 
                value={formData.fuelType} 
                onValueChange={(value) => handleChange('fuelType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input 
              id="pickupLocation" 
              value={formData.pickupLocation} 
              onChange={(e) => handleChange('pickupLocation', e.target.value)}
              placeholder="e.g. Colombo"
            />
          </div>
          
          <div>
            <Label htmlFor="dropoffLocation">Drop-off Location</Label>
            <Input 
              id="dropoffLocation" 
              value={formData.dropoffLocation} 
              onChange={(e) => handleChange('dropoffLocation', e.target.value)}
              placeholder="e.g. Galle"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="withDriver" 
              checked={formData.withDriver} 
              onCheckedChange={(checked) => handleChange('withDriver', checked)}
            />
            <Label htmlFor="withDriver">Include Driver</Label>
          </div>
        </div>
        
        <div className="space-y-4">
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
              <Label htmlFor="dropoffDate">Drop-off Date</Label>
              <Input 
                id="dropoffDate" 
                type="date" 
                value={formData.dropoffDate} 
                onChange={(e) => handleChange('dropoffDate', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="pricePerDay">Price per Day</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
              <Input 
                id="pricePerDay" 
                type="text" 
                className="pl-9" 
                value={formData.pricePerDay} 
                onChange={(e) => handleChange('pricePerDay', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxPercent">Tax (%)</Label>
              <div className="relative">
                <Input 
                  id="taxPercent" 
                  type="text" 
                  value={formData.taxPercent} 
                  onChange={(e) => handleChange('taxPercent', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div>
              <Label htmlFor="extraKMCharge">Extra KM Charge</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
                <Input 
                  id="extraKMCharge" 
                  type="text" 
                  className="pl-9" 
                  value={formData.extraKMCharge} 
                  onChange={(e) => handleChange('extraKMCharge', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="longRentalDiscount">Long Rental Discount (3+ days)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
              <Input 
                id="longRentalDiscount" 
                type="text" 
                className="pl-9" 
                value={formData.discounts.longRental} 
                onChange={(e) => handleNestedChange('discounts', 'longRental', e.target.value)}
              />
            </div>
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
              <p className="text-sm text-muted-foreground">Including taxes and discounts</p>
            </div>
            <div className="text-xl font-bold">Rs. {calculateTotal()}</div>
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