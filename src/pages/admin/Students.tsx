import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BarChart3, Users, GraduationCap, Building2, BookOpen, Calendar, FileText, DollarSign, Bell, Shield, Settings, Search, Plus, Eye, Edit, Trash2 } from "lucide-react";

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

const students = [
  { id: "STU2024001", name: "Alice Johnson", department: "Computer Science", semester: 5, status: "active" },
  { id: "STU2024002", name: "Bob Smith", department: "Electronics", semester: 3, status: "active" },
  { id: "STU2024003", name: "Carol White", department: "Mechanical", semester: 7, status: "inactive" },
];

const AdminStudents = () => (
  <>
    <Helmet><title>Students - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Students" subtitle="Manage student records" headerActions={<Button><Plus className="h-4 w-4 mr-2" />Add Student</Button>}>
      <div className="space-y-6">
        <div className="flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search students..." className="pl-9" /></div></div>
        <Card><CardHeader><CardTitle>All Students</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-left text-sm text-muted-foreground border-b"><th className="pb-3">Student</th><th className="pb-3">Department</th><th className="pb-3">Semester</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead><tbody>{students.map(s => (<tr key={s.id} className="border-b last:border-0"><td className="py-4"><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.id}</p></td><td className="py-4">{s.department}</td><td className="py-4">{s.semester}</td><td className="py-4"><Badge variant={s.status === "active" ? "success" : "secondary"}>{s.status}</Badge></td><td className="py-4 flex gap-2"><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></td></tr>))}</tbody></table></div></CardContent></Card>
      </div>
    </DashboardLayout>
  </>
);
export default AdminStudents;