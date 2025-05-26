
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
    // If localStorage flag is set, verify Firebase auth state.
    if (localStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
      if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
        router.replace('/admin/dashboard');
      } else {
        // Clear stale or invalid localStorage flag if Firebase auth doesn't match
        localStorage.removeItem(ADMIN_AUTH_KEY);
        if (auth.currentUser) { // If logged in as someone else, log them out from admin context
            auth.signOut();
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast({
        title: "Admin Portal Access Denied",
        description: `Login restricted. This portal is only for the admin email: ${ADMIN_EMAIL}. You attempted with: ${email}.`,
        variant: "destructive",
        duration: 7000,
      });
      setIsLoading(false);
      return;
    }

    // Attempt Firebase Authentication for the ADMIN_EMAIL
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // If Firebase sign-in is successful for ADMIN_EMAIL
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      
      toast({
        title: "Admin Login Successful",
        description: `Welcome, ${ADMIN_EMAIL}! Redirecting to dashboard...`,
      });
      router.push('/admin/dashboard');

    } catch (firebaseError: any) {
      console.error("Admin Firebase sign-in error for", ADMIN_EMAIL, ":", firebaseError);
      let userFriendlyMessage = "An unexpected error occurred during admin login. Please try again.";

      if (firebaseError.code === 'auth/invalid-credential' || 
          firebaseError.code === 'auth/user-not-found' || 
          firebaseError.code === 'auth/wrong-password') {
        userFriendlyMessage = `Login attempt failed for admin ${ADMIN_EMAIL}. The password provided is incorrect. Please ensure the account exists in Firebase Authentication with the correct password and is enabled.`;
      } else if (firebaseError.code === 'auth/too-many-requests') {
        userFriendlyMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can try again later or reset the password via Firebase console.";
      } else if (firebaseError.code === 'auth/user-disabled') {
        userFriendlyMessage = `The admin account for ${ADMIN_EMAIL} has been disabled. Please enable it in the Firebase Authentication console.`;
      } else {
        userFriendlyMessage = `Firebase auth error: ${firebaseError.message}. Please check your Firebase setup.`;
      }
      
      toast({
        title: "Admin Authentication Failed",
        description: userFriendlyMessage,
        variant: "destructive",
        duration: 10000, 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Secondary effect to redirect if already logged in as admin (e.g. page refresh)
  useEffect(() => {
      if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL && localStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
          router.replace('/admin/dashboard');
      }
  }, [router]);


  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <ShieldCheck size={48} className="mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Admin Portal</CardTitle>
          <CardDescription>Login to manage SVSD mediplaza. <br/>Use your designated admin credentials ({ADMIN_EMAIL}).</CardDescription>
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
              {isLoading ? 'Logging in...' : 'Login to Admin Portal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    