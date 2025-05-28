import LoginForm from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-600">
      <Card className="max-w-md w-full mx-4 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <i className="ri-island-line text-5xl text-primary"></i>
            </div>
            <h1 className="text-3xl font-bold text-primary-600 mb-2">IslandLoaf</h1>
            <p className="text-neutral-600">Vendor Dashboard Login</p>
          </div>
          
          <LoginForm />
          
          {/* Vendor Signup Call-to-Action - Force Visible */}
          <div className="mt-8 pt-6 border-t-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-blue-800 mb-2">
                🏝️ Join IslandLoaf as a Vendor
              </p>
              <p className="text-sm text-blue-600">
                List your tourism business and reach thousands of travelers
              </p>
            </div>
            <Link href="/vendor-signup">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg">
                🚀 Start Your Vendor Application
              </Button>
            </Link>
            <p className="text-xs text-blue-500 mt-3 text-center font-medium">
              ✅ No setup fees • ✅ 24/7 support • ✅ Instant approval
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
