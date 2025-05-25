
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

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if admin is already "logged in" via localStorage
    if (localStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
      // Optionally, you could also check Firebase auth state here if needed
      // For instance, if Firebase auth state is lost but localStorage persists.
      // However, the AdminLayout primarily relies on localStorage for route protection.
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // --- IMPORTANT: This is NOT fully secure authentication for a real production admin portal ---
    // This section demonstrates a basic check and Firebase sign-in.
    // For production, a robust backend authentication with role management is essential.

    if (email === 'admin@gmail.com' && password === 'password') {
      try {
        // Attempt to sign in the admin user with Firebase as well
        // This is useful if Firestore rules check request.auth != null
        await signInWithEmailAndPassword(auth, email, password);
        
        // If Firebase sign-in is successful, set the local flag
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
        
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the Admin Portal. Firebase sign-in also succeeded.",
        });
        router.push('/admin/dashboard');

      } catch (firebaseError: any) {
        // Handle Firebase sign-in errors
        console.error("Admin Firebase sign-in error:", firebaseError);
        // Even if Firebase sign-in fails (e.g., user not found in Firebase Auth, wrong Firebase password),
        // we might still allow access to the admin UI based on hardcoded credentials for demo purposes,
        // but show a more specific error. Or, you could choose to block access entirely.
        // For this example, we'll show an error but still proceed if hardcoded check passed.
        // This decision depends on how strictly you want to tie the demo admin to Firebase Auth.

        // For now, let's assume if hardcoded check passes, local storage is set.
        // But we should definitely inform about the Firebase auth issue.
        localStorage.setItem(ADMIN_AUTH_KEY, 'true'); // Still setting for UI demo
        toast({
          title: "Admin Login (Partial)",
          description: "Demo access granted. However, Firebase sign-in failed: " + firebaseError.message,
          variant: "destructive",
          duration: 7000,
        });
        // Decide if you want to redirect or not if Firebase auth fails.
        // For this demo, we'll redirect, as the UI protection relies on localStorage.
         router.push('/admin/dashboard');

        // If you want to block access if Firebase Auth fails for the admin:
        // toast({
        //   title: "Admin Login Failed",
        //   description: "Firebase authentication for admin failed: " + firebaseError.message,
        //   variant: "destructive",
        // });
        // setIsLoading(false);
        // return;
      }
    } else {
      toast({
        title: "Admin Login Failed",
        description: "Invalid local credentials. This is a demo, try 'admin@gmail.com' and 'password'.",
        variant: "destructive",
      });
    }
    // --- End of modified demo authentication ---
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
                placeholder="admin@gmail.com" 
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
