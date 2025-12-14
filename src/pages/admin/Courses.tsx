import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, GraduationCap, Building2, BookOpen, Calendar, FileText, DollarSign, Bell, Shield, Settings, Plus, Eye, Edit } from "lucide-react";

const sidebarLinks = [
  { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: GraduationCap, label: "Teachers", href: "/admin/teachers" },
  { icon: Building2, label: "Departments", href: "/admin/departments" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Calendar, label: "Attendance", href: "/admin/attendance" },
  { icon: FileText, label: "Exams", href: "/admin/exams" },
  { icon: DollarSign, label: "Fees", href: "/admin/fees" },
  { icon: Bell, label: "Announcements", href: "/admin/announcements" },
  { icon: Shield, label: "Roles & Access", href: "/admin/roles" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const courses = [
  { code: "CS301", name: "Data Structures", department: "CS", credits: 4, instructor: "Dr. Patricia Lee", students: 45 },
  { code: "CS302", name: "Algorithms", department: "CS", credits: 4, instructor: "Dr. Patricia Lee", students: 42 },
  { code: "ECE201", name: "Circuit Theory", department: "ECE", credits: 3, instructor: "Dr. Michael Brown", students: 50 },
];

const AdminCourses = () => (
  <>
    <Helmet><title>Courses - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Courses" subtitle="Manage course catalog" headerActions={<Button><Plus className="h-4 w-4 mr-2" />Add Course</Button>}>
      <Card><CardHeader><CardTitle>All Courses</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left text-sm text-muted-foreground border-b"><th className="pb-3">Course</th><th className="pb-3">Department</th><th className="pb-3">Credits</th><th className="pb-3">Instructor</th><th className="pb-3">Students</th><th className="pb-3">Actions</th></tr></thead><tbody>{courses.map(c => (<tr key={c.code} className="border-b last:border-0"><td className="py-4"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.code}</p></td><td className="py-4"><Badge variant="secondary">{c.department}</Badge></td><td className="py-4">{c.credits}</td><td className="py-4">{c.instructor}</td><td className="py-4">{c.students}</td><td className="py-4 flex gap-2"><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></td></tr>))}</tbody></table></div></CardContent></Card>
    </DashboardLayout>
  </>
);
export default AdminCourses;