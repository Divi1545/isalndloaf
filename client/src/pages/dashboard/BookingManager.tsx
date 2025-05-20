import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpcomingBookings from "@/components/dashboard/upcoming-bookings";

const BookingManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Booking Manager</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[300px]">
            <Input 
              type="text"
              placeholder="Search by name or booking ID..." 
              className="w-full"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = "/add-booking"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Add Booking
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <UpcomingBookings limit={10} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="pt-6 pb-2">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-amber-100 p-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <path d="M4.18 4.18A2 2 0 0 0 4 5v14a2 2 0 0 0 2 2h12a2 2 0 0 0 .82-.18"></path>
                    <path d="M9 14v-4"></path>
                    <path d="M9 18v.01"></path>
                    <path d="M15 14v-4"></path>
                    <path d="M15 18v.01"></path>
                    <path d="M5 8h14"></path>
                    <path d="M19.5 4.18v-.34A1.84 1.84 0 0 0 17.66 2h-.35"></path>
                    <path d="M19.82 8A2 2 0 0 0 22 6V5a2 2 0 0 0-2-2h-.5"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No pending bookings</h3>
                <p className="text-muted-foreground max-w-sm">
                  Any bookings awaiting confirmation will appear here. You'll be notified when a new booking request comes in.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Booking ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Guest</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length: 5}).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-4 text-sm">BK-{2023 + index}</td>
                      <td className="py-4 px-4 text-sm">Past Guest {index + 1}</td>
                      <td className="py-4 px-4 text-sm">{new Date(2023, 9 - index, 15 - index).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">${(250 + index * 25).toFixed(2)}</td>
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          <Card>
            <CardContent className="pt-6 pb-2">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-red-100 p-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                    <path d="M4.18 4.18A2 2 0 0 0 4 5v14a2 2 0 0 0 2 2h12a2 2 0 0 0 .82-.18"></path>
                    <path d="M20 16c0-2.5-2-4.5-4.5-4.5S11 13.5 11 16c0 2.5 2 4.5 4.5 4.5S20 18.5 20 16z"></path>
                    <path d="m17 14.5-2.9 2.9"></path>
                    <path d="m14.1 14.5 2.9 2.9"></path>
                    <path d="M5 8h14"></path>
                    <path d="M6 2v4"></path>
                    <path d="M18 2v4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No cancelled bookings</h3>
                <p className="text-muted-foreground max-w-sm">
                  Any bookings that were cancelled will appear here. Your cancellation rate is currently at 0%.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingManager;