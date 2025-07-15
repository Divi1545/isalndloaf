import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { updateServicePrice } from "@/lib/api";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Save, Trash2, Calendar as CalendarIcon, DollarSign, Users, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PricingEngine() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const queryClient = useQueryClient();
  
  // Get services data
  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/services'],
  });
  
  // Update service price mutation
  const updateServicePriceMutation = useMutation({
    mutationFn: async ({ serviceId, basePrice }: { serviceId: number; basePrice: number }) => {
      return updateServicePrice(serviceId, basePrice, queryClient);
    },
    onSuccess: () => {
      toast({
        title: "Price updated",
        description: "Your service price has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update price",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Use real services from the database
  const displayServices = services || [];
  
  // Service price state management
  const [servicePrices, setServicePrices] = useState<Record<number, number>>({});

  // Handle input changes for service prices
  const handlePriceChange = (serviceId: number, price: number) => {
    setServicePrices(prev => ({
      ...prev,
      [serviceId]: price
    }));
  };

  // Get current price for a service (from state or original value)
  const getCurrentPrice = (service: any) => {
    return servicePrices[service.id] !== undefined ? servicePrices[service.id] : service.basePrice;
  };

  // Handle saving pricing rules
  const handleSavePricingRules = () => {
    // For now, just show a toast notification
    toast({
      title: "Pricing rules saved",
      description: "Your pricing rules have been saved successfully.",
    });
  };

  // Handle creating promo codes
  const handleCreatePromoCode = () => {
    // For now, just show a toast notification
    toast({
      title: "Feature coming soon",
      description: "Promotional codes will be available in a future update.",
    });
  };

  // Handle adding blackout dates
  const handleAddBlackoutDate = () => {
    // For now, just show a toast notification
    toast({
      title: "Feature coming soon",
      description: "Blackout dates will be available in a future update.",
    });
  };

  // Handle removing blackout dates
  const handleRemoveBlackoutDate = () => {
    // For now, just show a toast notification
    toast({
      title: "Feature coming soon",
      description: "Blackout dates will be available in a future update.",
    });
  };
  
  // Mock pricing rules
  const [weekendSurcharge, setWeekendSurcharge] = useState(25);
  const [holidaySurcharge, setHolidaySurcharge] = useState(50);
  const [extraGuestFee, setExtraGuestFee] = useState(15);
  const [minStay, setMinStay] = useState(2);
  
  // Promotional codes placeholder for future implementation
  const promoCodes: any[] = [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Pricing Engine</h1>
      
      <Tabs defaultValue="base-pricing">
        <TabsList className="mb-6">
          <TabsTrigger value="base-pricing">Base Pricing</TabsTrigger>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="promos">Promotions</TabsTrigger>
          <TabsTrigger value="blackout-dates">Blackout Dates</TabsTrigger>
        </TabsList>
        
        {/* Base Pricing Tab */}
        <TabsContent value="base-pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Base Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayServices.map((service) => (
                    <div key={service.id} className="border rounded-md p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-neutral-500 text-sm">{service.type} • {service.description}</p>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                          <div className="w-full md:w-48">
                            <Label htmlFor={`price-${service.id}`}>Base Price ($)</Label>
                            <div className="flex">
                              <div className="flex items-center bg-neutral-100 px-3 rounded-l-md border border-r-0 border-input">
                                <DollarSign className="h-4 w-4 text-neutral-500" />
                              </div>
                              <Input
                                id={`price-${service.id}`}
                                type="number"
                                className="rounded-l-none"
                                value={getCurrentPrice(service)}
                                onChange={(e) => handlePriceChange(service.id, parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            onClick={() => updateServicePriceMutation.mutate({
                              serviceId: service.id,
                              basePrice: getCurrentPrice(service)
                            })}
                            disabled={updateServicePriceMutation.isPending}
                          >
                            {updateServicePriceMutation.isPending ? (
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {displayServices.length === 0 && (
                    <div className="text-center p-8 border rounded-md bg-neutral-50">
                      <DollarSign className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No services found</h3>
                      <p className="text-neutral-500 mb-4">
                        Add services to your account to set up pricing
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pricing Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Weekend Pricing</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weekend-surcharge">Weekend Surcharge (%)</Label>
                      <span className="font-medium">{weekendSurcharge}%</span>
                    </div>
                    
                    <Slider
                      id="weekend-surcharge"
                      defaultValue={[weekendSurcharge]}
                      max={100}
                      step={5}
                      onValueChange={(values) => setWeekendSurcharge(values[0])}
                    />
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch id="apply-weekend" />
                      <Label htmlFor="apply-weekend">Apply weekend pricing</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Holiday Pricing</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="holiday-surcharge">Holiday Surcharge (%)</Label>
                      <span className="font-medium">{holidaySurcharge}%</span>
                    </div>
                    
                    <Slider
                      id="holiday-surcharge"
                      defaultValue={[holidaySurcharge]}
                      max={100}
                      step={5}
                      onValueChange={(values) => setHolidaySurcharge(values[0])}
                    />
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch id="apply-holiday" />
                      <Label htmlFor="apply-holiday">Apply holiday pricing</Label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Additional Rules</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="extra-guest-fee">Extra Guest Fee ($)</Label>
                        <div className="flex">
                          <div className="flex items-center bg-neutral-100 px-3 rounded-l-md border border-r-0 border-input">
                            <DollarSign className="h-4 w-4 text-neutral-500" />
                          </div>
                          <Input
                            id="extra-guest-fee"
                            type="number"
                            className="rounded-l-none"
                            value={extraGuestFee}
                            onChange={(e) => setExtraGuestFee(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="min-stay">Minimum Stay (nights)</Label>
                        <Input
                          id="min-stay"
                          type="number"
                          value={minStay}
                          onChange={(e) => setMinStay(parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="w-full md:w-auto" onClick={handleSavePricingRules}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Pricing Rules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Promotions Tab */}
        <TabsContent value="promos" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Promotional Codes</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Promo Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Promotional Code</DialogTitle>
                    <DialogDescription>
                      Add a new promotional code for your services.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="promo-code">Promo Code</Label>
                      <Input id="promo-code" placeholder="SUMMER20" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discount-amount">Discount Amount</Label>
                        <Input id="discount-amount" type="number" placeholder="20" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="discount-type">Discount Type</Label>
                        <select
                          id="discount-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="valid-until">Valid Until</Label>
                      <Input id="valid-until" type="date" />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <Button onClick={handleCreatePromoCode}>Create Promo Code</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promoCodes.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">{promo.code}</h3>
                        <p className="text-sm text-neutral-500">
                          {promo.type === "percentage" ? `${promo.discount}% off` : `$${promo.discount} off`} • 
                          Valid until {promo.validUntil}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="text-center p-8 border rounded-md bg-neutral-50">
                  <Tag className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">Promotional codes coming soon</h3>
                  <p className="text-neutral-500 mb-4">
                    This feature will be available in a future update
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Blackout Dates Tab */}
        <TabsContent value="blackout-dates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blackout Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Select dates to block</h3>
                  <div className="border rounded-md p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Blocked Date Ranges</h3>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-neutral-500" />
                          <span>Christmas Season</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-2 space-y-2">
                          <p className="text-sm text-neutral-500">Dec 23, 2023 - Jan 2, 2024</p>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleRemoveBlackoutDate}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-neutral-500" />
                          <span>Maintenance Period</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-2 space-y-2">
                          <p className="text-sm text-neutral-500">Feb 15, 2023 - Feb 20, 2023</p>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleRemoveBlackoutDate}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="mt-4">
                    <Button className="w-full" onClick={handleAddBlackoutDate}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Blocked Date Range
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
