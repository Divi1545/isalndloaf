import { apiRequest } from "@/lib/queryClient";
import { QueryClient } from "@tanstack/react-query";
import { 
  BookingStatus, 
  BusinessType, 
  CalendarSource,
  MarketingContent
} from "@shared/schema";

// Calendar API functions
export async function syncCalendar(sourceId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiRequest("POST", `/api/calendar-sources/${sourceId}/sync`);
    return await response.json();
  } catch (error) {
    throw new Error("Failed to sync calendar");
  }
}

export async function addCalendarSource(data: {
  name: string;
  url: string;
  type: string;
  serviceId?: number;
}): Promise<CalendarSource> {
  try {
    const response = await apiRequest("POST", "/api/calendar-sources", data);
    return await response.json();
  } catch (error) {
    throw new Error("Failed to add calendar source");
  }
}

export async function deleteCalendarSource(sourceId: number): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/calendar-sources/${sourceId}`);
  } catch (error) {
    throw new Error("Failed to delete calendar source");
  }
}

// Booking API functions
export async function updateBookingStatus(
  bookingId: number, 
  status: BookingStatus,
  queryClient: QueryClient
): Promise<void> {
  try {
    await apiRequest("PUT", `/api/bookings/${bookingId}`, { status });
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    queryClient.invalidateQueries({ queryKey: ['/api/bookings/recent'] });
  } catch (error) {
    throw new Error("Failed to update booking status");
  }
}

// Service API functions
export async function updateServicePrice(
  serviceId: number, 
  basePrice: number,
  queryClient: QueryClient
): Promise<void> {
  try {
    await apiRequest("PUT", `/api/services/${serviceId}`, { basePrice });
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/services'] });
  } catch (error) {
    throw new Error("Failed to update service price");
  }
}

// Marketing API functions
export async function generateMarketingContent(data: {
  contentType: string;
  serviceId?: number;
  serviceDescription: string;
  targetAudience: string;
  tone: string;
}): Promise<{ success: boolean; content: string; marketingContent: MarketingContent }> {
  try {
    const response = await apiRequest("POST", "/api/ai/generate-marketing", data);
    return await response.json();
  } catch (error) {
    throw new Error("Failed to generate marketing content");
  }
}

// Notification API functions
export async function markAllNotificationsAsRead(queryClient: QueryClient): Promise<void> {
  try {
    await apiRequest("POST", "/api/notifications/mark-all-read");
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
  } catch (error) {
    throw new Error("Failed to mark notifications as read");
  }
}

// User API functions
export async function updateUserProfile(
  data: {
    fullName?: string;
    businessName?: string;
    businessType?: BusinessType;
    email?: string;
  },
  queryClient: QueryClient
): Promise<void> {
  try {
    await apiRequest("PUT", "/api/users/profile", data);
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  } catch (error) {
    throw new Error("Failed to update profile");
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    await apiRequest("PUT", "/api/users/password", {
      currentPassword,
      newPassword
    });
  } catch (error) {
    throw new Error("Failed to change password");
  }
}
