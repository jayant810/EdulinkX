import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, GraduationCap, BookOpen, Crown, UserPlus, Trash2, Plus, Minus } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const HODDashboard = () => {
  const { token } = useAuth();
  const [departmentInfo, setDepartmentInfo] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [addStudentDialog, setAddStudentDialog] = useState(false);
  const [manageCourseDialog, setManageCourseDialog] = useState(false);
  const [addCourseStudentDialog, setAddCourseStudentDialog] = useState(false);
  const [addCourseTeacherDialog, setAddCourseTeacherDialog] = useState(false);

  // Data for dialogs
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [courseTeachers, setCourseTeachers] = useState<any[]>([]);
  const [eligibleCourseStudents, setEligibleCourseStudents] = useState<any[]>([]);
  const [eligibleCourseTeachers, setEligibleCourseTeachers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("students");

  const loadDepartment = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hod/department`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 403) {
          setError("You don't have HOD privileges. Contact admin.");
          return;
        }
        throw new Error("Failed");
      }
      const data = await res.json();
      setDepartmentInfo(data);
    } catch (err) {
      setError("Failed to load department info");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    const res = await fetch(`${API_BASE}/api/hod/students`, { headers: { Authorization: `Bearer ${token}` } });
    setStudents(await res.json());
  };

  const loadCourses = async () => {
    const res = await fetch(`${API_BASE}/api/hod/courses`, { headers: { Authorization: `Bearer ${token}` } });
    setCourses(await res.json());
  };

  const loadTeachers = async () => {
    // Re-use department info to get teacher list
    const res = await fetch(`${API_BASE}/api/hod/department`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setDepartmentInfo(data);
  };

  useEffect(() => {
    loadDepartment();
  }, [token]);

  useEffect(() => {
    if (departmentInfo) {
      loadStudents();
      loadCourses();
    }
  }, [departmentInfo]);

  // Student management
  const loadEligibleStudents = async () => {
    const res = await fetch(`${API_BASE}/api/hod/students/eligible`, { headers: { Authorization: `Bearer ${token}` } });
    setEligibleStudents(await res.json());
  };

  const addStudent = async (studentId: string) => {
    const res = await fetch(`${API_BASE}/api/hod/students/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId })
    });
    if (res.ok) {
      toast.success("Student added");
      loadStudents();
      loadEligibleStudents();
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!window.confirm("Remove student from department?")) return;
    const res = await fetch(`${API_BASE}/api/hod/students/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId })
    });
    if (res.ok) {
      toast.success("Student removed");
      loadStudents();
    }
  };

  // Course management
  const openCourseManager = async (course: any) => {
    setSelectedCourse(course);
    const [sRes, tRes] = await Promise.all([
      fetch(`${API_BASE}/api/hod/courses/${course.id}/students`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/api/hod/courses/${course.id}/teachers`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setCourseStudents(await sRes.json());
    setCourseTeachers(await tRes.json());
    setActiveTab("students");
    setManageCourseDialog(true);
  };

  const loadEligibleCourseStudents = async () => {
    const res = await fetch(`${API_BASE}/api/hod/courses/${selectedCourse.id}/eligible-students`, { headers: { Authorization: `Bearer ${token}` } });
    setEligibleCourseStudents(await res.json());
  };

  const loadEligibleCourseTeachers = async () => {
    const res = await fetch(`${API_BASE}/api/hod/courses/${selectedCourse.id}/eligible-teachers`, { headers: { Authorization: `Bearer ${token}` } });
    setEligibleCourseTeachers(await res.json());
  };

  const addStudentToCourse = async (studentUserId: number) => {
    const res = await fetch(`${API_BASE}/api/hod/courses/${selectedCourse.id}/add-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentUserId })
    });
    if (res.ok) {
      toast.success("Student enrolled");
      openCourseManager(selectedCourse);
      loadEligibleCourseStudents();
    }
  };

  const removeStudentFromCourse = async (studentUserId: number) => {
    const res = await fetch(`${API_BASE}/api/hod/courses/${selectedCourse.id}/remove-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentUserId })
    });
    if (res.ok) {
      toast.success("Student removed from course");
      openCourseManager(selectedCourse);
    }
  };

  const addTeacherToCourse = async (teacherUserId: number) => {
    const res = await fetch(`${API_BASE}/api/hod/courses/${selectedCourse.id}/add-teacher`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teacherUserId })
    });
    if (res.ok) {
      toast.success("Teacher assigned");
      openCourseManager(selectedCourse);
      loadEligibleCourseTeachers();
    }
  };

  const removeTeacherFromCourse = async (teacherUserId: number) => {
    const res = await fetch(`${API_BASE}/api/hod/courses/${selectedCourse.id}/remove-teacher`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teacherUserId })
    });
    if (res.ok) {
      toast.success("Teacher removed from course");
      openCourseManager(selectedCourse);
    }
  };

  if (error) {
    return (
      <>
        <Helmet><title>HOD Dashboard - EdulinkX</title></Helmet>
        <DashboardLayout title="HOD Dashboard" subtitle="Head of Department Management">
          <div className="flex flex-col items-center justify-center py-20">
            <Crown className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">{error}</h3>
            <p className="text-muted-foreground mt-2">Only teachers with HOD role can access this page.</p>
          </div>
        </DashboardLayout>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Helmet><title>HOD Dashboard - EdulinkX</title></Helmet>
        <DashboardLayout title="HOD Dashboard" subtitle="Loading...">
          <p className="text-center py-20">Loading department info...</p>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <Helmet><title>HOD Dashboard - {departmentInfo?.name} - EdulinkX</title></Helmet>
      <DashboardLayout 
        title={`${departmentInfo?.name} Department`}
        subtitle="Head of Department Management"
      >
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentInfo?.student_count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentInfo?.teacher_count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentInfo?.course_count || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Students Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Department Students</CardTitle>
            <Button size="sm" onClick={() => { loadEligibleStudents(); setAddStudentDialog(true); }}>
              <UserPlus className="h-4 w-4 mr-1" /> Add Student
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left text-xs font-bold uppercase text-muted-foreground">
                    <th className="p-3">Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map(s => (
                    <tr key={s.id} className="text-sm">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 font-mono text-xs">{s.student_id}</td>
                      <td className="p-3">{s.semester}</td>
                      <td className="p-3"><Badge variant="outline">{s.academic_status}</Badge></td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeStudent(s.student_id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No students</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Courses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Department Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr className="text-left text-xs font-bold uppercase text-muted-foreground">
                    <th className="p-3">Course</th>
                    <th className="p-3 text-center">Faculty</th>
                    <th className="p-3 text-center">Students</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map(c => (
                    <tr key={c.id} className="text-sm">
                      <td className="p-3">
                        <p className="font-medium">{c.course_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.course_code}</p>
                      </td>
                      <td className="p-3 text-center font-bold text-primary">{c.teacher_count}</td>
                      <td className="p-3 text-center font-bold">{c.student_count}</td>
                      <td className="p-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => openCourseManager(c)}>
                          <Users className="h-4 w-4 mr-1" /> Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No courses</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Student to Dept Dialog */}
        <Dialog open={addStudentDialog} onOpenChange={setAddStudentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add Student to Department</DialogTitle></DialogHeader>
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-2">
                {eligibleStudents.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.student_id} • Sem {s.semester}</p>
                    </div>
                    <Button size="sm" onClick={() => addStudent(s.student_id)}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                ))}
                {eligibleStudents.length === 0 && <p className="text-center py-12 text-muted-foreground">No eligible students</p>}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Course Management Dialog */}
        <Dialog open={manageCourseDialog} onOpenChange={setManageCourseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Manage: {selectedCourse?.course_name}</DialogTitle>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="students">Students ({courseStudents.length})</TabsTrigger>
                <TabsTrigger value="teachers">Teachers ({courseTeachers.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="students">
                <div className="flex justify-end mb-3">
                  <Button size="sm" onClick={() => { loadEligibleCourseStudents(); setAddCourseStudentDialog(true); }}>
                    <UserPlus className="h-4 w-4 mr-1" /> Add Student
                  </Button>
                </div>
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-xs font-bold uppercase text-muted-foreground">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">ID</th>
                        <th className="pb-2">Sem</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {courseStudents.map(s => (
                        <tr key={s.id} className="text-sm">
                          <td className="py-3">{s.name}</td>
                          <td className="py-3 font-mono text-xs">{s.student_id}</td>
                          <td className="py-3">{s.semester}</td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeStudentFromCourse(s.id)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {courseStudents.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No students enrolled</td></tr>}
                    </tbody>
                  </table>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="teachers">
                <div className="flex justify-end mb-3">
                  <Button size="sm" onClick={() => { loadEligibleCourseTeachers(); setAddCourseTeacherDialog(true); }}>
                    <UserPlus className="h-4 w-4 mr-1" /> Add Teacher
                  </Button>
                </div>
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-xs font-bold uppercase text-muted-foreground">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Employee Code</th>
                        <th className="pb-2">Designation</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {courseTeachers.map(t => (
                        <tr key={t.id} className="text-sm">
                          <td className="py-3 font-medium">{t.name}</td>
                          <td className="py-3 font-mono text-xs">{t.employee_code}</td>
                          <td className="py-3 text-xs">{t.designation || "—"}</td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeTeacherFromCourse(t.id)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {courseTeachers.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No teachers assigned</td></tr>}
                    </tbody>
                  </table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Add Student to Course Dialog */}
        <Dialog open={addCourseStudentDialog} onOpenChange={setAddCourseStudentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add Student to {selectedCourse?.course_name}</DialogTitle></DialogHeader>
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-2">
                {eligibleCourseStudents.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.student_id} • Sem {s.semester}</p>
                    </div>
                    <Button size="sm" onClick={() => addStudentToCourse(s.id)}>Enroll</Button>
                  </div>
                ))}
                {eligibleCourseStudents.length === 0 && <p className="text-center py-12 text-muted-foreground">All department students are already enrolled</p>}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Add Teacher to Course Dialog */}
        <Dialog open={addCourseTeacherDialog} onOpenChange={setAddCourseTeacherDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add Teacher to {selectedCourse?.course_name}</DialogTitle></DialogHeader>
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-2">
                {eligibleCourseTeachers.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.employee_code} • {t.designation || "No designation"}</p>
                    </div>
                    <Button size="sm" onClick={() => addTeacherToCourse(t.id)}>Assign</Button>
                  </div>
                ))}
                {eligibleCourseTeachers.length === 0 && <p className="text-center py-12 text-muted-foreground">All department teachers are already assigned</p>}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};
export default HODDashboard;
