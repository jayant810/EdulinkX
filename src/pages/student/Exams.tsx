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
  Clock,
  Play,
  CheckCircle2,
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

const upcomingExams = [
  {
    id: 1,
    title: "Data Structures Mid-Term",
    course: "CS301",
    type: "mcq",
    date: "Dec 15, 2024",
    time: "10:00 AM",
    duration: "2 hours",
    questions: 50,
  },
  {
    id: 2,
    title: "Database Systems Quiz",
    course: "CS302",
    type: "mcq",
    date: "Dec 12, 2024",
    time: "2:00 PM",
    duration: "1 hour",
    questions: 25,
  },
  {
    id: 3,
    title: "Computer Networks Theory",
    course: "CS303",
    type: "pdf",
    date: "Dec 18, 2024",
    time: "9:00 AM",
    duration: "3 hours",
    questions: 8,
  },
];

const completedExams = [
  {
    id: 4,
    title: "Operating Systems Quiz 1",
    course: "CS304",
    type: "mcq",
    date: "Dec 5, 2024",
    marks: "45/50",
    percentage: 90,
    status: "passed",
  },
  {
    id: 5,
    title: "Software Engineering Mid-Term",
    course: "CS305",
    type: "short",
    date: "Nov 28, 2024",
    marks: "38/50",
    percentage: 76,
    status: "passed",
  },
  {
    id: 6,
    title: "Data Structures Lab Test",
    course: "CS306",
    type: "mcq",
    date: "Nov 20, 2024",
    marks: "28/30",
    percentage: 93,
    status: "passed",
  },
];

const StudentExams = () => {
  return (
    <>
      <Helmet>
        <title>Exams - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Exams"
        subtitle="View upcoming and completed exams"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold font-display text-warning">3</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold font-display text-success">8</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold font-display text-primary">86%</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold font-display text-info">100%</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="grid gap-4">
                {upcomingExams.map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{exam.title}</h3>
                            <Badge
                              variant={
                                exam.type === "mcq"
                                  ? "info"
                                  : exam.type === "short"
                                  ? "accent"
                                  : "secondary"
                              }
                            >
                              {exam.type === "mcq"
                                ? "MCQ"
                                : exam.type === "short"
                                ? "Short Answer"
                                : "PDF Upload"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Course: {exam.course}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{exam.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{exam.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span>{exam.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{exam.questions} Questions</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">View Instructions</Button>
                          <Button>
                            <Play className="h-4 w-4 mr-1" /> Start Exam
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="p-4 font-medium">Exam</th>
                          <th className="p-4 font-medium">Course</th>
                          <th className="p-4 font-medium">Type</th>
                          <th className="p-4 font-medium">Date</th>
                          <th className="p-4 font-medium">Marks</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedExams.map((exam) => (
                          <tr key={exam.id} className="border-b border-border last:border-0">
                            <td className="p-4 font-medium">{exam.title}</td>
                            <td className="p-4 text-muted-foreground">{exam.course}</td>
                            <td className="p-4">
                              <Badge variant="secondary">{exam.type.toUpperCase()}</Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">{exam.date}</td>
                            <td className="p-4 font-medium">{exam.marks}</td>
                            <td className="p-4">
                              <Badge variant="success">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Passed
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Button variant="ghost" size="sm">
                                View Results
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default StudentExams;