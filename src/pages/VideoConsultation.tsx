
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, Phone, FileText, Send, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock appointment data
const mockAppointment = {
  id: "appt-1",
  patient: {
    id: "patient-1",
    name: "John Smith",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  doctor: {
    id: "doctor-1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    image: "https://randomuser.me/api/portraits/women/67.jpg",
  },
  date: "2025-05-03",
  time: "10:30 AM",
  consultationType: "Video Consultation",
};

// Mock chat messages
const initialMessages = [
  {
    id: "msg-1",
    sender: "doctor",
    text: "Hello John, how are you feeling today?",
    time: "10:30 AM",
  },
  {
    id: "msg-2",
    sender: "patient",
    text: "Hi Dr. Johnson, I've been experiencing some chest pain lately.",
    time: "10:31 AM",
  },
  {
    id: "msg-3",
    sender: "doctor",
    text: "I see. Can you describe the pain? Is it sharp or dull? Does it come and go, or is it constant?",
    time: "10:32 AM",
  },
];

const VideoConsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [appointment] = useState(mockAppointment);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Mock starting a video call
  const startConsultation = () => {
    setIsConsultationActive(true);
    
    // In a real app, this is where you would initialize WebRTC
    // or connect to a service like Twilio Video or Agora
    
    // Mock: Show the user's webcam in the local video element
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          // Mock: After 2 seconds, show a fake remote stream (just using the same stream for demo)
          setTimeout(() => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
              
              toast({
                title: "Doctor connected",
                description: "Dr. Sarah Johnson has joined the consultation",
              });
            }
          }, 2000);
        })
        .catch(err => {
          console.error("Error accessing camera and microphone:", err);
          toast({
            variant: "destructive",
            title: "Camera access denied",
            description: "Please allow access to your camera and microphone to join the consultation.",
          });
        });
    }
  };
  
  // Mock ending a video call
  const endConsultation = () => {
    // In a real app, close WebRTC connections here
    
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    
    setIsConsultationActive(false);
    toast({
      title: "Consultation ended",
      description: "Your video consultation has been completed.",
    });
  };
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages([
      ...messages,
      {
        id: `msg-${Date.now()}`,
        sender: "patient", // In a real app, use the current user's role
        text: newMessage,
        time: currentTime,
      }
    ]);
    
    setNewMessage("");
    
    // Mock doctor response after a short delay
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `msg-${Date.now()}`,
          sender: "doctor",
          text: "Thank you for the information. Let me know if you have any other symptoms.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 3000);
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Video Consultation</h1>
        <p className="text-muted-foreground">
          Appointment with {appointment.doctor.name} - {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full">
        {/* Video Area - Takes 2/3 of the space on desktop */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full relative">
              {isConsultationActive ? (
                <>
                  {/* Main video (doctor) */}
                  <div className="flex-1 bg-black flex items-center justify-center relative">
                    <video 
                      ref={remoteVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                    >
                      Your browser doesn't support video.
                    </video>
                    
                    {/* Local video (patient) - small overlay */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
                      <video 
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      >
                        Your browser doesn't support video.
                      </video>
                    </div>
                  </div>
                  
                  {/* Video controls */}
                  <div className="bg-background p-4 flex justify-center space-x-4">
                    <Button
                      variant={isMicOn ? "outline" : "destructive"}
                      size="icon"
                      onClick={() => setIsMicOn(!isMicOn)}
                    >
                      {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant={isVideoOn ? "outline" : "destructive"}
                      size="icon"
                      onClick={() => setIsVideoOn(!isVideoOn)}
                    >
                      {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={endConsultation}
                    >
                      <Phone className="h-5 w-5 mr-2 rotate-135" />
                      End Call
                    </Button>
                    
                    <Button variant="outline">
                      <FileText className="h-5 w-5 mr-2" />
                      Request Prescription
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                      <img 
                        src={appointment.doctor.image} 
                        alt={appointment.doctor.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold">{appointment.doctor.name}</h2>
                    <p className="text-care-primary">{appointment.doctor.specialty}</p>
                  </div>
                  
                  <p className="text-muted-foreground mb-8">
                    Your appointment is scheduled for {new Date(appointment.date).toLocaleDateString()} at {appointment.time}.
                    Click the button below to join the video consultation.
                  </p>
                  
                  <Button size="lg" onClick={startConsultation}>
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Video Consultation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Chat and Notes - Takes 1/3 of space on desktop */}
        <div className="h-full">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="notes">Medical Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="flex-1 flex flex-col h-full mt-0">
              <Card className="flex-1 flex flex-col h-full">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Messages area */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex items-start gap-2 max-w-[80%]">
                            {msg.sender !== "patient" && (
                              <Avatar>
                                <AvatarImage src={appointment.doctor.image} />
                                <AvatarFallback>DR</AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div>
                              <div className={`rounded-lg p-3 ${
                                msg.sender === "patient" 
                                  ? "bg-care-primary text-white" 
                                  : "bg-muted"
                              }`}>
                                <p>{msg.text}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                            </div>
                            
                            {msg.sender === "patient" && (
                              <Avatar>
                                <AvatarImage src={appointment.patient.image} />
                                <AvatarFallback>PT</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Input area */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="flex-1 flex flex-col h-full mt-0">
              <Card className="flex-1 flex flex-col h-full">
                <CardContent className="flex-1 flex flex-col p-4">
                  <h3 className="font-medium mb-4">Medical Notes</h3>
                  <p className="text-muted-foreground mb-6">
                    Take notes during your consultation. These notes are private and only visible to you.
                  </p>
                  <textarea
                    className="flex-1 p-4 border rounded-md resize-none outline-none focus:ring-1 focus:ring-care-primary"
                    placeholder="Type your notes here..."
                  ></textarea>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline">Save Notes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;
