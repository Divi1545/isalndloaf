import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import StayBookingForm from '../../components/forms/StayBookingForm';
import VehicleBookingForm from '../../components/forms/VehicleBookingForm';
import TicketBookingForm from '../../components/forms/TicketBookingForm';
import WellnessBookingForm from '../../components/forms/WellnessBookingForm';

const AddBooking = () => {
  const [category, setCategory] = useState<string>("");
  const [vendor, setVendor] = useState({
    email: "",
    role: "",
    categories_allowed: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // In a real app, this would fetch from API
    // For this demo, we're simulating different vendors with different permissions
    const mockVendors = {
      "vendor@islandloaf.com": {
        email: "vendor@islandloaf.com",
        role: "vendor",
        categories_allowed: ["stay", "vehicle", "tickets", "wellness"]
      },
      "srilankadrives@gmail.com": {
        email: "srilankadrives@gmail.com",
        role: "vendor",
        categories_allowed: ["vehicle"]
      },
      "beachstayz@islandloaf.com": {
        email: "beachstayz@islandloaf.com",
        role: "vendor",
        categories_allowed: ["stay"]
      }
    };
    
    // Get user from session/storage - in a real app, this would come from a proper auth system
    const userEmail = localStorage.getItem("userEmail") || "vendor@islandloaf.com";
    
    // Set vendor data
    setVendor(mockVendors[userEmail] || mockVendors["vendor@islandloaf.com"]);
    setIsLoading(false);
  }, []);

  const handleBack = () => {
    if (category) {
      setCategory("");
    } else {
      window.location.href = "/dashboard/bookings";
    }
  };

  const handleBookingCreated = () => {
    toast({
      title: "Booking created successfully",
      description: "The booking has been added to your system",
    });
    
    // Redirect to booking manager after successful creation
    setTimeout(() => {
      window.location.href = "/dashboard/bookings";
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-4 p-0 h-auto" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {category ? `Add ${category.charAt(0).toUpperCase() + category.slice(1)} Booking` : "Add New Booking"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {category ? "Booking Details" : "Select Booking Category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
          ) : !category ? (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Logged in as: <span className="font-medium">{vendor.email}</span></p>
                <p className="text-sm text-gray-500">Access to: <span className="font-medium">{vendor.categories_allowed.join(", ") || "No categories"}</span></p>
              </div>
              
              {vendor.categories_allowed.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-red-600 mb-2">You don't have access to any booking categories.</p>
                  <p className="text-sm text-gray-500">Please contact your administrator to request access.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {["stay", "vehicle", "tickets", "wellness"].map((cat) => {
                    if (!vendor.categories_allowed.includes(cat)) {
                      return (
                        <div key={cat} className="opacity-40 cursor-not-allowed">
                          <Card className="border-gray-300 bg-gray-100">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center text-center">
                                <div className="mb-4 p-3 rounded-full bg-gray-200">
                                  {cat === "stay" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                                      <path d="M9 22v-4h6v4"></path>
                                      <path d="M8 6h.01"></path>
                                      <path d="M16 6h.01"></path>
                                      <path d="M8 10h.01"></path>
                                      <path d="M16 10h.01"></path>
                                      <path d="M8 14h.01"></path>
                                      <path d="M16 14h.01"></path>
                                    </svg>
                                  )}
                                  {cat === "vehicle" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
                                      <circle cx="6.5" cy="16.5" r="2.5"></circle>
                                      <circle cx="16.5" cy="16.5" r="2.5"></circle>
                                    </svg>
                                  )}
                                  {cat === "tickets" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
                                      <path d="M13 5v2"></path>
                                      <path d="M13 17v2"></path>
                                      <path d="M13 11v2"></path>
                                    </svg>
                                  )}
                                  {cat === "wellness" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                                      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
                                    </svg>
                                  )}
                                </div>
                                <h3 className="font-medium text-gray-500 mb-2">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
                                <div className="mt-2 bg-red-100 text-red-800 text-xs py-1 px-2 rounded-full">
                                  Access Denied
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    }
                    
                    return (
                      <CategoryCard 
                        key={cat}
                        title={cat.charAt(0).toUpperCase() + cat.slice(1)} 
                        description={
                          cat === "stay" ? "Hotels, villas, homestays" :
                          cat === "vehicle" ? "Cars, bikes, boats, scooters" :
                          cat === "tickets" ? "Events, attractions, tours" :
                          "Spa, massage, yoga"
                        } 
                        icon={
                          cat === "stay" ? "building" :
                          cat === "vehicle" ? "car" :
                          cat === "tickets" ? "ticket" :
                          "heart-pulse"
                        }
                        onClick={() => setCategory(cat)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {category === "stay" && vendor.categories_allowed.includes("stay") ? (
                <StayBookingForm onSuccess={handleBookingCreated} />
              ) : category === "stay" ? (
                <p className="text-red-600 p-4">You do not have permission to access Stay bookings. This access attempt has been logged.</p>
              ) : null}
              
              {category === "vehicle" && vendor.categories_allowed.includes("vehicle") ? (
                <VehicleBookingForm onSuccess={handleBookingCreated} />
              ) : category === "vehicle" ? (
                <p className="text-red-600 p-4">You do not have permission to access Vehicle bookings. This access attempt has been logged.</p>
              ) : null}
              
              {category === "tickets" && vendor.categories_allowed.includes("tickets") ? (
                <TicketBookingForm onSuccess={handleBookingCreated} />
              ) : category === "tickets" ? (
                <p className="text-red-600 p-4">You do not have permission to access Ticket bookings. This access attempt has been logged.</p>
              ) : null}
              
              {category === "wellness" && vendor.categories_allowed.includes("wellness") ? (
                <WellnessBookingForm onSuccess={handleBookingCreated} />
              ) : category === "wellness" ? (
                <p className="text-red-600 p-4">You do not have permission to access Wellness bookings. This access attempt has been logged.</p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Category card component for selection screen
const CategoryCard = ({ 
  title, 
  description, 
  icon, 
  onClick 
}: { 
  title: string; 
  description: string; 
  icon: string;
  onClick: () => void;
}) => {
  return (
    <Card 
      className="cursor-pointer hover:border-emerald-500 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-3 rounded-full bg-emerald-100">
            {icon === "building" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M16 10h.01"></path>
                <path d="M8 14h.01"></path>
                <path d="M16 14h.01"></path>
              </svg>
            )}
            {icon === "car" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
                <circle cx="6.5" cy="16.5" r="2.5"></circle>
                <circle cx="16.5" cy="16.5" r="2.5"></circle>
              </svg>
            )}
            {icon === "ticket" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
                <path d="M13 5v2"></path>
                <path d="M13 17v2"></path>
                <path d="M13 11v2"></path>
              </svg>
            )}
            {icon === "heart-pulse" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
              </svg>
            )}
          </div>
          <h3 className="font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddBooking;