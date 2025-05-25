
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import signInWithEmailAndPassword

const ADMIN_AUTH_KEY = 'svsdmediplaza_admin_auth';
const ADMIN_EMAIL = 'admin@gmail.com'; // Define admin email

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If localStorage flag is set, attempt to redirect.
    // AdminLayout will perform the more robust auth check.
    if (localStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (email !== ADMIN_EMAIL) {
      toast({
        title: "Admin Login Failed",
        description: `Only the designated admin email (${ADMIN_EMAIL}) can access this portal.`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to sign in the admin user with Firebase.
      // The password must match the one set for ADMIN_EMAIL in Firebase Authentication.
      await signInWithEmailAndPassword(auth, email, password);
      
      // If Firebase sign-in is successful, set the local flag
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      
      toast({
        title: "Admin Login Successful",
        description: "Firebase authentication succeeded. Welcome to the Admin Portal.",
      });
      router.push('/admin/dashboard');

    } catch (firebaseError: any) {
      // Handle Firebase sign-in errors
      console.error("Admin Firebase sign-in error:", firebaseError);
      let errorMessage = firebaseError.message || "An unknown Firebase error occurred.";
      // Provide more user-friendly messages for common auth errors
      if (firebaseError.code === 'auth/invalid-credential' || 
          firebaseError.code === 'auth/user-not-found' || 
          firebaseError.code === 'auth/wrong-password') {
        errorMessage = `Invalid credentials for ${ADMIN_EMAIL}. Please check the password. Ensure this account is registered in Firebase Authentication.`;
      } else if (firebaseError.code === 'auth/too-many-requests') {
        errorMessage = "Access temporarily disabled due to too many failed login attempts. Please try again later.";
      }
      
      toast({
        title: "Admin Login Failed",
        description: `Firebase Authentication Error: ${errorMessage}`,
        variant: "destructive",
        duration: 8000, // Longer duration for important errors
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <ShieldCheck size={48} className="mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
          <CardDescription>Login to manage SVSD mediplaza. <br/>Use your designated admin credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={ADMIN_EMAIL} 
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
                placeholder="Enter Firebase password" 
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
