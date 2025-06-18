
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, Phone, FileText, Send, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/lib/socket";
import { useAppointment } from "@/hooks/useAppointments";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  time: string;
}

const VideoConsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: appointment, isLoading } = useAppointment(appointmentId!);
  const { toast } = useToast();

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine user role and get participant info
  const userRole = user?.id === appointment?.doctorId ? 'doctor' : 'patient';
  const isDoctor = userRole === 'doctor';
  const roomId = appointment?.roomId;
  const userId = user?.id;

  // Participant info
  const doctorName = appointment?.doctorId?.user_id?.name || 'Doctor';
  const patientName = appointment?.patientId?.user_id?.name || 'Patient';
  const doctorImage = appointment?.doctorId?.profileImage;
  const patientImage = appointment?.patientId?.profileImage;

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Message handling
    socket.on("receive-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // WebRTC signaling
    socket.on("user-connected", handleUserConnected);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("session-ended", handleSessionEnded);

    // Error handling
    socket.on("error", (error: string) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    });

    return () => {
      socket.off("receive-message");
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
      socket.off("session-ended");
      socket.off("error");
    };
  }, []);

  // WebRTC handlers
  const handleUserConnected = async (connectedUserId: string) => {
    console.log("User connected:", connectedUserId);
    if (connectedUserId !== userId && peerConnectionRef.current) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("offer", roomId, offer);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    console.log("Received offer");
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", roomId, answer);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    console.log("Received answer");
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    console.log("Received ICE candidate");
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  };

  const handleUserDisconnected = (disconnectedUserId: string) => {
    console.log("User disconnected:", disconnectedUserId);
    setIsConnected(false);
    toast({
      title: "User Disconnected",
      description: "The other participant has left the session.",
    });
  };

  const handleSessionEnded = () => {
    toast({
      title: "Session Ended",
      description: "The consultation session has been ended by the doctor.",
    });
    cleanupAndExit();
  };

  // Start consultation
  const startConsultation = async () => {
    try {
      setIsConsultationActive(true);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("Received remote stream");
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsConnected(true);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", roomId, event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
        }
      };

      peerConnectionRef.current = pc;

      // Join room
      socket.emit("join-room", roomId, userId);

      toast({
        title: "Joining Session",
        description: "Waiting for the other participant...",
      });

    } catch (error) {
      console.error("Error starting consultation:", error);
      toast({
        title: "Error",
        description: "Failed to start video consultation. Please check your camera and microphone permissions.",
        variant: "destructive",
      });
      setIsConsultationActive(false);
    }
  };

  // End consultation
  const endConsultation = () => {
    if (isDoctor) {
      socket.emit("end-session", roomId, userId);
    }
    cleanupAndExit();
  };

  const cleanupAndExit = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Disconnect socket
    socket.disconnect();

    setIsConsultationActive(false);
    setRemoteStream(null);
    setLocalStream(null);
    setIsConnected(false);

    // Navigate back to dashboard
    navigate('/dashboard');
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: userRole,
      senderName: userRole === 'doctor' ? doctorName : patientName,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, message]);
    socket.emit("send-message", roomId, message);
    setNewMessage("");
  };

  if (isLoading || !appointment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading appointment...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Video Consultation</h1>
        <p className="text-muted-foreground">
          {isDoctor ? `Consultation with ${patientName}` : `Consultation with Dr. ${doctorName}`} - 
          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.timeSlot}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full">
        {/* Video Area */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full relative">
              {isConsultationActive ? (
                <>
                  {/* Main video area */}
                  <div className="flex-1 bg-black flex items-center justify-center relative">
                    {remoteStream ? (
                      <video 
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <div className="text-white text-center">
                        <div className="mb-4">
                          <Avatar className="w-24 h-24 mx-auto">
                            <AvatarImage src={isDoctor ? patientImage : doctorImage} />
                            <AvatarFallback>
                              {isDoctor ? patientName?.[0] : doctorName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <p>Waiting for {isDoctor ? patientName : `Dr. ${doctorName}`} to join...</p>
                        {isConnected && <p className="text-green-400 mt-2">Connected</p>}
                      </div>
                    )}
                    
                    {/* Local video overlay */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
                      <video 
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                    </div>
                  </div>
                  
                  {/* Video controls */}
                  <div className="bg-background p-4 flex justify-center space-x-4">
                    <Button
                      variant={isMicOn ? "outline" : "destructive"}
                      size="icon"
                      onClick={toggleMicrophone}
                    >
                      {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant={isVideoOn ? "outline" : "destructive"}
                      size="icon"
                      onClick={toggleVideo}
                    >
                      {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={endConsultation}
                    >
                      <Phone className="h-5 w-5 mr-2 rotate-[135deg]" />
                      {isDoctor ? "End Session" : "Leave Session"}
                    </Button>
                    
                    {isDoctor && (
                      <Button variant="outline">
                        <FileText className="h-5 w-5 mr-2" />
                        Create Prescription
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={isDoctor ? patientImage : doctorImage} />
                      <AvatarFallback>
                        {isDoctor ? patientName?.[0] : doctorName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">
                      {isDoctor ? patientName : `Dr. ${doctorName}`}
                    </h2>
                    {!isDoctor && (
                      <p className="text-care-primary">{appointment.doctorId?.specialization}</p>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-8">
                    Your appointment is scheduled for {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.timeSlot}.
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
        
        {/* Chat and Notes */}
        <div className="h-full">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="notes">Session Notes</TabsTrigger>
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
                          className={`flex ${msg.sender === userRole ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex items-start gap-2 max-w-[80%]">
                            {msg.sender !== userRole && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={msg.sender === 'doctor' ? doctorImage : patientImage} />
                                <AvatarFallback>
                                  {msg.senderName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div>
                              <div className={`rounded-lg p-3 ${
                                msg.sender === userRole
                                  ? "bg-care-primary text-white" 
                                  : "bg-muted"
                              }`}>
                                <p className="text-sm font-medium mb-1">{msg.senderName}</p>
                                <p>{msg.text}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                            </div>
                            
                            {msg.sender === userRole && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={userRole === 'doctor' ? doctorImage : patientImage} />
                                <AvatarFallback>
                                  {msg.senderName?.[0]}
                                </AvatarFallback>
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
                  <h3 className="font-medium mb-4">Session Notes</h3>
                  <p className="text-muted-foreground mb-6">
                    {isDoctor 
                      ? "Take notes during the consultation. These will be saved to the patient's record."
                      : "Take personal notes during your consultation. These notes are private and only visible to you."
                    }
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
