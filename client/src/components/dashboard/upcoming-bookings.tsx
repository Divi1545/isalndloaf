import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface UpcomingBookingsProps {
  limit?: number;
}

export default function UpcomingBookings({ limit = 3 }: UpcomingBookingsProps) {
  const [, navigate] = useLocation();
  
  const { data: bookings, isLoading } = useQuery({
    queryKey: [`/api/bookings/recent?limit=${limit}`],
  });
  
  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case "stays":
        return "ri-hotel-line";
      case "vehicles":
        return "ri-car-line";
      case "tours":
        return "ri-ship-line";
      case "wellness":
        return "ri-mental-health-line";
      case "tickets":
        return "ri-ticket-line";
      default:
        return "ri-calendar-event-line";
    }
  };
  
  const getBookingTypeColor = (type: string) => {
    switch (type) {
      case "stays":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600"
        };
      case "vehicles":
        return {
          bg: "bg-amber-100",
          text: "text-amber-600"
        };
      case "tours":
        return {
          bg: "bg-green-100",
          text: "text-green-600"
        };
      case "wellness":
        return {
          bg: "bg-purple-100",
          text: "text-purple-600"
        };
      case "tickets":
        return {
          bg: "bg-pink-100",
          text: "text-pink-600"
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600"
        };
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          dot: "bg-green-500",
          text: "text-green-800"
        };
      case "pending":
        return {
          dot: "bg-yellow-500",
          text: "text-yellow-800"
        };
      case "cancelled":
        return {
          dot: "bg-red-500",
          text: "text-red-800"
        };
      case "completed":
        return {
          dot: "bg-blue-500",
          text: "text-blue-800"
        };
      default:
        return {
          dot: "bg-gray-500",
          text: "text-gray-800"
        };
    }
  };
  
  const formatDateRange = (start: string, end: string) => {
    return `${format(new Date(start), "MMM d")} - ${format(new Date(end), "MMM d, yyyy")}`;
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Upcoming Bookings</h3>
          <Button
            variant="ghost"
            className="text-primary text-sm p-0 h-auto"
            onClick={() => navigate("/dashboard/bookings")}
          >
            View all
          </Button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            Array(limit).fill(0).map((_, index) => (
              <div key={index} className="border-b border-neutral-200 pb-3 last:border-0">
                <div className="flex">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="ml-3 flex-1">
                    <Skeleton className="h-5 w-2/3 mb-1" />
                    <Skeleton className="h-4 w-1/2 mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))
          ) : bookings && bookings.length > 0 ? (
            // Real data
            bookings.map((booking: any) => {
              const typeStyle = getBookingTypeColor(booking.type || "stays");
              const statusStyle = getStatusColor(booking.status);
              
              return (
                <div key={booking.id} className="border-b border-neutral-200 pb-3 last:border-0">
                  <div className="flex">
                    <div className={`w-10 h-10 rounded-full ${typeStyle.bg} flex items-center justify-center ${typeStyle.text} flex-shrink-0`}>
                      <i className={`${getBookingTypeIcon(booking.type || "stays")} text-lg`}></i>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{booking.serviceName}</p>
                      <p className="text-sm text-neutral-600">
                        {formatDateRange(booking.startDate, booking.endDate)}
                      </p>
                      <div className="flex items-center mt-1 text-sm">
                        <span className={`inline-block w-2 h-2 rounded-full ${statusStyle.dot} mr-1`}></span>
                        <span className={statusStyle.text}>{booking.status}</span>
                        <span className="mx-2 text-neutral-300">|</span>
                        <span>{formatCurrency(booking.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // No bookings
            <div className="text-center py-6">
              <p className="text-neutral-500 mb-2">No upcoming bookings</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/bookings")}
              >
                View all bookings
              </Button>
            </div>
          )}
          
          {bookings && bookings.length > 0 && (
            <div className="text-center pt-2">
              <Button 
                variant="ghost"
                className="text-primary hover:text-primary-700 text-sm font-medium"
                onClick={() => navigate("/dashboard/bookings")}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
