import LoginForm from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

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
        </CardContent>
      </Card>
    </div>
  );
}
