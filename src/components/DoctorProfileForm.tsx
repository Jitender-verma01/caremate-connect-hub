
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

const doctorProfileSchema = z.object({
  profileImage: z.instanceof(File).optional(),
  specialization: z.string().min(1, { message: "Specialization is required" }),
  fees: z.string().refine((val) => !isNaN(Number(val)), { message: "Fees must be a valid number" }),
  qualification: z.string().min(1, { message: "Qualification is required" }),
  experience: z.string().refine((val) => !isNaN(Number(val)), { message: "Experience must be a valid number" }),
});

type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>;

interface DoctorProfileFormProps {
  existingProfile?: any;
  onSuccess?: () => void;
}

export function DoctorProfileForm({
  existingProfile,
  onSuccess,
}: DoctorProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    existingProfile?.profileImage || null
  );

  console.log("Existing doctor profile for form:", existingProfile);

  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      specialization: existingProfile?.specialization || "",
      fees: existingProfile?.fees ? String(existingProfile.fees) : "",
      qualification: existingProfile?.qualification || "",
      experience: existingProfile?.experience ? String(existingProfile.experience) : "",
    },
  });

  const onSubmit = async (data: DoctorProfileFormValues) => {
    setIsSubmitting(true);

    try {
      console.log("Submitting doctor profile data:", data);
      
      if (existingProfile) {
        // Update existing profile
        const updateResponse = await api.doctors.updateDoctorProfile({
          specialization: data.specialization,
          fees: Number(data.fees),
          qualification: data.qualification,
          experience: Number(data.experience),
        });
        
        console.log("Profile update response:", updateResponse);

        // If there's a new profile image, update it separately
        if (data.profileImage) {
          const imageFormData = new FormData();
          imageFormData.append("profileImage", data.profileImage);
          const imageResponse = await api.doctors.updateProfileImage(imageFormData);
          console.log("Image update response:", imageResponse);
        }

        toast.success("Doctor profile updated successfully!");
      } else {
        // Create new profile
        // Create FormData for file upload
        const formData = new FormData();
        if (data.profileImage) {
          formData.append("profileImage", data.profileImage);
        }
        formData.append("specialization", data.specialization);
        formData.append("fees", data.fees);
        formData.append("qualification", data.qualification);
        formData.append("experience", data.experience);
        
        const createResponse = await api.doctors.createDoctor(formData);
        console.log("Profile creation response:", createResponse);
        
        toast.success("Doctor profile created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save doctor profile:", error);
      toast.error("Failed to save doctor profile. Please try again.");
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

  const specializations = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Urology",
    "General Medicine",
    "General Surgery",
    "Gynecology",
    "Ophthalmology",
    "ENT",
    "Pulmonology",
    "Radiology",
    "Other"
  ];

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
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialization *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {specializations.map((specialization) => (
                      <SelectItem key={specialization} value={specialization}>
                        {specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consultation Fees (₹) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience (Years) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qualification"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Qualifications *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="MBBS, MD, etc."
                    className="min-h-[80px]"
                    {...field}
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
