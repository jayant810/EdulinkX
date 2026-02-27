import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Edit, Trash2, UserPlus, FileSpreadsheet, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as xlsx from "xlsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const enrollTemplate = [
  { id: "STU2026001", course_code: "CS301" },
  { id: "FAC2026001", course_code: "CS301" }
];

const AdminCourses = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialogs
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [manageDialog, setManageDialog] = useState(false);
  const [manualAddDialog, setManualAddDialog] = useState(false);
  const [resultsDialog, setResultsDialog] = useState(false);

  // Selections
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [eligible, setEligible] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);

  const [courseForm, setCourseForm] = useState({
    course_name: "",
    course_code: "",
    course_description: "",
    credits: 3,
    course_timing: "",
    department: ""
  });

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [cRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/departments`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourses(await cRes.json());
      setDepartments(await dRes.json());
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleAddCourse = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseForm)
      });
      if (res.ok) {
        toast.success("Course created");
        setAddDialog(false);
        setCourseForm({ course_name: "", course_code: "", course_description: "", credits: 3, course_timing: "", department: "" });
        loadData();
      }
    } catch (err) {
      toast.error("Error creating course");
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(selectedCourse)
      });
      if (res.ok) {
        toast.success("Course updated");
        setEditDialog(false);
        loadData();
      }
    } catch (err) {}
  };

  const loadParticipants = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/courses/${id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParticipants(await res.json());
    } catch (err) {}
  };

  const loadEligible = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/courses/${id}/eligible`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEligible(await res.json());
    } catch (err) {}
  };

  const addParticipant = async (userId: number, role: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/courses/${selectedCourse.id}/add-participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        toast.success("Added to course");
        loadParticipants(selectedCourse.id);
        loadEligible(selectedCourse.id);
      }
    } catch (err) {}
  };

  const removeParticipant = async (userId: number, role: string) => {
    if (!window.confirm("Remove from course?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/courses/${selectedCourse.id}/remove-participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        toast.success("Removed from course");
        loadParticipants(selectedCourse.id);
      }
    } catch (err) {}
  };

  const handleBulkEnroll = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    toast.loading("Processing bulk enrollment...", { id: "bulk-enroll" });
    try {
      const res = await fetch(`${API_BASE}/api/admin/courses/bulk-enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setResults(data);
      setResultsDialog(true);
      toast.success("Processing complete", { id: "bulk-enroll" });
      loadData();
    } catch (err) {
      toast.error("Bulk upload failed", { id: "bulk-enroll" });
    }
  };

  const filteredCourses = Array.isArray(courses) ? courses.filter(c => 
    c.course_name.toLowerCase().includes(search.toLowerCase()) || 
    c.course_code.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <>
      <Helmet><title>Courses - EdulinkX Admin</title></Helmet>
      <DashboardLayout 
        title="Course Catalog" 
        subtitle="Manage academic courses and enrollments" 
        headerActions={
          <div className="flex gap-2">
            <input type="file" id="main-bulk-enroll" className="hidden" accept=".xlsx, .xls" onChange={e => e.target.files?.[0] && handleBulkEnroll(e.target.files[0])} />
            <Button variant="outline" asChild><label htmlFor="main-bulk-enroll" className="cursor-pointer"><FileSpreadsheet className="h-4 w-4 mr-2" /> Bulk Enroll</label></Button>
            <Button onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or code..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-left text-xs font-bold uppercase text-muted-foreground">
                      <th className="p-4">Course</th>
                      <th className="p-4">Dept</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4 text-center">Faculty</th>
                      <th className="p-4 text-center">Students</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCourses.map(c => (
                      <tr key={c.id} className="text-sm">
                        <td className="p-4">
                          <p className="font-medium">{c.course_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{c.course_code}</p>
                        </td>
                        <td className="p-4"><Badge variant="outline">{c.department}</Badge></td>
                        <td className="p-4">{c.credits}</td>
                        <td className="p-4 text-center font-bold">{c.teacher_count}</td>
                        <td className="p-4 text-center font-bold">{c.student_count}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedCourse(c); loadParticipants(c.id); setManageDialog(true); }}><Users className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedCourse(c); setEditDialog(true); }}><Edit className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Course Dialog */}
        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Add New Course</DialogTitle></DialogHeader>
            <div className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Course Name</label>
                  <Input value={courseForm.course_name} onChange={e => setCourseForm({...courseForm, course_name: e.target.value})} placeholder="e.g. Data Structures" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Course Code</label>
                  <Input value={courseForm.course_code} onChange={e => setCourseForm({...courseForm, course_code: e.target.value})} placeholder="e.g. CS301" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Department</label>
                  <select className="w-full p-2 border rounded-md text-sm" value={courseForm.department} onChange={e => setCourseForm({...courseForm, department: e.target.value})}>
                    <option value="">Select Dept</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase">Credits</label>
                  <Input type="number" value={courseForm.credits} onChange={e => setCourseForm({...courseForm, credits: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">Timing Info</label>
                <Input value={courseForm.course_timing} onChange={e => setCourseForm({...courseForm, course_timing: e.target.value})} placeholder="e.g. Mon/Wed 10:00 AM" />
              </div>
              <DialogFooter>
                <Button onClick={handleAddCourse}>Create Course</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
            {selectedCourse && (
              <div className="grid gap-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase">Course Name</label>
                    <Input value={selectedCourse.course_name} onChange={e => setSelectedCourse({...selectedCourse, course_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase">Course Code</label>
                    <Input value={selectedCourse.course_code} onChange={e => setSelectedCourse({...selectedCourse, course_code: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase">Department</label>
                    <select className="w-full p-2 border rounded-md text-sm" value={selectedCourse.department} onChange={e => setSelectedCourse({...selectedCourse, department: e.target.value})}>
                      <option value="">Select Dept</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase">Credits</label>
                    <Input type="number" value={selectedCourse.credits} onChange={e => setSelectedCourse({...selectedCourse, credits: parseInt(e.target.value)})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateCourse}>Save Changes</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Manage Participants Dialog */}
        <Dialog open={manageDialog} onOpenChange={setManageDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex justify-between items-center pr-8">
                <DialogTitle>Enrollment: {selectedCourse?.course_name}</DialogTitle>
                <Button variant="hero" size="sm" onClick={() => { loadEligible(selectedCourse.id); setManualAddDialog(true); }}><UserPlus className="h-4 w-4 mr-2" /> Add Participants</Button>
              </div>
            </DialogHeader>
            <ScrollArea className="h-[500px] mt-4 border rounded-md p-4">
              <table className="w-full">
                <thead className="border-b sticky top-0 bg-background">
                  <tr className="text-left text-xs font-bold uppercase text-muted-foreground">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {participants.map((p, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 font-mono text-xs">{p.identifier}</td>
                      <td className="py-3"><Badge variant={p.role === 'Teacher' ? 'accent' : 'outline'}>{p.role}</Badge></td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="xs" className="text-destructive hover:bg-destructive/10" onClick={() => removeParticipant(p.id, p.role)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {participants.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No one enrolled yet.</td></tr>}
                </tbody>
              </table>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Manual Add Participants Dialog */}
        <Dialog open={manualAddDialog} onOpenChange={setManualAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Eligible from {selectedCourse?.department} Dept</DialogTitle></DialogHeader>
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-2">
                {eligible.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{p.name} <Badge variant="secondary" className="ml-2 text-[10px]">{p.role}</Badge></p>
                      <p className="text-xs text-muted-foreground font-mono">{p.identifier}</p>
                    </div>
                    <Button size="sm" onClick={() => addParticipant(p.id, p.role)}>Enroll</Button>
                  </div>
                ))}
                {eligible.length === 0 && <p className="text-center py-12 text-muted-foreground">No eligible participants found in this department.</p>}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Bulk Results Dialog */}
        <Dialog open={resultsDialog} onOpenChange={setResultsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Bulk Enrollment Results</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-bold">{results?.success} Enrollments processed successfully</p>
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
                          <AlertTitle className="text-xs font-bold">ID: {w.id || "N/A"} | Course: {w.course_code || "N/A"}</AlertTitle>
                          <AlertDescription className="text-[10px]">Reason: {w.reason}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex-1 text-[10px] text-muted-foreground text-left">
                Ensure IDs start with <strong>STU</strong> or <strong>FAC</strong> and departments match.
              </div>
              <Button onClick={() => setResultsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </DashboardLayout>
    </>
  );
};
export default AdminCourses;
