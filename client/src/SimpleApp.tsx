import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import StatCard from "@/components/dashboard/stat-card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import ServiceBreakdown from "@/components/dashboard/service-breakdown";
import UpcomingBookings from "@/components/dashboard/upcoming-bookings";
import BookingSources from "@/components/dashboard/booking-sources";
import CalendarOverview from "@/components/dashboard/calendar-overview";

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

// Sample data for the dashboard
const revenueData = [
  { date: "Jan", revenue: 2400 },
  { date: "Feb", revenue: 3000 },
  { date: "Mar", revenue: 2800 },
  { date: "Apr", revenue: 3600 },
  { date: "May", revenue: 4200 },
  { date: "Jun", revenue: 4800 }
];

const serviceTypes = [
  {
    type: "Accommodation",
    percentage: 45,
    icon: "building",
    color: { bg: "bg-blue-100", text: "text-blue-700" }
  },
  {
    type: "Vehicle Rental",
    percentage: 25,
    icon: "car",
    color: { bg: "bg-green-100", text: "text-green-700" }
  },
  {
    type: "Tours",
    percentage: 18,
    icon: "map",
    color: { bg: "bg-amber-100", text: "text-amber-700" }
  },
  {
    type: "Wellness",
    percentage: 12,
    icon: "heart",
    color: { bg: "bg-rose-100", text: "text-rose-700" }
  }
];

const bookingSources = [
  { name: "Direct", percentage: 40, color: "#4f46e5" },
  { name: "IslandLoaf.com", percentage: 25, color: "#0891b2" },
  { name: "Partner Sites", percentage: 20, color: "#16a34a" },
  { name: "Social Media", percentage: 15, color: "#ea580c" }
];

// Sidebar component
const Sidebar = () => {
  const links = [
    { href: "#overview", label: "Overview", icon: "ri-dashboard-line" },
    { href: "#bookings", label: "Booking Manager", icon: "ri-calendar-check-line" },
    { href: "#calendar", label: "Calendar Sync", icon: "ri-calendar-line" },
    { href: "#pricing", label: "Pricing Engine", icon: "ri-money-dollar-circle-line" },
    { href: "#marketing", label: "AI Marketing", icon: "ri-robot-line" },
    { href: "#analytics", label: "Analytics & Reports", icon: "ri-line-chart-line" },
    { href: "#profile", label: "Profile Settings", icon: "ri-user-settings-line" },
    { href: "#notifications", label: "Notifications & Logs", icon: "ri-notification-3-line" }
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
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground hidden md:block">
      <div className="px-6 pt-8 pb-4 flex items-center border-b border-sidebar-border">
        <i className="ri-island-line text-3xl mr-2"></i>
        <h1 className="text-xl font-bold">IslandLoaf</h1>
      </div>
      
      <div className="px-4 py-6">
        <div className="flex items-center mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-white font-medium">
              {getInitials(mockUser.fullName)}
            </span>
          </div>
          <div className="ml-3">
            <p className="font-medium">{mockUser.fullName}</p>
            <p className="text-xs text-sidebar-foreground/70">{mockUser.businessName}</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {links.map((link) => (            
            <a 
              key={link.href}
              href={link.href}
              className="flex items-center px-3 py-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <i className={`${link.icon} mr-3`}></i>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto border-t border-sidebar-border px-4 py-4">
        <button 
          className="flex items-center px-3 py-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md w-full"
        >
          <i className="ri-logout-box-line mr-3"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// Header component
const Header = () => {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-background border-b z-30 flex items-center px-4 md:px-6">
      <div className="flex items-center md:hidden">
        <button className="text-2xl mr-4">
          <i className="ri-menu-line"></i>
        </button>
      </div>
      
      <div className="flex-1 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Vendor Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-accent rounded-full relative">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="hidden md:flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">{mockUser.fullName.charAt(0)}</span>
            </div>
            <span className="ml-2 font-medium">{mockUser.fullName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Dashboard component
const Dashboard = () => {
  return (
    <div className="pt-20 pb-8 px-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Welcome alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTitle className="text-blue-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg> 
          Welcome back, {mockUser.fullName}!
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          Your {mockUser.businessType} business has 3 new bookings since your last login. Check your upcoming schedule below.
        </AlertDescription>
      </Alert>
      
      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue"
          value="$12,628"
          icon="dollar-sign"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          trend={{ value: "+12.5%", isPositive: true }}
          subtitle="vs. last month"
        />
        <StatCard 
          title="Bookings"
          value="237"
          icon="calendar"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          trend={{ value: "+8.2%", isPositive: true }}
          subtitle="vs. last month"
        />
        <StatCard 
          title="Avg. Rating"
          value="4.8"
          icon="star"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          trend={{ value: "+0.3", isPositive: true }}
          subtitle="vs. last month"
        />
        <StatCard 
          title="Conversion Rate"
          value="28.5%"
          icon="percent"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          trend={{ value: "-2.1%", isPositive: false }}
          subtitle="vs. last month"
        />
      </div>
      
      {/* Revenue chart & Service breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Revenue Trend</h3>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Service Breakdown</h3>
            <ServiceBreakdown services={serviceTypes} />
          </CardContent>
        </Card>
      </div>
      
      {/* Calendar overview & Booking sources */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Calendar Overview</h3>
            <CalendarOverview />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Booking Sources</h3>
            <BookingSources sources={bookingSources} />
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming bookings */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Upcoming Bookings</h3>
          <UpcomingBookings limit={5} />
        </CardContent>
      </Card>
    </div>
  );
};

// AI Assistant Component 
const AiAssistant = () => {
  return (
    <div className="mt-8">
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-primary/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 bg-primary/20 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-primary">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Your business growth companion</p>
            </div>
          </div>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            <i className="ri-arrow-right-up-line mr-1"></i>
            View all tips
          </button>
        </div>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <i className="ri-award-line text-primary"></i>
              </div>
              <div>
                <h4 className="font-medium">Boost your growth score</h4>
                <p className="text-sm text-muted-foreground mt-1">Your business growth score is 78/100. Add more high-quality photos to improve visibility.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <i className="ri-lightbulb-line text-amber-600"></i>
              </div>
              <div>
                <h4 className="font-medium">Weekly tip</h4>
                <p className="text-sm text-muted-foreground mt-1">Consider offering a 10% discount for weekday bookings to increase occupancy during slower periods.</p>
              </div>
            </div>
            <div className="pt-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask AI Assistant a question..." 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-md p-1">
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

// Main App Component
const SimpleApp = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main>
          <Dashboard />
          <div className="px-4 md:px-6">
            <AiAssistant />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimpleApp;