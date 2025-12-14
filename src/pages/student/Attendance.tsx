import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckCircle2,
  XCircle,
  AlertCircle,
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

const subjects = [
  { name: "Data Structures", code: "CS301", present: 28, total: 30, percentage: 93 },
  { name: "Database Systems", code: "CS302", present: 25, total: 28, percentage: 89 },
  { name: "Computer Networks", code: "CS303", present: 22, total: 26, percentage: 85 },
  { name: "Operating Systems", code: "CS304", present: 27, total: 30, percentage: 90 },
  { name: "Software Engineering", code: "CS305", present: 24, total: 28, percentage: 86 },
  { name: "Data Structures Lab", code: "CS306", present: 14, total: 15, percentage: 93 },
];

const calendarDays = [
  { day: 1, status: "present" },
  { day: 2, status: "present" },
  { day: 3, status: "absent" },
  { day: 4, status: "present" },
  { day: 5, status: "holiday" },
  { day: 6, status: "holiday" },
  { day: 7, status: "present" },
  { day: 8, status: "present" },
  { day: 9, status: "present" },
  { day: 10, status: "present" },
  { day: 11, status: "absent" },
  { day: 12, status: "holiday" },
  { day: 13, status: "holiday" },
  { day: 14, status: "present" },
  { day: 15, status: "present" },
  { day: 16, status: "present" },
  { day: 17, status: "present" },
  { day: 18, status: "present" },
  { day: 19, status: "holiday" },
  { day: 20, status: "holiday" },
  { day: 21, status: "present" },
  { day: 22, status: "present" },
  { day: 23, status: "present" },
  { day: 24, status: "absent" },
  { day: 25, status: "present" },
  { day: 26, status: "holiday" },
  { day: 27, status: "holiday" },
  { day: 28, status: "present" },
  { day: 29, status: "present" },
  { day: 30, status: null },
];

const StudentAttendance = () => {
  const overallAttendance = 92;

  return (
    <>
      <Helmet>
        <title>Attendance - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Attendance"
        subtitle="Track your attendance across all subjects"
      >
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className="text-2xl font-bold font-display text-primary">{overallAttendance}%</p>
                <Progress value={overallAttendance} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Classes Attended</p>
                <p className="text-2xl font-bold font-display text-success">140</p>
                <p className="text-xs text-muted-foreground mt-1">Out of 152 classes</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Classes Missed</p>
                <p className="text-2xl font-bold font-display text-destructive">12</p>
                <p className="text-xs text-muted-foreground mt-1">This semester</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Low Attendance</p>
                <p className="text-2xl font-bold font-display text-warning">1</p>
                <p className="text-xs text-muted-foreground mt-1">Subject below 75%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar View */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>December 2024</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-muted-foreground font-medium py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d, i) => (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center rounded-md text-sm ${
                        d.status === "present"
                          ? "bg-success/20 text-success"
                          : d.status === "absent"
                          ? "bg-destructive/20 text-destructive"
                          : d.status === "holiday"
                          ? "bg-muted text-muted-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {d.day}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-success/20" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-destructive/20" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted" />
                    <span>Holiday</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject-wise Attendance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Subject-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.map((subject, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">{subject.code}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              subject.percentage >= 90
                                ? "success"
                                : subject.percentage >= 75
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {subject.percentage}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {subject.present}/{subject.total} classes
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={subject.percentage}
                        className={`h-2 ${
                          subject.percentage >= 90
                            ? "[&>div]:bg-success"
                            : subject.percentage >= 75
                            ? "[&>div]:bg-warning"
                            : "[&>div]:bg-destructive"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentAttendance;