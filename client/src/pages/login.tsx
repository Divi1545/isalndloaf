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
            <p className="text-neutral-600">Tourism Management Platform</p>
          </div>
          
          <LoginForm />
          
          {/* Vendor Sign Up Link - Simple approach */}
          <div className="mt-6 text-center">
            <span className="text-sm">Don't have an account? </span>
            <Link href="/vendor-signup">
              <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                Sign up as Vendor
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Vendor Signup - Outside Card */}
      <div className="mt-4 w-full max-w-md mx-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-sm text-gray-700 mb-3">Want to join IslandLoaf as a vendor?</p>
          <Link href="/vendor-signup">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Become a Vendor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
