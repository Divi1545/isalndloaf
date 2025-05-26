import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import StatCard from "@/components/dashboard/stat-card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import ServiceBreakdown from "@/components/dashboard/service-breakdown";
import UpcomingBookings from "@/components/dashboard/upcoming-bookings";
import BookingSources from "@/components/dashboard/booking-sources";
import CalendarOverview from "@/components/dashboard/calendar-overview";
import Overview from "@/pages/dashboard/Overview";
import BookingManager from "@/pages/dashboard/BookingManager";
import CalendarSync from "@/pages/dashboard/CalendarSync";
import PricingEngine from "@/pages/dashboard/PricingEngine";
import AiMarketing from "@/pages/dashboard/AiMarketing";
import Analytics from "@/pages/dashboard/Analytics";
import Profile from "@/pages/dashboard/Profile";

// No need to import the logo directly, we'll use a relative path

// Mock user data
const mockUser = {
  id: 1,
  username: "vendor",
  email: "vendor@islandloaf.com",
  fullName: "Island Vendor",
  businessName: "Beach Paradise Villa",
  businessType: "accommodation",
  role: "vendor"
};

// Sidebar component
interface SidebarProps {
  activeLink: string;
  setActiveLink: (link: string) => void;
  onLogout?: () => void;
}

const Sidebar = ({ activeLink, setActiveLink, onLogout }: SidebarProps) => {
  const links = [
    { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
    { id: "bookings", label: "Booking Manager", icon: "ri-calendar-check-line" },
    { id: "calendar", label: "Calendar Sync", icon: "ri-calendar-line" },
    { id: "pricing", label: "Pricing Engine", icon: "ri-money-dollar-circle-line" },
    { id: "marketing", label: "AI Marketing", icon: "ri-robot-line" },
    { id: "analytics", label: "Analytics & Reports", icon: "ri-line-chart-line" },
    { id: "profile", label: "Profile Settings", icon: "ri-user-settings-line" },
    { id: "notifications", label: "Notifications & Logs", icon: "ri-notification-3-line" }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 text-white hidden md:block">
      <div className="px-6 pt-6 pb-4 flex items-center border-b border-slate-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mr-2">
            <span className="text-white font-bold text-xl">IL</span>
          </div>
          <h1 className="text-xl font-bold">IslandLoaf</h1>
        </div>
      </div>
      
      <div className="px-4 py-6">
        <div className="flex items-center mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-medium">
              {getInitials(mockUser.fullName)}
            </span>
          </div>
          <div className="ml-3">
            <p className="font-medium">{mockUser.fullName}</p>
            <p className="text-xs text-slate-400">{mockUser.businessName}</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {links.map((link) => (            
            <button 
              key={link.id}
              onClick={() => setActiveLink(link.id)}
              className={`flex items-center px-3 py-2 rounded-md w-full text-left ${
                activeLink === link.id 
                  ? 'bg-emerald-700 text-white' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <i className={`${link.icon} mr-3`}></i>
              <span>{link.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto border-t border-slate-700 px-4 py-4">
        <button 
          className="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md w-full"
          onClick={onLogout}
        >
          <i className="ri-logout-box-line mr-3"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// Header component
interface HeaderProps {
  pageTitle: string;
}

const Header = ({ pageTitle }: HeaderProps) => {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b z-30 flex items-center px-4 md:px-6">
      <div className="flex items-center md:hidden">
        <button className="text-2xl mr-4">
          <i className="ri-menu-line"></i>
        </button>
      </div>
      
      <div className="flex-1 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{pageTitle}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="hidden md:flex items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-medium">{mockUser.fullName.charAt(0)}</span>
            </div>
            <span className="ml-2 font-medium">{mockUser.fullName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// AI Assistant Component 
const AiAssistant = () => {
  return (
    <div className="mt-8 mb-8">
      <Card className="overflow-hidden border-emerald-200">
        <div className="bg-emerald-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 bg-emerald-100 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-700">AI Assistant</h3>
              <p className="text-sm text-slate-500">Your business growth companion</p>
            </div>
          </div>
          <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <i className="ri-arrow-right-up-line mr-1"></i>
            View all tips
          </button>
        </div>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-emerald-100 p-2 rounded-full mr-3">
                <i className="ri-award-line text-emerald-600"></i>
              </div>
              <div>
                <h4 className="font-medium">Boost your growth score</h4>
                <p className="text-sm text-slate-500 mt-1">Your business growth score is 78/100. Add more high-quality photos to improve visibility.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <i className="ri-lightbulb-line text-amber-600"></i>
              </div>
              <div>
                <h4 className="font-medium">Weekly tip</h4>
                <p className="text-sm text-slate-500 mt-1">Consider offering a 10% discount for weekday bookings to increase occupancy during slower periods.</p>
              </div>
            </div>
            <div className="pt-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask AI Assistant a question..." 
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white rounded-md p-1">
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Import the login page and admin components
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import VendorManagement from "@/pages/admin/VendorManagement";
import BookingManagement from "@/pages/admin/BookingManagement";
import RevenueManagement from "@/pages/admin/RevenueManagement";
import AddVendorForm from "@/pages/admin/AddVendorForm";
import MarketingCampaigns from "@/pages/admin/MarketingCampaigns";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import TransactionHistory from "@/pages/admin/TransactionHistory";
import SupportDashboard from "@/pages/admin/SupportDashboard";
import NewCampaignPage from "@/pages/admin/NewCampaignPage";
import NewSupportTicketPage from "@/pages/admin/NewSupportTicketPage";

// Import Vendor Form Pages
import AddBookingForm from "@/pages/vendor/AddBookingForm";

// Main App Component
const SimpleApp = () => {
  const [activeLink, setActiveLink] = useState("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");
  const [currentAdminPath, setCurrentAdminPath] = useState<string | null>(null);
  const [_, setLocation] = useLocation();
  
  // Check for authentication and active tab on component mount
  useEffect(() => {
    // Retrieve authentication from localStorage
    const storedUserRole = localStorage.getItem("userRole");
    
    if (storedUserRole) {
      setIsLoggedIn(true);
      setUserRole(storedUserRole);
      
      // Check if there's an active tab stored in localStorage
      const storedActiveTab = localStorage.getItem("activeTab");
      if (storedActiveTab) {
        setActiveLink(storedActiveTab);
        // Clear the stored active tab after using it
        localStorage.removeItem("activeTab");
      }
    }
  }, []);
  
  // Set page title based on active link (for vendor)
  const getPageTitle = () => {
    const titles: Record<string, string> = {
      overview: "Dashboard Overview",
      bookings: "Booking Manager",
      calendar: "Calendar Sync",
      pricing: "Pricing Engine",
      marketing: "AI Marketing",
      analytics: "Analytics & Reports",
      profile: "Profile Settings",
      notifications: "Notifications & Logs"
    };
    
    return titles[activeLink] || "Vendor Dashboard";
  };
  
  // Get page title based on active tab (for admin)
  const getAdminPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Admin Dashboard",
      vendors: "Vendor Management",
      bookings: "Booking Management",
      revenue: "Revenue Management",
      settings: "Platform Settings",
      marketing: "Marketing Campaigns",
      analytics: "Analytics & Reports",
      transactions: "Transaction History",
      support: "Support Dashboard"
    };
    
    return titles[activeAdminTab] || "Admin Portal";
  };
  
  // Render content based on active link (for vendor)
  const renderContent = () => {
    // Check for special vendor routes
    const pathname = window.location.pathname;
    
    // Handle vendor form routes
    if (pathname.startsWith("/vendor/add-booking")) {
      // Extract the booking category if available
      const category = pathname.split('/')[3]; // /vendor/add-booking/[category]
      
      if (category) {
        // Return the specific booking form based on category
        switch (category) {
          case 'stay':
            return <AddBookingForm bookingType="stay" title="Add Stay Booking" />;
          case 'transport':
            return <AddBookingForm bookingType="transport" title="Add Transport Booking" />;
          case 'wellness':
            return <AddBookingForm bookingType="wellness" title="Add Health & Wellness Booking" />;
          case 'tour':
            return <AddBookingForm bookingType="tour" title="Add Tour Booking" />;
          case 'product':
            return <AddBookingForm bookingType="product" title="Add Product Order" />;
          default:
            return <AddBookingForm />;
        }
      }
      
      // Generic booking form if no category is specified
      return <AddBookingForm />;
    }
    
    // Otherwise show regular content based on active link
    switch (activeLink) {
      case "overview":
        return <Overview />;
      case "bookings":
        return <BookingManager />;
      case "calendar":
        return <CalendarSync />;
      case "pricing":
        return <PricingEngine />;
      case "marketing":
        return <AiMarketing />;
      case "analytics":
        return <Analytics />;
      case "profile":
        return <Profile />;
      case "notifications":
        return (
          <div className="py-20 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-notification-3-line text-3xl text-slate-500"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">Notifications & Logs</h2>
              <p className="text-slate-500 max-w-lg mb-6">
                This page will show your recent notifications, system alerts, and activity logs.
              </p>
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-md">
                  Mark All as Read
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-md">
                  Configure Notifications
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <Overview />;
    }
  };
  
  // Render content based on active tab (for admin)
  const renderAdminContent = () => {
    // Check for stored admin action
    const adminAction = localStorage.getItem("adminAction");
    
    // Handle special admin actions
    if (adminAction === "addVendor") {
      // Clear the action after handling it
      localStorage.removeItem("adminAction");
      return <AddVendorForm />;
    } else if (adminAction === "newMarketingCampaign") {
      return <NewCampaignPage />;
    } else if (adminAction === "createSupportTicket") {
      return <NewSupportTicketPage />;
    }
    
    // Otherwise show regular tab content based on active tab
    switch (activeAdminTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "vendors":
        return <VendorManagement />;
      case "bookings":
        return <BookingManagement />;
      case "revenue":
        return <RevenueManagement />;
      case "marketing":
        return <MarketingCampaigns />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "transactions":
        return <TransactionHistory />;
      case "support":
        return <SupportDashboard />;
      case "settings":
        return (
          <div className="py-20 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-settings-3-line text-3xl text-slate-500"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">Platform Settings</h2>
              <p className="text-slate-500 max-w-lg mb-6">
                Configure global platform settings, user permissions, and notification preferences.
              </p>
              <div className="flex gap-4">
                <button 
                  className="px-4 py-2 bg-purple-600 text-white rounded-md"
                  onClick={() => alert('General Settings functionality would be implemented here!')}
                >
                  General Settings
                </button>
                <button 
                  className="px-4 py-2 bg-white border border-slate-200 rounded-md"
                  onClick={() => alert('User Management functionality would be implemented here!')}
                >
                  User Management
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    // Clear authentication from localStorage
    localStorage.removeItem("userRole");
  };
  
  // Route navigation helper for admin
  const goToAdminPath = (path: string) => {
    setCurrentAdminPath(path);
    // Clear the path when we navigate to a main tab
    if (path === null) {
      setActiveAdminTab("dashboard");
    }
  };
  
  // Handle successful login
  const handleLoginSuccess = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentAdminPath(null);
    // Store authentication in localStorage
    localStorage.setItem("userRole", role);
  };
  
  // If not logged in, show the login page
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
  
  // Show admin dashboard for admin users
  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="fixed inset-y-0 left-0 z-10 w-64 bg-slate-800 text-white">
          <div className="p-4 flex items-center">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
              <span className="font-bold text-sm">IL</span>
            </div>
            <div>
              <div className="font-bold">IslandLoaf</div>
              <div className="text-xs text-slate-400">Admin Portal</div>
            </div>
          </div>
          
          <nav className="mt-8">
            <div className="px-4 mb-2 text-xs font-semibold text-slate-400">ADMINISTRATION</div>
            {[
              { id: "dashboard", label: "Dashboard", icon: "dashboard" },
              { id: "vendors", label: "Vendors", icon: "user" },
              { id: "bookings", label: "Bookings", icon: "calendar" },
              { id: "revenue", label: "Revenue", icon: "money-dollar-circle" },
              { id: "settings", label: "Settings", icon: "settings" },
            ].map((item) => (
              <a
                key={item.id}
                href="#"
                className={`flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white ${
                  activeAdminTab === item.id ? 'bg-slate-700 text-white' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveAdminTab(item.id);
                }}
              >
                <i className={`ri-${item.icon}-line mr-3`}></i>
                <span>{item.label}</span>
              </a>
            ))}

            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-400">MANAGEMENT</div>
            {[
              { id: "marketing", label: "Marketing", icon: "megaphone" },
              { id: "analytics", label: "Analytics", icon: "line-chart" },
              { id: "transactions", label: "Transactions", icon: "exchange-funds" },
              { id: "support", label: "Support", icon: "customer-service-2" },
            ].map((item) => (
              <a
                key={item.id}
                href="#"
                className={`flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white ${
                  activeAdminTab === item.id ? 'bg-slate-700 text-white' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveAdminTab(item.id);
                }}
              >
                <i className={`ri-${item.icon}-line mr-3`}></i>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          
          <div className="mt-auto border-t border-slate-700 px-4 py-4">
            <button 
              className="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md w-full"
              onClick={handleLogout}
            >
              <i className="ri-logout-box-line mr-3"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        <div className="md:ml-64 pt-16 pb-12 px-6">
          <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
            <h1 className="text-lg font-semibold">{getAdminPageTitle()}</h1>
            <div className="flex items-center">
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-4">
                <i className="ri-notification-3-line"></i>
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                  <span className="text-sm font-medium text-purple-600">A</span>
                </div>
                <span className="font-medium text-sm">Admin</span>
              </div>
            </div>
          </header>
          
          <main>
            {renderAdminContent()}
          </main>
        </div>
      </div>
    );
  }
  
  // Otherwise show the vendor dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} onLogout={handleLogout} />
      <div className="md:ml-64">
        <Header pageTitle={getPageTitle()} />
        <main className="pt-16">
          {renderContent()}
          
          {/* Show AI Assistant on all pages */}
          {activeLink !== "marketing" && (
            <div className="px-4 md:px-6">
              <AiAssistant />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SimpleApp;