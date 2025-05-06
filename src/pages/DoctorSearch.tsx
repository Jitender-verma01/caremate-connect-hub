
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, Calendar, DollarSign, ChevronDown, User, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDoctors } from "@/hooks/useDoctors";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// List of specialties for filter
const SPECIALIZATIONS = [
  "All Specialties", 
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Psychiatry",
  "Dental",
];

// Some mock languages for display
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "Arabic", "Chinese", "German"];

const DoctorSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [maxFee, setMaxFee] = useState(1000);
  const [sortBy, setSortBy] = useState("rating");
  const { user } = useAuth();

  // Fetch doctors using our hook
  const { data: doctorsData, isLoading, error, refetch } = useDoctors({
    specialization: selectedSpecialty === "All Specialties" ? undefined : selectedSpecialty,
    name: searchTerm,
  });
  
  // Show error toast if there's an issue fetching doctors
  useEffect(() => {
    if (error) {
      toast.error("Error loading doctors. Please try again.");
      console.error("Doctor fetch error:", error);
    }
  }, [error]);
  
  const doctors = doctorsData || [];
  console.log("Doctors data in search component:", doctors);
  
  // Filter doctors based on fee
  const filteredDoctors = doctors.filter(doctor => {
    const matchesFee = doctor.fee <= maxFee;    
    return matchesFee;
  });
  
  // Sort doctors based on selected criteria
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === "experience") {
      return b.experience - a.experience;
    }
    if (sortBy === "fee") {
      return a.fee - b.fee;
    }
    return 0;
  });

  // Helper function to get random languages for a doctor
  const getDoctorLanguages = (doctorId: string) => {
    // Use doctor ID as seed for consistent random selection
    const seed = doctorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...LANGUAGES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2 + (seed % 2)); // Return 2-3 languages
  };

  // Check if user is a doctor
  const isDoctor = user?.role === 'doctor';

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
          <p className="text-muted-foreground">
            Browse our network of specialists and book an appointment
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters - Left Side */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Search Filters</h2>
              
              {/* Search input */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Search by name or specialty
                </label>
                <Input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Specialty filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Specialty
                </label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Medical Specialties</SelectLabel>
                      {SPECIALIZATIONS.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price range filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Maximum Consultation Fee
                </label>
                <div className="space-y-2">
                  <Slider
                    defaultValue={[maxFee]}
                    max={3000}
                    step={10}
                    onValueChange={(values) => setMaxFee(values[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm">$0</span>
                    <span className="text-sm font-medium">${maxFee}</span>
                    <span className="text-sm">$3000</span>
                  </div>
                </div>
              </div>
              
              {/* Sort by */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort Options</SelectLabel>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="experience">Most Experienced</SelectItem>
                      <SelectItem value="fee">Lowest Fee</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Need Help?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Not sure which specialist is right for your symptoms? Our AI Assistant can help you find the right doctor.
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/aiassistance">Use AI Assistant</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Doctor List - Right Side */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              {isLoading ? 'Loading doctors...' : `Showing ${sortedDoctors.length} doctors`}
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Calendar className="h-4 w-4 mr-2" />
                Availability
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          {/* Doctor cards list */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 p-6 flex flex-col justify-center items-center border-r bg-card">
                        <Skeleton className="w-24 h-24 rounded-full" />
                        <Skeleton className="w-16 h-4 mt-3" />
                      </div>
                      <div className="md:w-2/4 p-6">
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-28 mb-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <div className="md:w-1/4 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l bg-muted/30">
                        <div>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-6 w-16 mb-4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-6 w-16 mt-2" />
                        </div>
                        <div className="space-y-2 mt-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-medium mb-2">Error loading doctors</h3>
                <p className="text-muted-foreground mb-4">
                  We encountered an issue while loading the doctors. Please try again.
                </p>
                <Button onClick={() => refetch()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : sortedDoctors.length > 0 ? (
            <div className="space-y-4">
              {sortedDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden card-hover">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Doctor image - left side */}
                      <div className="md:w-1/4 p-6 flex flex-col justify-center items-center border-r bg-card">
                        <Avatar className="w-24 h-24 border-2 border-muted">
                          <AvatarImage
                            src={doctor.image || "/placeholder.svg"}
                            alt={doctor.name}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {doctor.name?.substring(0, 2).toUpperCase() || "DR"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center justify-center mt-3">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium ml-1">{doctor.rating?.toFixed(1) || "4.5"}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({doctor.reviewCount || "25"})
                          </span>
                        </div>
                      </div>
                      
                      {/* Doctor info - middle */}
                      <div className="md:w-2/4 p-6">
                        <h3 className="text-xl font-bold">{doctor.name || "Unknown Doctor"}</h3>
                        <p className="text-care-primary font-medium">{doctor.specialty || "General"}</p>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start">
                            <div className="w-24 text-sm text-muted-foreground">Education:</div>
                            <div className="flex-1 text-sm">Medical Doctor</div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-24 text-sm text-muted-foreground">Experience:</div>
                            <div className="flex-1 text-sm">{doctor.experience || 0} years</div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-24 text-sm text-muted-foreground">Languages:</div>
                            <div className="flex-1 text-sm">
                              {getDoctorLanguages(doctor.id).join(", ")}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {["Online Consultation", "Prescription"].map((tag, index) => (
                            <Badge variant="secondary" key={index}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action buttons - right side */}
                      <div className="md:w-1/4 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l bg-muted/30">
                        <div>
                          <div className="flex items-center mb-3 text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-care-primary" />
                            <span>Next Available:</span>
                          </div>
                          <p className="font-medium">Today</p>
                          
                          <div className="flex items-center mt-3 mb-2 text-sm">
                            <DollarSign className="h-4 w-4 mr-2 text-care-primary" />
                            <span>Consultation Fee:</span>
                          </div>
                          <p className="font-medium text-lg">${doctor.fee || 0}</p>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          {!isDoctor && (
                            <Button asChild className="w-full">
                              <Link to={`/book-appointment/${doctor.id}`}>Book Appointment</Link>
                            </Button>
                          )}
                          <Button variant="outline" asChild className="w-full">
                            <Link to={`/doctors/${doctor.id}`}>View Profile</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No doctors found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialty("All Specialties");
                  setMaxFee(200);
                }}>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;
