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
    location: '',
    eventDate: '2025-06-01',
    time: '09:00',
    guestCount: 3,
    pricePerPerson: '4500',
    groupDiscount: '500',
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
    const pricePerPerson = parseInt(formData.pricePerPerson) || 0;
    const groupDiscount = parseInt(formData.groupDiscount) || 0;
    const guestCount = formData.guestCount || 1;
    
    const subtotal = pricePerPerson * guestCount;
    
    // Apply group discount only for groups of 3 or more
    const discountAmount = guestCount >= 3 ? groupDiscount * guestCount : 0;
    
    const total = subtotal - discountAmount;
    
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
            <Label htmlFor="ticketType">Ticket Type</Label>
            <Select 
              value={formData.ticketType} 
              onValueChange={(value) => handleChange('ticketType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ticket type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Day Tour">Day Tour</SelectItem>
                <SelectItem value="Heritage Site">Heritage Site</SelectItem>
                <SelectItem value="Cultural Show">Cultural Show</SelectItem>
                <SelectItem value="Adventure Activity">Adventure Activity</SelectItem>
                <SelectItem value="Wildlife Safari">Wildlife Safari</SelectItem>
                <SelectItem value="Boat Tour">Boat Tour</SelectItem>
                <SelectItem value="Museum">Museum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              value={formData.location} 
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. Sigiriya"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={formData.time} 
                onChange={(e) => handleChange('time', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="guestCount">Number of Guests</Label>
            <Input 
              id="guestCount" 
              type="number" 
              min="1" 
              value={formData.guestCount} 
              onChange={(e) => handleChange('guestCount', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="pricePerPerson">Price per Person</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
              <Input 
                id="pricePerPerson" 
                type="text" 
                className="pl-9" 
                value={formData.pricePerPerson} 
                onChange={(e) => handleChange('pricePerPerson', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="groupDiscount">Group Discount (per person)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
              <Input 
                id="groupDiscount" 
                type="text" 
                className="pl-9" 
                value={formData.groupDiscount} 
                onChange={(e) => handleChange('groupDiscount', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Applied for groups of 3 or more</p>
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
              <p className="text-sm text-muted-foreground">Including group discounts</p>
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

export default TicketBookingForm;