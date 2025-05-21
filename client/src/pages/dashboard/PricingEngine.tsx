import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const PricingEngine = () => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  const handleUpdateAllPrices = async () => {
    try {
      await fetch('/api/pricing/update-all', { method: 'POST' });
      toast({
        title: "Success",
        description: "All pricing updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveChanges = async () => {
    try {
      const currentPricingSettings = {
        // Collect all the pricing form values here
        basePrice: 149.00,
        weekendSurcharge: 15,
        // Other settings as needed
      };
      
      await fetch('/api/pricing/save', {
        method: 'POST',
        body: JSON.stringify(currentPricingSettings),
        headers: { 'Content-Type': 'application/json' },
      });
      
      toast({
        title: "Success",
        description: "Pricing saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pricing settings",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Pricing Engine</h1>
        <Button 
          className="w-full md:w-auto"
          onClick={handleUpdateAllPrices}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M12 5V2"></path>
            <path d="m19 8-3-3"></path>
            <circle cx="12" cy="12" r="7"></circle>
            <path d="M12 16v-4l2-2"></path>
          </svg>
          Update All Prices
        </Button>
      </div>
      
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rooms">Rooms & Accommodations</TabsTrigger>
          <TabsTrigger value="activities">Activities & Tours</TabsTrigger>
          <TabsTrigger value="transport">Transport & Rentals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rooms" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold">Room Pricing</h3>
                <div className="flex items-center gap-3">
                  <Select defaultValue="beachvilla">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beachvilla">Beach Villa</SelectItem>
                      <SelectItem value="gardenroom">Garden Room</SelectItem>
                      <SelectItem value="oceanview">Ocean View Suite</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="secondary"
                    onClick={() => setLocation("/vendor/edit-room")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                    Edit Room
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v4l3 3"></path>
                      </svg>
                      Base Pricing
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Base Price/Night</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input className="pl-7" placeholder="0.00" defaultValue="149.00" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Weekend Surcharge</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                            <Input className="pl-7" placeholder="0" defaultValue="15" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tax Rate</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                            <Input className="pl-7" placeholder="0" defaultValue="12" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Cleaning Fee</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input className="pl-7" placeholder="0.00" defaultValue="35.00" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                        <path d="M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"></path>
                        <path d="M14 15c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2Z"></path>
                        <path d="m10 7 4-2 4 2"></path>
                        <path d="M2 8v8"></path>
                        <path d="M22 8v8"></path>
                        <path d="M18 16h.01"></path>
                        <path d="M6 16h.01"></path>
                        <path d="M18 8h.01"></path>
                        <path d="M6 8h.01"></path>
                      </svg>
                      Occupancy Settings
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Base Occupancy</label>
                          <Input type="number" min="1" defaultValue="2" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Maximum Guests</label>
                          <Input type="number" min="1" defaultValue="4" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Additional Guest Fee</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input className="pl-7" placeholder="0.00" defaultValue="25.00" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-600">
                        <path d="M8 2v4"></path>
                        <path d="M16 2v4"></path>
                        <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                        <path d="M3 10h18"></path>
                      </svg>
                      Stay Requirements
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Stay (nights)</label>
                        <Input type="number" min="1" defaultValue="2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Weekend-only Minimum</label>
                          <div className="flex items-center space-x-2">
                            <Switch id="weekend-min" />
                            <Label htmlFor="weekend-min">Apply different minimum for weekends</Label>
                          </div>
                        </div>
                        <Input 
                          type="number" 
                          min="1" 
                          defaultValue="2" 
                          className="w-20" 
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-600">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                        <path d="M5 3v4"></path>
                        <path d="M19 17v4"></path>
                        <path d="M3 5h4"></path>
                        <path d="M17 19h4"></path>
                      </svg>
                      Special Offers
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Early Bird Discount</label>
                          <div className="flex items-center space-x-2">
                            <Switch id="early-bird" />
                            <Label htmlFor="early-bird">For bookings made 30+ days in advance</Label>
                          </div>
                        </div>
                        <div className="relative w-20">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          <Input className="pl-7" placeholder="0" defaultValue="10" disabled />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Last Minute Deal</label>
                          <div className="flex items-center space-x-2">
                            <Switch id="last-minute" defaultChecked />
                            <Label htmlFor="last-minute">For bookings made 3 days before</Label>
                          </div>
                        </div>
                        <div className="relative w-20">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          <Input className="pl-7" placeholder="0" defaultValue="15" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Long Stay Discount</label>
                          <div className="flex items-center space-x-2">
                            <Switch id="long-stay" defaultChecked />
                            <Label htmlFor="long-stay">For stays of 7+ nights</Label>
                          </div>
                        </div>
                        <div className="relative w-20">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          <Input className="pl-7" placeholder="0" defaultValue="12" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardContent className="pt-6 pb-2">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-blue-100 p-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No activities or tours yet</h3>
                <p className="text-muted-foreground max-w-sm mb-4">
                  Create tour packages or activities to add them to your listing and set up their pricing.
                </p>
                <Button
                  onClick={() => setLocation("/vendor/add-activity")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  Add New Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transport" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold">Transport Pricing</h3>
                <div className="flex items-center gap-3">
                  <Select defaultValue="scooter">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scooter">Scooter Rental</SelectItem>
                      <SelectItem value="car">Car Rental</SelectItem>
                      <SelectItem value="boat">Boat Tour</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="secondary"
                    onClick={() => setLocation("/vendor/edit-vehicle")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                    Edit Vehicle
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
                      <path d="M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"></path>
                      <path d="M14 15c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2Z"></path>
                      <path d="m10 7 4-2 4 2"></path>
                      <path d="M2 8v8"></path>
                      <path d="M22 8v8"></path>
                      <path d="M18 16h.01"></path>
                      <path d="M6 16h.01"></path>
                      <path d="M18 8h.01"></path>
                      <path d="M6 8h.01"></path>
                    </svg>
                    Rental Pricing
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hourly Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input className="pl-7" placeholder="0.00" defaultValue="12.50" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Daily Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input className="pl-7" placeholder="0.00" defaultValue="49.00" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Weekend Rate/Day</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input className="pl-7" placeholder="0.00" defaultValue="59.00" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Weekly Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input className="pl-7" placeholder="0.00" defaultValue="299.00" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Insurance Fee (per rental)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" placeholder="0.00" defaultValue="10.00" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-600">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                      <path d="M5 3v4"></path>
                      <path d="M19 17v4"></path>
                      <path d="M3 5h4"></path>
                      <path d="M17 19h4"></path>
                    </svg>
                    Special Offers
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Multiple Day Discount</label>
                        <div className="flex items-center space-x-2">
                          <Switch id="multi-day" defaultChecked />
                          <Label htmlFor="multi-day">3+ days rental</Label>
                        </div>
                      </div>
                      <div className="relative w-20">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        <Input className="pl-7" placeholder="0" defaultValue="10" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Package Deal</label>
                        <div className="flex items-center space-x-2">
                          <Switch id="package-deal" defaultChecked />
                          <Label htmlFor="package-deal">When booked with accommodation</Label>
                        </div>
                      </div>
                      <div className="relative w-20">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        <Input className="pl-7" placeholder="0" defaultValue="15" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Availability</label>
                      <div className="flex items-center space-x-2">
                        <Switch id="advance-booking" defaultChecked />
                        <Label htmlFor="advance-booking">Allow advance booking</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingEngine;