import {
  BarChart3,
  Users,
  UserCheck,
  Building2,
  BookOpen,
  Calendar,
  GraduationCap,
  CreditCard,
  Bell,
  ShieldAlert,
  Settings,
  User,
  FileText,
  TrendingUp,
  MessageSquare,
  CheckSquare,
  FileDown,
  LayoutGrid,
  Shield,
  Upload,
  ClipboardCheck,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";

export const useSidebarLinks = () => {
  const { user } = useAuth();

  const adminLinks = [
    { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Students", href: "/admin/students" },
    { icon: GraduationCap, label: "Teachers", href: "/admin/teachers" },
    { icon: Building2, label: "Departments", href: "/admin/departments" },
    { icon: BookOpen, label: "Courses", href: "/admin/courses" },
    { icon: Calendar, label: "Attendance", href: "/admin/attendance" },
    { icon: FileText, label: "Exams", href: "/admin/exams" },
    { icon: DollarSign, label: "Fees", href: "/admin/fees" },
    { icon: Bell, label: "Announcements", href: "/admin/announcements" },
    { icon: LayoutGrid, label: "Community", href: "/community" },
    { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
    { icon: Shield, label: "Roles & Access", href: "/admin/roles" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const teacherLinks = [
    { icon: BarChart3, label: "Dashboard", href: "/teacher/dashboard" },
    { icon: Users, label: "My Students", href: "/teacher/students" },
    { icon: BookOpen, label: "Courses", href: "/teacher/courses" },
    { icon: Calendar, label: "Attendance", href: "/teacher/attendance" },
    { icon: FileText, label: "Assignments", href: "/teacher/assignments" },
    { icon: GraduationCap, label: "Exams", href: "/teacher/exams" },
    { icon: ClipboardCheck, label: "Grading", href: "/teacher/grading" },
    { icon: Upload, label: "Materials", href: "/teacher/materials" },
    { icon: Bell, label: "Announcements", href: "/teacher/announcements" },
    { icon: LayoutGrid, label: "Community", href: "/community" },
    { icon: MessageSquare, label: "Messages", href: "/teacher/messages" },
    { icon: Settings, label: "Settings", href: "/teacher/settings" },
  ];

  const studentLinks = [
    { icon: BarChart3, label: "Dashboard", href: "/student/dashboard" },
    { icon: User, label: "My Profile", href: "/student/profile" },
    { icon: Calendar, label: "Attendance", href: "/student/attendance" },
    { icon: BookOpen, label: "Courses", href: "/student/courses" },
    { icon: FileText, label: "Assignments", href: "/student/assignments" },
    { icon: GraduationCap, label: "Exams", href: "/student/exams" },
    { icon: TrendingUp, label: "Grades", href: "/student/grades" },
    { icon: CreditCard, label: "Fees", href: "/student/fees" },
    { icon: LayoutGrid, label: "Community", href: "/community" },
    { icon: Bell, label: "Notifications", href: "/student/notifications" },
    { icon: MessageSquare, label: "Messages", href: "/student/messages" },
    { icon: Settings, label: "Settings", href: "/student/settings" },
  ];

  return {
    adminLinks,
    teacherLinks,
    studentLinks,
    sidebarLinks: user?.role === 'admin' ? adminLinks : (user?.role === 'teacher' ? teacherLinks : studentLinks)
  };
};
