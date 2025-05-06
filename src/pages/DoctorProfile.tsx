
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, DollarSign, Clock, MapPin, Phone, Mail, FileText, MessageSquare } from "lucide-react";
import { useDoctor } from "@/hooks/useDoctors";

// Mock doctor data - in a real app, fetch this from API based on ID
const mockDoctor = {
  id: "1",
  name: "Dr. Robert Chen",
  specialty: "Cardiologist",
  image: "https://randomuser.me/api/portraits/men/52.jpg",
  rating: 4.8,
  reviewCount: 124,
  experience: 12,
  fee: 150,
  qualifications: "Stanford University Medical School",
  address: "123 Medical Center Dr, San Francisco, CA",
  phone: "+1 (555) 123-4567",
  email: "dr.chen@caremate.com",
  about: "Dr. Robert Chen is a board-certified cardiologist with over 12 years of experience in treating cardiovascular diseases. He specializes in preventive cardiology, heart failure management, and cardiac imaging. Dr. Chen completed his fellowship at Stanford Medical Center and has published numerous research papers in leading medical journals.",
  languages: ["English", "Mandarin"],
  available_time_slots: {
    monday: ["9:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"],
    tuesday: ["9:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"],
    wednesday: ["9:00 AM - 1:00 PM"],
    thursday: ["2:00 PM - 8:00 PM"],
    friday: ["9:00 AM - 1:00 PM", "2:00 PM - 5:00 PM"],
    saturday: ["10:00 AM - 2:00 PM"],
    sunday: []
  },
  reviews: [
    {
      id: "rev1",
      patient: "John D.",
      rating: 5,
      date: "2025-03-15",
      comment: "Dr. Chen was very thorough and took the time to explain everything. Highly recommended!"
    },
    {
      id: "rev2",
      patient: "Sarah M.",
      rating: 4,
      date: "2025-03-02",
      comment: "Great doctor, but had to wait a bit longer than expected for my appointment."
    },
    {
      id: "rev3",
      patient: "Michael T.",
      rating: 5,
      date: "2025-02-18",
      comment: "Dr. Chen is excellent! He provided a clear treatment plan and followed up personally."
    }
  ]
};

const DoctorProfile = () => {
  const { id } = useParams<{ id: string }>();
  // In a real app, fetch doctor data based on ID
  // const { data: doctor, isLoading } = useQuery({ queryKey: ['doctor', id], queryFn: () => fetchDoctor(id) });
  
  const {data: doctorData, isLoading} = useDoctor(id || "");
  
  const doctor = doctorData || mockDoctor; // Using mock data for now
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`w-4 h-4 ${index < Math.floor(rating) ? "fill-yellow-500 text-yellow-500" : index < rating ? "fill-yellow-500 text-yellow-500 fill-opacity-50" : ""}`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Doctor Info Card */}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Doctor image and basic info */}
            <div className="md:w-1/3 p-6 flex flex-col items-center justify-center bg-muted/20">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-care-light mb-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-center">{doctor.name}</h1>
              <p className="text-care-primary font-medium mb-2">{doctor.specialty}</p>
              <div className="flex items-center mb-4">
                {renderStars(doctor.rating)}
                <span className="ml-2 text-sm">{doctor.rating} ({doctor.reviewCount} reviews)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Experience</span>
                  <span className="font-medium">{doctor.experience} yrs</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Fee</span>
                  <span className="font-medium">${doctor.fee}</span>
                </div>
              </div>
              <div className="mt-6 w-full">
                <Button asChild className="w-full">
                  <Link to={`/book-appointment/${doctor.id}`}>Book Appointment</Link>
                </Button>
              </div>
            </div>
            
            {/* Doctor details tabs */}
            <div className="md:w-2/3 p-6">
              <Tabs defaultValue="about">
                <TabsList className="mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium mb-2">About</h2>
                    <p className="text-muted-foreground">{doctor.about}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-medium mb-2">Education</h2>
                    <p>{(doctor as any).qualification}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-medium mb-2">Languages</h2>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages}
                    </div>
                  </div>
                  
                  {/* <div className="space-y-3">
                    <h2 className="text-lg font-medium">Contact Information</h2>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 text-care-primary" />
                      <span>{doctor.address}</span>
                    </div>
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 mr-3 text-care-primary" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 mr-3 text-care-primary" />
                      <span>{doctor.email}</span>
                    </div>
                  </div> */}
                </TabsContent>
                
                <TabsContent value="schedule">
                  <h2 className="text-lg font-medium mb-4">Weekly Schedule</h2>
                  {doctor.available_time_slots && doctor.available_time_slots.length > 0 ? (
                    <div className="space-y-4">
                      {doctor.available_time_slots.map((slot, index) => (
                        <div key={index} className="flex border-b pb-3 last:border-0">
                          <div className="w-1/3 font-medium capitalize">{slot.day}</div>
                          <div className="w-2/3">
                            <div className="flex flex-wrap gap-2">
                              {slot.times.map((time, timeIndex) => (
                                <span 
                                  key={timeIndex} 
                                  className={`px-3 py-1 text-sm rounded-full ${
                                    time.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  <Clock className="w-4 h-4 mr-2 text-care-primary" />
                                  {time.time} ({time.status})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No availability slots set up yet.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-medium">Patient Reviews</h2>
                      <p className="text-sm text-muted-foreground">Based on {doctor.reviewCount} reviews</p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(doctor.rating)}
                      </div>
                      <span className="font-medium">{doctor.rating}</span>
                    </div>
                  </div>
                  
                  {/* <div className="space-y-6">
                    {doctor.reviews.map(review => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{review.patient}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div> */}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Similar doctors section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Similar Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="card-hover">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${20 + i * 10}.jpg`}
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">Dr. Example Name</h3>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>4.{5 + i}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>${120 + i * 10}</span>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full">
                  <Link to={`/doctors/${i + 2}`}>View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
