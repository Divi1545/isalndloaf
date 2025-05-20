import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface WellnessBookingFormProps {
  onSuccess: () => void;
}

const WellnessBookingForm = ({ onSuccess }: WellnessBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    duration: 60,
    sessionDate: '2025-05-25',
    time: '15:00',
    practitioner: '',
    pricePerSession: '6000',
    addOns: [] as string[],
    taxPercent: '10',
    notes: '',
    status: 'pending'
  });

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleArrayToggle = (field: string, value: string) => {
    const array = formData[field] as string[];
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];

    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const calculateTotal = () => {
    const pricePerSession = parseInt(formData.pricePerSession) || 0;
    const taxPercent = parseInt(formData.taxPercent) || 0;
    
    // Calculate add-on costs (assuming each add-on is Rs. 1500)
    const addOnPrice = 1500;
    const addOnTotal = formData.addOns.length * addOnPrice;
    
    const subtotal = pricePerSession + addOnTotal;
    const taxAmount = (subtotal * taxPercent) / 100;
    
    const total = subtotal + taxAmount;
    
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
            <Label htmlFor="serviceType">Service Type</Label>
            <Select 
              value={formData.serviceType} 
              onValueChange={(value) => handleChange('serviceType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Massage">Massage</SelectItem>
                <SelectItem value="Ayurvedic Treatment">Ayurvedic Treatment</SelectItem>
                <SelectItem value="Yoga Session">Yoga Session</SelectItem>
                <SelectItem value="Meditation">Meditation</SelectItem>
                <SelectItem value="Spa Package">Spa Package</SelectItem>
                <SelectItem value="Wellness Consultation">Wellness Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select 
              value={formData.duration.toString()} 
              onValueChange={(value) => handleChange('duration', parseInt(value))}
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
            <Label htmlFor="practitioner">Preferred Practitioner (Optional)</Label>
            <Input 
              id="practitioner" 
              value={formData.practitioner} 
              onChange={(e) => handleChange('practitioner', e.target.value)}
              placeholder="Enter name if you have a preference"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="pricePerSession">Price per Session</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
              <Input 
                id="pricePerSession" 
                type="text" 
                className="pl-9" 
                value={formData.pricePerSession} 
                onChange={(e) => handleChange('pricePerSession', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Add-ons (Rs. 1,500 each)</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Herbal Pack', 'Aromatherapy', 'Hot Stone', 'Refreshments', 'Private Room'].map((addOn) => (
                <div key={addOn} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`add-on-${addOn}`} 
                    checked={formData.addOns.includes(addOn)}
                    onCheckedChange={() => handleArrayToggle('addOns', addOn)}
                  />
                  <label 
                    htmlFor={`add-on-${addOn}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {addOn}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
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
        <Label htmlFor="notes">Special Requests or Health Information</Label>
        <Textarea 
          id="notes" 
          placeholder="Add any special requests, health concerns, or preferences here" 
          value={formData.notes} 
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Total Price</h3>
              <p className="text-sm text-muted-foreground">Including add-ons and taxes</p>
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

export default WellnessBookingForm;