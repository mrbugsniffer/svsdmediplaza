
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-4 text-lg text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    // This state should ideally be brief due to the redirect, but serves as a fallback.
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <UserCircle size={64} className="text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">Please log in to view your profile.</p>
        <Button asChild size="lg">
          <Link href="/login?redirect=/profile">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <UserCircle size={64} className="mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Your Profile</CardTitle>
          <CardDescription>Manage your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Mail size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium text-foreground">{user.email || 'Not available'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <KeyRound size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium text-foreground text-xs">{user.uid}</p>
              </div>
            </div>
             {user.displayName && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                    <UserCircle size={20} className="text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Display Name</p>
                        <p className="font-medium text-foreground">{user.displayName}</p>
                    </div>
                </div>
            )}
          </div>
          
          {/* Placeholder for future profile actions */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-foreground mb-3">Account Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
                <Button variant="outline" disabled>Change Password (Coming Soon)</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
