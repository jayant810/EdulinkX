import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  ClipboardCheck,
  Upload,
  Bell,
  MessageSquare,
  Settings,
  Search,
  Filter,
  Eye,
  Mail,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const sidebarLinks = [
  { icon: BarChart3, label: "Dashboard", href: "/teacher/dashboard" },
  { icon: Users, label: "My Students", href: "/teacher/students" },
  { icon: BookOpen, label: "Courses", href: "/teacher/courses" },
  { icon: Calendar, label: "Attendance", href: "/teacher/attendance" },
  { icon: FileText, label: "Assignments", href: "/teacher/assignments" },
  { icon: GraduationCap, label: "Exams", href: "/teacher/exams" },
  { icon: ClipboardCheck, label: "Grading", href: "/teacher/grading" },
  { icon: Upload, label: "Materials", href: "/teacher/materials" },
  { icon: Bell, label: "Announcements", href: "/teacher/announcements" },
  { icon: MessageSquare, label: "Messages", href: "/teacher/messages" },
  { icon: Settings, label: "Settings", href: "/teacher/settings" },
];

const students = [
  { id: "STU2024001", name: "Alice Johnson", course: "Data Structures", section: "CS-A", attendance: 92, grade: "A", trend: "up" },
  { id: "STU2024002", name: "Bob Smith", course: "Data Structures", section: "CS-A", attendance: 88, grade: "B+", trend: "up" },
  { id: "STU2024003", name: "Carol White", course: "Algorithms", section: "CS-B", attendance: 76, grade: "B", trend: "down" },
  { id: "STU2024004", name: "David Brown", course: "Data Structures", section: "CS-A", attendance: 95, grade: "A+", trend: "up" },
  { id: "STU2024005", name: "Emma Davis", course: "Algorithms", section: "CS-B", attendance: 82, grade: "B+", trend: "up" },
  { id: "STU2024006", name: "Frank Miller", course: "Data Structures Lab", section: "CS-A", attendance: 70, grade: "C+", trend: "down" },
];

const TeacherStudents = () => {
  return (
    <>
      <Helmet>
        <title>My Students - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="My Students"
        subtitle="View and manage enrolled students"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold font-display text-primary">132</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Above 85% Attendance</p>
                <p className="text-2xl font-bold font-display text-success">98</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Below 75% Attendance</p>
                <p className="text-2xl font-bold font-display text-warning">12</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg. Grade</p>
                <p className="text-2xl font-bold font-display text-info">B+</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-9" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border">
                      <th className="pb-3 font-medium">Student</th>
                      <th className="pb-3 font-medium">Course</th>
                      <th className="pb-3 font-medium">Section</th>
                      <th className="pb-3 font-medium">Attendance</th>
                      <th className="pb-3 font-medium">Grade</th>
                      <th className="pb-3 font-medium">Trend</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-border last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground">{student.course}</td>
                        <td className="py-4">
                          <Badge variant="secondary">{student.section}</Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant={student.attendance >= 85 ? "success" : student.attendance >= 75 ? "warning" : "destructive"}>
                            {student.attendance}%
                          </Badge>
                        </td>
                        <td className="py-4 font-medium">{student.grade}</td>
                        <td className="py-4">
                          {student.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherStudents;