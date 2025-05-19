import React from 'react';
import { Button } from "@/components/ui/button";

interface UpcomingBookingsProps {
  limit?: number;
}

const UpcomingBookings = ({ limit = 5 }: UpcomingBookingsProps) => {
  // Sample booking data - in a real app, would come from API
  const bookings = [
    {
      id: 'BK-2023',
      customerName: 'Sarah Johnson',
      checkIn: new Date(2025, 4, 20), // May 20, 2025
      checkOut: new Date(2025, 4, 23), // May 23, 2025
      service: 'Beach Villa',
      status: 'confirmed',
      amount: 549.99
    },
    {
      id: 'BK-2024',
      customerName: 'Michael Chen',
      checkIn: new Date(2025, 4, 21), // May 21, 2025
      checkOut: new Date(2025, 4, 25), // May 25, 2025
      service: 'Garden Room',
      status: 'confirmed',
      amount: 349.99
    },
    {
      id: 'BK-2025',
      customerName: 'Emma Williams',
      checkIn: new Date(2025, 4, 25), // May 25, 2025
      checkOut: new Date(2025, 4, 28), // May 28, 2025
      service: 'Beach Villa',
      status: 'pending',
      amount: 549.99
    },
    {
      id: 'BK-2026',
      customerName: 'James Taylor',
      checkIn: new Date(2025, 5, 2), // June 2, 2025
      checkOut: new Date(2025, 5, 5), // June 5, 2025
      service: 'Ocean View Suite',
      status: 'confirmed',
      amount: 749.99
    },
    {
      id: 'BK-2027',
      customerName: 'Sophie Dubois',
      checkIn: new Date(2025, 5, 5), // June 5, 2025
      checkOut: new Date(2025, 5, 10), // June 10, 2025
      service: 'Beach Villa',
      status: 'pending',
      amount: 1349.99
    },
    {
      id: 'BK-2028',
      customerName: 'Raj Patel',
      checkIn: new Date(2025, 5, 12), // June 12, 2025
      checkOut: new Date(2025, 5, 15), // June 15, 2025
      service: 'Garden Room',
      status: 'confirmed',
      amount: 349.99
    }
  ];
  
  // Get only the first 'limit' number of bookings
  const limitedBookings = bookings.slice(0, limit);
  
  // Format date as "May 20, 2025"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-sm">Booking ID</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Guest</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Check In</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Check Out</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Service</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
              <th className="text-right py-3 px-4 font-medium text-sm">Amount</th>
              <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {limitedBookings.map((booking) => (
              <tr key={booking.id} className="border-b">
                <td className="py-4 px-4 text-sm">{booking.id}</td>
                <td className="py-4 px-4 text-sm font-medium">{booking.customerName}</td>
                <td className="py-4 px-4 text-sm">{formatDate(booking.checkIn)}</td>
                <td className="py-4 px-4 text-sm">{formatDate(booking.checkOut)}</td>
                <td className="py-4 px-4 text-sm">{booking.service}</td>
                <td className="py-4 px-4 text-sm">
                  <span 
                    className={`
                      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                      }
                    `}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-right">${booking.amount.toFixed(2)}</td>
                <td className="py-4 px-4 text-right">
                  <Button variant="ghost" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {limit < bookings.length && (
        <div className="flex justify-center mt-6">
          <Button variant="outline">View All Bookings</Button>
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;