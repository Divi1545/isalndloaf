import {
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  calendarEvents, type CalendarEvent, type InsertCalendarEvent,
  calendarSources, type CalendarSource, type InsertCalendarSource,
  bookings, type Booking, type InsertBooking,
  notifications, type Notification, type InsertNotification,
  marketingContents, type MarketingContent, type InsertMarketingContent,
  supportTickets, type SupportTicket, type InsertSupportTicket
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsers(): Promise<User[]>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServices(userId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Calendar operations
  getCalendarEvents(userId: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  getCalendarEventsByService(serviceId: number): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number): Promise<boolean>;
  
  // Calendar sources operations
  getCalendarSources(userId: number): Promise<CalendarSource[]>;
  createCalendarSource(source: InsertCalendarSource): Promise<CalendarSource>;
  updateCalendarSource(id: number, source: Partial<InsertCalendarSource>): Promise<CalendarSource | undefined>;
  deleteCalendarSource(id: number): Promise<boolean>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookings(userId: number): Promise<Booking[]>;
  getRecentBookings(userId: number, limit: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Marketing content operations
  getMarketingContents(userId: number): Promise<MarketingContent[]>;
  createMarketingContent(content: InsertMarketingContent): Promise<MarketingContent>;
  updateMarketingContent(id: number, content: Partial<InsertMarketingContent>): Promise<MarketingContent | undefined>;
  deleteMarketingContent(id: number): Promise<boolean>;
  
  // Support ticket operations
  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketsByUser(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  deleteSupportTicket(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateUser)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServices(userId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.userId, userId));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  async updateService(id: number, updateService: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set(updateService)
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCalendarEvents(userId: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let query = db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));
    return await query;
  }

  async getCalendarEventsByService(serviceId: number): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.serviceId, serviceId));
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db
      .insert(calendarEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateCalendarEvent(id: number, updateEvent: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .update(calendarEvents)
      .set(updateEvent)
      .where(eq(calendarEvents.id, id))
      .returning();
    return event || undefined;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    const result = await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCalendarSources(userId: number): Promise<CalendarSource[]> {
    return await db.select().from(calendarSources).where(eq(calendarSources.userId, userId));
  }

  async createCalendarSource(insertSource: InsertCalendarSource): Promise<CalendarSource> {
    const [source] = await db
      .insert(calendarSources)
      .values(insertSource)
      .returning();
    return source;
  }

  async updateCalendarSource(id: number, updateSource: Partial<InsertCalendarSource>): Promise<CalendarSource | undefined> {
    const [source] = await db
      .update(calendarSources)
      .set(updateSource)
      .where(eq(calendarSources.id, id))
      .returning();
    return source || undefined;
  }

  async deleteCalendarSource(id: number): Promise<boolean> {
    const result = await db.delete(calendarSources).where(eq(calendarSources.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookings(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getRecentBookings(userId: number, limit: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId)).limit(limit);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBooking(id: number, updateBooking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set(updateBooking)
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMarketingContents(userId: number): Promise<MarketingContent[]> {
    return await db.select().from(marketingContents).where(eq(marketingContents.userId, userId));
  }

  async createMarketingContent(insertContent: InsertMarketingContent): Promise<MarketingContent> {
    const [content] = await db
      .insert(marketingContents)
      .values(insertContent)
      .returning();
    return content;
  }

  async updateMarketingContent(id: number, updateContent: Partial<InsertMarketingContent>): Promise<MarketingContent | undefined> {
    const [content] = await db
      .update(marketingContents)
      .set(updateContent)
      .where(eq(marketingContents.id, id))
      .returning();
    return content || undefined;
  }

  async deleteMarketingContent(id: number): Promise<boolean> {
    const result = await db.delete(marketingContents).where(eq(marketingContents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets);
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db
      .insert(supportTickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  async updateSupportTicket(id: number, updateTicket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .update(supportTickets)
      .set(updateTicket)
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket || undefined;
  }

  async deleteSupportTicket(id: number): Promise<boolean> {
    const result = await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private servicesData: Map<number, Service>;
  private calendarEventsData: Map<number, CalendarEvent>;
  private calendarSourcesData: Map<number, CalendarSource>;
  private bookingsData: Map<number, Booking>;
  private notificationsData: Map<number, Notification>;
  private marketingContentsData: Map<number, MarketingContent>;
  
  private userIdCounter: number;
  private serviceIdCounter: number;
  private calendarEventIdCounter: number;
  private calendarSourceIdCounter: number;
  private bookingIdCounter: number;
  private notificationIdCounter: number;
  private marketingContentIdCounter: number;

  constructor() {
    this.usersData = new Map();
    this.servicesData = new Map();
    this.calendarEventsData = new Map();
    this.calendarSourcesData = new Map();
    this.bookingsData = new Map();
    this.notificationsData = new Map();
    this.marketingContentsData = new Map();
    
    this.userIdCounter = 1;
    this.serviceIdCounter = 1;
    this.calendarEventIdCounter = 1;
    this.calendarSourceIdCounter = 1;
    this.bookingIdCounter = 1;
    this.notificationIdCounter = 1;
    this.marketingContentIdCounter = 1;
    
    // Initialize with default admin user
    this.createUser({
      username: "admin", 
      password: "admin123",
      email: "admin@islandloaf.com",
      fullName: "Admin User",
      businessName: "IslandLoaf Admin",
      businessType: "administration",
      role: "admin"
    });
    
    // Initialize with default vendor
    this.createUser({
      username: "vendor",
      password: "password123",
      email: "vendor@islandloaf.com",
      fullName: "Island Vendor",
      businessName: "Beach Paradise Villa",
      businessType: "accommodation",
      role: "vendor"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    
    // Auto-assign default categories for vendors
    let categoriesAllowed = user.categoriesAllowed || [];
    
    // If it's a vendor and no categories are specified, assign default categories
    if (user.role === 'vendor' && (!Array.isArray(categoriesAllowed) || categoriesAllowed.length === 0)) {
      // Default categories based on business type
      categoriesAllowed = ['stays', 'transport', 'tours'];
      
      // Adjust default categories based on business type
      if (user.businessType === 'stays' || user.businessType === 'accommodation') {
        categoriesAllowed = ['stays', 'tours', 'wellness'];
      } else if (user.businessType === 'transport') {
        categoriesAllowed = ['transport', 'tours'];
      } else if (user.businessType === 'tours' || user.businessType === 'activities') {
        categoriesAllowed = ['tours', 'tickets', 'transport'];
      } else if (user.businessType === 'wellness') {
        categoriesAllowed = ['wellness', 'tours'];
      } else if (user.businessType === 'products' || user.businessType === 'retail') {
        categoriesAllowed = ['products', 'tickets'];
      }
    }
    
    const newUser: User = { 
      ...user, 
      id, 
      createdAt,
      categoriesAllowed,
      role: user.role || 'vendor'
    };
    
    this.usersData.set(id, newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    return this.servicesData.get(id);
  }

  async getServices(userId: number): Promise<Service[]> {
    return Array.from(this.servicesData.values()).filter(
      (service) => service.userId === userId
    );
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const createdAt = new Date();
    const newService: Service = { 
      ...service, 
      id, 
      createdAt,
      available: service.available ?? true
    };
    this.servicesData.set(id, newService);
    return newService;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.servicesData.get(id);
    if (!service) return undefined;
    
    const updatedService: Service = { ...service, ...serviceUpdate };
    this.servicesData.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.servicesData.delete(id);
  }

  // Calendar event operations
  async getCalendarEvents(userId: number, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let events = Array.from(this.calendarEventsData.values()).filter(
      (event) => event.userId === userId
    );
    
    if (startDate) {
      events = events.filter(event => new Date(event.startDate) >= startDate);
    }
    
    if (endDate) {
      events = events.filter(event => new Date(event.endDate) <= endDate);
    }
    
    return events;
  }

  async getCalendarEventsByService(serviceId: number): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEventsData.values()).filter(
      (event) => event.serviceId === serviceId
    );
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.calendarEventIdCounter++;
    const createdAt = new Date();
    const newEvent: CalendarEvent = { 
      ...event, 
      id, 
      createdAt,
      serviceId: event.serviceId ?? null,
      isBooked: event.isBooked ?? false,
      isPending: event.isPending ?? false,
      isBlocked: event.isBlocked ?? false,
      source: event.source ?? null,
      externalId: event.externalId ?? null
    };
    this.calendarEventsData.set(id, newEvent);
    return newEvent;
  }

  async updateCalendarEvent(id: number, eventUpdate: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const event = this.calendarEventsData.get(id);
    if (!event) return undefined;
    
    const updatedEvent: CalendarEvent = { ...event, ...eventUpdate };
    this.calendarEventsData.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    return this.calendarEventsData.delete(id);
  }

  // Calendar sources operations
  async getCalendarSources(userId: number): Promise<CalendarSource[]> {
    return Array.from(this.calendarSourcesData.values()).filter(
      (source) => source.userId === userId
    );
  }

  async createCalendarSource(source: InsertCalendarSource): Promise<CalendarSource> {
    const id = this.calendarSourceIdCounter++;
    const createdAt = new Date();
    const newSource: CalendarSource = { 
      ...source, 
      id, 
      createdAt, 
      lastSynced: null,
      serviceId: source.serviceId ?? null
    };
    this.calendarSourcesData.set(id, newSource);
    return newSource;
  }

  async updateCalendarSource(id: number, sourceUpdate: Partial<InsertCalendarSource>): Promise<CalendarSource | undefined> {
    const source = this.calendarSourcesData.get(id);
    if (!source) return undefined;
    
    const updatedSource: CalendarSource = { ...source, ...sourceUpdate };
    this.calendarSourcesData.set(id, updatedSource);
    return updatedSource;
  }

  async deleteCalendarSource(id: number): Promise<boolean> {
    return this.calendarSourcesData.delete(id);
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingsData.get(id);
  }

  async getBookings(userId: number): Promise<Booking[]> {
    return Array.from(this.bookingsData.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getRecentBookings(userId: number, limit: number): Promise<Booking[]> {
    return Array.from(this.bookingsData.values())
      .filter(booking => booking.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt, 
      updatedAt,
      status: booking.status || 'pending',
      notes: booking.notes || null
    };
    this.bookingsData.set(id, newBooking);
    return newBooking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookingsData.get(id);
    if (!booking) return undefined;
    
    const updatedAt = new Date();
    const updatedBooking: Booking = { ...booking, ...bookingUpdate, updatedAt };
    this.bookingsData.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    return this.bookingsData.delete(id);
  }

  // Notification operations
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const createdAt = new Date();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt,
      read: notification.read ?? false
    };
    this.notificationsData.set(id, newNotification);
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const notification = this.notificationsData.get(id);
    if (!notification) return false;
    
    const updatedNotification: Notification = { ...notification, read: true };
    this.notificationsData.set(id, updatedNotification);
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notificationsData.delete(id);
  }

  // Marketing content operations
  async getMarketingContents(userId: number): Promise<MarketingContent[]> {
    return Array.from(this.marketingContentsData.values())
      .filter(content => content.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createMarketingContent(content: InsertMarketingContent): Promise<MarketingContent> {
    const id = this.marketingContentIdCounter++;
    const createdAt = new Date();
    const newContent: MarketingContent = { 
      ...content, 
      id, 
      createdAt,
      serviceId: content.serviceId ?? null
    };
    this.marketingContentsData.set(id, newContent);
    return newContent;
  }

  async updateMarketingContent(id: number, contentUpdate: Partial<InsertMarketingContent>): Promise<MarketingContent | undefined> {
    const content = this.marketingContentsData.get(id);
    if (!content) return undefined;
    
    const updatedContent: MarketingContent = { ...content, ...contentUpdate };
    this.marketingContentsData.set(id, updatedContent);
    return updatedContent;
  }

  async deleteMarketingContent(id: number): Promise<boolean> {
    return this.marketingContentsData.delete(id);
  }
}

// Import database storage implementation
import { dbStorage } from './database-storage';

// Always use database storage for production
export const storage = dbStorage;
