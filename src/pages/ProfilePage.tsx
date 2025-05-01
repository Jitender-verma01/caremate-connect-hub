
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, User, UserCog, Lock, Stethoscope, Calendar, FileText, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientProfileForm } from "@/components/PatientProfileForm";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().optional(),
});

const passwordFormSchema = z.object({
  oldPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber ? String(user.phoneNumber) : "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch profile data based on user role
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        if (user.role === "patient") {
          try {
            const response = await api.patients.getProfile();
            setPatientProfile(response.data);
          } catch (error) {
            console.log("No patient profile found or error fetching profile");
          }
        } else if (user.role === "doctor") {
          try {
            const response = await api.doctors.getProfile();
            setDoctorProfile(response.data);
          } catch (error) {
            console.log("No doctor profile found or error fetching profile");
          }
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      // Update form values when user data is loaded
      profileForm.reset({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber ? String(user.phoneNumber) : "",
      });
      
      fetchProfileData();
    }
  }, [user]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      await api.auth.updateAccountDetails({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber ? parseInt(data.phoneNumber) : undefined,
      });
      toast.success("Account details updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update account details. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      await api.auth.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password. Please check your old password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateProfile = () => {
    setCreateProfileOpen(true);
  };

  const handleProfileCreated = () => {
    setCreateProfileOpen(false);
    toast.success("Profile created successfully! Refreshing data...");
    // Refresh profile data
    if (user?.role === "patient") {
      api.patients.getProfile().then((response) => {
        setPatientProfile(response.data);
      });
    } else if (user?.role === "doctor") {
      api.doctors.getProfile().then((response) => {
        setDoctorProfile(response.data);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={patientProfile?.profileImage || doctorProfile?.profileImage} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          <p className="text-muted-foreground capitalize">{user?.role}</p>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="profile">{user?.role === 'patient' ? 'Patient Profile' : 'Doctor Profile'}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Account Information</CardTitle>
              </div>
              <CardDescription>Update your account details here</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>Update your password here</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Current password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input placeholder="New password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Confirm new password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          {user?.role === 'patient' ? (
            patientProfile ? (
              <PatientProfileSection 
                patient={patientProfile} 
                isLoading={isLoadingProfile} 
              />
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    <CardTitle>Patient Profile</CardTitle>
                  </div>
                  <CardDescription>Create your patient profile to access all features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground mb-4">No patient profile found. Please create one to access all features of the platform.</p>
                    <Button onClick={handleCreateProfile}>Create Patient Profile</Button>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            doctorProfile ? (
              <DoctorProfileSection 
                doctor={doctorProfile} 
                isLoading={isLoadingProfile} 
              />
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <CardTitle>Doctor Profile</CardTitle>
                  </div>
                  <CardDescription>Set up your professional profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground mb-4">You need to create your professional profile to start accepting appointments.</p>
                    <Button onClick={handleCreateProfile}>Create Doctor Profile</Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for creating a new profile */}
      <Dialog open={createProfileOpen} onOpenChange={setCreateProfileOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Your {user?.role === 'patient' ? 'Patient' : 'Doctor'} Profile</DialogTitle>
            <DialogDescription>
              Please fill in the required information to set up your profile.
            </DialogDescription>
          </DialogHeader>
          
          {user?.role === 'patient' ? (
            <PatientProfileForm onSuccess={handleProfileCreated} />
          ) : (
            <DoctorProfileForm onSuccess={handleProfileCreated} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Patient Profile Section Component
const PatientProfileSection = ({ patient, isLoading }: { patient: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserCog className="h-5 w-5 text-primary" />
          <CardTitle>Patient Profile</CardTitle>
        </div>
        <CardDescription>Your medical profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Date of Birth</h3>
              <p>{formatDate(patient.date_of_birth)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Gender</h3>
              <p>{patient.gender || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Blood Group</h3>
              <p>{patient.blood_group || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Emergency Contact</h3>
              <p>{patient.emergency_contact || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-medium text-sm text-muted-foreground">Address</h3>
              <p>{patient.address || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-medium text-sm text-muted-foreground">About</h3>
              <p>{patient.About || 'N/A'}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Update Patient Profile</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Patient Profile</DialogTitle>
              <DialogDescription>
                Make changes to your medical profile information.
              </DialogDescription>
            </DialogHeader>
            <PatientProfileForm existingProfile={patient} onSuccess={() => window.location.reload()} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

// Doctor Profile Section Component
const DoctorProfileSection = ({ doctor, isLoading }: { doctor: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <CardTitle>Professional Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Specialization</h3>
                <p>{doctor.specialization || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Experience</h3>
                <p>{doctor.experience ? `${doctor.experience} years` : 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Qualification</h3>
                <p>{doctor.qualification || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Consultation Fee</h3>
                <p>{doctor.fees ? `₹${doctor.fees}` : 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <p className={doctor.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                  {doctor.status === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Update Professional Information</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Update Doctor Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your professional information.
                </DialogDescription>
              </DialogHeader>
              <DoctorProfileForm existingProfile={doctor} onSuccess={() => window.location.reload()} />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Availability</CardTitle>
          </div>
          <CardDescription>Manage your consultation slots</CardDescription>
        </CardHeader>
        <CardContent>
          {doctor.available_time_slots && doctor.available_time_slots.length > 0 ? (
            <div className="space-y-4">
              {doctor.available_time_slots.map((slot: any, index: number) => (
                <div key={index} className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">{slot.day}</h3>
                  <div className="flex flex-wrap gap-2">
                    {slot.times.map((time: any, timeIndex: number) => (
                      <span 
                        key={timeIndex} 
                        className={`px-3 py-1 text-sm rounded-full ${
                          time.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {time.time} ({time.status})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No availability slots set up yet.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline">Manage Availability</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Patients</CardTitle>
          </div>
          <CardDescription>Your recent patients</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">Patient list will be displayed here.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Prescriptions</CardTitle>
          </div>
          <CardDescription>Recent prescriptions you've written</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">Recent prescriptions will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
