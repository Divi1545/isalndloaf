import { Request, Response, NextFunction, Express } from "express";
import { Server } from "http";
import { z } from "zod";
import path from "path";
import { storage } from "./storage";
import { bookingStatuses, loginSchema, insertUserSchema } from "@shared/schema";
import OpenAI from "openai";
import vendorAuthRouter from "./vendor-auth";

interface SessionData {
  userId: number;
  userRole: string;
}

declare module "express-session" {
  interface SessionData {
    user: SessionData;
  }
}

// Initialize OpenAI (optional for development)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function registerRoutes(app: Express): Promise<void> {
  // Enhanced vendor authentication routes
  app.use("/api/vendor", vendorAuthRouter);

  // Session-based authentication endpoints
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      // For admin login
      if (email === 'admin@islandloaf.com' && password === 'admin123') {
        const adminUser = {
          id: 1,
          username: "admin",
          email: "admin@islandloaf.com",
          fullName: "Admin User",
          businessName: "IslandLoaf Admin",
          businessType: "administration",
          role: "admin"
        };
        
        req.session.user = {
          userId: adminUser.id,
          userRole: adminUser.role
        };
        
        return res.json({ 
          success: true, 
          user: adminUser,
          message: "Admin login successful" 
        });
      }
      
      // For vendor login - check database or create demo vendor
      let user = await storage.getUserByEmail(email);
      
      // Create demo vendor if it doesn't exist
      if (!user && email === 'vendor@islandloaf.com' && password === 'password123') {
        user = await storage.createUser({
          username: "vendor",
          email: "vendor@islandloaf.com",
          password: "password123",
          fullName: "Demo Vendor",
          businessName: "Beach Paradise Villa",
          businessType: "accommodation",
          role: "vendor",
          categoriesAllowed: ["stays", "tours"]
        });
      }
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      req.session.user = {
        userId: user.id,
        userRole: user.role
      };
      
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true, 
        user: userWithoutPassword,
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/me", (req: Request, res: Response) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Return user data based on session
    if (req.session.user.userRole === 'admin') {
      return res.json({
        id: 1,
        username: "admin",
        email: "admin@islandloaf.com",
        fullName: "Admin User",
        businessName: "IslandLoaf Admin",
        businessType: "administration",
        role: "admin"
      });
    }
    
    // For vendor users, fetch from database
    storage.getUser(req.session.user.userId).then(user => {
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(401).json({ error: "User not found" });
      }
    }).catch(error => {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

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

  // Sample users are already created in the MemStorage constructor

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
        role: 'vendor'
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

  // Vendor Management Routes - for admin users
  app.get("/api/vendors", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const vendors = await storage.getUsers();
      const vendorUsers = vendors.filter(user => user.role !== 'admin');
      res.status(200).json(vendorUsers);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.put("/api/vendors/:id", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      const updates = req.body;
      
      // Don't allow updating the admin user
      if (vendorId === 1) {
        return res.status(403).json({ error: "Cannot modify admin user" });
      }
      
      const updatedVendor = await storage.updateUser(vendorId, updates);
      if (!updatedVendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      
      res.status(200).json(updatedVendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });

  app.delete("/api/vendors/:id", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const vendorId = parseInt(req.params.id);
      
      // Don't allow deleting the admin user
      if (vendorId === 1) {
        return res.status(403).json({ error: "Cannot delete admin user" });
      }
      
      const success = await storage.deleteUser(vendorId);
      if (!success) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      
      res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ error: "Failed to delete vendor" });
    }
  });

  app.post("/api/vendors", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const { username, email, password, fullName, businessName, businessType, categoriesAllowed } = req.body;
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Create the vendor
      const newVendor = await storage.createUser({
        username,
        email,
        password,
        fullName,
        businessName,
        businessType,
        role: 'vendor',
        categoriesAllowed: categoriesAllowed || []
      });
      
      // Create notification for new vendor
      await storage.createNotification({
        userId: newVendor.id,
        title: "Welcome to IslandLoaf",
        message: `Welcome to IslandLoaf, ${newVendor.fullName}! Your vendor account has been created successfully.`,
        type: "info",
        read: false
      });
      
      // Return vendor data (excluding password)
      const { password: _, ...vendorData } = newVendor;
      res.status(201).json(vendorData);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });

  // Dashboard Statistics API
  app.get("/api/dashboard/stats", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      
      // Calculate statistics
      const totalVendors = users.filter(u => u.role !== 'admin').length;
      const activeVendors = users.filter(u => u.role === 'vendor').length;
      const pendingVendors = users.filter(u => u.role === 'pending').length;
      const inactiveVendors = users.filter(u => u.role === 'inactive').length;
      
      // Get all bookings from database
      const allBookings = await Promise.all(
        users.map(async (u) => {
          const userBookings = await storage.getBookings(u.id);
          return userBookings.map(booking => ({
            ...booking,
            vendorName: u.businessName || u.fullName,
            vendorType: u.businessType
          }));
        })
      );
      const bookings = allBookings.flat();
      
      // Calculate real booking statistics
      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      
      // Calculate revenue from all bookings (consistent with revenue analytics)
      const totalRevenue = bookings
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      
      // Calculate monthly revenue from real bookings
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = Array.from({length: 12}, (_, i) => {
        const month = i + 1;
        const revenue = bookings
          .filter(b => {
            const bookingDate = new Date(b.createdAt);
            return bookingDate.getFullYear() === currentYear && 
                   bookingDate.getMonth() === i;
          })
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        
        return {
          month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
          revenue
        };
      });
      
      // Get recent bookings
      const recentBookings = bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      res.json({
        totalVendors,
        activeVendors,
        pendingVendors,
        inactiveVendors,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        monthlyRevenue,
        recentBookings,
        vendorStats: users.filter(u => u.role !== 'admin').map(u => ({
          id: u.id,
          name: u.businessName || u.fullName,
          businessType: u.businessType,
          role: u.role,
          bookingCount: bookings.filter(b => b.userId === u.id).length
        }))
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Get booking analytics
  app.get("/api/dashboard/booking-analytics", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      
      // Business type distribution from actual users
      const businessTypes = users.filter(u => u.role !== 'admin').reduce((acc, user) => {
        acc[user.businessType] = (acc[user.businessType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Demo booking status distribution  
      const statusDistribution = {
        'confirmed': 1,
        'pending': 1,
        'completed': 2,
        'cancelled': 1
      };
      
      // Top performing vendors (demo data with actual vendor names)
      const activeVendors = users.filter(u => u.role === 'vendor').slice(0, 5);
      const topVendors = activeVendors.map((vendor, index) => ({
        name: vendor.businessName || vendor.fullName,
        bookings: Math.floor(Math.random() * 10) + 1 // Random demo bookings
      })).sort((a, b) => b.bookings - a.bookings);
      
      res.json({
        businessTypes,
        statusDistribution,
        topVendors
      });
    } catch (error) {
      console.error("Error fetching booking analytics:", error);
      res.status(500).json({ error: "Failed to fetch booking analytics" });
    }
  });

  // Revenue analytics endpoint
  app.get("/api/revenue/analytics", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const user = req.session.user;
      
      // Get all bookings for revenue calculations (admin can see all bookings)
      const users = await storage.getUsers();
      const allBookings = await Promise.all(
        users.map(async (u) => {
          const userBookings = await storage.getBookings(u.id);
          return userBookings;
        })
      );
      const bookings = allBookings.flat();
      
      // Calculate total revenue
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const totalCommission = bookings.reduce((sum, booking) => sum + booking.commission, 0);
      
      // Calculate revenue by category
      const userBusinessTypes = users.reduce((acc, user) => {
        acc[user.id] = user.businessType || 'other';
        return acc;
      }, {} as Record<number, string>);
      
      const revenueByCategory = bookings.reduce((acc, booking) => {
        const businessType = userBusinessTypes[booking.userId] || 'other';
        if (!acc[businessType]) {
          acc[businessType] = { revenue: 0, count: 0 };
        }
        acc[businessType].revenue += booking.totalPrice;
        acc[businessType].count += 1;
        return acc;
      }, {} as Record<string, { revenue: number; count: number }>);

      // Get top earning vendors
      const vendorRevenue = bookings.reduce((acc, booking) => {
        const vendor = users.find(u => u.id === booking.userId);
        if (vendor) {
          if (!acc[vendor.id]) {
            acc[vendor.id] = {
              id: vendor.id,
              name: vendor.businessName || vendor.fullName || vendor.username,
              businessType: vendor.businessType || 'other',
              revenue: 0,
              bookingCount: 0
            };
          }
          acc[vendor.id].revenue += booking.totalPrice;
          acc[vendor.id].bookingCount += 1;
        }
        return acc;
      }, {} as Record<number, any>);

      const topVendors = Object.values(vendorRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate monthly revenue trends
      const monthlyRevenue = bookings.reduce((acc, booking) => {
        const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += booking.totalPrice;
        return acc;
      }, {} as Record<string, number>);

      const monthlyTrends = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue
      }));

      // Calculate status-based metrics
      const statusMetrics = bookings.reduce((acc, booking) => {
        if (!acc[booking.status]) {
          acc[booking.status] = { count: 0, revenue: 0 };
        }
        acc[booking.status].count += 1;
        acc[booking.status].revenue += booking.totalPrice;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

      // Calculate pending payouts (completed bookings)
      const pendingPayouts = bookings
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + (booking.totalPrice - booking.commission), 0);

      return res.json({
        totalRevenue,
        totalCommission,
        pendingPayouts,
        revenueByCategory,
        topVendors,
        monthlyTrends,
        statusMetrics,
        totalBookings: bookings.length
      });
    } catch (error) {
      console.error("Failed to fetch revenue analytics:", error);
      return res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  // Process vendor payouts
  app.post("/api/revenue/process-payouts", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const { vendorIds } = req.body;
      
      if (!vendorIds || !Array.isArray(vendorIds)) {
        return res.status(400).json({ error: "Invalid vendor IDs" });
      }

      // Get all bookings for the specified vendors
      const bookings = await storage.getBookings(0); // Get all bookings (admin access)
      
      // Calculate payouts for each vendor
      const processedPayouts = [];
      
      for (const vendorId of vendorIds) {
        const vendorBookings = bookings.filter(booking => 
          booking.userId === vendorId && booking.status === 'completed'
        );
        
        if (vendorBookings.length === 0) {
          continue;
        }
        
        const totalAmount = vendorBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
        const totalCommission = vendorBookings.reduce((sum, booking) => sum + (booking.commission || booking.totalPrice * 0.1), 0);
        const payoutAmount = totalAmount - totalCommission;
        
        processedPayouts.push({
          vendorId,
          amount: payoutAmount,
          bookingCount: vendorBookings.length,
          status: 'processed',
          processedAt: new Date()
        });
        
        // Create notification for the vendor
        try {
          await storage.createNotification({
            userId: vendorId,
            title: "Payout Processed",
            message: `Your payout of $${payoutAmount.toFixed(2)} for ${vendorBookings.length} bookings has been processed successfully.`,
            type: "success",
            read: false
          });
        } catch (notificationError) {
          console.error(`Failed to create notification for vendor ${vendorId}:`, notificationError);
        }
      }

      res.json({ 
        success: true, 
        message: `Processed ${processedPayouts.length} payouts successfully`,
        payouts: processedPayouts 
      });
    } catch (error) {
      console.error("Failed to process payouts:", error);
      return res.status(500).json({ error: "Failed to process payouts" });
    }
  });

  // Update commission rates
  app.post("/api/revenue/update-commission", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const { rates } = req.body;
      
      if (!rates || typeof rates !== 'object') {
        return res.status(400).json({ error: "Invalid commission rates" });
      }

      // In a real implementation, this would:
      // 1. Validate the rates
      // 2. Update the commission settings in the database
      // 3. Apply to new bookings
      // 4. Log the changes for audit
      
      // For now, we'll just return success
      res.json({ 
        success: true, 
        message: "Commission rates updated successfully",
        rates: rates 
      });
    } catch (error) {
      console.error("Failed to update commission rates:", error);
      return res.status(500).json({ error: "Failed to update commission rates" });
    }
  });

  // Export revenue report
  app.get("/api/revenue/export", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const { format = 'csv', timeframe = 'thisMonth' } = req.query;
      
      // Get all bookings and users for the report
      const users = await storage.getUsers();
      const allBookings = await Promise.all(
        users.map(async (u) => {
          const userBookings = await storage.getBookings(u.id);
          return userBookings.map(booking => ({
            ...booking,
            vendorName: u.businessName || u.fullName,
            vendorType: u.businessType
          }));
        })
      );
      const bookings = allBookings.flat();

      if (format === 'csv') {
        // Generate CSV content
        const csvHeaders = [
          'Date',
          'Vendor Name',
          'Business Type',
          'Customer Name',
          'Service Type',
          'Total Price',
          'Commission',
          'Status'
        ];
        
        const csvRows = bookings.map(booking => [
          new Date(booking.createdAt).toLocaleDateString(),
          booking.vendorName,
          booking.vendorType,
          booking.customerName,
          booking.serviceType,
          booking.totalPrice.toFixed(2),
          booking.commission.toFixed(2),
          booking.status
        ]);
        
        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.join(','))
          .join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${timeframe}.csv`);
        res.send(csvContent);
      } else {
        // Return JSON format
        res.json({
          timeframe,
          generatedAt: new Date(),
          totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
          totalCommission: bookings.reduce((sum, b) => sum + b.commission, 0),
          bookings: bookings
        });
      }
    } catch (error) {
      console.error("Failed to export revenue report:", error);
      return res.status(500).json({ error: "Failed to export revenue report" });
    }
  });

  // Settings API Endpoints
  
  // Get system settings
  app.get("/api/settings", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      // Return default settings (in a real implementation, this would be stored in the database)
      const settings = {
        platformName: "IslandLoaf",
        adminEmail: "admin@islandloaf.com",
        supportEmail: "support@islandloaf.com",
        enableRegistration: true,
        defaultCommissionRate: 10,
        maxVendorsPerCategory: 100,
        autoApproveVendors: false,
        maintenanceMode: false,
        allowGuestBookings: true,
        emailNotifications: true,
        smsNotifications: false,
        backupFrequency: "daily",
        updatedAt: new Date().toISOString()
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update system settings
  app.post("/api/settings/system", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const settings = req.body;
      
      // In a real implementation, this would update the database
      console.log("Updating system settings:", settings);
      
      res.json({
        success: true,
        message: "System settings updated successfully",
        settings: settings
      });
    } catch (error) {
      console.error("Failed to update system settings:", error);
      return res.status(500).json({ error: "Failed to update system settings" });
    }
  });

  // Update commission settings
  app.post("/api/settings/commission", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const { rates } = req.body;
      
      // In a real implementation, this would update the database
      console.log("Updating commission rates:", rates);
      
      res.json({
        success: true,
        message: "Commission rates updated successfully",
        rates: rates
      });
    } catch (error) {
      console.error("Failed to update commission settings:", error);
      return res.status(500).json({ error: "Failed to update commission settings" });
    }
  });

  // Update user role
  app.put("/api/settings/users/:id/role", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!['admin', 'vendor', 'pending', 'inactive'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      // Update user role in database
      const updatedUser = await storage.updateUser(userId, { role });
      
      res.json({
        success: true,
        message: "User role updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Failed to update user role:", error);
      return res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Get database statistics
  app.get("/api/settings/database/stats", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      const allBookings = await Promise.all(
        users.map(async (u) => {
          const userBookings = await storage.getBookings(u.id);
          return userBookings;
        })
      );
      const bookings = allBookings.flat();
      
      const stats = {
        totalUsers: users.length,
        totalBookings: bookings.length,
        activeVendors: users.filter(u => u.role === 'vendor').length,
        databaseSize: "~2.4MB" // Mock size
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch database stats:", error);
      return res.status(500).json({ error: "Failed to fetch database stats" });
    }
  });

  // Create database backup
  app.post("/api/settings/database/backup", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would create a database backup
      console.log("Creating database backup...");
      
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({
        success: true,
        message: "Database backup created successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to create database backup:", error);
      return res.status(500).json({ error: "Failed to create database backup" });
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
      req.session.user = newUser;

      // Return user data (excluding password)
      const { password, ...newUserData } = newUser;
      
      // Create welcome notification
      await storage.createNotification({
        userId: newUser.id,
        title: "Welcome to IslandLoaf",
        message: `Welcome to IslandLoaf, ${newUser.fullName}! Your account has been created successfully. Get started by adding your first service.`,
        type: "info",
        read: false
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
      req.session.user = user;

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
      const user = await storage.getUser(req.session.user.id);
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
      const services = await storage.getServices(req.session.user.id);
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.put("/api/services/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      const { basePrice } = req.body;
      
      if (!basePrice || isNaN(basePrice) || basePrice < 0) {
        return res.status(400).json({ error: "Valid base price is required" });
      }
      
      const updatedService = await storage.updateService(serviceId, { basePrice });
      
      if (!updatedService) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  // Comprehensive Booking Management Routes
  
  // Get all bookings (admin) or user's bookings (vendor)
  app.get("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.session.user;
      let bookings;
      
      if (user.userRole === 'admin') {
        // Admin can see all bookings
        const users = await storage.getUsers();
        const allBookings = await Promise.all(
          users.map(async (u) => {
            const userBookings = await storage.getBookings(u.id);
            return userBookings.map(booking => ({
              ...booking,
              vendorName: u.businessName || u.fullName,
              vendorType: u.businessType
            }));
          })
        );
        bookings = allBookings.flat();
      } else {
        // Vendor can only see their own bookings
        bookings = await storage.getBookings(user.userId);
      }
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });
  
  // Get recent bookings
  app.get("/api/bookings/recent", requireAuth, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const bookings = await storage.getRecentBookings(req.session.user.id, limit);
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent bookings" });
    }
  });
  
  // Get a specific booking
  app.get("/api/bookings/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const user = req.session.user;
      
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Check if user can access this booking
      if (user.role !== 'admin' && booking.userId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });
  
  // Create a new booking
  app.post("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.session.user;
      const bookingData = req.body;
      
      // Debug logging
      console.log("=== BOOKING CREATION ===");
      console.log("User:", user.userId, "creating booking");
      
      // Handle both direct format and nested details format
      let processedData;
      if (bookingData.details) {
        // Form data comes with details nested structure
        processedData = {
          customerName: bookingData.details.customerName,
          customerEmail: bookingData.details.customerEmail,
          startDate: bookingData.details.checkInDate,
          endDate: bookingData.details.checkOutDate,
          totalPrice: bookingData.details.totalPrice,
          notes: bookingData.details.notes,
          status: bookingData.status || 'pending'
        };
      } else {
        // Direct format (from API or admin)
        processedData = {
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          totalPrice: bookingData.totalPrice,
          notes: bookingData.notes,
          status: bookingData.status || 'pending'
        };
      }
      
      console.log("Processed data:", JSON.stringify(processedData, null, 2));
      
      // Validate required fields
      if (!processedData.customerName || !processedData.customerEmail || !processedData.startDate || !processedData.endDate || !processedData.totalPrice) {
        console.log("Missing required fields validation failed:");
        console.log("customerName:", processedData.customerName);
        console.log("customerEmail:", processedData.customerEmail);
        console.log("startDate:", processedData.startDate);
        console.log("endDate:", processedData.endDate);
        console.log("totalPrice:", processedData.totalPrice);
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Validate dates
      const startDate = new Date(processedData.startDate);
      const endDate = new Date(processedData.endDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({ error: "End date must be after start date" });
      }
      
      if (startDate < new Date()) {
        return res.status(400).json({ error: "Start date cannot be in the past" });
      }
      
      // Get or create default service
      let serviceId = bookingData.serviceId;
      if (!serviceId) {
        // Create a default service if none exists
        const userServices = await storage.getServices(user.userId);
        if (userServices.length === 0) {
          const defaultService = await storage.createService({
            userId: user.userId,
            name: "Default Service",
            description: "Default service for bookings",
            type: "stays",
            basePrice: 0,
            available: true
          });
          serviceId = defaultService.id;
        } else {
          serviceId = userServices[0].id;
        }
      }

      // Create booking
      const newBooking = await storage.createBooking({
        userId: user.userId, // Use userId from session
        serviceId: serviceId,
        customerName: processedData.customerName,
        customerEmail: processedData.customerEmail,
        startDate: startDate,
        endDate: endDate,
        status: processedData.status || "pending",
        totalPrice: parseFloat(processedData.totalPrice),
        commission: parseFloat(processedData.commission) || parseFloat(processedData.totalPrice) * 0.1, // 10% default commission
        notes: processedData.notes || null
      });
      
      // Create notification - with error handling
      try {
        await storage.createNotification({
          userId: user.userId,
          title: "New booking created",
          message: `A new booking for ${processedData.customerName} has been created`,
          type: "info",
          read: false
        });
      } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
        // Continue without failing the entire booking creation
      }
      
      res.status(201).json(newBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });
  
  // Update a booking
  app.put("/api/bookings/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const user = req.session.user;
      const updateData = req.body;
      
      // Check if booking exists
      const existingBooking = await storage.getBooking(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Check permissions
      if (user.role !== 'admin' && existingBooking.userId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Process and validate dates if provided
      const processedUpdateData = { ...updateData };
      if (updateData.startDate) {
        processedUpdateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        processedUpdateData.endDate = new Date(updateData.endDate);
      }
      
      // Validate dates if both are provided
      if (processedUpdateData.startDate && processedUpdateData.endDate) {
        if (processedUpdateData.startDate >= processedUpdateData.endDate) {
          return res.status(400).json({ error: "End date must be after start date" });
        }
      }
      
      // Convert string numbers to actual numbers
      if (updateData.totalPrice) {
        processedUpdateData.totalPrice = parseFloat(updateData.totalPrice);
      }
      if (updateData.commission) {
        processedUpdateData.commission = parseFloat(updateData.commission);
      }
      
      // Update booking
      const updatedBooking = await storage.updateBooking(bookingId, processedUpdateData);
      
      if (!updatedBooking) {
        return res.status(500).json({ error: "Failed to update booking" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });
  
  // Delete a booking
  app.delete("/api/bookings/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const user = req.session.user;
      
      // Check if booking exists
      const existingBooking = await storage.getBooking(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Check permissions
      if (user.role !== 'admin' && existingBooking.userId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Delete booking
      const success = await storage.deleteBooking(bookingId);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete booking" });
      }
      
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });
  
  // Update booking (general PATCH endpoint)
  app.patch("/api/bookings/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const user = req.session.user;
      const updateData = req.body;
      
      // Check if booking exists
      const existingBooking = await storage.getBooking(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Check permissions
      if (user.role !== 'admin' && existingBooking.userId !== user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Validate status if provided
      if (updateData.status) {
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'refunded'];
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({ error: "Invalid status" });
        }
      }
      
      // Update booking
      const updatedBooking = await storage.updateBooking(bookingId, updateData);
      
      if (!updatedBooking) {
        return res.status(500).json({ error: "Failed to update booking" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const user = req.session.user;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      // Check if booking exists
      const existingBooking = await storage.getBooking(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Check permissions
      if (user.role !== 'admin' && existingBooking.userId !== user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update booking status
      const updatedBooking = await storage.updateBooking(bookingId, { status });
      
      if (!updatedBooking) {
        return res.status(500).json({ error: "Failed to update booking status" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // Calendar Routes
  app.get("/api/calendar-events", requireAuth, async (req: Request, res: Response) => {
    try {
      const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
      const endDate = req.query.end ? new Date(req.query.end as string) : undefined;
      
      const events = await storage.getCalendarEvents(req.session.user.id, startDate, endDate);
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });
  
  app.get("/api/calendar-sources", requireAuth, async (req: Request, res: Response) => {
    try {
      const sources = await storage.getCalendarSources(req.session.user.id);
      res.status(200).json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar sources" });
    }
  });
  
  app.post("/api/calendar-sources", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, url, type, serviceId } = req.body;
      
      if (!name || !url || !type) {
        return res.status(400).json({ error: "Name, URL, and type are required" });
      }
      
      const source = await storage.createCalendarSource({
        userId: req.session.user.id,
        name,
        url,
        type,
        serviceId: serviceId || null
      });
      
      res.status(201).json(source);
    } catch (error) {
      console.error("Error creating calendar source:", error);
      res.status(500).json({ error: "Failed to create calendar source" });
    }
  });
  
  app.delete("/api/calendar-sources/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCalendarSource(id);
      
      if (!success) {
        return res.status(404).json({ error: "Calendar source not found" });
      }
      
      res.status(200).json({ message: "Calendar source deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar source:", error);
      res.status(500).json({ error: "Failed to delete calendar source" });
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
      
      // Fallback to simple update if iCal sync is not available
      const source = await storage.updateCalendarSource(id, {});
      
      if (!source) {
        return res.status(404).json({ error: "Calendar source not found" });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Calendar sync completed successfully"
      });
    } catch (error) {
      console.error("Error syncing calendar:", error);
      res.status(500).json({ error: "Failed to sync calendar" });
    }
  });

  // Notification Routes
  app.get("/api/notifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getNotifications(req.session.user.id);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  
  app.get("/api/notifications/unread", requireAuth, async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getUnreadNotifications(req.session.user.id);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread notifications" });
    }
  });
  
  app.post("/api/notifications/mark-all-read", requireAuth, async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getUnreadNotifications(req.session.user.id);
      
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
      if (!openai) {
        return res.status(500).json({ error: "AI service is currently unavailable" });
      }
      
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
        userId: req.session.user.id,
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
      const contents = await storage.getMarketingContents(req.session.user.id);
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

      if (!openai) {
        return res.status(500).json({ error: "AI service is currently unavailable" });
      }
      
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
      const userId = req.session.user!.id;
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
- Location: Sri Lanka
- Services Offered: ${services.length} active listings

SERVICE PORTFOLIO:
${services.map(s => `- ${s.name} (${s.type}): $${s.basePrice}/night - ${s.description.substring(0, 100)}...`).join('\n')}

BOOKING PERFORMANCE (Last ${recentBookings.length} bookings):
${recentBookings.map(b => `- Service ${b.serviceId}: ${b.startDate.toISOString().split('T')[0]} → ${b.endDate.toISOString().split('T')[0]}, ${b.status.toUpperCase()}, $${b.totalPrice || 'N/A'}`).join('\n')}

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

      if (!openai) {
        return res.status(500).json({ error: "AI service is currently unavailable" });
      }
      
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

      if (!openai) {
        return res.status(500).json({ error: "AI service is currently unavailable" });
      }
      
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

  // AI Trip Concierge Service
  app.post("/api/ai/trip-concierge", requireAuth, async (req: Request, res: Response) => {
    try {
      const { arrivalDate, duration, interests, budget, location = "Sri Lanka" } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI concierge service not available" });
      }

      if (!arrivalDate || !duration || !interests || !budget) {
        return res.status(400).json({ error: "Missing required fields: arrivalDate, duration, interests, budget" });
      }

      // Get available services from our system
      const allServices = await storage.getServices(0);
      const accommodations = allServices.filter(s => s.type.toLowerCase() === 'accommodation');
      const tours = allServices.filter(s => s.type.toLowerCase() === 'tours');
      const transport = allServices.filter(s => s.type.toLowerCase() === 'transport');
      const wellness = allServices.filter(s => s.type.toLowerCase() === 'wellness');

      const conciergePrompt = `Create a detailed ${duration}-day Sri Lankan travel itinerary:

TRIP DETAILS:
- Arrival: ${arrivalDate}
- Duration: ${duration} days
- Interests: ${interests.join(', ')}
- Total Budget: $${budget}
- Location Focus: ${location}

AVAILABLE SERVICES:
Accommodations (${accommodations.length} options):
${accommodations.slice(0, 5).map(s => `- ${s.title}: $${s.price}/night - ${s.description.substring(0, 80)}...`).join('\n')}

Tours & Activities (${tours.length} options):
${tours.slice(0, 5).map(s => `- ${s.title}: $${s.price} - ${s.description.substring(0, 80)}...`).join('\n')}

Transport Options (${transport.length} available):
${transport.slice(0, 3).map(s => `- ${s.title}: $${s.price} - ${s.description.substring(0, 80)}...`).join('\n')}

Wellness Services (${wellness.length} available):
${wellness.slice(0, 3).map(s => `- ${s.title}: $${s.price} - ${s.description.substring(0, 80)}...`).join('\n')}

REQUIREMENTS:
1. Create day-by-day detailed itinerary
2. Include morning, afternoon, evening activities
3. Recommend specific accommodations from our list
4. Suggest transportation between locations
5. Estimate daily costs and keep within budget
6. Add cultural insights and local tips
7. Include weather considerations
8. Suggest authentic Sri Lankan experiences

Format as comprehensive JSON:
{
  "itinerary": {
    "days": [
      {
        "day": 1,
        "date": "calculated date",
        "location": "primary location",
        "morning": {"activity": "description", "cost": 0, "duration": "2 hours"},
        "afternoon": {"activity": "description", "cost": 0, "duration": "3 hours"},
        "evening": {"activity": "description", "cost": 0, "duration": "2 hours"},
        "accommodation": {"name": "from our list", "cost": 0},
        "meals": {"breakfast": 0, "lunch": 0, "dinner": 0},
        "transport": {"method": "description", "cost": 0},
        "dailyTotal": 0,
        "highlights": ["key experiences"],
        "tips": ["local insights"]
      }
    ]
  },
  "summary": {
    "totalEstimatedCost": 0,
    "accommodationCost": 0,
    "activitiesCost": 0,
    "transportCost": 0,
    "mealsCost": 0,
    "budgetRemaining": 0
  },
  "recommendations": {
    "bestAccommodations": ["top 3 from our services"],
    "mustDoActivities": ["essential experiences"],
    "culturalExperiences": ["authentic Sri Lankan experiences"],
    "foodRecommendations": ["local cuisine highlights"],
    "packingList": ["essential items to bring"]
  },
  "bookingStrategy": {
    "bestBookingTimes": "when to book each service",
    "seasonalConsiderations": "weather and crowd factors",
    "budgetOptimization": "money-saving tips",
    "flexibilityAdvice": "alternative options"
  }
}`;

      if (!openai) {
        return res.status(500).json({ error: "AI service is currently unavailable" });
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert Sri Lankan travel concierge with deep local knowledge. Create personalized, practical itineraries that showcase authentic experiences while respecting budget constraints. Use actual services from the provided list when possible."
          },
          {
            role: "user",
            content: conciergePrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 3000
      });

      const tripPlan = JSON.parse(completion.choices[0].message.content || '{}');

      // Add booking links for recommended services
      const bookingLinks = {
        accommodations: accommodations.slice(0, 3).map(s => ({
          id: s.id,
          name: s.title,
          price: s.price,
          bookingUrl: `/book/service/${s.id}`,
          description: s.description.substring(0, 100) + '...'
        })),
        tours: tours.slice(0, 5).map(s => ({
          id: s.id,
          name: s.title,
          price: s.price,
          bookingUrl: `/book/service/${s.id}`,
          description: s.description.substring(0, 100) + '...'
        })),
        transport: transport.slice(0, 3).map(s => ({
          id: s.id,
          name: s.title,
          price: s.price,
          bookingUrl: `/book/service/${s.id}`,
          description: s.description.substring(0, 100) + '...'
        }))
      };

      res.json({
        success: true,
        tripRequest: {
          arrivalDate,
          duration,
          interests,
          budget,
          location
        },
        itinerary: tripPlan.itinerary,
        summary: tripPlan.summary,
        recommendations: tripPlan.recommendations,
        bookingStrategy: tripPlan.bookingStrategy,
        bookingLinks,
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Valid for 7 days
      });

    } catch (error) {
      console.error("AI trip concierge error:", error);
      res.status(500).json({ error: "Failed to generate travel itinerary" });
    }
  });

  // AI Agent Executor System
  app.post("/api/ai/agent-executor", requireAuth, async (req: Request, res: Response) => {
    try {
      const { agent, action, data } = req.body;
      const userId = req.session.user!.id;
      
      if (!agent || !action || !data) {
        return res.status(400).json({ error: "Missing required fields: agent, action, data" });
      }

      // Define available agent actions
      const agentHandlers = {
        vendor: {
          analyze: async (params: any) => {
            const vendorServices = await storage.getServices(params.vendorId || userId);
            const vendorBookings = await storage.getBookings(params.vendorId || userId);
            
            return {
              success: true,
              vendorId: params.vendorId || userId,
              analytics: {
                totalServices: vendorServices.length,
                totalBookings: vendorBookings.length,
                revenue: vendorBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
                activeServices: vendorServices.filter(s => s.type).length
              },
              message: "Vendor analysis completed"
            };
          },
          approve: async (params: any) => {
            // Simulate vendor approval (in real system, this would update vendor status)
            return {
              success: true,
              vendorId: params.vendorId,
              status: "approved",
              message: `Vendor ${params.vendorId} has been approved`,
              approvedAt: new Date().toISOString()
            };
          },
          suspend: async (params: any) => {
            return {
              success: true,
              vendorId: params.vendorId,
              status: "suspended",
              reason: params.reason || "Policy violation",
              message: `Vendor ${params.vendorId} has been suspended`
            };
          }
        },
        booking: {
          create: async (params: any) => {
            const booking = await storage.createBooking({
              userId: params.vendorId || userId,
              serviceType: params.serviceType,
              checkIn: params.checkIn,
              checkOut: params.checkOut,
              guests: params.guests,
              totalPrice: params.totalPrice,
              status: "pending",
              customerName: params.customerName,
              customerEmail: params.customerEmail
            });
            
            return {
              success: true,
              bookingId: booking.id,
              message: "Booking created successfully"
            };
          },
          confirm: async (params: any) => {
            const booking = await storage.updateBooking(params.bookingId, { status: "confirmed" });
            return {
              success: true,
              bookingId: params.bookingId,
              status: "confirmed",
              message: "Booking confirmed successfully"
            };
          },
          cancel: async (params: any) => {
            const booking = await storage.updateBooking(params.bookingId, { status: "cancelled" });
            return {
              success: true,
              bookingId: params.bookingId,
              status: "cancelled",
              message: "Booking cancelled successfully"
            };
          }
        },
        marketing: {
          generateContent: async (params: any) => {
            if (!openai) {
              throw new Error("OpenAI API not configured");
            }
            
            const content = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: "Generate marketing content for Sri Lankan tourism businesses."
                },
                {
                  role: "user",
                  content: `Create ${params.type} content for ${params.businessName} targeting ${params.audience}`
                }
              ],
              max_tokens: 500
            });
            
            const marketingContent = await storage.createMarketingContent({
              userId,
              contentType: params.type,
              content: content.choices[0].message.content || "",
              targetAudience: params.audience,
              createdAt: new Date()
            });
            
            return {
              success: true,
              contentId: marketingContent.id,
              content: content.choices[0].message.content,
              message: "Marketing content generated successfully"
            };
          },
          scheduleCampaign: async (params: any) => {
            return {
              success: true,
              campaignId: params.campaignId,
              scheduledFor: params.scheduledDate,
              message: "Campaign scheduled successfully"
            };
          }
        },
        support: {
          createTicket: async (params: any) => {
            const notification = await storage.createNotification({
              userId,
              title: `Support Ticket: ${params.subject}`,
              message: params.description,
              type: "support",
              read: false,
              createdAt: new Date()
            });
            
            return {
              success: true,
              ticketId: notification.id,
              subject: params.subject,
              message: "Support ticket created successfully"
            };
          },
          respondToTicket: async (params: any) => {
            return {
              success: true,
              ticketId: params.ticketId,
              response: params.response,
              message: "Response sent successfully"
            };
          }
        }
      };

      // Validate agent and action
      if (!agentHandlers[agent as keyof typeof agentHandlers]) {
        return res.status(400).json({ error: `Invalid agent: ${agent}` });
      }

      const agentHandler = agentHandlers[agent as keyof typeof agentHandlers];
      if (!agentHandler[action as keyof typeof agentHandler]) {
        return res.status(400).json({ error: `Invalid action '${action}' for agent '${agent}'` });
      }

      // Execute the agent action
      const result = await agentHandler[action as keyof typeof agentHandler](data);

      // Log the action (you could extend this to store in database)
      console.log(`Agent action executed: ${agent}/${action}`, {
        userId,
        data,
        result,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        agent,
        action,
        result,
        executedAt: new Date().toISOString(),
        executedBy: userId
      });

    } catch (error) {
      console.error("Agent executor error:", error);
      res.status(500).json({ 
        error: "Agent execution failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Enhanced System Status
  app.get("/api/system/status", async (req: Request, res: Response) => {
    try {
      const status = {
        service: 'islandloaf-api',
        version: '2.0.0',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          database: process.env.DATABASE_URL ? 'postgresql' : 'memory',
          openai: !!process.env.OPENAI_API_KEY,
          storage: 'operational',
          agent_api: !!process.env.AGENT_API_KEY
        },
        endpoints: {
          health: '/api/health',
          agent: '/api/agent/execute',
          ai: '/api/ai/*',
          webhooks: '/api/webhooks/*'
        }
      };

      res.json({
        success: true,
        data: status,
        message: 'System operational'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'System check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Agent API key validation middleware
  const validateAgentApiKey = (req: Request, res: Response, next: Function) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey || apiKey !== process.env.AGENT_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
    }

    next();
  };

  // Universal Agent Executor
  app.post("/api/agent/execute", validateAgentApiKey, async (req: Request, res: Response) => {
    try {
      const { agent, action, data, requestId } = req.body;
      
      if (!agent || !action) {
        return res.status(400).json({
          success: false,
          error: 'Agent and action are required',
          code: 'MISSING_PARAMS'
        });
      }

      const startTime = Date.now();
      console.log(`Agent execution: ${agent}.${action} - ${requestId || 'no-id'}`);

      let result;
      
      switch (agent.toLowerCase()) {
        case 'vendor':
          result = await executeVendorAgent(action, data);
          break;
        case 'booking':
          result = await executeBookingAgent(action, data);
          break;
        case 'marketing':
          result = await executeMarketingAgent(action, data);
          break;
        case 'support':
          result = await executeSupportAgent(action, data);
          break;
        default:
          throw new Error(`Unknown agent: ${agent}`);
      }

      res.json({
        success: true,
        agent,
        action,
        data: result,
        message: `${agent} agent executed ${action} successfully`,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          executionTime: Date.now() - startTime
        }
      });

    } catch (error) {
      console.error('Agent execution failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'EXECUTION_FAILED',
        fallback: 'Manual intervention required',
        metadata: {
          requestId: req.body.requestId,
          timestamp: new Date().toISOString()
        }
      });
    }
  });

  // Agent action handlers with Airtable integration
  async function executeVendorAgent(action: string, data: any) {
    const airtableService = await import('./services/airtable.js').then(m => m.default);
    
    switch (action) {
      case 'analyze':
        // Get vendor analytics from Airtable
        const analytics = await airtableService.getVendorAnalytics(data.vendorId);
        
        await airtableService.logSystemEvent({
          eventType: 'Agent Execution',
          agent: 'vendor',
          action: 'analyze',
          data: { vendorId: data.vendorId },
          status: 'Success'
        });
        
        return {
          vendorId: data.vendorId,
          status: 'active',
          analytics: analytics,
          analysis: `Vendor analysis: ${analytics.totalBookings} bookings, ${analytics.conversionRate}% conversion rate`
        };

      case 'approve':
        await airtableService.updateVendor(data.vendorId, {
          'Status': 'Approved'
        });
        
        await airtableService.logSystemEvent({
          eventType: 'Vendor Action',
          agent: 'vendor',
          action: 'approve',
          data: { vendorId: data.vendorId },
          status: 'Success'
        });
        
        return {
          vendorId: data.vendorId,
          status: 'approved',
          approvedAt: new Date().toISOString()
        };

      case 'suspend':
        await airtableService.updateVendor(data.vendorId, {
          'Status': 'Suspended'
        });
        
        await airtableService.logSystemEvent({
          eventType: 'Vendor Action',
          agent: 'vendor',
          action: 'suspend',
          data: { vendorId: data.vendorId, reason: data.reason },
          status: 'Success'
        });
        
        return {
          vendorId: data.vendorId,
          status: 'suspended',
          suspendedAt: new Date().toISOString(),
          reason: data.reason || 'Administrative action'
        };

      default:
        throw new Error(`Unknown vendor action: ${action}`);
    }
  }

  async function executeBookingAgent(action: string, data: any) {
    const airtableService = await import('./services/airtable.js').then(m => m.default);
    
    switch (action) {
      case 'create':
        const bookingId = `B${Date.now()}`;
        
        // Create booking in Airtable
        await airtableService.createBooking({
          bookingId,
          vendorId: data.vendorId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          guests: data.guests || 1,
          checkIn: data.startDate,
          checkOut: data.endDate,
          status: 'Pending'
        });

        // Create corresponding payment entry
        const paymentId = `P${Date.now()}`;
        await airtableService.createPayment({
          paymentId,
          bookingId,
          vendorId: data.vendorId,
          amount: data.totalPrice,
          status: 'Pending',
          dueDate: data.endDate
        });

        await airtableService.logSystemEvent({
          eventType: 'Booking Creation',
          agent: 'booking',
          action: 'create',
          data: { bookingId, vendorId: data.vendorId, amount: data.totalPrice },
          status: 'Success'
        });

        return {
          bookingId,
          paymentId,
          status: 'created',
          totalPrice: data.totalPrice,
          commission: data.totalPrice * 0.1
        };

      case 'confirm':
        await airtableService.updateBookingStatus(data.bookingId, 'Confirmed');
        
        await airtableService.logSystemEvent({
          eventType: 'Booking Confirmation',
          agent: 'booking',
          action: 'confirm',
          data: { bookingId: data.bookingId },
          status: 'Success'
        });
        
        return {
          bookingId: data.bookingId,
          status: 'confirmed',
          confirmedAt: new Date().toISOString()
        };

      case 'cancel':
        await airtableService.updateBookingStatus(data.bookingId, 'Cancelled');
        
        await airtableService.logSystemEvent({
          eventType: 'Booking Cancellation',
          agent: 'booking',
          action: 'cancel',
          data: { bookingId: data.bookingId, reason: data.reason },
          status: 'Success'
        });
        
        return {
          bookingId: data.bookingId,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          reason: data.reason || 'Customer request'
        };

      default:
        throw new Error(`Unknown booking action: ${action}`);
    }
  }

  async function executeMarketingAgent(action: string, data: any) {
    switch (action) {
      case 'generate_content':
        return {
          contentType: data.type || 'social_media',
          content: `Generated ${data.type} content for ${data.service}`,
          generatedAt: new Date().toISOString()
        };

      case 'schedule_campaign':
        return {
          campaignId: `CAM-${Date.now()}`,
          scheduled: true,
          scheduledFor: data.scheduledFor,
          platform: data.platform
        };

      default:
        throw new Error(`Unknown marketing action: ${action}`);
    }
  }

  async function executeSupportAgent(action: string, data: any) {
    switch (action) {
      case 'create_ticket':
        const notification = await storage.createNotification({
          userId: data.vendorId || 1,
          title: `Support Ticket: ${data.subject}`,
          message: data.description,
          type: 'support'
        });

        return {
          ticketId: notification.id,
          subject: data.subject,
          priority: data.priority || 'medium',
          createdAt: new Date().toISOString()
        };

      case 'respond':
        return {
          ticketId: data.ticketId,
          response: data.response,
          respondedAt: new Date().toISOString(),
          status: 'responded'
        };

      default:
        throw new Error(`Unknown support action: ${action}`);
    }
  }

  // Webhook Endpoints
  app.post("/api/webhooks/n8n", async (req: Request, res: Response) => {
    try {
      const { workflow, data, executionId } = req.body;
      
      console.log(`n8n webhook: ${workflow} - ${executionId}`);

      let result;
      switch (workflow) {
        case 'booking_automation':
          const booking = await storage.createBooking({
            userId: data.vendorId,
            serviceId: data.serviceId,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            totalPrice: data.totalPrice,
            commission: data.commission || data.totalPrice * 0.1,
            status: 'pending'
          });
          result = { bookingId: booking.id };
          break;

        case 'vendor_onboarding':
          const vendor = await storage.createUser({
            username: data.email,
            email: data.email,
            password: 'temp-password',
            fullName: data.fullName,
            businessName: data.businessName,
            businessType: data.businessType,
            role: 'vendor'
          });
          result = { vendorId: vendor.id };
          break;

        default:
          result = { message: 'Workflow not recognized' };
      }

      res.json({
        success: true,
        executionId,
        result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('n8n webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'Manual processing required'
      });
    }
  });

  // Airtable Integration Endpoints
  app.get("/api/airtable/test", async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const result = await airtableService.testConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }
  });

  app.get("/api/airtable/vendors", async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const vendors = await airtableService.getVendors();
      res.json({
        success: true,
        data: vendors,
        count: vendors.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vendors'
      });
    }
  });

  app.get("/api/airtable/bookings", async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const bookings = await airtableService.getBookings();
      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings'
      });
    }
  });

  app.get("/api/airtable/payments", async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const payments = await airtableService.getPayments();
      res.json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payments'
      });
    }
  });

  app.get("/api/airtable/reports", async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const { startDate, endDate } = req.query;
      const reports = await airtableService.getDailyReports(
        startDate as string, 
        endDate as string
      );
      res.json({
        success: true,
        data: reports,
        count: reports.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reports'
      });
    }
  });

  app.get("/api/airtable/analytics/:vendorId", async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const { vendorId } = req.params;
      const analytics = await airtableService.getVendorAnalytics(vendorId);
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
      });
    }
  });

  app.post("/api/airtable/sync", async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const { syncType } = req.body;
      
      let result;
      switch (syncType) {
        case 'vendors':
          result = await airtableService.getVendors();
          break;
        case 'bookings':
          result = await airtableService.getBookings();
          break;
        case 'payments':
          result = await airtableService.getPayments();
          break;
        case 'reports':
          result = await airtableService.getDailyReports();
          break;
        default:
          throw new Error('Invalid sync type');
      }

      await airtableService.logSystemEvent({
        eventType: 'Data Sync',
        action: syncType,
        data: { recordCount: result.length },
        status: 'Success'
      });

      res.json({
        success: true,
        message: `${syncType} synchronized successfully`,
        data: result,
        count: result.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      });
    }
  });

  // Services Management Endpoints
  app.get("/api/services", requireAuth, async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const services = await airtableService.getServices();
      res.json({
        success: true,
        data: services,
        count: services.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch services'
      });
    }
  });

  app.post("/api/services", requireAuth, async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const serviceData = {
        serviceId: `SVC${Date.now()}`,
        vendorId: req.body.vendorId,
        serviceName: req.body.serviceName,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        currency: req.body.currency || 'LKR',
        imageUrl: req.body.imageUrl,
        availability: req.body.availability || 'Available'
      };
      
      const result = await airtableService.createService(serviceData);
      await airtableService.logSystemEvent({
        eventType: 'CREATE',
        action: 'services',
        data: { serviceId: serviceData.serviceId },
        status: 'Success'
      });
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create service'
      });
    }
  });

  // Customer Feedback Management
  app.get("/api/feedback", requireAuth, async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const feedback = await airtableService.getCustomerFeedback();
      res.json({
        success: true,
        data: feedback,
        count: feedback.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch feedback'
      });
    }
  });

  app.post("/api/feedback", requireAuth, async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      
      // Calculate sentiment analysis
      function calculateSentiment(text: string): string {
        if (!text) return 'Neutral';
        const positiveWords = ['excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'perfect', 'outstanding'];
        const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'worst', 'hate', 'disappointed', 'horrible', 'disgusting'];
        const textLower = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
        const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
        if (positiveCount > negativeCount) return 'Positive';
        if (negativeCount > positiveCount) return 'Negative';
        return 'Neutral';
      }

      const feedbackData = {
        feedbackId: `FB${Date.now()}`,
        bookingId: req.body.bookingId,
        vendorId: req.body.vendorId,
        customerName: req.body.customerName,
        rating: req.body.rating,
        reviewText: req.body.reviewText,
        sentiment: calculateSentiment(req.body.reviewText)
      };
      
      const result = await airtableService.createCustomerFeedback(feedbackData);
      await airtableService.logSystemEvent({
        eventType: 'CREATE',
        action: 'feedback',
        data: { feedbackId: feedbackData.feedbackId },
        status: 'Success'
      });
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create feedback'
      });
    }
  });

  app.get("/api/feedback/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const feedback = await airtableService.getCustomerFeedback();
      
      const stats = {
        totalFeedback: feedback.length,
        averageRating: feedback.length > 0 
          ? feedback.reduce((sum, f) => sum + parseFloat(f.rating || '0'), 0) / feedback.length 
          : 0,
        sentimentBreakdown: {
          positive: feedback.filter(f => f.sentiment === 'Positive').length,
          neutral: feedback.filter(f => f.sentiment === 'Neutral').length,
          negative: feedback.filter(f => f.sentiment === 'Negative').length
        },
        responseRate: feedback.length > 0 
          ? (feedback.filter(f => f.responseByVendor).length / feedback.length * 100) 
          : 0
      };
      
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch feedback stats'
      });
    }
  });

  // In-memory store for campaigns (in production this would be database)
  let campaignsStore = [
    {
      id: 1,
      title: 'Summer Special 2025',
      type: 'email',
      status: 'active',
      message: 'Book your summer getaway with 25% off all accommodation bookings!',
      startDate: '2025-06-01T00:00:00Z',
      endDate: '2025-08-31T23:59:59Z',
      targetAudience: 'all',
      promoCode: 'SUMMER25',
      discount: 25,
      sent: 450,
      opened: 387,
      clicks: 142,
      conversions: 28,
      createdAt: '2025-05-15T10:30:00Z',
      updatedAt: '2025-05-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Last Minute Deals',
      type: 'email',
      status: 'scheduled',
      message: 'Grab these last-minute deals before they\'re gone!',
      startDate: '2025-07-20T00:00:00Z',
      endDate: '2025-07-25T23:59:59Z',
      targetAudience: 'customers',
      promoCode: 'LASTMIN15',
      discount: 15,
      sent: 0,
      opened: 0,
      clicks: 0,
      conversions: 0,
      createdAt: '2025-07-10T14:20:00Z',
      updatedAt: '2025-07-10T14:20:00Z'
    },
    {
      id: 3,
      title: 'Vendor Spotlight',
      type: 'email',
      status: 'completed',
      message: 'Discover amazing local vendors and their unique offerings.',
      startDate: '2025-05-01T00:00:00Z',
      endDate: '2025-05-31T23:59:59Z',
      targetAudience: 'all',
      sent: 892,
      opened: 623,
      clicks: 178,
      conversions: 45,
      createdAt: '2025-04-25T09:15:00Z',
      updatedAt: '2025-04-25T09:15:00Z'
    }
  ];

  // Marketing Campaigns Management  
  app.get("/api/campaigns", requireAuth, async (req: Request, res: Response) => {
    try {
      res.json(campaignsStore);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  // Create new campaign
  app.post("/api/campaigns", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const campaignData = req.body;
      
      const newCampaign = {
        id: Date.now(), // Mock ID generation
        ...campaignData,
        status: 'draft',
        sent: 0,
        opened: 0,
        clicks: 0,
        conversions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to in-memory store
      campaignsStore.push(newCampaign);
      
      console.log("Creating new campaign:", newCampaign);
      
      res.json({
        success: true,
        message: "Campaign created successfully",
        data: newCampaign
      });
    } catch (error) {
      console.error("Failed to create campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  // Update campaign
  app.put("/api/campaigns/:id", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const updates = req.body;
      
      // Find and update campaign in store
      const campaignIndex = campaignsStore.findIndex(c => c.id === campaignId);
      if (campaignIndex === -1) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      campaignsStore[campaignIndex] = {
        ...campaignsStore[campaignIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Updating campaign ${campaignId}:`, updates);
      
      res.json({
        success: true,
        message: "Campaign updated successfully",
        data: campaignsStore[campaignIndex]
      });
    } catch (error) {
      console.error("Failed to update campaign:", error);
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  // Delete campaign
  app.delete("/api/campaigns/:id", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      // Find and remove campaign from store
      const campaignIndex = campaignsStore.findIndex(c => c.id === campaignId);
      if (campaignIndex === -1) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      campaignsStore.splice(campaignIndex, 1);
      
      console.log(`Deleting campaign ${campaignId}`);
      
      res.json({
        success: true,
        message: "Campaign deleted successfully"
      });
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // Launch campaign
  app.post("/api/campaigns/:id/launch", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      // Find and update campaign status in store
      const campaignIndex = campaignsStore.findIndex(c => c.id === campaignId);
      if (campaignIndex === -1) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      campaignsStore[campaignIndex].status = 'active';
      campaignsStore[campaignIndex].updatedAt = new Date().toISOString();
      
      console.log(`Launching campaign ${campaignId}`);
      
      res.json({
        success: true,
        message: "Campaign launched successfully"
      });
    } catch (error) {
      console.error("Failed to launch campaign:", error);
      res.status(500).json({ error: "Failed to launch campaign" });
    }
  });

  // Get active campaigns (this replaces the duplicate route)
  // The existing route is kept below, this one is removed

  // Send quick email blast
  app.post("/api/campaigns/quick-email", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const { title, message, audience } = req.body;
      
      // In production, this would send emails to the selected audience
      console.log(`Sending quick email blast: ${title} to ${audience}`);
      console.log(`Message: ${message}`);
      
      res.json({
        success: true,
        message: "Email blast sent successfully",
        sent: audience === 'all' ? 500 : 150 // Mock numbers
      });
    } catch (error) {
      console.error("Failed to send email blast:", error);
      res.status(500).json({ error: "Failed to send email blast" });
    }
  });

  // Generate promo code
  app.post("/api/campaigns/promo-code", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const { code, discount, validUntil } = req.body;
      
      // In production, this would save to database
      console.log(`Creating promo code: ${code} with ${discount}% discount, valid until ${validUntil}`);
      
      res.json({
        success: true,
        message: "Promo code created successfully",
        code: code,
        discount: discount,
        validUntil: validUntil
      });
    } catch (error) {
      console.error("Failed to create promo code:", error);
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });

  // This route is replaced by the new one above - keeping for reference
  // app.post("/api/campaigns", requireAuth, async (req: Request, res: Response) => {

  app.get("/api/campaigns/active", requireAuth, async (req: Request, res: Response) => {
    try {
      // Filter active campaigns from store
      const activeCampaigns = campaignsStore.filter(campaign => campaign.status === 'active');
      res.json(activeCampaigns);
    } catch (error) {
      console.error("Failed to fetch active campaigns:", error);
      res.status(500).json({ error: "Failed to fetch active campaigns" });
    }
  });

  // Agent Training Management
  app.get("/api/ai/agent-training", requireAuth, async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const trainingHistory = await airtableService.getAgentTraining();
      
      res.json({
        success: true,
        data: trainingHistory,
        count: trainingHistory.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch training history'
      });
    }
  });

  // System Logs Endpoint
  app.get("/api/system/logs", requireAuth, async (req: Request, res: Response) => {
    try {
      const airtableService = await import('./services/airtable.js').then(m => m.default);
      const logs = await airtableService.getSystemLogs();
      
      res.json({
        success: true,
        data: logs.slice(0, 100), // Last 100 logs
        count: logs.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch system logs'
      });
    }
  });

  // AI Agent Trainer Endpoints
  app.post("/api/ai/agent-trainer", requireAuth, async (req: Request, res: Response) => {
    try {
      const { agent, trainingData } = req.body;
      const userId = req.session.user!.id;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI training service not available" });
      }

      if (!agent || !trainingData?.input || !trainingData?.expectedOutput) {
        return res.status(400).json({ error: "Missing required training data" });
      }

      // Generate prompt tuning suggestions using OpenAI
      const tuningPrompt = `Analyze this training example for an AI agent and provide specific prompt improvements:

AGENT TYPE: ${agent}
USER INPUT: ${trainingData.input}
EXPECTED OUTPUT: ${trainingData.expectedOutput}
CONTEXT: ${trainingData.context || 'None provided'}

Provide structured analysis:
1. IMPROVED PROMPT TEMPLATE for this scenario
2. KEY PATTERNS the agent should recognize
3. RESPONSE STRUCTURE guidelines
4. EDGE CASES to consider
5. VALIDATION RULES for similar inputs

Format as actionable prompt engineering advice for a ${agent} agent in a Sri Lankan tourism platform.`;

      if (!openai) {
        return res.status(500).json({ error: "AI service is currently unavailable" });
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an AI prompt engineering expert specializing in tourism and booking systems. Provide specific, actionable advice for improving agent prompts." 
          },
          { role: "user", content: tuningPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const suggestions = completion.choices[0].message.content || "";

      // Store training data as a notification for tracking
      const trainingRecord = await storage.createNotification({
        userId,
        title: `AI Training: ${agent} Agent`,
        message: `Input: ${trainingData.input}\nExpected: ${trainingData.expectedOutput}`,
        type: "training",
        read: false
      });

      console.log(`AI Agent Training Submitted:`, {
        agent,
        userId,
        trainingId: trainingRecord.id,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        trainingId: trainingRecord.id,
        suggestions: suggestions,
        message: "Training data processed and suggestions generated"
      });

    } catch (error) {
      console.error("AI agent training error:", error);
      res.status(500).json({ error: "Failed to process training data" });
    }
  });

  app.get("/api/ai/agent-trainer/history", requireAuth, async (req: Request, res: Response) => {
    try {
      const { agent } = req.query;
      const userId = req.session.user!.id;

      // Get training history from notifications
      const notifications = await storage.getNotifications(userId);
      const trainingHistory = notifications
        .filter(n => n.type === "training")
        .filter(n => !agent || n.title.includes(agent as string))
        .slice(0, 20)
        .map(n => ({
          id: n.id,
          agent: n.title.replace("AI Training: ", "").replace(" Agent", ""),
          input: n.message.split("\nExpected:")[0].replace("Input: ", ""),
          expectedOutput: n.message.split("\nExpected: ")[1] || "",
          status: 'success' as const,
          timestamp: n.createdAt || new Date().toISOString()
        }));

      res.json({ 
        success: true, 
        history: trainingHistory
      });

    } catch (error) {
      console.error("Failed to fetch training history:", error);
      res.status(500).json({ error: "Failed to fetch training history" });
    }
  });

  // Stay/Accommodation API endpoints
  app.get("/api/stay/types", (req: Request, res: Response) => {
    const stayTypes = [
      'One Room', 'Double Bed', 'Twin Room', 'Triple Room', 'Family Room', 
      'Deluxe Room', 'Suite', 'Junior Suite', 'Studio', 'Entire Villa', 
      'Entire Apartment', 'Private Cottage', 'Shared Dorm', 'Capsule Room',
      'Tent', 'Bungalow', 'Chalet', 'Houseboat', 'Cabana', 'Treehouse'
    ];
    res.json(stayTypes);
  });

  app.get("/api/stay/property-types", (req: Request, res: Response) => {
    const propertyTypes = [
      'Hotel', 'Villa', 'Resort', 'Apartment', 'Bungalow', 'Boutique Hotel',
      'Homestay', 'Hostel', 'Cottage', 'Treehouse', 'Guesthouse'
    ];
    res.json(propertyTypes);
  });

  app.get("/api/stay/property-spaces", (req: Request, res: Response) => {
    const propertySpaces = [
      'Beachfront', 'Mountain View', 'City Center', 'Countryside', 'Lakeside',
      'Riverside', 'Forest', 'Desert', 'Island', 'Oceanfront'
    ];
    res.json(propertySpaces);
  });

  app.get("/api/stay/themes", (req: Request, res: Response) => {
    const themes = [
      'Romantic', 'Family-friendly', 'Business', 'Luxury', 'Budget',
      'Adventure', 'Eco-friendly', 'Historic', 'Modern', 'Traditional'
    ];
    res.json(themes);
  });

  app.get("/api/stay/amenities", (req: Request, res: Response) => {
    const amenities = [
      { id: '1', name: 'WiFi' },
      { id: '2', name: 'Air Conditioning' },
      { id: '3', name: 'Swimming Pool' },
      { id: '4', name: 'Beach Access' },
      { id: '5', name: 'Kitchen' },
      { id: '6', name: 'Breakfast Included' },
      { id: '7', name: 'Private Bathroom' },
      { id: '8', name: 'Balcony' },
      { id: '9', name: 'Ocean View' },
      { id: '10', name: 'Gym Access' }
    ];
    res.json(amenities);
  });

  // Vehicle/Transport API endpoints
  app.get("/api/vehicles/types", (req: Request, res: Response) => {
    const vehicleTypes = [
      'Car', 'Van', 'Bus', 'Motorcycle', 'Bicycle', 'Tuk-tuk',
      'Luxury Car', 'SUV', 'Minibus', 'Boat', 'Helicopter', 'Taxi'
    ];
    res.json(vehicleTypes);
  });

  // Support Ticket API endpoints
  app.get("/api/support/tickets", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const tickets = await storage.getSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);
      res.status(500).json({ error: "Failed to fetch support tickets" });
    }
  });

  app.get("/api/support/tickets/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }
      
      // Only allow admin or ticket owner to view ticket details
      if (req.session.user!.role !== 'admin' && ticket.userId !== req.session.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Failed to fetch support ticket:", error);
      res.status(500).json({ error: "Failed to fetch support ticket" });
    }
  });

  app.post("/api/support/tickets", requireAuth, async (req: Request, res: Response) => {
    try {
      const { subject, message, priority = 'medium', category } = req.body;
      const userId = req.session.user!.id;
      
      if (!subject || !message || !category) {
        return res.status(400).json({ error: "Subject, message, and category are required" });
      }
      
      // Get vendor name from user
      const user = await storage.getUser(userId);
      const vendorName = user?.businessName || user?.fullName || 'Unknown Vendor';
      
      const ticketData = {
        userId,
        vendorName,
        subject,
        message,
        priority,
        category,
        status: 'open',
        assignedTo: null,
        internalNotes: null
      };
      
      const ticket = await storage.createSupportTicket(ticketData);
      
      // Create notification for admin
      await storage.createNotification({
        userId: 1, // Admin user ID
        title: "New Support Ticket",
        message: `New support ticket from ${vendorName}: ${subject}`,
        type: "info"
      });
      
      res.json(ticket);
    } catch (error) {
      console.error("Failed to create support ticket:", error);
      res.status(500).json({ error: "Failed to create support ticket" });
    }
  });

  app.put("/api/support/tickets/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { status, assignedTo, internalNotes, priority } = req.body;
      
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }
      
      // Only admin can update ticket status and assignments
      if (req.session.user!.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can update support tickets" });
      }
      
      const updateData: any = {};
      if (status) updateData.status = status;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
      if (priority) updateData.priority = priority;
      
      const updatedTicket = await storage.updateSupportTicket(ticketId, updateData);
      
      // Create notification for vendor if status changed
      if (status && status !== ticket.status) {
        await storage.createNotification({
          userId: ticket.userId,
          title: "Support Ticket Update",
          message: `Your support ticket "${ticket.subject}" has been updated to ${status}`,
          type: "info"
        });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Failed to update support ticket:", error);
      res.status(500).json({ error: "Failed to update support ticket" });
    }
  });

  app.delete("/api/support/tickets/:id", requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const success = await storage.deleteSupportTicket(ticketId);
      
      if (success) {
        res.json({ message: "Support ticket deleted successfully" });
      } else {
        res.status(404).json({ error: "Support ticket not found" });
      }
    } catch (error) {
      console.error("Failed to delete support ticket:", error);
      res.status(500).json({ error: "Failed to delete support ticket" });
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