import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";
import * as schema from "@shared/schema";
import {
  User, InsertUser,
  Service, InsertService,
  CalendarEvent, InsertCalendarEvent,
  CalendarSource, InsertCalendarSource,
  Booking, InsertBooking,
  Notification, InsertNotification,
  MarketingContent, InsertMarketingContent
} from "@shared/schema";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(schema.services).where(eq(schema.services.id, id));
    return service;
  }

  async getServices(userId: number): Promise<Service[]> {
    return await db.select().from(schema.services).where(eq(schema.services.userId, userId));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(schema.services).values(service).returning();
    return newService;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(schema.services)
      .set(serviceUpdate)
      .where(eq(schema.services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    await db.delete(schema.services).where(eq(schema.services.id, id));
    return true;
  }

  // Calendar events operations
  async getCalendarEvents(userId: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(schema.calendarEvents)
        .where(
          and(
            eq(schema.calendarEvents.userId, userId),
            gte(schema.calendarEvents.startDate, startDate),
            lte(schema.calendarEvents.endDate, endDate)
          )
        );
    } else {
      return await db
        .select()
        .from(schema.calendarEvents)
        .where(eq(schema.calendarEvents.userId, userId));
    }
  }

  async getCalendarEventsByService(serviceId: number): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(schema.calendarEvents)
      .where(eq(schema.calendarEvents.serviceId, serviceId));
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db
      .insert(schema.calendarEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateCalendarEvent(id: number, eventUpdate: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const [updatedEvent] = await db
      .update(schema.calendarEvents)
      .set(eventUpdate)
      .where(eq(schema.calendarEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.calendarEvents)
      .where(eq(schema.calendarEvents.id, id));
    return result.count > 0;
  }

  // Calendar sources operations
  async getCalendarSources(userId: number): Promise<CalendarSource[]> {
    return await db
      .select()
      .from(schema.calendarSources)
      .where(eq(schema.calendarSources.userId, userId));
  }

  async createCalendarSource(source: InsertCalendarSource): Promise<CalendarSource> {
    const [newSource] = await db
      .insert(schema.calendarSources)
      .values(source)
      .returning();
    return newSource;
  }

  async updateCalendarSource(id: number, sourceUpdate: Partial<InsertCalendarSource>): Promise<CalendarSource | undefined> {
    const [updatedSource] = await db
      .update(schema.calendarSources)
      .set({ ...sourceUpdate, lastSynced: new Date() })
      .where(eq(schema.calendarSources.id, id))
      .returning();
    return updatedSource;
  }

  async deleteCalendarSource(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.calendarSources)
      .where(eq(schema.calendarSources.id, id));
    return result.count > 0;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, id));
    return booking;
  }

  async getBookings(userId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.userId, userId));
  }

  async getRecentBookings(userId: number, limit: number): Promise<Booking[]> {
    return await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.userId, userId))
      .orderBy(schema.bookings.createdAt)
      .limit(limit);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(schema.bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(schema.bookings)
      .set({ ...bookingUpdate, updatedAt: new Date() })
      .where(eq(schema.bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.bookings)
      .where(eq(schema.bookings.id, id));
    return result.count > 0;
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(schema.notifications.createdAt);
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .where(eq(schema.notifications.read, false))
      .orderBy(schema.notifications.createdAt);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(schema.notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const result = await db
      .update(schema.notifications)
      .set({ read: true })
      .where(eq(schema.notifications.id, id));
    return result.count > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.notifications)
      .where(eq(schema.notifications.id, id));
    return result.count > 0;
  }

  // Marketing content operations
  async getMarketingContents(userId: number): Promise<MarketingContent[]> {
    return await db
      .select()
      .from(schema.marketingContents)
      .where(eq(schema.marketingContents.userId, userId))
      .orderBy(schema.marketingContents.createdAt);
  }

  async createMarketingContent(content: InsertMarketingContent): Promise<MarketingContent> {
    const [newContent] = await db
      .insert(schema.marketingContents)
      .values(content)
      .returning();
    return newContent;
  }

  async updateMarketingContent(id: number, contentUpdate: Partial<InsertMarketingContent>): Promise<MarketingContent | undefined> {
    const [updatedContent] = await db
      .update(schema.marketingContents)
      .set(contentUpdate)
      .where(eq(schema.marketingContents.id, id))
      .returning();
    return updatedContent;
  }

  async deleteMarketingContent(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.marketingContents)
      .where(eq(schema.marketingContents.id, id));
    return result.count > 0;
  }
}