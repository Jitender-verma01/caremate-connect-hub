import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Star, Video, User, FileText, Search } from "lucide-react";

// Mock data
const upcomingAppointments = [
  {
    id: "appt-1",
    doctorName: "Dr. Sarah Johnson",
    doctorSpecialty: "Cardiologist",
    doctorImage: "https://randomuser.me/api/portraits/women/67.jpg",
    date: "2025-05-03",
    time: "10:30 AM",
    status: "confirmed",
  },
  {
    id: "appt-2",
    doctorName: "Dr. Michael Wong",
    doctorSpecialty: "Dermatologist",
    doctorImage: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "2025-05-10",
    time: "2:00 PM",
    status: "confirmed",
  },
];

const recentPrescriptions = [
  {
    id: "presc-1",
    doctorName: "Dr. Emily Chen",
    doctorSpecialty: "General Physician",
    date: "2025-04-20",
    medications: ["Amoxicillin 500mg", "Paracetamol 650mg"],
  },
  {
    id: "presc-2",
    doctorName: "Dr. James Wilson",
    doctorSpecialty: "ENT Specialist",
    date: "2025-04-15",
    medications: ["Cetirizine 10mg", "Vitamin C 500mg"],
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Simulate adding a notification on component mount
  useEffect(() => {
    // Only add a welcome notification once when component loads
    addNotification({
      userId: user?.id || '',
      message: "Welcome to CareMate! Your healthcare journey starts here.",
      type: "system"
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here's an overview of your health activities</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="bg-care-light p-3 rounded-full mb-3">
              <Search className="h-6 w-6 text-care-primary" />
            </div>
            <h3 className="font-medium">Find Doctors</h3>
            <Button variant="link" asChild className="mt-2">
              <Link to="/doctors">Browse Specialists</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="bg-care-light p-3 rounded-full mb-3">
              <Calendar className="h-6 w-6 text-care-primary" />
            </div>
            <h3 className="font-medium">Appointments</h3>
            <Button variant="link" asChild className="mt-2">
              <Link to="/appointments">View Schedule</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="bg-care-light p-3 rounded-full mb-3">
              <FileText className="h-6 w-6 text-care-primary" />
            </div>
            <h3 className="font-medium">Prescriptions</h3>
            <Button variant="link" asChild className="mt-2">
              <Link to="/prescriptions">View History</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="bg-care-light p-3 rounded-full mb-3">
              <User className="h-6 w-6 text-care-primary" />
            </div>
            <h3 className="font-medium">Profile</h3>
            <Button variant="link" asChild className="mt-2">
              <Link to="/profile">Manage Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled consultations</CardDescription>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link to="/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={appointment.doctorImage} 
                        alt={appointment.doctorName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{appointment.doctorName}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {appointment.time}
                    </div>
                  </div>
                  <Button asChild>
                    <Link to={`/consultation/${appointment.id}`}>
                      <Video className="w-4 h-4 mr-2" />
                      Join
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No upcoming appointments</h3>
                <p className="text-sm text-muted-foreground mb-4">Book a consultation with a specialist</p>
                <Button asChild>
                  <Link to="/doctors">Find Doctors</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Prescriptions</CardTitle>
              <CardDescription>Your latest medications</CardDescription>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link to="/prescriptions">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPrescriptions.map(prescription => (
              <div key={prescription.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{prescription.doctorName}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(prescription.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{prescription.doctorSpecialty}</p>
                <div className="space-y-1 mt-3">
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-care-primary mr-2"></div>
                      <span className="text-sm">{med}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-3" asChild size="sm">
                  <Link to={`/prescriptions/${prescription.id}`}>View Details</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Doctors */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recommended Doctors</h2>
          <Button variant="outline" asChild size="sm">
            <Link to="/doctors">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Doctor 1 */}
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-care-light">
                  <img
                    src="https://randomuser.me/api/portraits/men/52.jpg"
                    alt="Dr. Robert Chen"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg">Dr. Robert Chen</h3>
                <p className="text-sm text-muted-foreground">Cardiologist</p>
                <div className="flex items-center justify-center mt-2 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground ml-2">4.0</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link to="/doctors/1">View Profile</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Doctor 2 */}
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-care-light">
                  <img
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="Dr. Sarah Johnson"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg">Dr. Sarah Johnson</h3>
                <p className="text-sm text-muted-foreground">Neurologist</p>
                <div className="flex items-center justify-center mt-2 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm text-muted-foreground ml-2">5.0</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link to="/doctors/2">View Profile</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Doctor 3 */}
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-care-light">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Dr. Michael Wong"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg">Dr. Michael Wong</h3>
                <p className="text-sm text-muted-foreground">Dermatologist</p>
                <div className="flex items-center justify-center mt-2 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground ml-2">4.0</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link to="/doctors/3">View Profile</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Doctor 4 */}
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-care-light">
                  <img
                    src="https://randomuser.me/api/portraits/women/68.jpg"
                    alt="Dr. Jessica Patel"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg">Dr. Jessica Patel</h3>
                <p className="text-sm text-muted-foreground">Psychiatrist</p>
                <div className="flex items-center justify-center mt-2 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4" />
                  <Star className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground ml-2">3.0</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link to="/doctors/4">View Profile</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
