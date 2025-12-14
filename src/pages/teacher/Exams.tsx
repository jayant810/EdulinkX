import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  UserPlus,
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

const upcomingExams = [
  { id: 1, title: "Data Structures Mid-Term", course: "CS301", type: "mcq", date: "Dec 15, 2024", duration: "2 hours", questions: 50, enrolled: 45 },
  { id: 2, title: "Algorithms Quiz 2", course: "CS302", type: "short", date: "Dec 18, 2024", duration: "1 hour", questions: 15, enrolled: 42 },
  { id: 3, title: "DS Lab Practical", course: "CS301L", type: "pdf", date: "Dec 20, 2024", duration: "3 hours", questions: 5, enrolled: 45 },
];

const pastExams = [
  { id: 4, title: "Algorithms Quiz 1", course: "CS302", type: "mcq", date: "Dec 5, 2024", submitted: 42, graded: 42, avgScore: 78 },
  { id: 5, title: "Data Structures Quiz 1", course: "CS301", type: "mcq", date: "Nov 28, 2024", submitted: 45, graded: 45, avgScore: 82 },
];

const TeacherExams = () => {
  return (
    <>
      <Helmet>
        <title>Exams - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="Exam Management"
        subtitle="Create and manage exams"
        headerActions={
          <Button asChild>
            <Link to="/teacher/exams/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Link>
          </Button>
        }
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
                <p className="text-sm text-muted-foreground">Pending Grading</p>
                <p className="text-2xl font-bold font-display text-primary">0</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold font-display text-info">80%</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Exams</TabsTrigger>
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
                              {exam.type === "mcq" ? "MCQ" : exam.type === "short" ? "Short Answer" : "PDF Upload"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">Course: {exam.course}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {exam.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {exam.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {exam.questions} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {exam.enrolled} Enrolled
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-1" /> Enroll
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-1" /> Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle>Past Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastExams.map((exam) => (
                      <div key={exam.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{exam.title}</h3>
                              <Badge variant="secondary">{exam.type.toUpperCase()}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{exam.course} • {exam.date}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Submitted</p>
                              <p className="font-medium">{exam.submitted}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Graded</p>
                              <Badge variant="success">{exam.graded}</Badge>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Avg. Score</p>
                              <p className="font-medium text-primary">{exam.avgScore}%</p>
                            </div>
                            <Button variant="outline" size="sm">View Results</Button>
                          </div>
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

export default TeacherExams;