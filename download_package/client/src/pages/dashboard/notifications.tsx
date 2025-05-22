import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { markAllNotificationsAsRead } from "@/lib/api";
import { format } from "date-fns";
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  CheckCheck, 
  Clock, 
  Calendar, 
  User, 
  CreditCard,
  FileText,
  Settings2
} from "lucide-react";

export default function Notifications() {
  const queryClient = useQueryClient();
  
  // Get notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
  });
  
  // Get system logs
  const { data: systemLogs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['/api/system-logs'],
    enabled: false, // Disabled because the endpoint doesn't exist in our implementation
  });
  
  // Mark all notifications as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return markAllNotificationsAsRead(queryClient);
    },
    onSuccess: () => {
      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to mark notifications as read",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Demo notifications for UI
  const demoNotifications = [
    {
      id: 1,
      title: "New Booking",
      message: "You have a new booking for Ocean View Villa on January 12-16, 2023",
      type: "success",
      read: false,
      createdAt: new Date("2023-01-05T10:30:00Z")
    },
    {
      id: 2,
      title: "Calendar Sync Completed",
      message: "Your Google Calendar has been successfully synced.",
      type: "info",
      read: true,
      createdAt: new Date("2023-01-04T15:15:00Z")
    },
    {
      id: 3,
      title: "Payment Received",
      message: "You received a payment of $350 for Island Tour Package.",
      type: "success",
      read: false,
      createdAt: new Date("2023-01-03T18:45:00Z")
    },
    {
      id: 4,
      title: "Booking Cancelled",
      message: "A booking for Spa Treatment on January 5, 2023 has been cancelled.",
      type: "warning",
      read: true,
      createdAt: new Date("2023-01-02T09:20:00Z")
    },
    {
      id: 5,
      title: "Calendar Sync Failed",
      message: "Failed to sync with Airbnb Calendar. Please check the URL and try again.",
      type: "error",
      read: false,
      createdAt: new Date("2023-01-01T14:10:00Z")
    }
  ];
  
  // Demo system logs for UI
  const demoSystemLogs = [
    {
      id: 1,
      action: "Profile Updated",
      details: "User profile information updated",
      user: "John Smith",
      timestamp: new Date("2023-01-05T11:30:00Z")
    },
    {
      id: 2,
      action: "Service Price Changed",
      details: "Base price for 'Ocean View Villa' changed from $200 to $250",
      user: "John Smith",
      timestamp: new Date("2023-01-04T16:45:00Z")
    },
    {
      id: 3,
      action: "Calendar Source Added",
      details: "Added new calendar source: 'Booking.com Calendar'",
      user: "John Smith",
      timestamp: new Date("2023-01-03T14:20:00Z")
    },
    {
      id: 4,
      action: "Booking Status Changed",
      details: "Booking #3 status changed from 'pending' to 'confirmed'",
      user: "John Smith",
      timestamp: new Date("2023-01-02T10:15:00Z")
    },
    {
      id: 5,
      action: "Login Successful",
      details: "User logged in from new device",
      user: "John Smith",
      timestamp: new Date("2023-01-01T09:05:00Z")
    }
  ];
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getSystemLogIcon = (action: string) => {
    if (action.includes("Profile")) return <User className="h-5 w-5 text-purple-500" />;
    if (action.includes("Price") || action.includes("Payment")) return <CreditCard className="h-5 w-5 text-green-500" />;
    if (action.includes("Calendar")) return <Calendar className="h-5 w-5 text-blue-500" />;
    if (action.includes("Booking")) return <FileText className="h-5 w-5 text-amber-500" />;
    if (action.includes("Login")) return <CheckCheck className="h-5 w-5 text-green-500" />;
    return <Settings2 className="h-5 w-5 text-neutral-500" />;
  };
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Notifications & Logs</h1>
      
      <Tabs defaultValue="notifications">
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center mb-6">
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system-logs">System Logs</TabsTrigger>
          </TabsList>
          
          <div className="mb-4 sm:mb-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          </div>
        </div>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoNotifications.length === 0 ? (
                  <div className="text-center p-8 border rounded-md bg-neutral-50">
                    <Bell className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No notifications</h3>
                    <p className="text-neutral-500 mb-4">
                      You're all caught up! New notifications will appear here.
                    </p>
                  </div>
                ) : (
                  demoNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex p-4 border rounded-md ${notification.read ? "" : "bg-blue-50 border-blue-100"}`}
                    >
                      <div className="mr-4 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <h3 className="font-medium">{notification.title}</h3>
                          <span className="text-sm text-neutral-500 mt-1 sm:mt-0">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-neutral-700 mt-1">{notification.message}</p>
                        
                        <div className="flex justify-end mt-2">
                          {!notification.read && (
                            <Button variant="ghost" size="sm">
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Logs Tab */}
        <TabsContent value="system-logs">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoSystemLogs.length === 0 ? (
                  <div className="text-center p-8 border rounded-md bg-neutral-50">
                    <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No activity logs</h3>
                    <p className="text-neutral-500 mb-4">
                      System activity logs will appear here.
                    </p>
                  </div>
                ) : (
                  demoSystemLogs.map((log) => (
                    <div key={log.id} className="flex p-4 border rounded-md">
                      <div className="mr-4 mt-1">
                        {getSystemLogIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <h3 className="font-medium">{log.action}</h3>
                          <span className="text-sm text-neutral-500 mt-1 sm:mt-0">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-neutral-700 mt-1">{log.details}</p>
                        <p className="text-sm text-neutral-500 mt-1">
                          User: {log.user}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
