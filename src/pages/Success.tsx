// src/pages/Success.tsx
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useBookAppointment } from "@/hooks/useAppointments";

const Success = () => {
    console.log("✅ Success component mounted");

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const bookAppointment = useBookAppointment();

  if (isLoading) return <div>Loading auth...</div>;

useEffect(() => {
  if (!sessionId || !user) return;

  const confirmAppointment = async () => {
    try {
    const res = await apiRequest(`/payment/confirm-stripe-session?session_id=${sessionId}`, "GET");
    console.log("🧾 Confirm result:", res);


    if (res.status === "confirmed") {
        const meta = res.metadata;

        const appointmentData = {
            doctorId: meta.doctorId,
            date: meta.date,
            time: meta.time,
            consultationType: meta.consultationType,
            reason: meta.reason,
        };

        bookAppointment.mutate({
            ...appointmentData
          }, {
            onSuccess: (data) => {
              // Create notification for booking success
                toast.success("Appointment booked successfully! 🎉");
                console.log("✅ Appointment booked:", data);
            }
          });
    } else {
        toast.error("Payment not confirmed 😓");
    }

    setTimeout(() => {
        navigate("/dashboard");
    }, 3000);
    } catch (err) {
      console.error("❌ Error confirming appointment:", err);
      toast.error("Something went wrong. Try again.");
    }
  };

  confirmAppointment();
}, [sessionId, user]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
        <CardHeader className="text-center">
          <CheckCircle className="text-green-500 mx-auto h-16 w-16" strokeWidth={1.5} />
          <CardTitle className="text-2xl mt-4">Payment Successful</CardTitle>
          <CardDescription>Your appointment has been confirmed.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Thank you for trusting us with your care 💙</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Success;
