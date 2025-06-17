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
import { useAuth } from "@/lib/auth-mock";
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
      setLocation("/dashboard");
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
      
      {/* Dashboard routes */}
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/dashboard/bookings" component={BookingManager} />
              <Route path="/dashboard/add-booking" component={AddBooking} />
              <Route path="/dashboard/calendar" component={CalendarSync} />
              <Route path="/dashboard/pricing" component={PricingEngine} />
              <Route path="/dashboard/ai-marketing" component={AiMarketing} />
              <Route path="/dashboard/ai-features" component={AIFeatures} />
              <Route path="/dashboard/ai-trainer" component={AIAgentTrainer} />
              <Route path="/dashboard/airtable" component={AirtableManager} />
              <Route path="/dashboard/services" component={ServicesManager} />
              <Route path="/dashboard/feedback" component={FeedbackManager} />
              <Route path="/dashboard/campaigns" component={CampaignsManager} />
              <Route path="/dashboard/system-logs" component={SystemLogs} />
              <Route path="/dashboard/analytics" component={Analytics} />
              <Route path="/dashboard/profile" component={ProfileSettings} />
              <Route path="/dashboard/notifications" component={Notifications} />
              <Route component={NotFound} />
            </Switch>
          </DashboardLayout>
        )}
      </Route>
      
      {/* Redirect root to dashboard or login */}
      <Route path="/">
        {() => {
          setLocation(user ? "/dashboard" : "/login");
          return null;
        }}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
