
import { useState } from "react";
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
import { Star, Calendar, DollarSign, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock doctors data
const mockDoctors = [
  {
    id: "1",
    name: "Dr. Robert Chen",
    specialty: "Cardiologist",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    rating: 4.8,
    reviewCount: 124,
    experience: 12,
    fee: 150,
    nextAvailable: "Tomorrow",
    education: "Stanford University Medical School",
    languages: ["English", "Mandarin"],
  },
  {
    id: "2",
    name: "Dr. Sarah Johnson",
    specialty: "Neurologist",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    rating: 5.0,
    reviewCount: 89,
    experience: 8,
    fee: 175,
    nextAvailable: "Today",
    education: "Harvard Medical School",
    languages: ["English", "Spanish"],
  },
  {
    id: "3",
    name: "Dr. Michael Wong",
    specialty: "Dermatologist",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.5,
    reviewCount: 62,
    experience: 15,
    fee: 120,
    nextAvailable: "In 2 days",
    education: "Johns Hopkins University School of Medicine",
    languages: ["English", "French"],
  },
  {
    id: "4",
    name: "Dr. Jessica Patel",
    specialty: "Psychiatrist",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4.9,
    reviewCount: 157,
    experience: 10,
    fee: 190,
    nextAvailable: "Today",
    education: "Yale School of Medicine",
    languages: ["English", "Hindi", "Gujarati"],
  },
  {
    id: "5",
    name: "Dr. David Lee",
    specialty: "Orthopedic Surgeon",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 4.7,
    reviewCount: 104,
    experience: 20,
    fee: 200,
    nextAvailable: "In 3 days",
    education: "Mayo Clinic School of Medicine",
    languages: ["English", "Korean"],
  },
  {
    id: "6",
    name: "Dr. Emily Martinez",
    specialty: "Pediatrician",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    rating: 4.9,
    reviewCount: 132,
    experience: 7,
    fee: 130,
    nextAvailable: "Tomorrow",
    education: "Columbia University College of Physicians and Surgeons",
    languages: ["English", "Spanish"],
  },
];

// List of specialties for filter
const specialties = ["All Specialties", "Cardiologist", "Neurologist", "Dermatologist", "Psychiatrist", "Orthopedic Surgeon", "Pediatrician"];

const DoctorSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [maxFee, setMaxFee] = useState(200);
  const [sortBy, setSortBy] = useState("rating");

  // Filter doctors based on search and filters
  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
                         
    const matchesSpecialty = selectedSpecialty === "All Specialties" || 
                           doctor.specialty === selectedSpecialty;
                           
    const matchesFee = doctor.fee <= maxFee;
    
    return matchesSearch && matchesSpecialty && matchesFee;
  });
  
  // Sort doctors based on selected criteria
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    if (sortBy === "experience") {
      return b.experience - a.experience;
    }
    if (sortBy === "fee") {
      return a.fee - b.fee;
    }
    return 0;
  });

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
                      {specialties.map(specialty => (
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
                    max={300}
                    step={10}
                    onValueChange={(values) => setMaxFee(values[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm">$0</span>
                    <span className="text-sm font-medium">${maxFee}</span>
                    <span className="text-sm">$300</span>
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
              <Button variant="secondary" className="w-full">
                Use AI Assistant
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Doctor List - Right Side */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              Showing {sortedDoctors.length} doctors
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
          <div className="space-y-4">
            {sortedDoctors.length > 0 ? (
              sortedDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden card-hover">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Doctor image - left side */}
                      <div className="md:w-1/4 p-6 flex flex-col justify-center items-center border-r bg-card">
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                          <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-center">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium ml-1">{doctor.rating}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({doctor.reviewCount})
                          </span>
                        </div>
                      </div>
                      
                      {/* Doctor info - middle */}
                      <div className="md:w-2/4 p-6">
                        <h3 className="text-xl font-bold">{doctor.name}</h3>
                        <p className="text-care-primary font-medium">{doctor.specialty}</p>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start">
                            <div className="w-24 text-sm text-muted-foreground">Education:</div>
                            <div className="flex-1 text-sm">{doctor.education}</div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-24 text-sm text-muted-foreground">Experience:</div>
                            <div className="flex-1 text-sm">{doctor.experience} years</div>
                          </div>
                          <div className="flex items-start">
                            <div className="w-24 text-sm text-muted-foreground">Languages:</div>
                            <div className="flex-1 text-sm">
                              {doctor.languages.join(", ")}
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
                          <p className="font-medium">{doctor.nextAvailable}</p>
                          
                          <div className="flex items-center mt-3 mb-2 text-sm">
                            <DollarSign className="h-4 w-4 mr-2 text-care-primary" />
                            <span>Consultation Fee:</span>
                          </div>
                          <p className="font-medium text-lg">${doctor.fee}</p>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <Button asChild className="w-full">
                            <Link to={`/book-appointment/${doctor.id}`}>Book Appointment</Link>
                          </Button>
                          <Button variant="outline" asChild className="w-full">
                            <Link to={`/doctors/${doctor.id}`}>View Profile</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
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
    </div>
  );
};

export default DoctorSearch;
