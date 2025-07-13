import { IStorage } from './storage';
import prisma from './prisma-client';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';
import {
  User, InsertUser,
  Service, InsertService,
  CalendarEvent, InsertCalendarEvent,
  CalendarSource, InsertCalendarSource,
  Booking, InsertBooking,
  Notification, InsertNotification,
  MarketingContent, InsertMarketingContent,
  bookings
} from '@shared/schema';

/**
 * PostgreSQL implementation of the IStorage interface
 */
export class DatabaseStorage implements IStorage {
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return user || undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    // Default categories based on business type if none provided
    if (!user.categoriesAllowed || (Array.isArray(user.categoriesAllowed) && user.categoriesAllowed.length === 0)) {
      // Set default categories based on business type
      if (user.role === 'vendor') {
        let categoriesAllowed = ['stays', 'transport', 'tours'];
        
        switch(user.businessType) {
          case 'stays':
          case 'accommodation':
            categoriesAllowed = ['stays', 'tours', 'wellness'];
            break;
          case 'transport':
            categoriesAllowed = ['transport', 'tours'];
            break;
          case 'tours':
          case 'activities':
            categoriesAllowed = ['tours', 'tickets', 'transport'];
            break;
          case 'wellness':
            categoriesAllowed = ['wellness', 'tours'];
            break;
          case 'products':
          case 'retail':
            categoriesAllowed = ['products', 'tickets'];
            break;
        }
        
        user.categoriesAllowed = categoriesAllowed;
      }
    }
    
    return await prisma.user.create({
      data: user
    });
  }
  
  async getUsers(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    try {
      return await prisma.user.update({
        where: { id },
        data: userUpdate
      });
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      return false;
    }
  }
  
  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    const service = await prisma.service.findUnique({
      where: { id }
    });
    return service || undefined;
  }
  
  async getServices(userId: number): Promise<Service[]> {
    return await prisma.service.findMany({
      where: { userId }
    });
  }
  
  async createService(service: InsertService): Promise<Service> {
    return await prisma.service.create({
      data: service
    });
  }
  
  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    try {
      return await prisma.service.update({
        where: { id },
        data: serviceUpdate
      });
    } catch (error) {
      console.error(`Failed to update service ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteService(id: number): Promise<boolean> {
    try {
      await prisma.service.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete service ${id}:`, error);
      return false;
    }
  }
  
  // Calendar event operations
  async getCalendarEvents(userId: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    const where: any = { userId };
    
    if (startDate && endDate) {
      where.startDate = { gte: startDate };
      where.endDate = { lte: endDate };
    } else if (startDate) {
      where.startDate = { gte: startDate };
    } else if (endDate) {
      where.endDate = { lte: endDate };
    }
    
    return await prisma.calendarEvent.findMany({
      where
    });
  }
  
  async getCalendarEventsByService(serviceId: number): Promise<CalendarEvent[]> {
    return await prisma.calendarEvent.findMany({
      where: { serviceId }
    });
  }
  
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    return await prisma.calendarEvent.create({
      data: event
    });
  }
  
  async updateCalendarEvent(id: number, eventUpdate: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    try {
      return await prisma.calendarEvent.update({
        where: { id },
        data: eventUpdate
      });
    } catch (error) {
      console.error(`Failed to update calendar event ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteCalendarEvent(id: number): Promise<boolean> {
    try {
      await prisma.calendarEvent.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete calendar event ${id}:`, error);
      return false;
    }
  }
  
  // Calendar source operations
  async getCalendarSources(userId: number): Promise<CalendarSource[]> {
    return await prisma.calendarSource.findMany({
      where: { userId }
    });
  }
  
  async createCalendarSource(source: InsertCalendarSource): Promise<CalendarSource> {
    return await prisma.calendarSource.create({
      data: source
    });
  }
  
  async updateCalendarSource(id: number, sourceUpdate: Partial<InsertCalendarSource>): Promise<CalendarSource | undefined> {
    try {
      return await prisma.calendarSource.update({
        where: { id },
        data: sourceUpdate
      });
    } catch (error) {
      console.error(`Failed to update calendar source ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteCalendarSource(id: number): Promise<boolean> {
    try {
      await prisma.calendarSource.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete calendar source ${id}:`, error);
      return false;
    }
  }
  
  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }
  
  async getBookings(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }
  
  async getRecentBookings(userId: number, limit: number): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt))
      .limit(limit);
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }
  
  async updateBooking(id: number, bookingUpdate: Partial<InsertBooking>): Promise<Booking | undefined> {
    try {
      const [updated] = await db
        .update(bookings)
        .set({ ...bookingUpdate, updatedAt: new Date() })
        .where(eq(bookings.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error(`Failed to update booking ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    try {
      await db.delete(bookings).where(eq(bookings.id, id));
      return true;
    } catch (error) {
      console.error(`Failed to delete booking ${id}:`, error);
      return false;
    }
  }
  
  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { 
        userId,
        read: false
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    return await prisma.notification.create({
      data: notification
    });
  }
  
  async markNotificationRead(id: number): Promise<boolean> {
    try {
      await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
      return true;
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      return false;
    }
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    try {
      await prisma.notification.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete notification ${id}:`, error);
      return false;
    }
  }
  
  // Marketing content operations
  async getMarketingContents(userId: number): Promise<MarketingContent[]> {
    return await prisma.marketingContent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async createMarketingContent(content: InsertMarketingContent): Promise<MarketingContent> {
    return await prisma.marketingContent.create({
      data: content
    });
  }
  
  async updateMarketingContent(id: number, contentUpdate: Partial<InsertMarketingContent>): Promise<MarketingContent | undefined> {
    try {
      return await prisma.marketingContent.update({
        where: { id },
        data: contentUpdate
      });
    } catch (error) {
      console.error(`Failed to update marketing content ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteMarketingContent(id: number): Promise<boolean> {
    try {
      await prisma.marketingContent.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete marketing content ${id}:`, error);
      return false;
    }
  }
}

// Create a singleton instance of the DatabaseStorage
export const dbStorage = new DatabaseStorage();