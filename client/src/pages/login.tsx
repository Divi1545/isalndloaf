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
          
          {/* Vendor Signup Call-to-Action */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Want to list your business on IslandLoaf?
            </p>
            <Link href="/vendor-signup">
              <Button variant="outline" className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 2-5 10-5-5 10-5z"/>
                </svg>
                Become a Vendor
              </Button>
            </Link>
            <p className="text-xs text-gray-500 mt-2">
              Join 1,000+ tourism businesses • No setup fees
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
