
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, FileText, Video, User, ChevronRight, Search } from "lucide-react";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Calendar className="w-12 h-12 text-care-primary" />,
      title: "Easy Appointment Booking",
      description: "Book appointments with specialized doctors using our intuitive scheduling system."
    },
    {
      icon: <Video className="w-12 h-12 text-care-primary" />,
      title: "Video Consultations",
      description: "Connect with your doctor through high-quality video consultations from anywhere."
    },
    {
      icon: <FileText className="w-12 h-12 text-care-primary" />,
      title: "Digital Prescriptions",
      description: "Receive and access your prescriptions digitally, available anytime in your account."
    },
  ];

  const testimonials = [
    {
      quote: "CareMate has transformed how I manage my healthcare. The video consultations save me so much time!",
      author: "Sarah Johnson",
      role: "Patient"
    },
    {
      quote: "As a doctor, this platform helps me reach more patients and manage my practice efficiently.",
      author: "Dr. Robert Chen",
      role: "Cardiologist"
    },
    {
      quote: "The prescription system is seamless. I can access my medication details anytime, anywhere.",
      author: "Michael Thompson",
      role: "Patient"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            {/* Updated logo with the new blue cross + heart logo */}
            <img 
              src="/public/lovable-uploads/fb497873-d154-4ea1-8f85-542123eda93d.png" 
              alt="CareMate Logo" 
              className="h-8 w-8" 
            />
            <span className="text-xl font-bold">CareMate</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="#features" className="text-gray-600 hover:text-care-primary">Features</Link>
            <Link to="#how-it-works" className="text-gray-600 hover:text-care-primary">How It Works</Link>
            <Link to="#testimonials" className="text-gray-600 hover:text-care-primary">Testimonials</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-care-light to-blue-50 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-care-dark">
              Healthcare at Your Fingertips
            </h1>
            <p className="text-lg mb-8 text-gray-700 max-w-md">
              Connect with doctors, book appointments, and receive care from anywhere with our comprehensive telehealth platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="#how-it-works" className="flex items-center">
                  Learn More <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            {/* Updated hero image with the new telemedicine consultation image */}
            <img 
              src="/public/lovable-uploads/9daa46c4-08f0-48ed-b764-325c5a131541.png" 
              alt="Virtual Doctor Consultation" 
              className="w-full max-w-md rounded-lg shadow-xl" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-care-dark">
            Why Choose CareMate
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-center text-care-dark">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-care-dark">
            How CareMate Works
          </h2>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center border-t-4 border-care-primary">
                <div className="bg-care-light p-4 rounded-full mb-4">
                  <User className="h-8 w-8 text-care-primary" />
                </div>
                <h3 className="font-bold mb-2">Create Account</h3>
                <p className="text-sm text-gray-600">Sign up as a patient or doctor in minutes.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <ChevronRight className="h-8 w-8 text-care-primary" />
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center border-t-4 border-care-primary">
                <div className="bg-care-light p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-care-primary" />
                </div>
                <h3 className="font-bold mb-2">Find a Doctor</h3>
                <p className="text-sm text-gray-600">Browse specialists based on your needs.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <ChevronRight className="h-8 w-8 text-care-primary" />
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center border-t-4 border-care-primary">
                <div className="bg-care-light p-4 rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-care-primary" />
                </div>
                <h3 className="font-bold mb-2">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule a convenient time for your consultation.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <ChevronRight className="h-8 w-8 text-care-primary" />
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center border-t-4 border-care-primary">
                <div className="bg-care-light p-4 rounded-full mb-4">
                  <Video className="h-8 w-8 text-care-primary" />
                </div>
                <h3 className="font-bold mb-2">Get Care</h3>
                <p className="text-sm text-gray-600">Connect via video and receive treatment online.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link to="/register">Start Using CareMate</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-care-dark">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="mb-4">
                  <svg className="h-8 w-8 text-care-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.51.884-3.995 3.097-3.995 5.389h4v10.459h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.511.884-3.996 3.097-3.996 5.389h4v10.459h-10z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4 italic">{testimonial.quote}</p>
                <div>
                  <h4 className="font-bold">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-care-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to experience better healthcare?</h2>
          <p className="text-lg mb-8 max-w-lg mx-auto">
            Join thousands of patients and doctors already using CareMate for their healthcare needs.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">Create Your Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4">
                {/* Updated footer logo */}
                <img 
                  src="/public/lovable-uploads/fb497873-d154-4ea1-8f85-542123eda93d.png" 
                  alt="CareMate Logo" 
                  className="h-8 w-8 bg-white rounded-lg p-1" 
                />
                <span className="text-xl font-bold text-white">CareMate</span>
              </Link>
              <p className="text-sm">
                Revolutionizing healthcare through telemedicine and digital solutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link to="#features" className="hover:text-white">Features</Link></li>
                <li><Link to="#how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link to="#testimonials" className="hover:text-white">Testimonials</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">FAQs</Link></li>
                <li><Link to="#" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white">HIPAA Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} CareMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
