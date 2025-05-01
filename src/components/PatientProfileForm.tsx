
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const patientProfileSchema = z.object({
  profileImage: z.instanceof(File).optional(),
  date_of_birth: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  address: z.string().optional(),
  blood_group: z.string().min(1, { message: "Blood group is required" }),
  About: z.string().optional(),
  emergency_contact: z.string().optional(),
});

type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;

interface PatientProfileFormProps {
  existingProfile?: any;
  onSuccess?: () => void;
}

export function PatientProfileForm({
  existingProfile,
  onSuccess,
}: PatientProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    existingProfile?.profileImage || null
  );

  console.log("Existing patient profile for form:", existingProfile);

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      date_of_birth: existingProfile?.date_of_birth
        ? new Date(existingProfile.date_of_birth).toISOString().split("T")[0]
        : "",
      gender: existingProfile?.gender || "",
      address: existingProfile?.address || "",
      blood_group: existingProfile?.blood_group || "",
      About: existingProfile?.About || "",
      emergency_contact: existingProfile?.emergency_contact || "",
    },
  });

  const onSubmit = async (data: PatientProfileFormValues) => {
    setIsSubmitting(true);

    try {
      console.log("Submitting patient profile data:", data);
      
      if (existingProfile) {
        // Update existing profile
        const updateResponse = await api.patients.updateProfile({
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          address: data.address,
          blood_group: data.blood_group,
          About: data.About,
          emergency_contact: data.emergency_contact,
        });
        
        console.log("Profile update response:", updateResponse);

        // If there's a new profile image, update it separately
        if (data.profileImage) {
          const imageFormData = new FormData();
          imageFormData.append("profileImage", data.profileImage);
          await api.patients.updateProfileImage(imageFormData);
        }

        toast.success("Patient profile updated successfully!");
      } else {
        // Create new profile
        // Create FormData for file upload
        const formData = new FormData();
        if (data.profileImage) {
          formData.append("profileImage", data.profileImage);
        }
        formData.append("date_of_birth", data.date_of_birth);
        formData.append("gender", data.gender);
        formData.append("address", data.address || "");
        formData.append("blood_group", data.blood_group);
        formData.append("About", data.About || "");
        formData.append("emergency_contact", data.emergency_contact || "");
        
        const createResponse = await api.patients.createProfile(formData);
        console.log("Profile creation response:", createResponse);
        
        toast.success("Patient profile created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save patient profile:", error);
      toast.error("Failed to save patient profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("profileImage", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <FormLabel>Profile Image</FormLabel>
          <div className="flex items-center space-x-4">
            {selectedImage && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                <img
                  src={selectedImage}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="max-w-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blood_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Group *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergency_contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Emergency contact number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="About"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>About</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Tell us about yourself"
                    className="min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingProfile ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
}
