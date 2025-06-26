
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileText, Clock, CheckCircle } from "lucide-react";
import { PrescriptionForm } from "@/components/forms/PrescriptionForm";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useDoctor } from "@/hooks/useDoctors";
import { getAgeFromDOB } from "@/lib/utils";
import { PatientPrescriptionsList } from "@/components/patient/PatientPrescriptionsList";
const DoctorPrescriptions = () => {

  const { user } = useAuth();

  const { data: doctorInfo, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor', user?.id],
    queryFn: () => api.doctors.getProfile().then(res => res.data),
    enabled: !!user?.id,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // This would need to be implemented - getting patients for a doctor
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['doctor-patients', doctorInfo?._id],
    queryFn: async () => {
      // For now, return empty array - this would need proper implementation
      if (!user?.id) throw new Error('User not found');
      
      try {
        const response = await api.doctors.getPatientsForDoctor(doctorInfo?._id);
        return response.data || [];
      } catch (err) {
        console.error('Error fetching patient:', err);
        return [];
      }
    },
    enabled: !!user?.id
  });

  const filteredPatients = patients.filter((patient: any) => 
    patient?.user_id?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (patientsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Patient Prescriptions</h1>
          <p className="text-muted-foreground">
            Create and manage prescriptions for your patients
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Patient Prescriptions</h1>
        <p className="text-muted-foreground">
          Create and manage prescriptions for your patients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
            <CardDescription>
              Choose a patient to create a prescription for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-2" />
                    <h3 className="font-medium">No patients found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Try a different search term" : "You don't have any patients yet"}
                    </p>
                  </div>
                ) : (
                  filteredPatients.map((patient: any) => (
                    <Card 
                      key={patient._id} 
                      className={`cursor-pointer transition-colors ${
                        selectedPatient?.id === patient._id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <Avatar>
                              <AvatarImage src={patient.profileImage || ""} alt={patient.user_id.name} />
                              <AvatarFallback>
                                {patient.user_id.name?.[0]}
                              </AvatarFallback>
                            </Avatar>

                            {/* Name + Email */}
                            <div>
                              <h4 className="font-medium">{patient.user_id.name}</h4>
                              <p className="text-sm text-muted-foreground">{patient.user_id.email}</p>
                            </div>
                          </div>

                          {/* Age Badge */}
                          <Badge variant="outline">
                            {patient.date_of_birth ? `${getAgeFromDOB(patient.date_of_birth)} years` : "Age N/A"}
                          </Badge>
                        </div>
                      </CardContent>

                    </Card>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescription Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Prescription</CardTitle>
            <CardDescription>
              {selectedPatient 
                ? `Create a prescription for ${selectedPatient.name}`
                : "Select a patient to create a prescription"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPatient ? (
              <PrescriptionForm
                patientId={selectedPatient.id}
                patientName={selectedPatient.name}
                doctorId={doctorInfo?._id || ''} // Providing a default empty string
                onSuccess={() => {
                  // Optionally refresh data or show success message
                }}
              />
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Please select a patient to create a prescription
                </p>
              </div>
            )}
          </CardContent>
          <PatientPrescriptionsList patientId={selectedPatient?.user_id._id || ""} />
        </Card>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;
