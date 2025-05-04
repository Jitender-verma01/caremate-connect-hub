// AIAssistance.tsx
import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, User, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIAssistance = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your healthcare assistant. How can I help you with your medical questions today?",
      timestamp: new Date(),
    },
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [conversationHistory]);

  const API_KEY = "your_hugging_face_api_key"; // Replace with your Hugging Face API key
  const API_URL = "https://api-inference.huggingface.co/models/gpt2"; // Model endpoint

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setConversationHistory((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`, // Use the API key for authorization
        },
        body: JSON.stringify({
          inputs: input, // Send user input as the model's prompt
        }),
      });

      const data = await response.json();

      if (data && data.choices && data.choices[0].text) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.choices[0].text, // Use the correct key for response text
          timestamp: new Date(),
        };

        setConversationHistory((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("No valid response from the AI");
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      toast.error("Failed to get a response. Please try again.");

      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble responding right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setConversationHistory([
      {
        role: "assistant",
        content:
          "Hello! I'm your healthcare assistant. How can I help you with your medical questions today?",
        timestamp: new Date(),
      },
    ]);
    toast.success("Conversation cleared");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const suggestedQuestions = [
    "What are some ways to reduce stress?",
    "How much exercise should I get weekly?",
    "What causes headaches?",
    "How can I improve my sleep quality?",
    "What should I do for a fever?",
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Health Assistant</h1>
          <p className="text-muted-foreground">
            Get health guidance and suggestions for your wellness journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Chat Section */}
        <Card className="col-span-3 h-[calc(100vh-220px)]">
          <CardHeader className="border-b bg-muted/40 px-6">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3 bg-care-primary">
                <AvatarFallback>
                  <Bot size={18} />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  CareMate AI
                  <Badge
                    variant="outline"
                    className="ml-2 bg-care-primary/10 text-care-primary"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Gemini
                  </Badge>
                </CardTitle>
                <CardDescription>Powered by Google Gemini</CardDescription>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="h-[calc(100%-10rem)]" ref={scrollAreaRef}>
            <CardContent className="p-6">
              <div className="space-y-6">
                {conversationHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar
                        className={`h-8 w-8 mt-0.5 ${
                          message.role === "user"
                            ? "ml-3 bg-care-secondary"
                            : "mr-3 bg-care-primary"
                        }`}
                      >
                        <AvatarFallback>
                          {message.role === "user" ? (
                            <User size={18} />
                          ) : (
                            <Bot size={18} />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg p-4 ${
                            message.role === "user"
                              ? "bg-care-secondary text-care-secondary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                        <div
                          className={`text-xs text-muted-foreground mt-1 flex items-center ${
                            message.role === "user" ? "justify-end" : ""
                          }`}
                        >
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex">
                      <Avatar className="h-8 w-8 mt-0.5 mr-3 bg-care-primary">
                        <AvatarFallback>
                          <Bot size={18} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-4 bg-muted">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-care-primary rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-care-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="h-2 w-2 bg-care-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </ScrollArea>

          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={clearConversation}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your health question here..."
                className="flex-1 min-h-[60px]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0"
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Right Suggestions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
              <CardDescription>
                Try asking these to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setInput(q)}
                >
                  {q}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistance;
