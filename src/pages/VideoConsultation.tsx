
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
import { socket } from "@/lib/socket"; // adjust if your socket file is elsewhere
import { useAppointment } from "@/hooks/useAppointments";

const VideoConsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { data: appointment, isLoading } = useAppointment(appointmentId!);
  console.log("Appointment data:", appointment);
  
  const userId = localStorage.getItem("userId");
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    if (userId === appointment?.patientId) {
      setRole('patient');
    } else {
      setRole('doctor');
    }
  }, [userId, appointment]);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  
  // Function for starting a video call
  const startConsultation = async () => {
    setIsConsultationActive(true);
  
    socket.connect();

    useEffect(() => {
      socket.on("receive-message", (message) => {
        setMessages((prev) => [...prev, message]);
      });
    
      return () => {
        socket.off("receive-message"); // Clean it up
      };
    }, []);
    
    
    socket.emit("join-room", appointment?.id, appointment?.patientId); // You might fetch real userId here
  
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });
  
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
  
    pc.ontrack = (event) => {
      const remoteStream  = event.streams[0];
      setRemoteStream(remoteStream );
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream ;
      }
    };
  
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", appointment?.id, event.candidate);
      }
    };
  
    peerConnectionRef.current = pc;
  
    socket.on("user-connected", async (userId) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", appointment?.id, offer);
    });
  
    socket.on("offer", async (offer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", appointment?.id, answer);
    });
  
    socket.on("answer", async (answer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });
  
    socket.on("ice-candidate", async (candidate) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });
  
    toast({
      title: "Video Session Started",
      description: "Connecting...",
    });
  };
  
  
  // Function for ending a video call
  const endConsultation = () => {
    socket.emit("end-session", appointment?.id, appointment?.patientId);
    socket.disconnect();
  
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
  
    const tracks = (localVideoRef.current?.srcObject as MediaStream)?.getTracks();
    tracks?.forEach((track) => track.stop());
  
    setIsConsultationActive(false);
    setRemoteStream(null);
    toast({
      title: "Consultation ended",
      description: "Your video consultation has been completed.",
    });
  };
  
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
  
    const message = {
      id: `msg-${Date.now()}`,
      sender: role,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  
    setMessages((prev) => [...prev, message]);
    socket.emit("send-message", appointment?.id, message);
    setNewMessage("");
  };

  if (isLoading || !appointment) {
    return <p>Loading appointment...</p>; // or a skeleton
  }
  
  
  
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Video Consultation</h1>
        <p className="text-muted-foreground">
          Appointment with {appointment?.doctorName} - {appointment?.date} at {appointment?.time}
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
                        src={appointment?.doctorImage} 
                        alt={appointment?.doctorName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold">{appointment?.doctorName}</h2>
                    <p className="text-care-primary">{appointment?.doctorSpecialty}</p>
                  </div>
                  
                  <p className="text-muted-foreground mb-8">
                    Your appointment is scheduled for {appointment?.date} at {appointment?.time}.
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
                                <AvatarImage src={appointment?.doctorImage} />
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
                                <AvatarImage src={appointment?.patientImage} />
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
