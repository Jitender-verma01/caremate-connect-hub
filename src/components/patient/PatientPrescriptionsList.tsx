import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface Props {
  patientId: string;
}

export const PatientPrescriptionsList = ({ patientId }: Props) => {
    console.log("Patient ID:", patientId);
  const { data = [], isLoading } = useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async () => {
      const res = await api.prescriptions.getForPatient(patientId);
      return res.data || [];
    },
    enabled: !!patientId,
  });
  console.log("Prescriptions data:", data); 

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-4">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">No prescriptions yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-96 pr-2">
      <div className="space-y-3">
        {data.map((prescription: any) => (
          <Card key={prescription._id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">🧾 Prescription</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(prescription.createdAt).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <p><strong>💊 Medication:</strong> {prescription.medication}</p>
              <p><strong>📏 Dosage:</strong> {prescription.dosage}</p>
              <p><strong>📋 Instructions:</strong> {prescription.instructions}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
