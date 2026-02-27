import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BarChart3, Users, GraduationCap, Building2, BookOpen, Calendar, FileText, DollarSign, Bell, Shield, Settings, Save } from "lucide-react";

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

const AdminSettings = () => (
  <>
    <Helmet><title>Settings - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Settings" subtitle="System configuration">
      <div className="space-y-6 max-w-2xl">
        <Card><CardHeader><CardTitle>Institution Details</CardTitle><CardDescription>Update your institution information</CardDescription></CardHeader><CardContent className="space-y-4"><div><label className="text-sm font-medium">Institution Name</label><Input defaultValue="EdulinkX University" className="mt-1" /></div><div><label className="text-sm font-medium">Email</label><Input defaultValue="admin@edulink.edu" className="mt-1" /></div><Button><Save className="h-4 w-4 mr-2" />Save Changes</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>System Settings</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><div><p className="font-medium">Maintenance Mode</p><p className="text-sm text-muted-foreground">Put the system in maintenance mode</p></div><Switch /></div><div className="flex items-center justify-between"><div><p className="font-medium">Email Notifications</p><p className="text-sm text-muted-foreground">Send system notifications via email</p></div><Switch defaultChecked /></div>
        <div className="flex items-center justify-between"><div><p className="font-medium">Windows Notifications</p><p className="text-sm text-muted-foreground">Receive native OS notifications</p></div><Switch defaultChecked /></div></CardContent></Card>
      </div>
    </DashboardLayout>
  </>
);
export default AdminSettings;