import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
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

const currentSemesterGrades = [
  { subject: "Data Structures & Algorithms", code: "CS301", internal: 42, external: 75, total: 87, grade: "A", credits: 4 },
  { subject: "Database Management Systems", code: "CS302", internal: 38, external: 68, total: 79, grade: "B+", credits: 4 },
  { subject: "Computer Networks", code: "CS303", internal: 40, external: 72, total: 84, grade: "A", credits: 3 },
  { subject: "Operating Systems", code: "CS304", internal: 44, external: 78, total: 91, grade: "A+", credits: 4 },
  { subject: "Software Engineering", code: "CS305", internal: 36, external: 65, total: 75, grade: "B+", credits: 3 },
  { subject: "Data Structures Lab", code: "CS306", internal: 48, external: null, total: 95, grade: "A+", credits: 2 },
];

const semesterHistory = [
  { semester: "Semester 5", sgpa: 8.2, credits: 20, status: "Completed" },
  { semester: "Semester 4", sgpa: 8.5, credits: 22, status: "Completed" },
  { semester: "Semester 3", sgpa: 8.0, credits: 21, status: "Completed" },
  { semester: "Semester 2", sgpa: 8.8, credits: 20, status: "Completed" },
  { semester: "Semester 1", sgpa: 8.4, credits: 18, status: "Completed" },
];

const StudentGrades = () => {
  return (
    <>
      <Helmet>
        <title>Grades - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Academic Records"
        subtitle="View your grades and academic performance"
        headerActions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Marksheet
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Current SGPA</p>
                <p className="text-2xl font-bold font-display text-primary">8.7</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">CGPA</p>
                <p className="text-2xl font-bold font-display text-accent">8.5</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Credits Earned</p>
                <p className="text-2xl font-bold font-display text-success">101</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold font-display text-info">#5</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="current" className="space-y-4">
            <TabsList>
              <TabsTrigger value="current">Current Semester</TabsTrigger>
              <TabsTrigger value="history">Semester History</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Semester 6 - Results</CardTitle>
                    <Badge variant="warning">In Progress</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3 font-medium">Subject</th>
                          <th className="pb-3 font-medium">Code</th>
                          <th className="pb-3 font-medium text-center">Internal (50)</th>
                          <th className="pb-3 font-medium text-center">External (100)</th>
                          <th className="pb-3 font-medium text-center">Total</th>
                          <th className="pb-3 font-medium text-center">Grade</th>
                          <th className="pb-3 font-medium text-center">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSemesterGrades.map((subject, index) => (
                          <tr key={index} className="border-b border-border last:border-0">
                            <td className="py-3 font-medium">{subject.subject}</td>
                            <td className="py-3 text-muted-foreground">{subject.code}</td>
                            <td className="py-3 text-center">{subject.internal}</td>
                            <td className="py-3 text-center">{subject.external ?? "-"}</td>
                            <td className="py-3 text-center font-medium">{subject.total}</td>
                            <td className="py-3 text-center">
                              <Badge
                                variant={
                                  subject.grade.includes("A")
                                    ? "success"
                                    : subject.grade.includes("B")
                                    ? "info"
                                    : "secondary"
                                }
                              >
                                {subject.grade}
                              </Badge>
                            </td>
                            <td className="py-3 text-center">{subject.credits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Semester-wise Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {semesterHistory.map((sem, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                      >
                        <div>
                          <h4 className="font-medium">{sem.semester}</h4>
                          <p className="text-sm text-muted-foreground">
                            {sem.credits} Credits Earned
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{sem.sgpa}</p>
                            <p className="text-xs text-muted-foreground">SGPA</p>
                          </div>
                          <Badge variant="success">{sem.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentGrades;