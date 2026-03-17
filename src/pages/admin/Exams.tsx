import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { BarChart3, Users, GraduationCap, Building2, BookOpen, Calendar as CalendarIcon, FileText, DollarSign, Bell, Shield, Settings, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const sidebarLinks = [
  { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: GraduationCap, label: "Teachers", href: "/admin/teachers" },
  { icon: Building2, label: "Departments", href: "/admin/departments" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: CalendarIcon, label: "Attendance", href: "/admin/attendance" },
  { icon: FileText, label: "Exams", href: "/admin/exams" },
  { icon: DollarSign, label: "Fees", href: "/admin/fees" },
  { icon: Bell, label: "Announcements", href: "/admin/announcements" },
  { icon: Shield, label: "Roles & Access", href: "/admin/roles" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const AdminExams = () => {
  const { token } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Publish Results Dialog State
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishScope, setPublishScope] = useState("all");
  const [publishAction, setPublishAction] = useState("publish"); // 'publish' or 'hide'
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  
  // Data for Selects
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const fetchExams = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/exams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectData = async () => {
    if (!token) return;
    try {
      const [deptRes, courseRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/courses`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (courseRes.ok) setCourses(await courseRes.json());
    } catch (err) {
      console.error("Failed to load select data", err);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchSelectData();
  }, [token]);

  const handlePublishToggle = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/exams/publish-results`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          scope: publishScope,
          departmentId: publishScope === 'department' ? departmentId : null,
          courseId: publishScope === 'course' ? courseId : null,
          published: publishAction === 'publish'
        })
      });

      if (!res.ok) throw new Error("Failed to update results visibility");
      
      toast.success(`Exam results ${publishAction === 'publish' ? 'published' : 'hidden'} successfully.`);
      setPublishDialogOpen(false);
      fetchExams(); // Refresh list to see updated status
    } catch (err) {
      toast.error("Error updating exam result visibility");
    }
  };

  return (
    <>
      <Helmet><title>Exams - EdulinkX Admin</title></Helmet>
      <DashboardLayout 
        sidebarLinks={sidebarLinks} 
        userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} 
        title="Exams & Grading" 
        subtitle="Manage examination schedules and result visibility" 
        headerActions={
          <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Eye className="h-4 w-4 mr-2" />
                Manage Result Visibility
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Exam Results</DialogTitle>
                <DialogDescription>
                  Releasing results will make the grades and AI Autograder feedback visible to students for the selected scope.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action</label>
                  <Select value={publishAction} onValueChange={setPublishAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publish">Publish Results (Make Visible)</SelectItem>
                      <SelectItem value="hide">Hide Results (Make Invisible)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Scope of Action</label>
                  <Select value={publishScope} onValueChange={setPublishScope}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams (Global)</SelectItem>
                      <SelectItem value="department">Specific Department</SelectItem>
                      <SelectItem value="course">Specific Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {publishScope === 'department' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Department</label>
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d: any) => (
                          <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {publishScope === 'course' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Course</label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.course_code} - {c.course_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
                <Button 
                  variant={publishAction === 'publish' ? 'hero' : 'destructive'} 
                  onClick={handlePublishToggle}
                  disabled={(publishScope === 'department' && !departmentId) || (publishScope === 'course' && !courseId)}
                >
                  {publishAction === 'publish' ? 'Release Results' : 'Hide Results'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        {loading ? (
          <div className="flex justify-center p-8 text-muted-foreground">Loading exams...</div>
        ) : (
          <div className="space-y-4">
            {exams.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No exams have been created by teachers yet.
                </CardContent>
              </Card>
            ) : (
              exams.map((e, i) => (
                <Card key={i}>
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{e.title}</h3>
                        {e.results_published ? (
                          <Badge className="bg-success text-success-foreground border-success text-[10px]"><Eye className="h-3 w-3 mr-1"/> Results Published</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]"><EyeOff className="h-3 w-3 mr-1"/> Results Hidden</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {e.course_code} - {e.course_name} ({e.department})
                      </p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Date: {new Date(e.exam_date).toLocaleDateString()}</span>
                        <span>Type: {e.type.toUpperCase()}</span>
                        <span>Duration: {e.duration_minutes}m</span>
                      </div>
                    </div>
                    <Badge className={e.status === "draft" ? "bg-secondary" : "bg-info text-info-foreground"}>{e.status.toUpperCase()}</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </DashboardLayout>
    </>
  );
};
export default AdminExams;