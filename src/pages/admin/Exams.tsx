import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, GraduationCap, Building2, BookOpen, Calendar, FileText, DollarSign, Bell, Shield, Settings, Plus } from "lucide-react";

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

const exams = [
  { title: "Mid-Term Examinations", type: "Semester Exam", startDate: "Dec 15, 2024", endDate: "Dec 25, 2024", status: "upcoming" },
  { title: "End Semester Exams", type: "Semester Exam", startDate: "Jan 15, 2025", endDate: "Jan 30, 2025", status: "scheduled" },
];

const AdminExams = () => (
  <>
    <Helmet><title>Exams - EdulinkX Admin</title></Helmet>
    <DashboardLayout sidebarLinks={sidebarLinks} userInfo={{ name: "Admin User", id: "Super Admin", initials: "AD", gradientFrom: "from-warning", gradientTo: "to-destructive" }} title="Exams" subtitle="Manage examination schedules" headerActions={<Button><Plus className="h-4 w-4 mr-2" />Schedule Exam</Button>}>
      <div className="space-y-4">{exams.map((e, i) => (<Card key={i}><CardContent className="p-6 flex justify-between items-center"><div><h3 className="font-semibold">{e.title}</h3><p className="text-sm text-muted-foreground">{e.type} • {e.startDate} - {e.endDate}</p></div><Badge variant={e.status === "upcoming" ? "warning" : "info"}>{e.status}</Badge></CardContent></Card>))}</div>
    </DashboardLayout>
  </>
);
export default AdminExams;