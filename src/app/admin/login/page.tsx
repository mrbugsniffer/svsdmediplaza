
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ADMIN_AUTH_KEY = 'svsdmediplaza_admin_auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if admin is already "logged in"
    if (localStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // --- IMPORTANT: This is NOT secure authentication ---
    // --- For demonstration purposes only. Use a real auth system for production. ---
    if (email === 'admin@example.com' && password === 'password') {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      toast({
        title: "Admin Login Successful",
        description: "Welcome to the Admin Portal.",
      });
      router.push('/admin/dashboard');
    } else {
      toast({
        title: "Admin Login Failed",
        description: "Invalid credentials. This is a demo, try 'admin@example.com' and 'password'.",
        variant: "destructive",
      });
    }
    // --- End of insecure demo authentication ---
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <ShieldCheck size={48} className="mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
          <CardDescription>Login to manage svsdmediplaza.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
