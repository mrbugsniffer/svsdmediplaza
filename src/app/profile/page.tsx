
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, KeyRound, MailCheck, CalendarPlus, CalendarClock, ShieldAlert, MailQuestion } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { auth } from '@/lib/firebase'; // Import auth directly
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  const handleSendPasswordReset = async () => {
    if (!user || !user.email) {
      toast({
        title: "Error",
        description: "User email not found. Cannot send reset email.",
        variant: "destructive",
      });
      return;
    }
    setIsSendingResetEmail(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Email Sent",
        description: `A password reset link has been sent to ${user.email}. Please check your inbox.`,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error Sending Reset Email",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };


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

  const ProfileDetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
      <Icon size={20} className="text-muted-foreground mt-1 shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
  
  const creationTime = user.metadata.creationTime ? format(new Date(user.metadata.creationTime), "PPPp") : 'Not available';
  const lastSignInTime = user.metadata.lastSignInTime ? format(new Date(user.metadata.lastSignInTime), "PPPp") : 'Not available';

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <UserCircle size={64} className="mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Your Profile</CardTitle>
          <CardDescription>Manage your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {user.displayName && (
                 <ProfileDetailItem icon={UserCircle} label="Display Name" value={user.displayName} />
            )}
            <ProfileDetailItem icon={Mail} label="Email Address" value={user.email || 'Not available'} />
            <ProfileDetailItem 
              icon={user.emailVerified ? MailCheck : ShieldAlert} 
              label="Email Verified" 
              value={
                <span className={user.emailVerified ? 'text-green-600' : 'text-amber-600'}>
                  {user.emailVerified ? 'Yes' : 'No'}
                  {!user.emailVerified && (
                    <span className="text-xs ml-2">(Verification email can be sent if needed)</span>
                  )}
                </span>
              } 
            />
            <ProfileDetailItem icon={KeyRound} label="User ID" value={<span className="text-xs">{user.uid}</span>} />
            <ProfileDetailItem icon={CalendarPlus} label="Account Created" value={creationTime} />
            <ProfileDetailItem icon={CalendarClock} label="Last Sign-in" value={lastSignInTime} />
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-foreground mb-3">Account Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={isSendingResetEmail}>
                      <MailQuestion size={16} className="mr-2" /> 
                      {isSendingResetEmail ? 'Sending Email...' : 'Send Password Reset Email'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to send a password reset email to {user.email}? 
                        You will be able to set a new password by following the link in the email.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSendPasswordReset} disabled={isSendingResetEmail} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isSendingResetEmail ? 'Processing...' : 'Send Email'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
            {!user.emailVerified && (
              <p className="text-xs text-muted-foreground mt-3">
                To change your password or manage other sensitive account settings, your email address must be verified first.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
