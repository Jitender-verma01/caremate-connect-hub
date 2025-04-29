
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Mock prescription data
const mockPrescriptions = [
  {
    id: "presc-1",
    patientName: "John Smith",
    doctorName: "Dr. Sarah Johnson",
    doctorSpecialty: "Cardiologist",
    issueDate: "2025-04-15",
    expiryDate: "2025-07-15",
    status: "active",
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "3 months" },
      { name: "Aspirin", dosage: "81mg", frequency: "Once daily", duration: "3 months" }
    ],
    instructions: "Take with food. Avoid alcohol. Monitor blood pressure regularly.",
    notes: "Follow up in 3 months. Report any side effects immediately."
  },
  {
    id: "presc-2",
    patientName: "John Smith",
    doctorName: "Dr. Emily Chen",
    doctorSpecialty: "General Physician",
    issueDate: "2025-04-08",
    expiryDate: "2025-05-08",
    status: "active",
    medications: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily", duration: "10 days" },
      { name: "Acetaminophen", dosage: "500mg", frequency: "Every 6 hours as needed", duration: "5 days" }
    ],
    instructions: "Complete the full course of antibiotics even if you feel better.",
    notes: "Return if symptoms worsen or fever persists beyond 3 days."
  },
  {
    id: "presc-3",
    patientName: "John Smith",
    doctorName: "Dr. Michael Wong",
    doctorSpecialty: "Dermatologist",
    issueDate: "2025-03-20",
    expiryDate: "2025-04-20",
    status: "expired",
    medications: [
      { name: "Hydrocortisone cream", dosage: "1%", frequency: "Twice daily", duration: "2 weeks" },
      { name: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "1 month" }
    ],
    instructions: "Apply thin layer to affected areas. Avoid sun exposure.",
    notes: "Follow up in 2 weeks if condition does not improve."
  }
];

const Prescriptions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(mockPrescriptions[0]);
  
  // Filter prescriptions based on search term
  const filteredPrescriptions = mockPrescriptions.filter(
    prescription => 
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications.some(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
  
  // View a specific prescription
  const viewPrescription = (prescription: typeof mockPrescriptions[0]) => {
    setSelectedPrescription(prescription);
  };

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
                        <TableHead>Medications</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.map((prescription) => (
                        <TableRow 
                          key={prescription.id}
                          className="cursor-pointer"
                          onClick={() => viewPrescription(prescription)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{prescription.doctorName}</div>
                              <div className="text-sm text-muted-foreground">{prescription.doctorSpecialty}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(prescription.issueDate).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="text-sm truncate max-w-[200px]">
                                  {med.name} {med.dosage}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={prescription.status === "active" ? "default" : "secondary"}>
                              {prescription.status === "active" ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {prescription.status === "active" ? "Active" : "Expired"}
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
                        <TableHead>Medications</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.filter(p => p.status === "active").map((prescription) => (
                        <TableRow 
                          key={prescription.id}
                          className="cursor-pointer"
                          onClick={() => viewPrescription(prescription)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{prescription.doctorName}</div>
                              <div className="text-sm text-muted-foreground">{prescription.doctorSpecialty}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(prescription.issueDate).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="text-sm truncate max-w-[200px]">
                                  {med.name} {med.dosage}
                                </div>
                              ))}
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
                        <TableHead>Medications</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrescriptions.filter(p => p.status === "expired").map((prescription) => (
                        <TableRow 
                          key={prescription.id}
                          className="cursor-pointer"
                          onClick={() => viewPrescription(prescription)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{prescription.doctorName}</div>
                              <div className="text-sm text-muted-foreground">{prescription.doctorSpecialty}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(prescription.issueDate).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                Expired: {new Date(prescription.expiryDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="text-sm truncate max-w-[200px]">
                                  {med.name} {med.dosage}
                                </div>
                              ))}
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
                      Issued on {new Date(selectedPrescription.issueDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={selectedPrescription.status === "active" ? "default" : "secondary"}>
                    {selectedPrescription.status === "active" ? "Active" : "Expired"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Prescribed by
                  </div>
                  <div className="font-medium">{selectedPrescription.doctorName}</div>
                  <div className="text-sm">{selectedPrescription.doctorSpecialty}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Patient
                  </div>
                  <div className="font-medium">{selectedPrescription.patientName}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Medications
                  </div>
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="pb-2 font-normal">Name</th>
                        <th className="pb-2 font-normal">Dosage</th>
                        <th className="pb-2 font-normal">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.medications.map((med, index) => (
                        <tr key={index} className="border-b last:border-none">
                          <td className="py-2">{med.name}</td>
                          <td className="py-2">{med.dosage}</td>
                          <td className="py-2">{med.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Instructions
                  </div>
                  <p className="text-sm">{selectedPrescription.instructions}</p>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Additional Notes
                  </div>
                  <p className="text-sm">{selectedPrescription.notes}</p>
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
