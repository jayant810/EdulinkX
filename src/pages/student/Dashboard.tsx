import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/auth/AuthProvider";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Bell,
  User,
  Clock,
  FileText,
  BarChart3,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
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

const upcomingClasses = [
  { subject: "Data Structures", time: "9:00 AM - 10:00 AM", room: "Room 301", type: "Lecture" },
  { subject: "Database Systems", time: "11:00 AM - 12:00 PM", room: "Lab 105", type: "Lab" },
  { subject: "Computer Networks", time: "2:00 PM - 3:00 PM", room: "Room 204", type: "Lecture" },
];

const recentAssignments = [
  { title: "Algorithm Analysis Report", subject: "Data Structures", due: "Dec 12", status: "pending" },
  { title: "SQL Query Practice", subject: "Database Systems", due: "Dec 10", status: "submitted" },
  { title: "Network Protocol Design", subject: "Computer Networks", due: "Dec 15", status: "pending" },
];

const notifications = [
  { message: "New assignment posted in Data Structures", time: "2 hours ago", type: "info" },
  { message: "Exam schedule updated for December", time: "5 hours ago", type: "warning" },
  { message: "Fee payment reminder for next semester", time: "1 day ago", type: "alert" },
];

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name ?? "Student";
  const displayId = user?.studentId ?? user?.id ?? "—";
  const initials =
    displayName && displayName.split(" ").length > 1
      ? displayName.split(" ").map((s: string) => s[0]).slice(0, 2).join("")
      : (displayName || "U").slice(0, 2).toUpperCase();

  return (
    <>
      <Helmet>
        <title>Student Dashboard - EdulinkX</title>
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
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-sidebar-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-primary-foreground font-semibold">
                  {initials}
                </div>
                <div>
                  <div className="font-medium text-sm">{displayName}</div>
                  <div className="text-xs text-sidebar-foreground/60">{displayId}</div>
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground`}
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
              <button
                onClick={() => {
                  logout(); // clears token + user
                  navigate("/login"); // redirect
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold font-display">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {displayName}!</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-lg hover:bg-muted" aria-label="notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Semester 6</span>
                </div>
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
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="text-2xl font-bold font-display text-primary">92%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <Progress value={92} className="mt-3 h-1.5" />
                </CardContent>
              </Card>

              <Card variant="stat" className="border-l-accent">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">CGPA</p>
                      <p className="text-2xl font-bold font-display text-accent">8.5</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Out of 10.0</p>
                </CardContent>
              </Card>

              <Card variant="stat" className="border-l-info">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Courses</p>
                      <p className="text-2xl font-bold font-display text-info">6</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-info" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">This semester</p>
                </CardContent>
              </Card>

              <Card variant="stat" className="border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold font-display text-warning">3</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Assignments</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Today's Schedule</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/student/schedule">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingClasses.map((cls, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{cls.subject}</div>
                          <div className="text-sm text-muted-foreground">{cls.time}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant={cls.type === "Lab" ? "info" : "secondary"}>{cls.type}</Badge>
                          <div className="text-xs text-muted-foreground mt-1">{cls.room}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <Badge variant="destructive" className="text-xs">
                    3 new
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.map((notif, index) => (
                      <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === "info" ? "bg-info/10" : notif.type === "warning" ? "bg-warning/10" : "bg-destructive/10"
                          }`}
                        >
                          {notif.type === "info" ? (
                            <Bell className="h-4 w-4 text-info" />
                          ) : notif.type === "warning" ? (
                            <AlertCircle className="h-4 w-4 text-warning" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Recent Assignments</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/student/assignments">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">Assignment</th>
                        <th className="pb-3 font-medium">Subject</th>
                        <th className="pb-3 font-medium">Due Date</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAssignments.map((assignment, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="py-3 font-medium">{assignment.title}</td>
                          <td className="py-3 text-muted-foreground">{assignment.subject}</td>
                          <td className="py-3 text-muted-foreground">{assignment.due}</td>
                          <td className="py-3">
                            <Badge variant={assignment.status === "submitted" ? "success" : "warning"}>
                              {assignment.status === "submitted" ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {assignment.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button variant="outline" size="sm">
                              {assignment.status === "submitted" ? "View" : "Submit"}
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

export default StudentDashboard;
