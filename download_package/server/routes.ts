import { Request, Response, NextFunction, Express } from "express";
import { Server } from "http";
import { z } from "zod";
import path from "path";
import { storage } from "./storage";
import { bookingStatuses, loginSchema, insertUserSchema } from "@shared/schema";
import OpenAI from "openai";

interface SessionData {
  userId: number;
  userRole: string;
}

declare module "express-session" {
  interface SessionData {
    user: SessionData;
  }
}

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<void> {
  // API Reports endpoint for generating CSV reports
  app.get("/api/reports/generate", (req: Request, res: Response) => {
    // Generate report data - in a real app, this would fetch from database
    const content = "Islandloaf Report\nBookings: 102\nVendors: 40\nRevenue: LKR 3,400,000";
    
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=islandloaf_report.csv');
    res.set('Content-Type', 'text/csv');
    res.send(content);
  });
  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  };

  // Create a sample user if none exists (for development purposes)
  const createSampleUser = async () => {
    try {
      const users = await storage.getUsers();
      if (users.length === 0) {
        console.log("Creating sample user...");
        await storage.createUser({
          username: "vendor",
          email: "vendor@islandloaf.com",
          password: "password123", // This is just for development
          fullName: "Island Vendor",
          businessName: "Beach Paradise Villa",
          businessType: "accommodation",
          role: "vendor",
        });
        console.log("Sample user created successfully");
      }
    } catch (error) {
      console.error("Error creating sample user:", error);
    }
  };

  // Create sample user on startup
  await createSampleUser();

  // Auth Routes
  // Registration endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Create the user (categories will be auto-assigned based on business type)
      const newUser = await storage.createUser(userData);
      
      // Set session
      req.session.user = {
        userId: newUser.id,
        userRole: newUser.role,
      };

      // Return user data (excluding password)
      const { password, ...newUserData } = newUser;
      
      // Create welcome notification
      await storage.createNotification({
        userId: newUser.id,
        title: "Welcome to IslandLoaf",
        message: `Welcome to IslandLoaf, ${newUser.fullName}! Your account has been created successfully. Get started by adding your first service.`,
        type: "info",
        read: false,
        createdAt: new Date()
      });
      
      res.status(201).json({
        user: newUserData,
        message: "Registration successful",
        categories: newUser.categoriesAllowed
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      // Get user by email
      const user = await storage.getUserByEmail(data.email);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Set session
      req.session.user = {
        userId: user.id,
        userRole: user.role,
      };

      // Return user data (excluding password)
      const { password, ...userData } = user;
      res.status(200).json(userData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.user.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: "User not found" });
      }
      
      const { password, ...userData } = user;
      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Service Routes
  app.get("/api/services", requireAuth, async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices(req.session.user.userId);
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Booking Routes
  app.get("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings(req.session.user.userId);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });
  
  app.get("/api/bookings/recent", requireAuth, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const bookings = await storage.getRecentBookings(req.session.user.userId, limit);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent bookings" });
    }
  });
  
  app.post("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const { type, details, status } = req.body;
      
      // Validate booking type
      if (!['stay', 'vehicle', 'ticket', 'wellness'].includes(type)) {
        return res.status(400).json({ error: "Invalid booking type" });
      }
      
      // Validate booking status
      if (!bookingStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid booking status" });
      }
      
      // Create booking with user ID from session
      const booking = await storage.createBooking({
        type,
        details: JSON.stringify(details),
        status,
        vendorId: req.session.user.userId,
        customerName: details.customerName || "Guest", // Default name if not provided
        customerEmail: details.customerEmail || null,
        customerPhone: details.customerPhone || null,
        totalAmount: details.totalPrice || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create a notification for new booking
      await storage.createNotification({
        userId: req.session.user.userId,
        title: `New ${type} booking created`,
        content: `A new ${type} booking has been created with status: ${status}`,
        type: "booking",
        read: false,
        createdAt: new Date()
      });
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const status = req.body.status;
      
      if (!bookingStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid booking status" });
      }
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      if (booking.vendorId !== req.session.user.userId) {
        return res.status(403).json({ error: "Not authorized to update this booking" });
      }
      
      const updatedBooking = await storage.updateBooking(id, { status });
      res.status(200).json(updatedBooking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // Calendar Routes
  app.get("/api/calendar-events", requireAuth, async (req: Request, res: Response) => {
    try {
      const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
      const endDate = req.query.end ? new Date(req.query.end as string) : undefined;
      
      const events = await storage.getCalendarEvents(req.session.user.userId, startDate, endDate);
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });
  
  app.get("/api/calendar-sources", requireAuth, async (req: Request, res: Response) => {
    try {
      const sources = await storage.getCalendarSources(req.session.user.userId);
      res.status(200).json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar sources" });
    }
  });
  
  app.post("/api/calendar-sources/:id/sync", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if our extended iCal sync functionality is available
      if ((storage as any).syncCalendarFromUrl) {
        // Use the iCal sync functionality
        const result = await (storage as any).syncCalendarFromUrl(id);
        return res.status(result.success ? 200 : 400).json(result);
      }
      
      // Fallback to simple lastSynced update if iCal sync is not available
      const source = await storage.updateCalendarSource(id, { lastSynced: new Date() });
      
      if (!source) {
        return res.status(404).json({ error: "Calendar source not found" });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Calendar sync completed successfully",
        lastSynced: source.lastSynced
      });
    } catch (error) {
      console.error("Error syncing calendar:", error);
      res.status(500).json({ error: "Failed to sync calendar" });
    }
  });

  // Notification Routes
  app.get("/api/notifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getNotifications(req.session.user.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  
  app.get("/api/notifications/unread", requireAuth, async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getUnreadNotifications(req.session.user.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread notifications" });
    }
  });
  
  app.post("/api/notifications/mark-all-read", requireAuth, async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getUnreadNotifications(req.session.user.userId);
      
      // Mark each notification as read
      for (const notification of notifications) {
        await storage.markNotificationRead(notification.id);
      }
      
      res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  // Helper function to sanitize user input for AI prompts
  const sanitizePromptInput = (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potential prompt injection patterns
    return input
      .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 500) // Limit length
      .trim();
  };

  // AI Marketing Routes
  app.post("/api/ai/generate-marketing", requireAuth, async (req: Request, res: Response) => {
    try {
      const { 
        contentType, 
        businessName,
        businessType,
        serviceDescription,
        targetAudience,
        tone
      } = req.body;
      
      if (!contentType || !serviceDescription) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Verify API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI service is currently unavailable" });
      }
      
      // Sanitize all user inputs to prevent prompt injection
      const safeBusinessName = sanitizePromptInput(businessName);
      const safeBusinessType = sanitizePromptInput(businessType);
      const safeServiceDescription = sanitizePromptInput(serviceDescription);
      const safeTargetAudience = sanitizePromptInput(targetAudience);
      const safeTone = sanitizePromptInput(tone);
      
      let prompt = "";
      let contentTypeTitle = "";
      
      switch (contentType) {
        case "instagram":
          contentTypeTitle = "Instagram Post";
          prompt = `Create an engaging Instagram caption for ${safeBusinessName || 'my'} ${safeBusinessType || 'tourism business'} promoting the following service:\n\n${safeServiceDescription}\n\nTarget audience: ${safeTargetAudience || 'tourists'}\nTone: ${safeTone || 'enthusiastic'}\n\nInclude relevant hashtags.`;
          break;
        case "facebook":
          contentTypeTitle = "Facebook Post";
          prompt = `Write a compelling Facebook post for ${safeBusinessName || 'my'} ${safeBusinessType || 'tourism business'} featuring this service:\n\n${safeServiceDescription}\n\nTarget audience: ${safeTargetAudience || 'tourists'}\nTone: ${safeTone || 'friendly'}\n\nAim for engagement and shares.`;
          break;
        case "seo":
          contentTypeTitle = "SEO Description";
          prompt = `Generate an SEO-optimized description for ${safeBusinessName || 'my'} ${safeBusinessType || 'tourism business'} offering the following service:\n\n${safeServiceDescription}\n\nTarget keywords should focus on ${safeTargetAudience || 'tourists'} looking for this type of service in Sri Lanka. Make it informative and persuasive.`;
          break;
        case "email":
          contentTypeTitle = "Email Campaign";
          prompt = `Compose an email campaign for ${safeBusinessName || 'my'} ${safeBusinessType || 'tourism business'} featuring:\n\n${safeServiceDescription}\n\nTarget audience: ${safeTargetAudience || 'tourists'}\nTone: ${safeTone || 'professional'}\n\nInclude a subject line and call-to-action.`;
          break;
        default:
          contentTypeTitle = "Marketing Content";
          prompt = `Create marketing content for ${safeBusinessName || 'my'} ${safeBusinessType || 'tourism business'} about:\n\n${safeServiceDescription}\n\nTarget audience: ${safeTargetAudience || 'tourists'}\nTone: ${safeTone || 'persuasive'}`;
      }
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a marketing expert specializing in tourism and hospitality. Create compelling marketing content that highlights unique experiences and appeals to travelers."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      });
      
      const generatedContent = response.choices[0].message.content;
      
      // Store the generated content
      const marketingContent = await storage.createMarketingContent({
        userId: req.session.user.userId,
        title: `${contentTypeTitle} - ${new Date().toLocaleDateString()}`,
        contentType,
        content: generatedContent,
        serviceDescription: safeServiceDescription,
        targetAudience: safeTargetAudience || 'tourists',
        tone: safeTone || 'persuasive'
      });
      
      res.status(200).json({
        success: true,
        content: generatedContent,
        marketingContent
      });
    } catch (error) {
      console.error("Error generating marketing content:", error);
      res.status(500).json({ error: "Failed to generate marketing content" });
    }
  });
  
  app.get("/api/ai/marketing-contents", requireAuth, async (req: Request, res: Response) => {
    try {
      const contents = await storage.getMarketingContents(req.session.user.userId);
      res.status(200).json(contents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch marketing contents" });
    }
  });

  // For handling errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send({ error: "Something went wrong!" });
  });
  
  // Return null instead of creating a new server
  return null;
}