import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trash2,
  CheckCircle2,
  Clock,
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

const activeAssignments = [
  { id: 1, title: "Algorithm Analysis Report", course: "Data Structures", type: "pdf", dueDate: "Dec 12, 2024", submissions: 28, total: 45 },
  { id: 2, title: "SQL Quiz", course: "Database Systems", type: "mcq", dueDate: "Dec 10, 2024", submissions: 38, total: 42 },
  { id: 3, title: "OS Concepts Short Questions", course: "Operating Systems", type: "short", dueDate: "Dec 14, 2024", submissions: 15, total: 45 },
];

const pastAssignments = [
  { id: 4, title: "Binary Tree Implementation", course: "Data Structures", type: "pdf", dueDate: "Dec 5, 2024", submissions: 45, total: 45, graded: 45 },
  { id: 5, title: "Process Scheduling MCQ", course: "Operating Systems", type: "mcq", dueDate: "Dec 3, 2024", submissions: 42, total: 42, graded: 42 },
];

const TeacherAssignments = () => {
  return (
    <>
      <Helmet>
        <title>Assignments - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="Assignments"
        subtitle="Create and manage assignments"
        headerActions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold font-display text-primary">3</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold font-display text-warning">81</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold font-display text-success">87</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Created</p>
                <p className="text-2xl font-bold font-display text-info">12</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeAssignments.map((assignment) => (
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
                              {assignment.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{assignment.course}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due: {assignment.dueDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {assignment.submissions}/{assignment.total} submitted
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle>Past Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3 font-medium">Assignment</th>
                          <th className="pb-3 font-medium">Course</th>
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Due Date</th>
                          <th className="pb-3 font-medium">Submissions</th>
                          <th className="pb-3 font-medium">Graded</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastAssignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b border-border last:border-0">
                            <td className="py-4 font-medium">{assignment.title}</td>
                            <td className="py-4 text-muted-foreground">{assignment.course}</td>
                            <td className="py-4">
                              <Badge variant="secondary">{assignment.type.toUpperCase()}</Badge>
                            </td>
                            <td className="py-4 text-muted-foreground">{assignment.dueDate}</td>
                            <td className="py-4">{assignment.submissions}/{assignment.total}</td>
                            <td className="py-4">
                              <Badge variant="success">{assignment.graded}/{assignment.total}</Badge>
                            </td>
                            <td className="py-4">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
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

export default TeacherAssignments;