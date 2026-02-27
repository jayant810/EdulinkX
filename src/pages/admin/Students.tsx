import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BulkPDFUpload } from "@/components/shared/BulkPDFUpload";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const AdminStudents = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals state
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    semester: ""
  });

  const loadStudents = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [token]);

  const handleAddStudent = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to add student");
      toast.success("Student added successfully");
      setAddDialog(false);
      setFormData({ name: "", email: "", department: "", semester: "" });
      loadStudents();
    } catch (err) {
      toast.error("Error adding student");
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/students/${selectedStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedStudent)
      });
      if (!res.ok) throw new Error("Failed to update student");
      toast.success("Student updated successfully");
      setEditDialog(false);
      loadStudents();
    } catch (err) {
      toast.error("Error updating student");
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("Mark this student as Inactive?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to deactivate student");
      toast.success("Student marked as Inactive");
      loadStudents();
    } catch (err) {
      toast.error("Error deactivating student");
    }
  };

  const handleBulkPDF = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    toast.loading("Processing PDF...", { id: "bulk-pdf" });
    try {
      const res = await fetch(`${API_BASE}/api/admin/students/bulk-pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      toast.success(`Upload complete: ${data.results.success} success, ${data.results.failed} failed`, { id: "bulk-pdf" });
      loadStudents();
    } catch (err) {
      toast.error("Bulk upload failed", { id: "bulk-pdf" });
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Students - EdulinkX Admin</title></Helmet>
      <DashboardLayout 
        title="Students" 
        subtitle="Manage student records" 
        headerActions={
          <div className="flex gap-2">
            <BulkPDFUpload onUpload={handleBulkPDF} />
            <Button onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Student</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b">
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Semester</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-4">
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.student_id}</p>
                        </td>
                        <td className="py-4">{s.department || "-"}</td>
                        <td className="py-4">{s.semester || "-"}</td>
                        <td className="py-4">
                          <Badge variant={s.academic_status === "Active" ? "success" : "secondary"}>{s.academic_status}</Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedStudent(s); setViewDialog(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedStudent(s); setEditDialog(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteStudent(s.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loading && <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>}
                    {!loading && filteredStudents.length === 0 && <tr><td colSpan={5} className="text-center py-8">No students found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Dialog */}
        <Dialog open={viewDialog} onOpenChange={setViewDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
            {selectedStudent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm font-medium">Name:</p><p className="text-sm">{selectedStudent.name}</p>
                  <p className="text-sm font-medium">Email:</p><p className="text-sm">{selectedStudent.email}</p>
                  <p className="text-sm font-medium">ID:</p><p className="text-sm">{selectedStudent.student_id}</p>
                  <p className="text-sm font-medium">Dept:</p><p className="text-sm">{selectedStudent.department || "-"}</p>
                  <p className="text-sm font-medium">Semester:</p><p className="text-sm">{selectedStudent.semester || "-"}</p>
                  <p className="text-sm font-medium">Status:</p><p className="text-sm">{selectedStudent.academic_status}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
            {selectedStudent && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={selectedStudent.name} onChange={e => setSelectedStudent({...selectedStudent, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={selectedStudent.email} onChange={e => setSelectedStudent({...selectedStudent, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <Input value={selectedStudent.department || ""} onChange={e => setSelectedStudent({...selectedStudent, department: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <Input type="number" value={selectedStudent.semester || ""} onChange={e => setSelectedStudent({...selectedStudent, semester: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="w-full p-2 border rounded-md" 
                    value={selectedStudent.academic_status} 
                    onChange={e => setSelectedStudent({...selectedStudent, academic_status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateStudent}>Save Changes</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Student Dialog */}
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. john@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Computer Science" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <Input type="number" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} placeholder="e.g. 1" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Default password will be set to "student". Student ID will be generated automatically.</p>
              <DialogFooter>
                <Button onClick={handleAddStudent}>Add Student</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};
export default AdminStudents;
