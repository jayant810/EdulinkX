import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ChevronRight,
  PlayCircle,
  FolderOpen,
} from "lucide-react";
import { Link } from "react-router-dom";

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

const courses = [
  {
    id: 1,
    name: "Data Structures",
    code: "CS301",
    section: "CS-A",
    students: 45,
    progress: 65,
    lectures: 18,
    totalLectures: 28,
    materials: 24,
  },
  {
    id: 2,
    name: "Algorithms",
    code: "CS302",
    section: "CS-B",
    students: 42,
    progress: 58,
    lectures: 16,
    totalLectures: 28,
    materials: 20,
  },
  {
    id: 3,
    name: "Data Structures Lab",
    code: "CS301L",
    section: "CS-A",
    students: 45,
    progress: 70,
    lectures: 10,
    totalLectures: 14,
    materials: 15,
  },
];

const TeacherCourses = () => {
  return (
    <>
      <Helmet>
        <title>Courses - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="My Courses"
        subtitle="Manage your courses and content"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold font-display text-primary">3</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold font-display text-accent">132</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Lectures Done</p>
                <p className="text-2xl font-bold font-display text-success">44</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Materials Uploaded</p>
                <p className="text-2xl font-bold font-display text-info">59</p>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2">{course.code}</Badge>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Section {course.section}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-sm font-medium">{course.students}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <PlayCircle className="h-4 w-4 mx-auto mb-1 text-accent" />
                      <p className="text-sm font-medium">{course.lectures}/{course.totalLectures}</p>
                      <p className="text-xs text-muted-foreground">Lectures</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <FolderOpen className="h-4 w-4 mx-auto mb-1 text-success" />
                      <p className="text-sm font-medium">{course.materials}</p>
                      <p className="text-xs text-muted-foreground">Materials</p>
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link to={`/teacher/courses/${course.id}`}>
                      Manage Course <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherCourses;