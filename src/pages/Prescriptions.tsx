import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Download, FileText, MoreVertical, Printer, Clock, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import DoctorPrescriptions from "./DoctorPrescriptions";
import { useDoctor } from "@/hooks/useDoctors";

const Prescriptions = () => {
  const { user } = useAuth();

  // If user is a doctor, show doctor prescription management
  if (user?.role === 'doctor') {
    return <DoctorPrescriptions />;
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  
  // Fetch prescriptions based on user role
  const { data: prescriptions = [], isLoading, error } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found');
      
      try {
        const response = await api.prescriptions.getForPatient(user.id);
        return response.data || [];
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        toast.error('Failed to load prescriptions');
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Set first prescription as selected when data loads
  useEffect(() => {
    if (prescriptions.length > 0 && !selectedPrescription) {
      setSelectedPrescription(prescriptions[0]);
    }
  }, [prescriptions, selectedPrescription]);
  
  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter((prescription: any) => 
    prescription.doctorId?.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // View a specific prescription
  const viewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
  };

  // Helper function to determine if prescription is active (example logic)
  const isPrescriptionActive = (prescription: any) => {
    const createdDate = new Date(prescription.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 90; // Consider active if created within 90 days
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prescriptions</h1>
          <p className="text-muted-foreground">
            View and manage all your medications and prescriptions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Prescriptions</h1>
        <p className="text-muted-foreground">
          View and manage all your medications and prescriptions
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prescription list - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Prescriptions</CardTitle>
              <CardDescription>
                All prescriptions issued to you by your healthcare providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by doctor or medication..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Request New
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="expired">Expired</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.map((prescription: any) => (
                        <TableRow 
                          key={prescription._id}
                          className="cursor-pointer"
                          onClick={() => viewPrescription(prescription)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {prescription.doctorId?.user_id?.name || 'Unknown Doctor'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {prescription.doctorId?.specialization || 'General Physician'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(prescription.createdAt).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm truncate max-w-[200px]">
                                {prescription.medication} {prescription.dosage}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isPrescriptionActive(prescription) ? "default" : "secondary"}>
                              {isPrescriptionActive(prescription) ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {isPrescriptionActive(prescription) ? "Active" : "Expired"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredPrescriptions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                              <h3 className="font-medium">No prescriptions found</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {searchTerm ? "Try a different search term" : "You don't have any prescriptions yet"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="active" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.filter((p: any) => isPrescriptionActive(p)).map((prescription: any) => (
                        <TableRow 
                          key={prescription._id}
                          className="cursor-pointer"
                          onClick={() => viewPrescription(prescription)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {prescription.doctorId?.user_id?.name || 'Unknown Doctor'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {prescription.doctorId?.specialization || 'General Physician'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(prescription.createdAt).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm truncate max-w-[200px]">
                                {prescription.medication} {prescription.dosage}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="expired" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.filter((p: any) => !isPrescriptionActive(p)).map((prescription: any) => (
                        <TableRow 
                          key={prescription._id}
                          className="cursor-pointer"
                          onClick={() => viewPrescription(prescription)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {prescription.doctorId?.user_id?.name || 'Unknown Doctor'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {prescription.doctorId?.specialization || 'General Physician'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(prescription.createdAt).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm truncate max-w-[200px]">
                                {prescription.medication} {prescription.dosage}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Expired
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Prescription detail - Right Side */}
        <div>
          {selectedPrescription && (
            <Card className="sticky top-20">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Prescription Details</CardTitle>
                    <CardDescription>
                      Issued on {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={isPrescriptionActive(selectedPrescription) ? "default" : "secondary"}>
                    {isPrescriptionActive(selectedPrescription) ? "Active" : "Expired"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Prescribed by
                  </div>
                  <div className="font-medium">
                    {selectedPrescription.doctorId?.user_id?.name || 'Unknown Doctor'}
                  </div>
                  <div className="text-sm">
                    {selectedPrescription.doctorId?.specialization || 'General Physician'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Patient
                  </div>
                  <div className="font-medium">{user?.name || 'Patient'}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Medication
                  </div>
                  <div className="space-y-2">
                    <div className="border rounded p-3">
                      <div className="font-medium">{selectedPrescription.medication}</div>
                      <div className="text-sm text-muted-foreground">
                        Dosage: {selectedPrescription.dosage}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Instructions
                  </div>
                  <p className="text-sm">{selectedPrescription.instructions}</p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
