import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, GraduationCap, Building2, BookOpen, Calendar, FileText, DollarSign, Bell, Shield, Settings, Plus, Edit } from "lucide-react";

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

const roles = [
  { name: "Super Admin", users: 2, permissions: ["All Access"] },
  { name: "Department Admin", users: 12, permissions: ["Manage Department", "View Reports"] },
  { name: "Teacher", users: 128, permissions: ["Manage Courses", "Grade Students"] },
  { name: "Student", users: 2450, permissions: ["View Courses", "Submit Assignments"] },
];

const AdminRoles = () => (
  <>
    <Helmet><title>Roles & Access - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Roles & Access" subtitle="Manage user roles and permissions" headerActions={<Button><Plus className="h-4 w-4 mr-2" />Create Role</Button>}>
      <div className="grid md:grid-cols-2 gap-6">{roles.map(r => (<Card key={r.name}><CardHeader className="flex flex-row items-center justify-between"><CardTitle>{r.name}</CardTitle><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-3">{r.users} users</p><div className="flex flex-wrap gap-2">{r.permissions.map(p => (<Badge key={p} variant="secondary">{p}</Badge>))}</div></CardContent></Card>))}</div>
    </DashboardLayout>
  </>
);
export default AdminRoles;