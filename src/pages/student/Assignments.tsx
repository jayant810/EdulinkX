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
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
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

const pendingAssignments = [
  {
    id: 1,
    title: "Algorithm Analysis Report",
    course: "Data Structures",
    type: "pdf",
    dueDate: "Dec 12, 2024",
    daysLeft: 3,
  },
  {
    id: 2,
    title: "Network Protocol Design",
    course: "Computer Networks",
    type: "pdf",
    dueDate: "Dec 15, 2024",
    daysLeft: 6,
  },
  {
    id: 3,
    title: "SQL Quiz",
    course: "Database Systems",
    type: "mcq",
    dueDate: "Dec 10, 2024",
    daysLeft: 1,
  },
  {
    id: 4,
    title: "OS Concepts Short Questions",
    course: "Operating Systems",
    type: "short",
    dueDate: "Dec 14, 2024",
    daysLeft: 5,
  },
];

const submittedAssignments = [
  {
    id: 5,
    title: "SQL Query Practice",
    course: "Database Systems",
    type: "pdf",
    submittedOn: "Dec 8, 2024",
    status: "graded",
    marks: "18/20",
  },
  {
    id: 6,
    title: "Binary Tree Implementation",
    course: "Data Structures",
    type: "pdf",
    submittedOn: "Dec 5, 2024",
    status: "reviewed",
    marks: "Pending",
  },
  {
    id: 7,
    title: "Process Scheduling MCQ",
    course: "Operating Systems",
    type: "mcq",
    submittedOn: "Dec 3, 2024",
    status: "graded",
    marks: "9/10",
  },
];

const StudentAssignments = () => {
  return (
    <>
      <Helmet>
        <title>Assignments - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Assignments"
        subtitle="View and submit your assignments"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold font-display text-warning">4</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold font-display text-success">12</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold font-display text-primary">10</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold font-display text-destructive">0</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{assignment.title}</h3>
                            <Badge
                              variant={
                                assignment.type === "mcq"
                                  ? "info"
                                  : assignment.type === "short"
                                  ? "accent"
                                  : "secondary"
                              }
                            >
                              {assignment.type === "mcq"
                                ? "MCQ"
                                : assignment.type === "short"
                                ? "Short Answer"
                                : "PDF Upload"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{assignment.course}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{assignment.dueDate}</p>
                            <p
                              className={`text-xs ${
                                assignment.daysLeft <= 2
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {assignment.daysLeft} days left
                            </p>
                          </div>
                          <Button size="sm">
                            {assignment.type === "pdf" ? (
                              <>
                                <Upload className="h-4 w-4 mr-1" /> Submit
                              </>
                            ) : (
                              "Start"
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submitted">
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submittedAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{assignment.title}</h3>
                            <Badge
                              variant={assignment.status === "graded" ? "success" : "warning"}
                            >
                              {assignment.status === "graded" ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {assignment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{assignment.course}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Marks: {assignment.marks}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {assignment.submittedOn}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
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

export default StudentAssignments;