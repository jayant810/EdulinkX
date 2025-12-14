import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Calendar,
  BookOpen,
  FileText,
  GraduationCap,
  TrendingUp,
  CreditCard,
  Bell,
  MessageSquare,
  Settings,
  BarChart3,
  Play,
  FileDown,
  Clock,
  Users,
} from "lucide-react";

const sidebarLinks = [
  { icon: BarChart3, label: "Dashboard", href: "/student/dashboard" },
  { icon: User, label: "My Profile", href: "/student/profile" },
  { icon: Calendar, label: "Attendance", href: "/student/attendance" },
  { icon: BookOpen, label: "Courses", href: "/student/courses" },
  { icon: FileText, label: "Assignments", href: "/student/assignments" },
  { icon: GraduationCap, label: "Exams", href: "/student/exams" },
  { icon: TrendingUp, label: "Grades", href: "/student/grades" },
  { icon: CreditCard, label: "Fees", href: "/student/fees" },
  { icon: Bell, label: "Notifications", href: "/student/notifications" },
  { icon: MessageSquare, label: "Messages", href: "/student/messages" },
  { icon: Settings, label: "Settings", href: "/student/settings" },
];

const courses = [
  {
    id: 1,
    name: "Data Structures & Algorithms",
    code: "CS301",
    instructor: "Dr. Patricia Lee",
    progress: 65,
    lectures: 18,
    totalLectures: 28,
    materials: 12,
    credits: 4,
  },
  {
    id: 2,
    name: "Database Management Systems",
    code: "CS302",
    instructor: "Prof. James Wilson",
    progress: 72,
    lectures: 20,
    totalLectures: 28,
    materials: 8,
    credits: 4,
  },
  {
    id: 3,
    name: "Computer Networks",
    code: "CS303",
    instructor: "Dr. Emily Chen",
    progress: 55,
    lectures: 15,
    totalLectures: 28,
    materials: 10,
    credits: 3,
  },
  {
    id: 4,
    name: "Operating Systems",
    code: "CS304",
    instructor: "Prof. Michael Brown",
    progress: 80,
    lectures: 22,
    totalLectures: 28,
    materials: 15,
    credits: 4,
  },
  {
    id: 5,
    name: "Software Engineering",
    code: "CS305",
    instructor: "Dr. Sarah Davis",
    progress: 45,
    lectures: 12,
    totalLectures: 26,
    materials: 6,
    credits: 3,
  },
  {
    id: 6,
    name: "Data Structures Lab",
    code: "CS306",
    instructor: "Dr. Patricia Lee",
    progress: 85,
    lectures: 12,
    totalLectures: 14,
    materials: 8,
    credits: 2,
  },
];

const StudentCourses = () => {
  return (
    <>
      <Helmet>
        <title>Courses - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Courses"
        subtitle="Access your enrolled courses and materials"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                <p className="text-2xl font-bold font-display text-primary">6</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold font-display text-success">20</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Lectures Completed</p>
                <p className="text-2xl font-bold font-display text-info">99</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Materials Available</p>
                <p className="text-2xl font-bold font-display text-accent">59</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{course.code}</Badge>
                    <Badge variant="info">{course.credits} Credits</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course.instructor}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Play className="h-4 w-4" />
                        <span>
                          {course.lectures}/{course.totalLectures} Lectures
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <FileDown className="h-4 w-4" />
                        <span>{course.materials} Materials</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentCourses;