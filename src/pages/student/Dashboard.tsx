import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/auth/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Users,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function StudentDashboard() {
  const { user, isAuthenticated, authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ attendance: 0, cgpa: 0, courses: 0, pendingAssignments: 0 });
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);

  useEffect(() => {
    if (!token) return;

    // Fetch Summary
    fetch(`${API_BASE}/api/student/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSummary(data));

    // Fetch Upcoming Classes
    fetch(`${API_BASE}/api/student/dashboard/upcoming-classes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUpcomingClasses(data));

    // Fetch Recent Assignments
    fetch(`${API_BASE}/api/student/assignments/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRecentAssignments(data.slice(0, 3)));

  }, [token]);

  // Wait for auth hydration
  if (authLoading) return null;

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const displayName = user?.name ?? "Student";

  const notifications = [
    { message: "New assignment posted in Data Structures", time: "2 hours ago", type: "info" },
    { message: "Exam schedule updated for December", time: "5 hours ago", type: "warning" },
    { message: "Fee payment reminder for next semester", time: "1 day ago", type: "alert" },
  ];

  return (
    <>
      <Helmet>
        <title>Student Dashboard - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title="Dashboard"
        subtitle={`Welcome back, ${displayName}!`}
        headerActions={
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
        }
      >
        <div className="p-0 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="text-2xl font-bold font-display text-primary">{summary.attendance}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <Progress value={summary.attendance} className="mt-3 h-1.5" />
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CGPA</p>
                    <p className="text-2xl font-bold font-display text-accent">{summary.cgpa}</p>
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
                    <p className="text-2xl font-bold font-display text-info">{summary.courses}</p>
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
                    <p className="text-2xl font-bold font-display text-warning">{summary.pendingAssignments}</p>
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
                  <Link to="/student/attendance">
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
                  {upcomingClasses.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No classes scheduled for today.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <Badge variant="destructive" className="text-xs">
                  {notifications.length} new
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
                        <td className="py-3 text-muted-foreground">{assignment.course_name}</td>
                        <td className="py-3 text-muted-foreground">{new Date(assignment.due_date).toLocaleDateString()}</td>
                        <td className="py-3">
                          <Badge variant="warning">
                            <Clock className="h-3 w-3 mr-1" />
                            pending
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button variant="outline" size="sm" onClick={() => navigate("/student/assignments")}>
                            Submit
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {recentAssignments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">No recent assignments.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}
