import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Bell,
  Users,
  Clock,
  FileText,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
  Upload,
  ClipboardCheck,
} from "lucide-react";

const sidebarLinks = [
  { icon: BarChart3, label: "Dashboard", href: "/teacher/dashboard", active: true },
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

const todaysClasses = [
  { subject: "Data Structures", section: "CS-A", time: "9:00 AM", students: 45, room: "Room 301" },
  { subject: "Algorithms", section: "CS-B", time: "11:00 AM", students: 42, room: "Room 302" },
  { subject: "Data Structures Lab", section: "CS-A", time: "2:00 PM", students: 45, room: "Lab 105" },
];

const pendingTasks = [
  { task: "Grade Assignment: Algorithm Analysis", course: "Data Structures", count: 38, deadline: "Today" },
  { task: "Review Quiz Submissions", course: "Algorithms", count: 42, deadline: "Tomorrow" },
  { task: "Upload Lecture Notes", course: "Data Structures", count: 1, deadline: "Dec 12" },
];

const recentSubmissions = [
  { student: "Alice Johnson", assignment: "Binary Tree Implementation", course: "Data Structures", time: "2 hours ago" },
  { student: "Bob Smith", assignment: "Sorting Algorithm Report", course: "Algorithms", time: "4 hours ago" },
  { student: "Carol White", assignment: "SQL Query Practice", course: "Databases", time: "6 hours ago" },
];

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Teacher Dashboard - EdulinkX</title>
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-info">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold font-display">EdulinkX</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded hover:bg-sidebar-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center text-primary-foreground font-semibold">
                  DP
                </div>
                <div>
                  <div className="font-medium text-sm">Dr. Patricia Lee</div>
                  <div className="text-xs text-sidebar-foreground/60">FAC2024001</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-1">
                {sidebarLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        link.active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-sidebar-border">
              <Link
                to="/login"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-muted"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold font-display">Teacher Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, Dr. Lee!</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="hero" size="sm" className="hidden sm:flex">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Exam
                </Button>
                <button className="relative p-2 rounded-lg hover:bg-muted">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="stat" className="border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold font-display text-primary">132</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Across 3 courses</p>
                </CardContent>
              </Card>

              <Card variant="stat" className="border-l-accent">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Courses</p>
                      <p className="text-2xl font-bold font-display text-accent">3</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">This semester</p>
                </CardContent>
              </Card>

              <Card variant="stat" className="border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Grading</p>
                      <p className="text-2xl font-bold font-display text-warning">80</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Submissions</p>
                </CardContent>
              </Card>

              <Card variant="stat" className="border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                      <p className="text-2xl font-bold font-display text-success">89%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <Progress value={89} className="mt-3 h-1.5" />
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Today's Classes */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Today's Classes</CardTitle>
                  <Button variant="outline" size="sm">
                    Mark Attendance
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todaysClasses.map((cls, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 flex flex-col items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{cls.time.split(' ')[0]}</span>
                          <span className="text-xs text-muted-foreground">{cls.time.split(' ')[1]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{cls.subject}</div>
                          <div className="text-sm text-muted-foreground">Section {cls.section} • {cls.room}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{cls.students}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="mt-1">
                            Start Class
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Tasks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Pending Tasks</CardTitle>
                  <Badge variant="warning">{pendingTasks.length} tasks</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingTasks.map((task, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-muted/50 border-l-2 border-l-warning"
                      >
                        <div className="font-medium text-sm">{task.task}</div>
                        <div className="text-xs text-muted-foreground mt-1">{task.course}</div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {task.count} items
                          </Badge>
                          <span className="text-xs text-warning font-medium">{task.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Recent Submissions</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/teacher/grading">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Assignment</th>
                        <th className="pb-3 font-medium">Course</th>
                        <th className="pb-3 font-medium">Submitted</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubmissions.map((submission, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {submission.student.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium">{submission.student}</span>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">{submission.assignment}</td>
                          <td className="py-3 text-muted-foreground">{submission.course}</td>
                          <td className="py-3 text-muted-foreground">{submission.time}</td>
                          <td className="py-3">
                            <Button variant="outline" size="sm">
                              Grade
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default TeacherDashboard;
