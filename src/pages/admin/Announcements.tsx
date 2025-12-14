import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, GraduationCap, Building2, BookOpen, Calendar, FileText, DollarSign, Bell, Shield, Settings, Plus, Megaphone } from "lucide-react";

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

const announcements = [
  { title: "Winter Break Schedule", content: "College will remain closed from Dec 25 to Jan 2.", date: "Dec 10, 2024", priority: "high" },
  { title: "Mid-Term Exam Schedule Released", content: "Check the notice board for detailed schedule.", date: "Dec 8, 2024", priority: "medium" },
];

const AdminAnnouncements = () => (
  <>
    <Helmet><title>Announcements - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Announcements" subtitle="Institution-wide announcements" headerActions={<Button><Plus className="h-4 w-4 mr-2" />New Announcement</Button>}>
      <div className="space-y-4">{announcements.map((a, i) => (<Card key={i} className={`border-l-4 ${a.priority === "high" ? "border-l-destructive" : "border-l-warning"}`}><CardContent className="p-4"><div className="flex items-start gap-3"><Megaphone className="h-5 w-5 text-primary mt-1" /><div><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{a.title}</h3><Badge variant={a.priority === "high" ? "destructive" : "warning"}>{a.priority}</Badge></div><p className="text-sm text-muted-foreground">{a.content}</p><p className="text-xs text-muted-foreground mt-2">{a.date}</p></div></div></CardContent></Card>))}</div>
    </DashboardLayout>
  </>
);
export default AdminAnnouncements;