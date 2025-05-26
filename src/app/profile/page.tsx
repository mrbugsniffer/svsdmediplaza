
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, KeyRound, MailCheck, CalendarPlus, CalendarClock, ShieldAlert, MailQuestion, Edit3, Home } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { auth, db } from '@/lib/firebase'; // Import db
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserProfile, ShippingAddress } from '@/types';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    } else if (user) {
      setDisplayName(user.displayName || '');
      const fetchUserProfile = async () => {
        setProfileLoading(true);
        const userProfileRef = doc(db, 'userProfiles', user.uid);
        const docSnap = await getDoc(userProfileRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null); // No profile exists yet
        }
        setProfileLoading(false);
      };
      fetchUserProfile();
    }
  }, [user, loading, router]);

  const handleSendPasswordReset = async () => {
    if (!user || !user.email) {
      toast({ title: "Error", description: "User email not found.", variant: "destructive" });
      return;
    }
    setIsSendingResetEmail(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({ title: "Password Reset Email Sent", description: `A password reset link sent to ${user.email}.` });
    } catch (error: any) {
      toast({ title: "Error Sending Reset Email", description: error.message, variant: "destructive" });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (displayName.trim() === "") {
        toast({ title: "Validation Error", description: "Display name cannot be empty.", variant: "destructive" });
        return;
    }
    setIsUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      // Optionally update display name in userProfiles collection too if you store it there
      // const userProfileRef = doc(db, 'userProfiles', user.uid);
      // await setDoc(userProfileRef, { displayName: displayName.trim() }, { merge: true });
      toast({ title: "Profile Updated", description: "Display name updated successfully." });
      setIsEditProfileOpen(false);
    } catch (error: any) {
      toast({ title: "Profile Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (loading || profileLoading) {
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
    // This case should ideally be handled by the useEffect redirect, but as a fallback:
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

  const ProfileDetailItem = ({ icon: Icon, label, value, valueClassName }: { icon: React.ElementType, label: string, value: React.ReactNode, valueClassName?: string }) => (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-md border">
      <Icon size={20} className="text-primary mt-1 shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-medium text-foreground ${valueClassName || ''}`}>{value}</p>
      </div>
    </div>
  );
  
  const creationTime = user.metadata.creationTime ? format(new Date(user.metadata.creationTime), "MMMM d, yyyy 'at' h:mm a") : 'Not available';
  const lastSignInTime = user.metadata.lastSignInTime ? format(new Date(user.metadata.lastSignInTime), "MMMM d, yyyy 'at' h:mm a") : 'Not available';

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-6">
          <UserCircle size={64} className="mx-auto text-primary mb-3" />
          <CardTitle className="text-3xl font-bold">{user.displayName || 'Your Profile'}</CardTitle>
          <CardDescription>Manage your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground mb-2">Account Information</h3>
            {user.displayName && (
                 <ProfileDetailItem icon={UserCircle} label="Display Name" value={user.displayName} />
            )}
            <ProfileDetailItem icon={Mail} label="Email Address" value={user.email || 'Not available'} />
            <ProfileDetailItem 
              icon={user.emailVerified ? MailCheck : ShieldAlert} 
              label="Email Verified" 
              value={user.emailVerified ? 'Yes' : 'No'} 
              valueClassName={user.emailVerified ? 'text-green-600' : 'text-amber-600'}
            />
            {!user.emailVerified && (
                <p className="text-xs text-muted-foreground pl-9 -mt-2">
                    A verification email can be re-sent if needed. Some features may require a verified email.
                </p>
            )}
            <ProfileDetailItem icon={KeyRound} label="User ID" value={<span className="text-xs">{user.uid}</span>} />
            <ProfileDetailItem icon={CalendarPlus} label="Account Created" value={creationTime} />
            <ProfileDetailItem icon={CalendarClock} label="Last Sign-in" value={lastSignInTime} />
          </div>
          
          <Separator />

          <div>
             <h3 className="text-lg font-semibold text-foreground mb-3">Default Shipping Address</h3>
            {userProfile?.defaultShippingAddress ? (
              <div className="p-4 bg-muted/30 rounded-md border space-y-1 text-sm">
                <p><strong>{userProfile.defaultShippingAddress.fullName}</strong></p>
                <p>{userProfile.defaultShippingAddress.address}</p>
                <p>{userProfile.defaultShippingAddress.city}, {userProfile.defaultShippingAddress.postalCode}</p>
                <p>{userProfile.defaultShippingAddress.country}</p>
                {userProfile.defaultShippingAddress.phone && <p>Phone: {userProfile.defaultShippingAddress.phone}</p>}
                 <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/checkout')}>
                   Edit on Checkout Page
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-md border text-sm text-muted-foreground text-center">
                <Home size={24} className="mx-auto mb-2 text-primary" />
                No default shipping address set.
                <Button variant="link" className="block mx-auto p-0 h-auto mt-1" onClick={() => router.push('/checkout')}>
                    Add one during your next checkout.
                </Button>
              </div>
            )}
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Account Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full"><Edit3 size={16} className="mr-2" /> Edit Display Name</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Display Name</DialogTitle>
                      <DialogDescription>
                        Make changes to your display name here. Click save when you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="displayName" className="text-right col-span-1">
                          Name
                        </Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="col-span-3"
                          disabled={isUpdatingProfile}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isUpdatingProfile}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isUpdatingProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={isSendingResetEmail || !user.emailVerified} className="w-full">
                      <MailQuestion size={16} className="mr-2" /> 
                      {isSendingResetEmail ? 'Sending...' : 'Reset Password'}
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
                Password reset requires a verified email address. Please verify your email.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
