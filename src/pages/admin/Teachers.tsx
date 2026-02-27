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

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const AdminTeachers = () => {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    designation: ""
  });

  const loadDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {}
  };

  const loadTeachers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    loadDepartments();
  }, [token]);

  const handleAddTeacher = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to add teacher");
      toast.success("Teacher added successfully");
      setAddDialog(false);
      setFormData({ name: "", email: "", department: "", designation: "" });
      loadTeachers();
    } catch (err) {
      toast.error("Error adding teacher");
    }
  };

  const handleUpdateTeacher = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/teachers/${selectedTeacher.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedTeacher)
      });
      if (!res.ok) throw new Error("Failed to update teacher");
      toast.success("Teacher updated successfully");
      setEditDialog(false);
      loadTeachers();
    } catch (err) {
      toast.error("Error updating teacher");
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!window.confirm("Mark this teacher as Inactive?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/teachers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to deactivate teacher");
      toast.success("Teacher marked as Inactive");
      loadTeachers();
    } catch (err) {
      toast.error("Error deactivating teacher");
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.employee_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Teachers - EdulinkX Admin</title></Helmet>
      <DashboardLayout 
        title="Teachers" 
        subtitle="Manage faculty records" 
        headerActions={<Button onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Teacher</Button>}
      >
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or Employee Code..." 
                className="pl-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>All Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b">
                      <th className="pb-3">Faculty</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Designation</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map(t => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-4">
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.employee_code}</p>
                        </td>
                        <td className="py-4">{t.department || "-"}</td>
                        <td className="py-4">{t.designation || "-"}</td>
                        <td className="py-4">
                          <Badge variant={t.academic_status === "Active" ? "success" : "secondary"}>{t.academic_status}</Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedTeacher(t); setViewDialog(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedTeacher(t); setEditDialog(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteTeacher(t.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loading && <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>}
                    {!loading && filteredTeachers.length === 0 && <tr><td colSpan={5} className="text-center py-8">No teachers found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Dialog */}
        <Dialog open={viewDialog} onOpenChange={setViewDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Teacher Details</DialogTitle></DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm font-medium">Name:</p><p className="text-sm">{selectedTeacher.name}</p>
                  <p className="text-sm font-medium">Email:</p><p className="text-sm">{selectedTeacher.email}</p>
                  <p className="text-sm font-medium">Emp Code:</p><p className="text-sm">{selectedTeacher.employee_code}</p>
                  <p className="text-sm font-medium">Dept:</p><p className="text-sm">{selectedTeacher.department || "-"}</p>
                  <p className="text-sm font-medium">Designation:</p><p className="text-sm">{selectedTeacher.designation || "-"}</p>
                  <p className="text-sm font-medium">Status:</p><p className="text-sm">{selectedTeacher.academic_status}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Teacher</DialogTitle></DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={selectedTeacher.name} onChange={e => setSelectedTeacher({...selectedTeacher, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={selectedTeacher.email} onChange={e => setSelectedTeacher({...selectedTeacher, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <select 
                      className="w-full p-2 border rounded-md" 
                      value={selectedTeacher.department || ""} 
                      onChange={e => setSelectedTeacher({...selectedTeacher, department: e.target.value})}
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Designation</label>
                    <Input value={selectedTeacher.designation || ""} onChange={e => setSelectedTeacher({...selectedTeacher, designation: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="w-full p-2 border rounded-md" 
                    value={selectedTeacher.academic_status} 
                    onChange={e => setSelectedTeacher({...selectedTeacher, academic_status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateTeacher}>Save Changes</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Teacher Dialog */}
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Teacher</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Prof. Smith" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. smith@edulinkx.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <select 
                    className="w-full p-2 border rounded-md text-sm" 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Designation</label>
                  <Input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Senior Professor" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Default password will be set to "teacher". Employee code will be generated automatically (FAC2026XXX).</p>
              <DialogFooter>
                <Button onClick={handleAddTeacher}>Add Teacher</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};
export default AdminTeachers;
