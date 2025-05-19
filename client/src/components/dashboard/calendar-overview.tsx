import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface CalendarDayProps {
  day: number;
  status?: "available" | "booked" | "pending";
}

function CalendarDay({ day, status }: CalendarDayProps) {
  return (
    <div 
      className={cn(
        "calendar-day",
        status === "booked" && "booked",
        status === "available" && "available",
        status === "pending" && "pending"
      )}
    >
      {day}
    </div>
  );
}

export default function CalendarOverview() {
  const [, navigate] = useLocation();
  
  // In a real app, this would be fetched from an API
  const month = "January 2023";
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  // Sample calendar data for display
  const calendarDays: CalendarDayProps[] = [
    { day: 1 },
    { day: 2 },
    { day: 3 },
    { day: 4 },
    { day: 5 },
    { day: 6 },
    { day: 7 },
    { day: 8 },
    { day: 9 },
    { day: 10, status: "pending" },
    { day: 11, status: "pending" },
    { day: 12, status: "booked" },
    { day: 13, status: "booked" },
    { day: 14, status: "booked" },
    { day: 15, status: "booked" },
    { day: 16, status: "booked" },
    { day: 17, status: "available" },
    { day: 18, status: "available" },
    { day: 19, status: "available" },
    { day: 20, status: "available" },
    { day: 21, status: "available" },
  ];

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-4">Calendar Overview</h3>
        
        <div className="mb-3">
          <p className="text-sm text-neutral-700 mb-2">{month}</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day, index) => (
              <div key={index} className="text-xs text-neutral-500">{day}</div>
            ))}
            
            {calendarDays.map((day, index) => (
              <CalendarDay key={index} {...day} />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between text-sm mt-4">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            <span>Booked</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
            <span>Pending</span>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            className="text-primary hover:text-primary-700 text-sm font-medium"
            onClick={() => navigate("/dashboard/calendar")}
          >
            View full calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
