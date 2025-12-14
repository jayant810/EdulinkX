import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Eye,
  Download,
  CheckCircle2,
  Send,
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

const pendingSubmissions = [
  { id: 1, student: "Alice Johnson", studentId: "STU2024001", assignment: "Algorithm Analysis Report", course: "Data Structures", type: "pdf", submitted: "2 hours ago" },
  { id: 2, student: "Bob Smith", studentId: "STU2024002", assignment: "SQL Quiz", course: "Database Systems", type: "mcq", submitted: "4 hours ago" },
  { id: 3, student: "Carol White", studentId: "STU2024003", assignment: "Network Protocol Design", course: "Computer Networks", type: "pdf", submitted: "6 hours ago" },
  { id: 4, student: "David Brown", studentId: "STU2024004", assignment: "OS Concepts", course: "Operating Systems", type: "short", submitted: "1 day ago" },
];

const gradedSubmissions = [
  { id: 5, student: "Emma Davis", studentId: "STU2024005", assignment: "Binary Tree Implementation", course: "Data Structures", marks: "18/20", gradedOn: "Dec 8, 2024" },
  { id: 6, student: "Frank Miller", studentId: "STU2024006", assignment: "Process Scheduling MCQ", course: "Operating Systems", marks: "9/10", gradedOn: "Dec 7, 2024" },
];

const TeacherGrading = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<typeof pendingSubmissions[0] | null>(null);

  return (
    <>
      <Helmet>
        <title>Grading - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="Grading"
        subtitle="Review and grade submissions"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold font-display text-warning">{pendingSubmissions.length}</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Graded Today</p>
                <p className="text-2xl font-bold font-display text-success">12</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold font-display text-primary">45</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg. Marks</p>
                <p className="text-2xl font-bold font-display text-info">85%</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="graded">Graded</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {submission.student.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{submission.student}</p>
                              <Badge variant={submission.type === "mcq" ? "info" : submission.type === "short" ? "accent" : "secondary"}>
                                {submission.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{submission.assignment}</p>
                            <p className="text-xs text-muted-foreground">{submission.course} • {submission.submitted}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {submission.type === "pdf" && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedSubmission(submission)}>
                                <ClipboardCheck className="h-4 w-4 mr-1" /> Grade
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Grade Submission</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div className="p-4 rounded-lg bg-muted/50">
                                  <p className="font-medium">{submission.student}</p>
                                  <p className="text-sm text-muted-foreground">{submission.assignment}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Marks Obtained</label>
                                    <Input type="number" placeholder="0" className="mt-1" />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Total Marks</label>
                                    <Input type="number" placeholder="20" className="mt-1" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Feedback</label>
                                  <Textarea placeholder="Enter feedback for the student..." className="mt-1" rows={4} />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Upload Checked PDF (Optional)</label>
                                  <Input type="file" accept=".pdf" className="mt-1" />
                                </div>
                                <Button className="w-full">
                                  <Send className="h-4 w-4 mr-2" /> Submit Grade
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graded">
              <Card>
                <CardHeader>
                  <CardTitle>Graded Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3 font-medium">Student</th>
                          <th className="pb-3 font-medium">Assignment</th>
                          <th className="pb-3 font-medium">Course</th>
                          <th className="pb-3 font-medium">Marks</th>
                          <th className="pb-3 font-medium">Graded On</th>
                          <th className="pb-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradedSubmissions.map((submission) => (
                          <tr key={submission.id} className="border-b border-border last:border-0">
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-xs font-medium text-success">
                                  <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{submission.student}</p>
                                  <p className="text-xs text-muted-foreground">{submission.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-muted-foreground">{submission.assignment}</td>
                            <td className="py-4 text-muted-foreground">{submission.course}</td>
                            <td className="py-4">
                              <Badge variant="success">{submission.marks}</Badge>
                            </td>
                            <td className="py-4 text-muted-foreground">{submission.gradedOn}</td>
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

export default TeacherGrading;