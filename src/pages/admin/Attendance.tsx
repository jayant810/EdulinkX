import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, GraduationCap, Building2, BookOpen, Calendar, FileText, DollarSign, Bell, Shield, Settings } from "lucide-react";

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

const deptAttendance = [
  { name: "Computer Science", percentage: 89 },
  { name: "Electronics", percentage: 85 },
  { name: "Mechanical", percentage: 82 },
  { name: "Civil", percentage: 88 },
];

const AdminAttendance = () => (
  <>
    <Helmet><title>Attendance - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Attendance" subtitle="Institution-wide attendance overview">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="stat" className="border-l-success"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Overall Attendance</p><p className="text-2xl font-bold text-success">86%</p></CardContent></Card>
          <Card variant="stat" className="border-l-warning"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Below 75%</p><p className="text-2xl font-bold text-warning">142</p></CardContent></Card>
          <Card variant="stat" className="border-l-primary"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Today's Present</p><p className="text-2xl font-bold text-primary">2,180</p></CardContent></Card>
          <Card variant="stat" className="border-l-destructive"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Today's Absent</p><p className="text-2xl font-bold text-destructive">270</p></CardContent></Card>
        </div>
        <Card><CardHeader><CardTitle>Department-wise Attendance</CardTitle></CardHeader><CardContent className="space-y-4">{deptAttendance.map(d => (<div key={d.name} className="space-y-2"><div className="flex justify-between text-sm"><span>{d.name}</span><span className="font-medium">{d.percentage}%</span></div><Progress value={d.percentage} /></div>))}</CardContent></Card>
      </div>
    </DashboardLayout>
  </>
);
export default AdminAttendance;