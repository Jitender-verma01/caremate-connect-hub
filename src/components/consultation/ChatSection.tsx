
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { socket } from "@/lib/socket";

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  time: string;
}

interface ChatSectionProps {
  roomId: string;
  userRole: 'doctor' | 'patient';
  userName: string;
  userImage?: string;
  otherParticipantName: string;
  otherParticipantImage?: string;
}

export const ChatSection = ({ 
  roomId, 
  userRole, 
  userName, 
  userImage, 
  otherParticipantName, 
  otherParticipantImage 
}: ChatSectionProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket event listeners for chat
  useEffect(() => {
    if (!roomId) return;

    const handleReceiveMessage = (message: Message) => {
      console.log('Received message via socket:', message);
      
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          console.log('Message already exists, not adding duplicate');
          return prev;
        }
        
        console.log('Adding new message to chat');
        return [...prev, message];
      });
    };

    // Clean up any existing listeners
    socket.off("receive-message");
    
    // Add new listener
    socket.on("receive-message", handleReceiveMessage);

    console.log('Chat socket listener setup for room:', roomId);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [roomId]);

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !roomId) {
      console.log('Cannot send empty message or no room ID');
      return;
    }

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: userRole,
      senderName: userName,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    console.log('Sending message to room:', roomId, message);
    
    // Send to server
    socket.emit("send-message", roomId, message);
    
    setNewMessage("");
  };

  return (
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
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No messages yet. Start the conversation!</p>
                      <p className="text-xs mt-2">Room: {roomId}</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.sender === userRole ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex items-start gap-2 max-w-[80%]">
                          {msg.sender !== userRole && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={otherParticipantImage} />
                              <AvatarFallback>
                                {otherParticipantName?.[0]?.toUpperCase()}
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
                              <AvatarImage src={userImage} />
                              <AvatarFallback>
                                {userName?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
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
              <h3 className="font-medium mb-4">
                {userRole === 'doctor' ? 'Medical Notes' : 'Personal Notes'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {userRole === 'doctor' 
                  ? "Take notes during the consultation. These will be saved to the patient's medical record."
                  : "Take personal notes during your consultation. These notes are private and only visible to you."
                }
              </p>
              <textarea
                className="flex-1 p-4 border rounded-md resize-none outline-none focus:ring-1 focus:ring-care-primary"
                placeholder={userRole === 'doctor' 
                  ? "Medical observations, diagnosis, treatment recommendations..."
                  : "Questions to ask, symptoms to mention, important points..."
                }
              ></textarea>
              <div className="mt-4 flex justify-end">
                <Button variant="outline">Save Notes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
