import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import VendorSignup from "@/pages/VendorSignup";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Dashboard from "@/pages/dashboard";
import BookingManager from "@/pages/dashboard/booking-manager";
import AddBooking from "./pages/dashboard/add-booking";
import CalendarSync from "@/pages/dashboard/calendar-sync";
import PricingEngine from "@/pages/dashboard/pricing-engine";
import AiMarketing from "@/pages/dashboard/ai-marketing";
import AIFeatures from "@/pages/dashboard/AIFeatures";
import AIAgentTrainer from "@/pages/dashboard/AIAgentTrainer";
import AirtableManager from "@/pages/dashboard/AirtableManager";
import ServicesManager from "@/pages/dashboard/ServicesManager";
import FeedbackManager from "@/pages/dashboard/FeedbackManager";
import CampaignsManager from "@/pages/dashboard/CampaignsManager";
import SystemLogs from "@/pages/dashboard/SystemLogs";
import Analytics from "@/pages/dashboard/analytics";
import ProfileSettings from "@/pages/dashboard/profile-settings";
import Notifications from "@/pages/dashboard/notifications";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import VendorManagement from "@/pages/admin/VendorManagement";
import BookingManagement from "@/pages/admin/BookingManagement";
import RevenueManagement from "@/pages/admin/RevenueManagement";
import MarketingCampaigns from "@/pages/admin/MarketingCampaigns";
import TransactionHistory from "@/pages/admin/TransactionHistory";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import SupportDashboard from "@/pages/admin/SupportDashboard";
import Settings from "@/pages/admin/Settings";
import ApiKeys from "@/pages/admin/api-keys";
import AddVendorForm from "@/pages/admin/AddVendorForm";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated and not already on login page
    if (!isLoading && !user && location !== "/login") {
      setLocation("/login");
    }
    
    // Redirect to dashboard if authenticated and on login page
    if (!isLoading && user && location === "/login") {
      setLocation(user.role === 'admin' ? "/admin" : "/dashboard");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent"></div>
    </div>;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/vendor-signup" component={VendorSignup} />
      
      {/* Admin Dashboard routes */}
      <Route path="/admin">
        {() => (
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/vendors">
        {() => (
          <DashboardLayout>
            <VendorManagement />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/bookings">
        {() => (
          <DashboardLayout>
            <BookingManagement />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/revenue">
        {() => (
          <DashboardLayout>
            <RevenueManagement />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/marketing">
        {() => (
          <DashboardLayout>
            <MarketingCampaigns />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/transactions">
        {() => (
          <DashboardLayout>
            <TransactionHistory />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/analytics">
        {() => (
          <DashboardLayout>
            <AnalyticsDashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/support">
        {() => (
          <DashboardLayout>
            <SupportDashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/api-keys">
        {() => (
          <DashboardLayout>
            <ApiKeys />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/admin/add-vendor">
        {() => (
          <DashboardLayout>
            <AddVendorForm />
          </DashboardLayout>
        )}
      </Route>
      
      {/* Vendor Dashboard routes */}
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/bookings">
        {() => (
          <DashboardLayout>
            <BookingManager />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/add-booking">
        {() => (
          <DashboardLayout>
            <AddBooking />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/calendar">
        {() => (
          <DashboardLayout>
            <CalendarSync />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/pricing">
        {() => (
          <DashboardLayout>
            <PricingEngine />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/ai-marketing">
        {() => (
          <DashboardLayout>
            <AiMarketing />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/ai-features">
        {() => (
          <DashboardLayout>
            <AIFeatures />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/ai-trainer">
        {() => (
          <DashboardLayout>
            <AIAgentTrainer />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/airtable">
        {() => (
          <DashboardLayout>
            <AirtableManager />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/services">
        {() => (
          <DashboardLayout>
            <ServicesManager />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/feedback">
        {() => (
          <DashboardLayout>
            <FeedbackManager />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/campaigns">
        {() => (
          <DashboardLayout>
            <CampaignsManager />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/system-logs">
        {() => (
          <DashboardLayout>
            <SystemLogs />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/analytics">
        {() => (
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/profile">
        {() => (
          <DashboardLayout>
            <ProfileSettings />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/dashboard/notifications">
        {() => (
          <DashboardLayout>
            <Notifications />
          </DashboardLayout>
        )}
      </Route>
      
      {/* Redirect root to dashboard or login */}
      <Route path="/">
        {() => {
          if (user) {
            setLocation(user.role === 'admin' ? "/admin" : "/dashboard");
          } else {
            setLocation("/login");
          }
          return null;
        }}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
