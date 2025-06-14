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
  // Enhanced middleware to check if user is authenticated with logging
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      console.log(`🔒 Unauthorized access attempt to ${req.path} from IP: ${req.ip}`);
      return res.status(401).json({ error: "Not authenticated" });
    }
    console.log(`✅ Authenticated request to ${req.path} by user ${req.session.user.userId} (${req.session.user.userRole})`);
    next();
  };

  // Role-based access control middleware
  const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: Function) => {
      if (!req.session.user) {
        console.log(`🔒 Unauthenticated role check attempt on ${req.path}`);
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (!allowedRoles.includes(req.session.user.userRole)) {
        console.log(`🚫 Role violation: ${req.session.user.userRole} tried to access ${req.path} (requires: ${allowedRoles.join('|')})`);
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      console.log(`✅ Role authorized: ${req.session.user.userRole} accessing ${req.path}`);
      next();
    };
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

  // Vendor Registration Route (new dedicated endpoint)
  app.post("/api/vendors/register", async (req: Request, res: Response) => {
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
      
      // Create the vendor with pending status
      const newVendor = await storage.createUser({
        ...userData,
        role: 'vendor',
        status: 'pending' // Pending admin approval
      });
      
      // Create welcome notification for admin review
      await storage.createNotification({
        userId: 1, // Admin user ID
        title: "New Vendor Application",
        message: `New vendor application from ${newVendor.businessName} (${newVendor.email}) awaiting approval.`,
        type: "info",
        read: false
      });
      
      // Return success without logging in (awaiting approval)
      res.status(201).json({
        message: "Vendor application submitted successfully. You will be notified once approved.",
        status: "pending"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Vendor registration error:", error);
      res.status(500).json({ error: "Failed to submit vendor application" });
    }
  });

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
      
      let prompt = "";
      let contentTypeTitle = "";
      
      switch (contentType) {
        case "instagram":
          contentTypeTitle = "Instagram Post";
          prompt = `Create an engaging Instagram caption for ${businessName || 'my'} ${businessType || 'tourism business'} promoting the following service:\n\n${serviceDescription}\n\nTarget audience: ${targetAudience || 'tourists'}\nTone: ${tone || 'enthusiastic'}\n\nInclude relevant hashtags.`;
          break;
        case "facebook":
          contentTypeTitle = "Facebook Post";
          prompt = `Write a compelling Facebook post for ${businessName || 'my'} ${businessType || 'tourism business'} featuring this service:\n\n${serviceDescription}\n\nTarget audience: ${targetAudience || 'tourists'}\nTone: ${tone || 'friendly'}\n\nAim for engagement and shares.`;
          break;
        case "seo":
          contentTypeTitle = "SEO Description";
          prompt = `Generate an SEO-optimized description for ${businessName || 'my'} ${businessType || 'tourism business'} offering the following service:\n\n${serviceDescription}\n\nTarget keywords should focus on ${targetAudience || 'tourists'} looking for this type of service in Sri Lanka. Make it informative and persuasive.`;
          break;
        case "email":
          contentTypeTitle = "Email Campaign";
          prompt = `Compose an email campaign for ${businessName || 'my'} ${businessType || 'tourism business'} featuring:\n\n${serviceDescription}\n\nTarget audience: ${targetAudience || 'tourists'}\nTone: ${tone || 'professional'}\n\nInclude a subject line and call-to-action.`;
          break;
        default:
          contentTypeTitle = "Marketing Content";
          prompt = `Create marketing content for ${businessName || 'my'} ${businessType || 'tourism business'} about:\n\n${serviceDescription}\n\nTarget audience: ${targetAudience || 'tourists'}\nTone: ${tone || 'persuasive'}`;
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
        serviceDescription,
        targetAudience: targetAudience || 'tourists',
        tone: tone || 'persuasive'
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

  // AI-Enhanced Booking Optimization
  app.post("/api/ai/optimize-booking", requireAuth, async (req: Request, res: Response) => {
    try {
      const { serviceType, checkIn, checkOut, guests, budget, preferences } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI optimization not available" });
      }

      const allServices = await storage.getServices(0); // Get all services for comparison
      const availableServices = allServices.filter(service => 
        service.type.toLowerCase() === serviceType.toLowerCase()
      );

      if (availableServices.length === 0) {
        return res.json({ 
          recommendations: [], 
          strategy: "No services available for this category",
          totalOptions: 0 
        });
      }

      const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

      const prompt = `As a Sri Lankan tourism expert, analyze these accommodation options for optimal booking recommendations:

BOOKING REQUIREMENTS:
- Service Type: ${serviceType}
- Check-in: ${checkIn}
- Check-out: ${checkOut} (${nights} nights)
- Guests: ${guests}
- Budget: ${budget ? `$${budget}` : 'Flexible'}
- Preferences: ${preferences?.join(', ') || 'None specified'}

AVAILABLE OPTIONS:
${availableServices.map((service, idx) => `
${idx + 1}. ${service.title}
   - Price: $${service.price}/night (Total: $${service.price * nights * guests})
   - Type: ${service.type}
   - Description: ${service.description}
   - Service ID: ${service.id}
`).join('')}

ANALYSIS REQUIRED:
1. Rank top 3 best matches considering value, suitability, and guest preferences
2. Provide detailed reasoning for each recommendation
3. Suggest booking strategy and tips
4. Identify any seasonal considerations or special opportunities

Respond in JSON format:
{
  "recommendations": [
    {
      "serviceId": number,
      "rank": 1,
      "matchScore": "percentage match to requirements",
      "valueRating": "excellent/good/fair/poor",
      "reasoning": "detailed explanation of why this is recommended",
      "highlights": ["key selling points"],
      "considerations": ["important notes or limitations"]
    }
  ],
  "strategy": "overall booking strategy and timing advice",
  "marketInsights": "current market conditions and trends",
  "alternatives": "suggestion for alternative dates or options if beneficial"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional Sri Lankan tourism consultant with deep knowledge of local accommodations, seasonal patterns, and booking optimization strategies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500
      });

      const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Enrich recommendations with calculated pricing and service details
      const enrichedRecommendations = aiResponse.recommendations?.map((rec: any) => {
        const service = availableServices.find(s => s.id === rec.serviceId);
        return {
          ...rec,
          service,
          calculatedPrice: service.price * nights * guests,
          pricePerNight: service.price,
          totalNights: nights,
          savings: budget ? Math.max(0, budget - (service.price * nights * guests)) : 0
        };
      }) || [];

      res.json({
        recommendations: enrichedRecommendations,
        strategy: aiResponse.strategy,
        marketInsights: aiResponse.marketInsights,
        alternatives: aiResponse.alternatives,
        totalOptions: availableServices.length,
        searchCriteria: { serviceType, checkIn, checkOut, guests, budget }
      });

    } catch (error) {
      console.error("AI booking optimization error:", error);
      res.status(500).json({ error: "Failed to optimize booking recommendations" });
    }
  });

  // AI Vendor Performance Analytics
  app.post("/api/ai/vendor-analytics", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.userId;
      const { analysisType = 'comprehensive', period = 'monthly' } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI analytics not available" });
      }

      const [bookings, services, user] = await Promise.all([
        storage.getBookings(userId),
        storage.getServices(userId),
        storage.getUser(userId)
      ]);

      const recentBookings = bookings.slice(0, 50); // Last 50 bookings for analysis
      
      const prompt = `Analyze this Sri Lankan tourism vendor's business performance:

VENDOR PROFILE:
- Business: ${user?.businessName || 'Tourism Vendor'}
- Location: ${user?.location || 'Sri Lanka'}
- Services Offered: ${services.length} active listings

SERVICE PORTFOLIO:
${services.map(s => `- ${s.title} (${s.type}): $${s.price}/night - ${s.description.substring(0, 100)}...`).join('\n')}

BOOKING PERFORMANCE (Last ${recentBookings.length} bookings):
${recentBookings.map(b => `- ${b.serviceType}: ${b.checkIn} → ${b.checkOut}, ${b.guests} guests, ${b.status.toUpperCase()}, $${b.totalPrice || 'N/A'}`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Performance trends and patterns
2. Revenue optimization opportunities  
3. Service portfolio analysis
4. Market positioning assessment
5. Operational efficiency recommendations
6. Growth strategy suggestions

Provide comprehensive business insights in JSON:
{
  "performanceMetrics": {
    "bookingTrends": "detailed trend analysis",
    "revenuePatterns": "revenue insights and seasonality",
    "servicePerformance": "which services perform best",
    "customerBehavior": "booking patterns and preferences",
    "occupancyRate": "estimated occupancy analysis"
  },
  "businessHealth": {
    "strengths": ["list of business strengths"],
    "weaknesses": ["areas needing improvement"],
    "opportunities": ["market opportunities"],
    "threats": ["potential challenges"]
  },
  "recommendations": {
    "pricing": "specific pricing strategy advice",
    "marketing": "targeted marketing recommendations",
    "operations": "operational improvements",
    "serviceOptimization": "service portfolio recommendations",
    "customerExperience": "experience enhancement suggestions"
  },
  "actionPlan": {
    "immediate": ["actions to take within 1 week"],
    "shortTerm": ["actions for next 1-3 months"],
    "longTerm": ["strategic 6-12 month goals"]
  },
  "competitiveInsights": "market positioning and competitor analysis",
  "riskAlerts": ["urgent issues requiring attention"]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a senior business consultant specializing in Sri Lankan tourism industry with expertise in revenue optimization, market analysis, and operational efficiency."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2000
      });

      const analytics = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Add calculated metrics
      const totalRevenue = recentBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      
      const averageBookingValue = recentBookings.length > 0 
        ? totalRevenue / recentBookings.filter(b => b.status === 'confirmed').length 
        : 0;

      res.json({
        ...analytics,
        calculatedMetrics: {
          totalRevenue,
          averageBookingValue: Math.round(averageBookingValue),
          totalBookings: recentBookings.length,
          confirmedBookings: recentBookings.filter(b => b.status === 'confirmed').length,
          conversionRate: recentBookings.length > 0 
            ? Math.round((recentBookings.filter(b => b.status === 'confirmed').length / recentBookings.length) * 100)
            : 0
        },
        analysisDate: new Date().toISOString(),
        period
      });

    } catch (error) {
      console.error("AI vendor analytics error:", error);
      res.status(500).json({ error: "Failed to generate vendor analytics" });
    }
  });

  // AI Customer Feedback Analysis
  app.post("/api/ai/analyze-feedback", requireAuth, async (req: Request, res: Response) => {
    try {
      const { feedback, bookingId, customerName, serviceType } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI feedback analysis not available" });
      }

      if (!feedback) {
        return res.status(400).json({ error: "Feedback text is required" });
      }

      const prompt = `Analyze this customer feedback from a Sri Lankan tourism booking:

BOOKING CONTEXT:
- Service Type: ${serviceType || 'Not specified'}
- Customer: ${customerName || 'Anonymous'}
- Booking ID: ${bookingId || 'Unknown'}

CUSTOMER FEEDBACK:
"${feedback}"

ANALYSIS REQUIREMENTS:
1. Sentiment analysis (positive/negative/neutral with confidence score)
2. Category classification for tourism industry
3. Priority level assessment  
4. Specific actionable insights
5. Professional response recommendation
6. Business improvement suggestions

Provide detailed analysis in JSON:
{
  "sentiment": {
    "classification": "positive/negative/neutral",
    "confidence": "percentage confidence in classification",
    "emotionalTone": "description of emotional tone",
    "intensity": "low/medium/high"
  },
  "categorization": {
    "primaryCategory": "accommodation/service/location/value/cleanliness/staff/amenities/transport/food/other",
    "secondaryCategories": ["additional relevant categories"],
    "specificAspects": ["detailed aspects mentioned"]
  },
  "businessImpact": {
    "priority": "low/medium/high/urgent",
    "actionRequired": true/false,
    "potentialImpact": "description of business impact",
    "reputationRisk": "low/medium/high"
  },
  "insights": {
    "keyPoints": ["main points from feedback"],
    "customerExpectations": "what customer expected vs received",
    "satisfactionDrivers": ["factors that influenced satisfaction"],
    "improvementAreas": ["specific areas for improvement"]
  },
  "recommendations": {
    "immediateActions": ["urgent actions to take"],
    "responseStrategy": "how to respond to customer",
    "operationalChanges": ["process improvements to implement"],
    "preventiveMeasures": ["how to prevent similar issues"]
  },
  "responseTemplate": {
    "tone": "professional tone recommendation",
    "content": "suggested response to customer",
    "followUpActions": ["post-response actions needed"]
  },
  "businessIntelligence": {
    "trendsIndicators": ["what this feedback suggests about trends"],
    "competitiveInsights": ["insights about market expectations"],
    "serviceGaps": ["identified service gaps"]
  }
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a customer experience analyst specializing in Sri Lankan tourism with expertise in sentiment analysis, service quality assessment, and reputation management."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Log the analysis for tracking (you might want to store this in your database)
      console.log(`Feedback analysis completed for booking ${bookingId}:`, {
        sentiment: analysis.sentiment?.classification,
        priority: analysis.businessImpact?.priority,
        category: analysis.categorization?.primaryCategory
      });

      res.json({
        ...analysis,
        metadata: {
          analyzedAt: new Date().toISOString(),
          bookingId,
          customerName,
          serviceType,
          feedbackLength: feedback.length
        }
      });

    } catch (error) {
      console.error("AI feedback analysis error:", error);
      res.status(500).json({ error: "Failed to analyze customer feedback" });
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