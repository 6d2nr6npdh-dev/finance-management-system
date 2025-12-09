import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at:  string;
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/user/:userId/settings");
  const userId = params?.userId;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data:  { user } } = await supabase. auth.getUser();
      
      if (! user) {
        setLocation("/");
        return;
      }

      // Verify the userId in the URL matches the logged-in user
      if (userId && userId !== user.id) {
        setLocation(`/user/${user.id}/settings`);
        return;
      }

      // Load user profile
      const { data: profileData, error:  profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        setIsLoading(false);
        return;
      }

      const profileWithEmail = {
        ...profileData,
        email: user.email || '',
      };

      setProfile(profileWithEmail as UserProfile);
      
      // Set form default values
      reset({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
      });

      setIsLoading(false);
    };

    loadProfile();
  }, [userId]);

  const onSubmit = async (values: ProfileFormData) => {
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSaveError("Not authenticated");
        return;
      }

      // Update profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: values.full_name,
          phone: values.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        setSaveError(error.message);
        return;
      }

      // Reload profile
      const { data: updatedProfile } = await supabase
        . from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        setProfile({
          ...updatedProfile,
          email: user.email || '',
        } as UserProfile);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveError("An unexpected error occurred");
    }
  };

  if (isLoading) {
    return (
      <Layout title="Settings" description="Manage your account settings and preferences.">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading... </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout title="Settings" description="Manage your account settings and preferences.">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Profile not found</div>
        </div>
      </Layout>
    );
  }

  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Layout title="Settings" description="Manage your account settings and preferences.">
       <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} />
                    ) : null}
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" disabled>Change Avatar</Button>
                    <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input 
                        id="full_name" 
                        {... register("full_name")}
                      />
                      {errors.full_name && (
                        <p className="text-red-600 text-sm">{errors. full_name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={profile.email} 
                        disabled 
                        className="bg-muted"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        {... register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm">{errors.phone. message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Account Created</Label>
                      <Input 
                        value={new Date(profile.created_at).toLocaleDateString()} 
                        disabled 
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-green-600 text-sm">Profile updated successfully!</p>
                    </div>
                  )}

                  {saveError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{saveError}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                     <Button type="submit" disabled={isSubmitting}>
                       {isSubmitting ? "Saving..." : "Save Changes"}
                     </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
             <Card className="max-w-2xl">
               <CardHeader>
                 <CardTitle>Security Settings</CardTitle>
                 <CardDescription>Manage your password and security preferences.</CardDescription>
               </CardHeader>
               <CardContent className="py-8 text-center text-muted-foreground">
                 <p>Password change and security settings coming soon.</p>
                 <p className="text-sm mt-2">For now, you can reset your password via email.</p>
               </CardContent>
             </Card>
          </TabsContent>
       </Tabs>
    </Layout>
  );
}