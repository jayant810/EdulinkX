import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Plus,
  Edit,
  Trash2,
  Send,
  Megaphone,
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

const announcements = [
  {
    id: 1,
    title: "Mid-Term Exam Schedule Updated",
    content: "The mid-term exam for Data Structures has been rescheduled to December 15, 2024. Please check the updated schedule.",
    course: "Data Structures",
    audience: "CS-A",
    date: "Dec 9, 2024",
    priority: "high",
  },
  {
    id: 2,
    title: "Assignment Submission Deadline Extended",
    content: "Due to technical issues, the deadline for Algorithm Analysis Report has been extended by 2 days.",
    course: "Data Structures",
    audience: "All Students",
    date: "Dec 8, 2024",
    priority: "medium",
  },
  {
    id: 3,
    title: "Extra Lab Session",
    content: "An extra lab session will be conducted on Saturday for students who need additional practice.",
    course: "Data Structures Lab",
    audience: "CS-A",
    date: "Dec 7, 2024",
    priority: "low",
  },
];

const TeacherAnnouncements = () => {
  return (
    <>
      <Helmet>
        <title>Announcements - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="Announcements"
        subtitle="Create and manage announcements"
        headerActions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input placeholder="Announcement title" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="cs301">Data Structures</SelectItem>
                      <SelectItem value="cs302">Algorithms</SelectItem>
                      <SelectItem value="cs301l">DS Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="cs-a">Section CS-A</SelectItem>
                      <SelectItem value="cs-b">Section CS-B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea placeholder="Enter your announcement message..." className="mt-1" rows={4} />
                </div>
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" /> Publish Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold font-display text-primary">24</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold font-display text-destructive">3</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold font-display text-warning">5</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Read Rate</p>
                <p className="text-2xl font-bold font-display text-success">92%</p>
              </CardContent>
            </Card>
          </div>

          {/* Announcements List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      announcement.priority === "high"
                        ? "border-l-destructive bg-destructive/5"
                        : announcement.priority === "medium"
                        ? "border-l-warning bg-warning/5"
                        : "border-l-muted-foreground bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Megaphone className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <Badge
                            variant={
                              announcement.priority === "high"
                                ? "destructive"
                                : announcement.priority === "medium"
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {announcement.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="secondary">{announcement.course}</Badge>
                          <span>To: {announcement.audience}</span>
                          <span>• {announcement.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherAnnouncements;