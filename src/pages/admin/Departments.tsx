import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Users, FileSpreadsheet, AlertCircle, CheckCircle2, Trash2, UserPlus, ArrowRight } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BulkUpload } from "@/components/shared/BulkUpload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import * as xlsx from "xlsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const AdminDepartments = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [addDeptDialog, setAddDeptDialog] = useState(false);
  const [manageStudentsDialog, setManageStudentsDialog] = useState(false);
  const [manualAddDialog, setManualAddDialog] = useState(false);
  const [bulkPreviewDialog, setBulkPreviewDialog] = useState(false);

  // Selection
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [deptStudents, setDeptStudents] = useState<any[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [bulkPreviewData, setBulkPreviewData] = useState<any[]>([]);
  
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

  const loadDeptStudents = async (deptName: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/${deptName}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDeptStudents(data);
    } catch (err) {}
  };

  const loadEligibleStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/students/eligible`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEligibleStudents(data);
    } catch (err) {}
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

  const removeStudent = async (studentId: string) => {
    if (!window.confirm("Remove student from this department?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/remove-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId })
      });
      if (res.ok) {
        toast.success("Student removed");
        loadDeptStudents(selectedDept.name);
      }
    } catch (err) {}
  };

  const addStudentToDept = async (studentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/${selectedDept.name}/add-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId })
      });
      if (res.ok) {
        toast.success("Student added");
        loadEligibleStudents();
        loadDeptStudents(selectedDept.name);
      }
    } catch (err) {}
  };

  const handleBulkFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    toast.loading("Validating students...", { id: "bulk-dept" });
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/validate-bulk`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setBulkPreviewData(data.map((s: any) => ({ ...s, move: !s.already_assigned })));
      setBulkPreviewDialog(true);
      toast.success("Validation complete", { id: "bulk-dept" });
    } catch (err) {
      toast.error("Bulk upload failed", { id: "bulk-dept" });
    }
  };

  const processBulkChanges = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/${selectedDept.name}/process-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ students: bulkPreviewData })
      });
      if (res.ok) {
        toast.success("Changes saved successfully");
        setBulkPreviewDialog(false);
        loadDeptStudents(selectedDept.name);
      }
    } catch (err) {}
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
                <Button variant="outline" className="w-full" onClick={() => { 
                  setSelectedDept(d); 
                  loadDeptStudents(d.name);
                  setManageStudentsDialog(true); 
                }}>
                  <Users className="h-4 w-4 mr-2" /> Manage Students
                </Button>
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

        {/* Manage Students Dialog */}
        <Dialog open={manageStudentsDialog} onOpenChange={setManageStudentsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex justify-between items-center pr-8">
                <DialogTitle>Students in {selectedDept?.name}</DialogTitle>
                <div className="flex gap-2">
                  <input type="file" id="bulk-excel" className="hidden" accept=".xlsx, .xls" onChange={e => e.target.files?.[0] && handleBulkFile(e.target.files[0])} />
                  <Button variant="outline" size="sm" asChild><label htmlFor="bulk-excel" className="cursor-pointer"><FileSpreadsheet className="h-4 w-4 mr-2" /> Bulk Add</label></Button>
                  <Button variant="hero" size="sm" onClick={() => { loadEligibleStudents(); setManualAddDialog(true); }}><UserPlus className="h-4 w-4 mr-2" /> Add Manually</Button>
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className="h-[500px] mt-4 border rounded-md">
              <div className="p-4">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background border-b">
                    <tr className="text-left text-xs font-bold text-muted-foreground uppercase">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Sem</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {deptStudents.map(s => (
                      <tr key={s.id} className="text-sm">
                        <td className="py-3">{s.name}</td>
                        <td className="py-3 font-mono text-xs">{s.student_id}</td>
                        <td className="py-3">{s.semester}</td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="xs" className="text-destructive hover:bg-destructive/10" onClick={() => removeStudent(s.student_id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {deptStudents.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No students in this department.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Manual Add Dialog */}
        <Dialog open={manualAddDialog} onOpenChange={setManualAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Eligible Students (Not in any Dept)</DialogTitle></DialogHeader>
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-2">
                {eligibleStudents.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.student_id} • Sem {s.semester}</p>
                    </div>
                    <Button size="sm" onClick={() => addStudentToDept(s.student_id)}>Add to Dept</Button>
                  </div>
                ))}
                {eligibleStudents.length === 0 && <p className="text-center py-12 text-muted-foreground">No eligible students found.</p>}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Bulk Preview Dialog */}
        <Dialog open={bulkPreviewDialog} onOpenChange={setBulkPreviewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Bulk Assignment Preview</DialogTitle></DialogHeader>
            <p className="text-xs text-muted-foreground mb-4">Checked students will be moved to {selectedDept?.name}. Unchecked students will be skipped.</p>
            <ScrollArea className="h-[400px] border rounded-md">
              <table className="w-full">
                <thead className="border-b bg-muted/50 sticky top-0">
                  <tr className="text-left text-xs font-bold uppercase">
                    <th className="p-3">Move?</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Current Dept</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {bulkPreviewData.map((s, idx) => (
                    <tr key={idx} className={s.already_assigned ? "bg-warning/5" : ""}>
                      <td className="p-3">
                        <Checkbox checked={s.move} onCheckedChange={(val) => {
                          const updated = [...bulkPreviewData];
                          updated[idx].move = !!val;
                          setBulkPreviewData(updated);
                        }} />
                      </td>
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 font-mono text-xs">{s.student_id}</td>
                      <td className="p-3">
                        {s.already_assigned ? (
                          <div className="flex items-center gap-1 text-warning font-bold">
                            {s.current_department} <ArrowRight className="h-3 w-3" />
                          </div>
                        ) : <span className="text-muted-foreground italic">None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setBulkPreviewDialog(false)}>Cancel</Button>
              <Button onClick={processBulkChanges}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};
export default AdminDepartments;
