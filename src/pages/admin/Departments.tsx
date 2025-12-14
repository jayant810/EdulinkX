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

const departments = [
  { name: "Computer Science", code: "CS", hod: "Dr. Patricia Lee", students: 450, teachers: 28, courses: 24 },
  { name: "Electronics", code: "ECE", hod: "Dr. Michael Brown", students: 380, teachers: 22, courses: 20 },
  { name: "Mechanical", code: "ME", hod: "Dr. Robert Wilson", students: 420, teachers: 25, courses: 22 },
];

const AdminDepartments = () => (
  <>
    <Helmet><title>Departments - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Departments" subtitle="Manage academic departments" headerActions={<Button><Plus className="h-4 w-4 mr-2" />Add Department</Button>}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(d => (
          <Card key={d.code}><CardHeader><Badge variant="secondary" className="w-fit mb-2">{d.code}</Badge><CardTitle>{d.name}</CardTitle><p className="text-sm text-muted-foreground">HOD: {d.hod}</p></CardHeader><CardContent><div className="grid grid-cols-3 gap-2 text-center"><div className="p-2 rounded-lg bg-muted/50"><p className="text-lg font-bold text-primary">{d.students}</p><p className="text-xs text-muted-foreground">Students</p></div><div className="p-2 rounded-lg bg-muted/50"><p className="text-lg font-bold text-accent">{d.teachers}</p><p className="text-xs text-muted-foreground">Teachers</p></div><div className="p-2 rounded-lg bg-muted/50"><p className="text-lg font-bold text-success">{d.courses}</p><p className="text-xs text-muted-foreground">Courses</p></div></div><Button variant="outline" className="w-full mt-4">Manage</Button></CardContent></Card>
        ))}
      </div>
    </DashboardLayout>
  </>
);
export default AdminDepartments;