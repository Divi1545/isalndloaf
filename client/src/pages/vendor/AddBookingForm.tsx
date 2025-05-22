import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

// Base schema with common fields for all booking types
const baseFormSchema = {
  customerName: z.string().min(2, { message: 'Customer name must be at least 2 characters.' }),
  customerEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  customerPhone: z.string().min(5, { message: 'Please enter a valid phone number.' }),
  serviceId: z.string().min(1, { message: 'Please select a service.' }),
  notes: z.string().optional(),
  status: z.string().default('pending')
};

// Stay booking specific fields
const stayFormSchema = z.object({
  ...baseFormSchema,
  stayType: z.string().min(1, { message: 'Please select a stay type.' }),
  propertyType: z.string().min(1, { message: 'Please select a property type.' }),
  checkInDate: z.date({ required_error: 'Please select a check-in date.' }),
  checkOutDate: z.date({ required_error: 'Please select a check-out date.' }),
  adults: z.string().min(1, { message: 'Please enter the number of adults.' }),
  children: z.string().default('0'),
  amenities: z.array(z.string()).optional(),
  totalPrice: z.string().min(1, { message: 'Please enter the total price.' })
});

// Transport booking specific fields
const transportFormSchema = z.object({
  ...baseFormSchema,
  vehicleType: z.string().min(1, { message: 'Please select a vehicle type.' }),
  rentalType: z.string().min(1, { message: 'Please select a rental type.' }),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  pickupLocation: z.string().min(1, { message: 'Please enter the pickup location.' }),
  dropoffLocation: z.string().min(1, { message: 'Please enter the drop-off location.' }),
  startDate: z.date({ required_error: 'Please select a start date.' }),
  endDate: z.date({ required_error: 'Please select an end date.' }),
  duration: z.string().min(1, { message: 'Please enter the duration.' }),
  addons: z.array(z.string()).optional(),
  totalPrice: z.string().min(1, { message: 'Please enter the total price.' })
});

// Wellness booking specific fields
const wellnessFormSchema = z.object({
  ...baseFormSchema,
  serviceType: z.string().min(1, { message: 'Please select a service type.' }),
  appointmentDate: z.date({ required_error: 'Please select an appointment date.' }),
  timeSlot: z.string().min(1, { message: 'Please select a time slot.' }),
  people: z.string().min(1, { message: 'Please enter the number of people.' }),
  therapistPreference: z.string().optional(),
  totalPrice: z.string().min(1, { message: 'Please enter the total price.' })
});

// Tour booking specific fields
const tourFormSchema = z.object({
  ...baseFormSchema,
  tourPackage: z.string().min(1, { message: 'Please select a tour package.' }),
  tourDate: z.date({ required_error: 'Please select a tour date.' }),
  groupSize: z.string().min(1, { message: 'Please enter the group size.' }),
  addons: z.array(z.string()).optional(),
  totalPrice: z.string().min(1, { message: 'Please enter the total price.' })
});

// Product booking specific fields
const productFormSchema = z.object({
  ...baseFormSchema,
  productId: z.string().min(1, { message: 'Please select a product.' }),
  quantity: z.string().min(1, { message: 'Please enter the quantity.' }),
  shippingAddress: z.string().min(1, { message: 'Please enter the shipping address.' }),
  deliveryDate: z.date({ required_error: 'Please select a delivery date.' }),
  totalPrice: z.string().min(1, { message: 'Please enter the total price.' })
});

// Default schema for basic booking form
const formSchema = z.object({
  customerName: z.string().min(2, { message: 'Customer name must be at least 2 characters.' }),
  customerEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  customerPhone: z.string().min(5, { message: 'Please enter a valid phone number.' }),
  serviceId: z.string().min(1, { message: 'Please select a service.' }),
  startDate: z.date({ required_error: 'Please select a start date.' }),
  endDate: z.date({ required_error: 'Please select an end date.' }),
  notes: z.string().optional(),
  numGuests: z.string().min(1, { message: 'Please enter the number of guests.' }),
  status: z.string().default('pending')
});

type FormValues = z.infer<typeof formSchema>;

interface AddBookingFormProps {
  bookingType?: 'stay' | 'transport' | 'wellness' | 'tour' | 'product';
  title?: string;
}

const AddBookingForm = ({ bookingType = 'stay', title = 'Add New Booking' }: AddBookingFormProps) => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [services, setServices] = useState<{id: string, name: string, type: string}[]>([]);
  const [stayTypes, setStayTypes] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<{id: string, name: string}[]>([]);
  
  // Form-specific states based on booking type
  const [vehicleAddons, setVehicleAddons] = useState<{id: string, name: string}[]>([]);
  
  // Fetch relevant data based on booking type
  useEffect(() => {
    // Fetch services based on the booking type
    const fetchServices = async () => {
      try {
        // This would be an actual API call in production
        // const response = await fetch(`/api/services?category=${bookingType}`);
        // const data = await response.json();
        // setServices(data);
        
        // Mock data for now
        const mockServices = [
          // Stay services
          { id: '1', name: 'Beach Villa', type: 'stay' },
          { id: '2', name: 'Garden Room', type: 'stay' },
          { id: '3', name: 'Ocean View Suite', type: 'stay' },
          // Transport services
          { id: '4', name: 'Economy Car', type: 'transport' },
          { id: '5', name: 'Luxury Car', type: 'transport' },
          { id: '6', name: 'Scooter', type: 'transport' },
          // Wellness services
          { id: '7', name: 'Full Body Massage', type: 'wellness' },
          { id: '8', name: 'Yoga Session', type: 'wellness' },
          { id: '9', name: 'Spa Package', type: 'wellness' },
          // Tour services
          { id: '10', name: 'Island Tour', type: 'tour' },
          { id: '11', name: 'Snorkeling Trip', type: 'tour' },
          { id: '12', name: 'Hiking Adventure', type: 'tour' },
          // Product services
          { id: '13', name: 'Local Craft Item', type: 'product' },
          { id: '14', name: 'Souvenir Package', type: 'product' },
          { id: '15', name: 'Fresh Produce Box', type: 'product' },
        ];
        
        // Filter services by booking type
        setServices(mockServices.filter(service => service.type === bookingType));
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: 'Error',
          description: 'Failed to load services. Please try again.',
          variant: 'destructive'
        });
      }
    };
    
    // Fetch form-specific data based on booking type
    const fetchFormSpecificData = async () => {
      try {
        if (bookingType === 'stay') {
          // Fetch stay types
          // const stayTypesResponse = await fetch('/api/stay/types');
          // const stayTypesData = await stayTypesResponse.json();
          // setStayTypes(stayTypesData);
          
          // Mock stay types
          setStayTypes([
            'One Room', 'Double Bed', 'Twin Room', 'Triple Room', 'Family Room', 
            'Deluxe Room', 'Suite', 'Junior Suite', 'Studio', 'Entire Villa', 
            'Entire Apartment', 'Private Cottage', 'Shared Dorm', 'Capsule Room'
          ]);
          
          // Fetch property types
          setPropertyTypes([
            'Hotel', 'Villa', 'Resort', 'Apartment', 'Bungalow', 'Boutique Hotel',
            'Homestay', 'Hostel', 'Cottage', 'Treehouse', 'Guesthouse'
          ]);
          
          // Fetch amenities
          setAmenities([
            { id: '1', name: 'WiFi' },
            { id: '2', name: 'Air Conditioning' },
            { id: '3', name: 'Swimming Pool' },
            { id: '4', name: 'Beach Access' },
            { id: '5', name: 'Kitchen' },
            { id: '6', name: 'Breakfast Included' }
          ]);
        } else if (bookingType === 'transport') {
          // Fetch vehicle types
          // const vehicleTypesResponse = await fetch('/api/vehicles/types');
          // const vehicleTypesData = await vehicleTypesResponse.json();
          // setVehicleTypes(vehicleTypesData);
          
          // Mock vehicle types
          setVehicleTypes([
            'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup Truck', 
            'Van / Mini Van', '4x4 / Off-road', 'Jeep', 'Luxury Car', 'Classic Car', 
            'Electric Vehicle', 'Hybrid', 'Motorbike / Scooter', 'Bicycle'
          ]);
          
          // Fetch vehicle add-ons
          setVehicleAddons([
            { id: '1', name: 'GPS Navigation' },
            { id: '2', name: 'Child Seat' },
            { id: '3', name: 'Additional Driver' },
            { id: '4', name: 'Roof Rack' },
            { id: '5', name: 'Bluetooth Audio' },
            { id: '6', name: 'Full Insurance' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    
    fetchServices();
    fetchFormSpecificData();
  }, [bookingType, toast]);
  
  // Get the appropriate schema and type based on booking type
  const getSchemaForBookingType = () => {
    switch (bookingType) {
      case 'stay':
        return stayFormSchema;
      case 'transport':
        return transportFormSchema;
      case 'wellness':
        return wellnessFormSchema;
      case 'tour':
        return tourFormSchema;
      case 'product':
        return productFormSchema;
      default:
        return formSchema;
    }
  };
  
  // Get default values based on booking type
  const getDefaultValues = () => {
    const baseDefaults = {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      serviceId: '',
      notes: '',
      status: 'pending'
    };
    
    switch (bookingType) {
      case 'stay':
        return {
          ...baseDefaults,
          stayType: '',
          propertyType: '',
          adults: '1',
          children: '0',
          amenities: [],
          totalPrice: ''
        };
      case 'transport':
        return {
          ...baseDefaults,
          vehicleType: '',
          rentalType: '',
          fuelType: '',
          transmission: '',
          pickupLocation: '',
          dropoffLocation: '',
          duration: '1',
          addons: [],
          totalPrice: ''
        };
      case 'wellness':
        return {
          ...baseDefaults,
          serviceType: '',
          timeSlot: '',
          people: '1',
          therapistPreference: '',
          totalPrice: ''
        };
      case 'tour':
        return {
          ...baseDefaults,
          tourPackage: '',
          groupSize: '1',
          addons: [],
          totalPrice: ''
        };
      case 'product':
        return {
          ...baseDefaults,
          productId: '',
          quantity: '1',
          shippingAddress: '',
          totalPrice: ''
        };
      default:
        return {
          ...baseDefaults,
          numGuests: '1'
        };
    }
  };
  
  // Use the appropriate schema based on booking type
  const selectedSchema = getSchemaForBookingType();
  
  // Create the form with the appropriate schema and default values
  const form = useForm({
    resolver: zodResolver(selectedSchema),
    defaultValues: getDefaultValues()
  });
  
  const onSubmit = async (data: any) => {
    try {
      // Format the data based on booking type
      let endpoint = '/api/bookings';
      let formattedData = { ...data };
      
      // Format the data based on booking type
      switch (bookingType) {
        case 'stay':
          endpoint = '/api/bookings/stay';
          formattedData = {
            ...data,
            serviceId: Number(data.serviceId),
            adults: Number(data.adults),
            children: Number(data.children),
            totalPrice: parseFloat(data.totalPrice)
          };
          break;
          
        case 'transport':
          endpoint = '/api/bookings/transport';
          formattedData = {
            ...data,
            serviceId: Number(data.serviceId),
            duration: Number(data.duration),
            totalPrice: parseFloat(data.totalPrice)
          };
          break;
          
        case 'wellness':
          endpoint = '/api/bookings/wellness';
          formattedData = {
            ...data,
            serviceId: Number(data.serviceId),
            people: Number(data.people),
            totalPrice: parseFloat(data.totalPrice)
          };
          break;
          
        case 'tour':
          endpoint = '/api/bookings/tour';
          formattedData = {
            ...data,
            serviceId: Number(data.serviceId),
            groupSize: Number(data.groupSize),
            totalPrice: parseFloat(data.totalPrice)
          };
          break;
          
        case 'product':
          endpoint = '/api/bookings/product';
          formattedData = {
            ...data,
            serviceId: Number(data.serviceId),
            productId: Number(data.productId),
            quantity: Number(data.quantity),
            totalPrice: parseFloat(data.totalPrice)
          };
          break;
          
        default:
          formattedData = {
            ...data,
            serviceId: Number(data.serviceId),
            numGuests: Number(data.numGuests)
          };
      }
      
      console.log('Submitting booking data:', formattedData);
      
      // For demo purposes, we'll simulate a successful API call
      // In production, this would be a real API call:
      /*
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      */
      
      // Simulate a successful response
      toast({
        title: 'Success',
        description: `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} booking created successfully`,
      });
      
      // Navigate back to the booking manager
      setLocation('/');
      // Set active tab to bookings via localStorage
      localStorage.setItem('activeTab', 'bookings');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  // Render the appropriate form fields based on booking type
  const renderFormFields = () => {
    const commonFields = (
      <>
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="customer@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1 234 567 8900" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${bookingType} service`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
    
    // Render fields specific to each booking type
    switch (bookingType) {
      case 'stay':
        return (
          <>
            {commonFields}
            
            <FormField
              control={form.control}
              name="stayType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stay Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a stay type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stayTypes.map((type, index) => (
                        <SelectItem key={index} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propertyTypes.map((type, index) => (
                        <SelectItem key={index} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="checkInDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Check-In Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="checkOutDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Check-Out Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const checkInDate = form.getValues('checkInDate');
                          return checkInDate && date < checkInDate;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Adults</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Children</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case 'transport':
        return (
          <>
            {commonFields}
            
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleTypes.map((type, index) => (
                        <SelectItem key={index} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pickupLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Airport, Hotel, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dropoffLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drop-off Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Airport, Hotel, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Pickup Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      // Default case for other booking types (simplified version)
      default:
        return (
          <>
            {commonFields}
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="numGuests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Guests</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <Button variant="outline" onClick={() => {
          setLocation('/');
          localStorage.setItem('activeTab', 'bookings');
        }}>
          Cancel
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Create a new {bookingType} booking for a customer</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormFields()}
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special requests or additional information" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full md:w-40">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => {
                  setLocation('/');
                  localStorage.setItem('activeTab', 'bookings');
                }}>
                  Cancel
                </Button>
                <Button type="submit">Create Booking</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBookingForm;