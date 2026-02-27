import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Users, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BulkUpload } from "@/components/shared/BulkUpload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as xlsx from "xlsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const studentDeptTemplate = [
  { student_id: "STU2026001", name: "John Doe" },
  { student_id: "STU2026002", name: "Jane Smith" }
];

const AdminDepartments = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [addDeptDialog, setAddDeptDialog] = useState(false);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [resultsDialog, setResultsDialog] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [results, setResults] = useState<any>(null);

  const [deptForm, setDeptForm] = useState({ name: "", description: "" });

  const loadDepartments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, [token]);

  const handleAddDept = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(deptForm)
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Department created");
      setAddDeptDialog(false);
      setDeptForm({ name: "", description: "" });
      loadDepartments();
    } catch (err) {
      toast.error("Error creating department");
    }
  };

  const handleBulkUpload = async (data: any[]) => {
    if (!selectedDept) return;
    
    // Create a Blob from the data to send as a file to the existing endpoint
    // Actually, let's just use the json data since we have it, or modify backend to accept JSON.
    // The current backend endpoint expect a file (upload.single('file')). 
    // To stay consistent with your request "Excel sheet", I will convert the json back to a file or 
    // better, update the frontend to send the actual File object.
    
    // Let's modify BulkUpload to provide the File object too, or just use fetch with FormData here.
  };

  // Improved handleBulkUpload to handle the File directly
  const processExcelFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    toast.loading("Processing Excel...", { id: "bulk-dept" });
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/${selectedDept}/bulk-students`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setResults(data);
      setResultsDialog(true);
      setBulkDialog(false);
      toast.success("Processing complete", { id: "bulk-dept" });
    } catch (err) {
      toast.error("Bulk upload failed", { id: "bulk-dept" });
    }
  };

  return (
    <>
      <Helmet><title>Departments - EdulinkX Admin</title></Helmet>
      <DashboardLayout 
        title="Departments" 
        subtitle="Manage academic departments" 
        headerActions={<Button onClick={() => setAddDeptDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Department</Button>}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(d => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {d.name}
                  <Badge variant="outline">Dept</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{d.description || "No description provided."}</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedDept(d.name); setBulkDialog(true); }}>
                    <Users className="h-4 w-4 mr-2" /> Add Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {loading && <p className="col-span-full text-center py-12">Loading departments...</p>}
        </div>

        {/* Add Dept Dialog */}
        <Dialog open={addDeptDialog} onOpenChange={setAddDeptDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Department</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Name</label>
                <Input value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} placeholder="e.g. Computer Science" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} placeholder="Brief description..." />
              </div>
              <DialogFooter>
                <Button onClick={handleAddDept}>Create Department</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Student Dialog */}
        <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Students to {selectedDept}</DialogTitle></DialogHeader>
            <div className="space-y-6 pt-4 text-center">
              <p className="text-sm text-muted-foreground">Upload an Excel sheet containing student IDs to assign them to this department.</p>
              
              <div className="flex justify-center border-2 border-dashed rounded-xl p-8 bg-muted/20">
                <div className="space-y-4">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-primary opacity-50" />
                  <input 
                    type="file" 
                    id="excel-upload" 
                    className="hidden" 
                    accept=".xlsx, .xls"
                    onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])}
                  />
                  <Button asChild>
                    <label htmlFor="excel-upload" className="cursor-pointer">Choose Excel File</label>
                  </Button>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg text-left">
                <p className="text-xs font-bold mb-2">Instructions:</p>
                <ul className="text-[10px] space-y-1 list-disc pl-4 text-muted-foreground">
                  <li>File must be .xlsx or .xls</li>
                  <li>Must contain a column named <strong>student_id</strong></li>
                  <li>Optional: <strong>name</strong> column for verification</li>
                </ul>
                <Button variant="link" size="sm" className="h-auto p-0 text-[10px] mt-2" onClick={() => {
                  const ws = xlsx.utils.json_to_sheet(studentDeptTemplate);
                  const wb = xlsx.utils.book_new();
                  xlsx.utils.book_append_sheet(wb, ws, "Template");
                  xlsx.writeFile(wb, "student_dept_template.xlsx");
                }}>Download Template</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Results Dialog */}
        <Dialog open={resultsDialog} onOpenChange={setResultsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Bulk Upload Results</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-bold">{results?.successCount} Students added successfully</p>
              </div>

              {results?.warnings?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-bold">{results.warnings.length} Warnings / Skipped</p>
                  </div>
                  <ScrollArea className="h-[300px] border rounded-md p-4">
                    <div className="space-y-3">
                      {results.warnings.map((w: any, idx: number) => (
                        <Alert key={idx} variant="warning" className="border-warning/50 bg-warning/5">
                          <AlertTitle className="text-xs font-bold">Student: {w.student_id || "Unknown"}</AlertTitle>
                          <AlertDescription className="text-[10px]">
                            Reason: {w.reason}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setResultsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  </>
);
export default AdminDepartments;
