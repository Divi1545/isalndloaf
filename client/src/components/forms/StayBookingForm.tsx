import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface StayBookingFormProps {
  onSuccess: () => void;
}

const StayBookingForm = ({ onSuccess }: StayBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    stayType: '',
    propertyType: '',
    checkInDate: '2025-06-01',
    checkOutDate: '2025-06-05',
    guests: 2,
    basePrice: '150',
    taxRate: '10',
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
    
    const days = 4; // For demonstration, would calculate from dates
    const subtotal = basePrice * days;
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal + taxAmount - discountAmount;
    
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
            <Label htmlFor="stayType">Stay Type</Label>
            <Select 
              value={formData.stayType} 
              onValueChange={(value) => handleChange('stayType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stay type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel">Hotel Room</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="homestay">Homestay</SelectItem>
                <SelectItem value="resort">Resort</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select 
              value={formData.propertyType} 
              onValueChange={(value) => handleChange('propertyType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Input 
                id="checkInDate" 
                type="date" 
                value={formData.checkInDate} 
                onChange={(e) => handleChange('checkInDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <Input 
                id="checkOutDate" 
                type="date" 
                value={formData.checkOutDate} 
                onChange={(e) => handleChange('checkOutDate', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="guests">Number of Guests</Label>
            <Input 
              id="guests" 
              type="number" 
              min="1" 
              value={formData.guests} 
              onChange={(e) => handleChange('guests', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="basePrice">Base Price (per night)</Label>
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
                <SelectItem value="booking.com">Booking.com</SelectItem>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="expedia">Expedia</SelectItem>
                <SelectItem value="agoda">Agoda</SelectItem>
                <SelectItem value="walkin">Walk-in</SelectItem>
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
              <p className="text-sm text-muted-foreground">Including taxes and discounts</p>
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

export default StayBookingForm;