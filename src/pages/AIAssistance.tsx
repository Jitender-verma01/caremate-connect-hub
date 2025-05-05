
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock chat for demonstration
const initialChat = [
  { role: "assistant", content: "Hello! I'm your AI medical assistant. How can I help you today?" }
];

const AIAssistance = () => {
  const [chat, setChat] = useState(initialChat);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loadingNewMessage, setLoadingNewMessage] = useState(false);
  const { toast } = useToast();

  // Scroll to the bottom of the chat container whenever chat updates
  useEffect(() => {
    const chatContainer = document.getElementById("chat-scroll-area");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chat, loadingNewMessage]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    setChat(prev => [...prev, { role: "user", content: userInput }]);
    setLoadingNewMessage(true);
    
    try {
      setIsLoading(true);
      
      // Simulate API call to Gemini or another AI service
      // Replace this with actual API call
      setTimeout(() => {
        // Mock response
        const responses = [
          "Based on your symptoms, you might want to consult with a general practitioner first, who can refer you to a specialist if needed.",
          "Those symptoms are common with seasonal allergies. I'd recommend seeing an allergist for proper testing and treatment.",
          "That could be related to several conditions. A neurologist would be the appropriate specialist to consult in this case.",
          "For that specific issue, I recommend consulting with a dermatologist who specializes in treating skin conditions.",
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setChat(prev => [...prev, { 
          role: "assistant", 
          content: randomResponse
        }]);
        setIsLoading(false);
        setLoadingNewMessage(false);
        setUserInput("");
      }, 1500);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setError(true);
      setIsLoading(false);
      setLoadingNewMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setChat(initialChat);
    setError(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">AI Medical Assistant</h1>
        <p className="text-muted-foreground mb-6">
          Get help understanding your symptoms and find the right specialist
        </p>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" /> 
              AI Assistant
            </CardTitle>
            <CardDescription>
              Describe your symptoms or ask health-related questions
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-0">
            <ScrollArea 
              id="chat-scroll-area" 
              className="h-[400px] pr-4"
            >
              <div className="space-y-4 pb-4">
                {chat.map((message, index) => (
                  <div 
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" ? (
                          <Bot className="h-5 w-5 mt-1 shrink-0" />
                        ) : (
                          <User className="h-5 w-5 mt-1 shrink-0" />
                        )}
                        <div>{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loadingNewMessage && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 shrink-0" />
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex justify-center">
                    <Card className="bg-destructive/10 w-full">
                      <CardContent className="py-4 flex flex-col items-center">
                        <p className="text-center text-sm text-destructive mb-2">
                          Error connecting to the AI assistant
                        </p>
                        <Button 
                          onClick={resetChat} 
                          variant="outline" 
                          size="sm"
                          className="flex items-center"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset Chat
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="pt-4">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Type your symptoms or questions..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !userInput.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How this AI Assistant can help</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Understand your symptoms and suggest relevant specialists</li>
              <li>Answer general health questions (not a substitute for medical advice)</li>
              <li>Help you prepare for your doctor's appointment</li>
              <li>Provide information about common medical conditions</li>
            </ul>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Note: This AI assistant provides general information only and is not a substitute for professional medical advice.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistance;
