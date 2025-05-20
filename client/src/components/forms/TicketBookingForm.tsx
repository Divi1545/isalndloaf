import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface TicketBookingFormProps {
  onSuccess: () => void;
}

const TicketBookingForm = ({ onSuccess }: TicketBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ticketType: '',
    eventDate: '2025-06-15',
    pricePerPerson: '25',
    groupSize: 2,
    taxRate: '5',
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
    const pricePerPerson = parseFloat(formData.pricePerPerson) || 0;
    const groupSize = parseInt(formData.groupSize.toString()) || 0;
    const taxRate = parseFloat(formData.taxRate) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    const subtotal = pricePerPerson * groupSize;
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
            <Label htmlFor="ticketType">Ticket Type</Label>
            <Select 
              value={formData.ticketType} 
              onValueChange={(value) => handleChange('ticketType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ticket type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tour">Guided Tour</SelectItem>
                <SelectItem value="attraction">Attraction Entry</SelectItem>
                <SelectItem value="event">Special Event</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="adventure">Adventure Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="eventDate">Event Date</Label>
            <Input 
              id="eventDate" 
              type="date" 
              value={formData.eventDate} 
              onChange={(e) => handleChange('eventDate', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="groupSize">Group Size</Label>
            <Input 
              id="groupSize" 
              type="number" 
              min="1" 
              value={formData.groupSize} 
              onChange={(e) => handleChange('groupSize', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="pricePerPerson">Price Per Person</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input 
                id="pricePerPerson" 
                type="text" 
                className="pl-7" 
                value={formData.pricePerPerson} 
                onChange={(e) => handleChange('pricePerPerson', e.target.value)}
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
                <SelectItem value="online">Online Aggregator</SelectItem>
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
                {formData.groupSize} {parseInt(formData.groupSize.toString()) === 1 ? 'person' : 'people'} including taxes and discounts
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

export default TicketBookingForm;