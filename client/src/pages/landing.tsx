import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Shield, Users, UserCheck, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleRoleLogin = async (role: 'admin' | 'project') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
        credentials: 'include'
      });
      
      if (response.ok) {
        // Force page refresh to update auth state
        window.location.href = '/';
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
              <Rocket className="text-white h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Decubate IDO Platform</h1>
          <p className="text-xl text-gray-600 mb-2">Secure internal platform for IDO preparation and management</p>
          <p className="text-sm text-gray-500">Select your role to access the appropriate dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="text-blue-600 h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-xl">Administrator</CardTitle>
              <CardDescription className="text-sm">
                Manage all projects, create new IDOs, and oversee the entire platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={() => handleRoleLogin('admin')} 
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? "Signing in..." : "Continue as Admin"}
              </Button>
              <div className="mt-3 text-xs text-gray-500 text-center">
                • Full project management<br/>
                • Create and delete projects<br/>
                • Access all project data
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-green-600 h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-xl">Project User</CardTitle>
              <CardDescription className="text-sm">
                Access your assigned project and manage IDO preparation details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={() => handleRoleLogin('project')} 
                className="w-full"
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                {isLoading ? "Signing in..." : "Continue as Project User"}
              </Button>
              <div className="mt-3 text-xs text-gray-500 text-center">
                • Edit assigned project<br/>
                • Update IDO metrics<br/>
                • Manage content and assets
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Internal Use Only</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Rocket className="h-4 w-4" />
            <span>IDO Management</span>
          </div>
        </div>
      </div>
    </div>
  );
}