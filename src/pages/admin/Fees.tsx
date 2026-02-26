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

const AdminFees = () => (
  <>
    <Helmet><title>Fees - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Fee Management" subtitle="Track and manage student fees">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="stat" className="border-l-success"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Collected</p><p className="text-2xl font-bold text-success">₹2.4M</p></CardContent></Card>
          <Card variant="stat" className="border-l-warning"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-warning">₹180K</p></CardContent></Card>
          <Card variant="stat" className="border-l-primary"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Collection Rate</p><p className="text-2xl font-bold text-primary">92%</p></CardContent></Card>
          <Card variant="stat" className="border-l-destructive"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Defaulters</p><p className="text-2xl font-bold text-destructive">48</p></CardContent></Card>
        </div>
        <Card><CardHeader><CardTitle>Fee Collection Progress</CardTitle></CardHeader><CardContent><div className="space-y-2"><div className="flex justify-between text-sm"><span>Overall Collection</span><span>92%</span></div><Progress value={92} /></div></CardContent></Card>
      </div>
    </DashboardLayout>
  </>
);
export default AdminFees;