import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface WellnessBookingFormProps {
  onSuccess: () => void;
}

const WellnessBookingForm = ({ onSuccess }: WellnessBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    practitionerName: '',
    sessionDate: '2025-06-10',
    sessionTime: '10:00',
    sessionDuration: '60', // in minutes
    pricePerSession: '75',
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
    const pricePerSession = parseFloat(formData.pricePerSession) || 0;
    const taxRate = parseFloat(formData.taxRate) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    const taxAmount = (pricePerSession * taxRate) / 100;
    const discountAmount = (pricePerSession * discount) / 100;
    
    const total = pricePerSession + taxAmount - discountAmount;
    
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
            <Label htmlFor="serviceName">Service Name</Label>
            <Select 
              value={formData.serviceName} 
              onValueChange={(value) => handleChange('serviceName', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="massage">Massage Therapy</SelectItem>
                <SelectItem value="facial">Facial Treatment</SelectItem>
                <SelectItem value="yoga">Yoga Session</SelectItem>
                <SelectItem value="meditation">Meditation Class</SelectItem>
                <SelectItem value="ayurveda">Ayurvedic Treatment</SelectItem>
                <SelectItem value="spa">Spa Package</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="practitionerName">Practitioner Name (Optional)</Label>
            <Input 
              id="practitionerName" 
              value={formData.practitionerName} 
              onChange={(e) => handleChange('practitionerName', e.target.value)}
              placeholder="Enter practitioner name if any"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionDate">Session Date</Label>
              <Input 
                id="sessionDate" 
                type="date" 
                value={formData.sessionDate} 
                onChange={(e) => handleChange('sessionDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sessionTime">Session Time</Label>
              <Input 
                id="sessionTime" 
                type="time" 
                value={formData.sessionTime} 
                onChange={(e) => handleChange('sessionTime', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
            <Select 
              value={formData.sessionDuration} 
              onValueChange={(value) => handleChange('sessionDuration', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="pricePerSession">Price Per Session</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input 
                id="pricePerSession" 
                type="text" 
                className="pl-7" 
                value={formData.pricePerSession} 
                onChange={(e) => handleChange('pricePerSession', e.target.value)}
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
                <SelectItem value="partner">Partner Referral</SelectItem>
                <SelectItem value="walkin">Walk-in</SelectItem>
                <SelectItem value="online">Online Booking Platform</SelectItem>
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
                {formData.sessionDuration} minute session including taxes and discounts
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

export default WellnessBookingForm;