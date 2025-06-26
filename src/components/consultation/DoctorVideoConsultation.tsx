import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Phone, FileText, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionForm } from "../forms/PrescriptionForm";
import { socket } from "@/lib/socket";
import { useAppointment } from "@/hooks/useAppointments";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatSection } from "./ChatSection";

export const DoctorVideoConsultation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: appointment, isLoading } = useAppointment(appointmentId!);
  const { toast } = useToast();

  // State management
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);


  const roomId = appointment?.roomId;
  const userId = user?.id;
  const patientName = appointment?.patientName || 'Patient';
  const patientImage = appointment?.patientImage;
  const appointmentReason = appointment?.reason || 'General consultation';

  // WebRTC setup, socket listeners, etc.
  useEffect(() => {
    if (roomId && userId && socket.connected) {
      console.log("✅ user-connected can now emit:", { roomId, userId });
      socket.emit("join-room", roomId, userId);

      socket.on("trigger-offer", (connectedUserId) => {
        console.log("⚡ Received trigger-offer from:", connectedUserId);
        handleUserConnected(connectedUserId); // This will create and send the offer
      });
      
      socket.once("ready", () => {
        console.log("🚀 Server is ready — emitting user-connected");
        socket.emit("user-connected", roomId, userId);
      });
    }
  }, [roomId, userId, socket.connected]);
  
  
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  
    // Clear existing listeners (prevent stacking)
    socket.off("user-connected", handleUserConnected);
    socket.off("offer", handleOffer);
    socket.off("answer", handleAnswer);
    socket.off("ice-candidate", handleIceCandidate);
    socket.off("user-disconnected", handleUserDisconnected);
    socket.off("session-ended", handleSessionEnded);
    socket.off("error");
  
    // Add fresh listeners
    socket.on("user-connected", handleUserConnected);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("session-ended", handleSessionEnded);
    socket.on("error", (error: string) => {
      console.error("Socket error:", error);
      toast({
        title: "Connection Issue",
        description: error,
        variant: "destructive",
      });
    });
  
    return () => {
      cleanUpConnection();
      socket.off("user-connected", handleUserConnected);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("session-ended", handleSessionEnded);
      socket.off("error");
    };
  }, [roomId, userId]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log("✅ remote video stream attached");
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log("✅ local video stream attached");
    }
  }, [localStream]);
  

  // WebRTC handlers
  const startPeerConnection = async () => {
    console.log(">>> startPeerConnection running");
    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("✅ Local stream acquired:", stream.getTracks());
    } catch (err) {
      console.error("🚨 Error accessing media devices:", err);
      return; // 💀 Don't continue if no cam/mic
    }

    // Now stream is defined ✅
    setLocalStream(stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      console.log("🎥 Local video hooked up");
    }

  
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
  
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
  
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log("🎯 Got remote track:", remoteStream);
      console.log("📹 Remote stream tracks:", remoteStream.getTracks());
      // If remoteStream is null, we can't set it
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        console.log("✅ Remote video attached");
      } else {
        console.warn("🚫 remoteVideoRef.current is NULL");
      }
      setIsConnected(true);
    };
  
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", roomId, event.candidate);
      }
    };
  
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setIsConnected(false);
      }
    };
  
    peerConnectionRef.current = pc;
  };
  
  const handleUserConnected = async (connectedUserId: string) => {
    console.log("HANDLEUserConnected:", connectedUserId);
    
    if (connectedUserId === userId) return;
  
    // 👇 create peer connection if it doesn't exist
    if (!peerConnectionRef.current) {
      await startPeerConnection();
      console.log("Peer connection created again for:", connectedUserId);
    }
  
    if (peerConnectionRef.current) {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit("offer", roomId, offer);
        console.log("Offer created and sent to:", connectedUserId);
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }
  };
  

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    console.log("Received offer");
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Draining buffered ICE candidates...");
        for (const candidate of pendingCandidates.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Buffered ICE candidate added");
          } catch (err) {
            console.error("Failed to add buffered candidate:", err);
          }
        }
        pendingCandidates.current = []; // Clean the queue
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", roomId, answer);
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    console.log("📩 Received answer");
  
    if (!peerConnectionRef.current) {
      console.warn("❌ Peer connection missing");
      return;
    }
  
    const pc = peerConnectionRef.current;
  
    try {
      // Prevent duplicate setting of remote description
      if (pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Remote description set from answer");
      } else {
        console.warn("⚠️ Remote description already set. Skipping.");
      }
  
      // Apply any buffered ICE
      console.log("🧊 Draining buffered ICE candidates...");
      for (const candidate of pendingCandidates.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ Buffered ICE candidate added");
        } catch (err) {
          console.error("❌ Failed to add ICE candidate:", err);
        }
      }
      pendingCandidates.current = [];
    } catch (error) {
      console.error("❌ Error handling answer:", error);
    }
  };
  

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    console.log("Received ICE candidate");
    const pc = peerConnectionRef.current;
  
    if (!pc) return;
  
    if (!pc.remoteDescription || !pc.remoteDescription.type) {
      console.log("Remote description not set yet. Queuing candidate.");
      pendingCandidates.current.push(candidate);
      return;
    }
  
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added");
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };
  

  const handleUserDisconnected = (disconnectedUserId: string) => {
    console.log("User disconnected:", disconnectedUserId);
    setIsConnected(false);
    toast({
      title: "User Disconnected",
      description: "The patient has left the session.",
    });
  };

  const handleSessionEnded = () => {
    toast({
      title: "Session Ended",
      description: "The consultation session has been ended.",
    });
    cleanUpConnection();
  };

  // Start consultation
  const startConsultation = async () => {
    await startPeerConnection();
    socket.emit("join-room", roomId, userId);
    socket.emit("ready-for-offer", roomId, userId);

    setIsConsultationActive(true);
    console.log(">>> startConsultation triggered");
  };

  // End consultation (Doctor can end session)
  const endConsultation = () => {
    socket.emit("end-session", roomId, userId);
    cleanUpConnection();
  };

  const cleanUpConnection = () => {
    console.log("🧹 Cleaning up connection...");
  
    // Stop local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
  
    // Stop remote stream tracks (optional, extra clean)
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
  
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  
    // Reset video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  
    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
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
        <h1 className="text-2xl font-bold mb-1">Doctor Consultation</h1>
        <p className="text-muted-foreground">
          Patient: {patientName} • {appointment.date} at {appointment.time}
        </p>
        <p className="text-sm text-muted-foreground">
          Reason: {appointmentReason}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full">
        {/* Video Area */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full relative">
              {isConsultationActive ? (
                <>
                  {/* Main video area - showing patient */}
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
                            <AvatarImage src={patientImage} />
                            <AvatarFallback>{patientName?.[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <p>Waiting for {patientName} to join...</p>
                        {isConnected && <p className="text-green-400 mt-2">✓ Connected</p>}
                      </div>
                    )}
                    
                    {/* Local video overlay - showing doctor (you) */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
                      <video 
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        You
                      </div>
                    </div>
                  </div>
                  
                  {/* Doctor controls */}
                  <div className="bg-background p-4 flex justify-center space-x-4">
                    <Button
                      variant={isMicOn ? "outline" : "destructive"}
                      size="icon"
                      onClick={toggleMicrophone}
                      title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                    >
                      {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant={isVideoOn ? "outline" : "destructive"}
                      size="icon"
                      onClick={toggleVideo}
                      title={isVideoOn ? "Turn off camera" : "Turn on camera"}
                    >
                      {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={endConsultation}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Phone className="h-5 w-5 mr-2 rotate-[135deg]" />
                      End Session
                    </Button>
                    
                    <Button variant="outline" onClick={() => setShowForm(true)}>
                      <FileText className="h-5 w-5 mr-2" />
                      Create Prescription
                    </Button>
                    {showForm && (
                      <PrescriptionForm
                        patientId={appointment.patientId}
                        patientName={patientName}
                        onSuccess={() => {
                          setShowForm(false);
                        }}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={patientImage} />
                      <AvatarFallback>{patientName?.[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">{patientName}</h2>
                    <p className="text-muted-foreground">Patient</p>
                    <p className="text-sm text-care-primary mt-2">
                      Consultation reason: {appointmentReason}
                    </p>
                  </div>
                  
                  <p className="text-muted-foreground mb-8">
                    Patient appointment scheduled for {appointment.date} at {appointment.time}.
                    Start the consultation when ready.
                  </p>
                  
                  <Button size="lg" onClick={startConsultation} className="bg-care-primary hover:bg-care-primary/90">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Consultation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Chat and Notes */}
        <ChatSection 
          roomId={roomId || ''}
          userRole="doctor"
          userName={`Dr. ${user?.name}`}
          userImage={user?.profileImage}
          otherParticipantName={patientName}
          otherParticipantImage={patientImage}
        />
      </div>
    </div>
  );
};
