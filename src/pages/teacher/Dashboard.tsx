import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/auth/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  LayoutGrid,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: { totalStudents: 0, activeCourses: 0, pendingGrading: 0, avgAttendance: 0 },
    classes: [],
    submissions: []
  });

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/teacher/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(json => {
        if (json && json.stats) {
          setData(json);
        }
      })
      .catch(err => console.error("Failed to fetch teacher dashboard data", err));
  }, [token]);

  const displayName = user?.name || "Teacher";
  const stats = data.stats || { totalStudents: 0, activeCourses: 0, pendingGrading: 0, avgAttendance: 0 };
  const classes = data.classes || [];
  const submissions = data.submissions || [];

  return (
    <>
      <Helmet>
        <title>Teacher Dashboard - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title="Dashboard"
        subtitle={`Welcome back, ${displayName}!`}
        headerActions={
          <div className="flex items-center gap-3">
            <Button variant="hero" size="sm" className="hidden sm:flex" onClick={() => navigate("/teacher/exams/create")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
            <button className="relative p-2 rounded-lg hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
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
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold font-display text-primary">{stats.totalStudents}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Enrolled across courses</p>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                    <p className="text-2xl font-bold font-display text-accent">{stats.activeCourses}</p>
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
                    <p className="text-2xl font-bold font-display text-warning">{stats.pendingGrading}</p>
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
                    <p className="text-2xl font-bold font-display text-success">{stats.avgAttendance}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                </div>
                <Progress value={stats.avgAttendance} className="mt-3 h-1.5" />
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Classes */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Today's Classes</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate("/teacher/attendance")}>
                  Mark Attendance
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classes.map((cls: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{cls.time ? cls.time.split(' ')[0] : '—'}</span>
                        <span className="text-xs text-muted-foreground">{cls.time ? cls.time.split(' ')[1] : ''}</span>
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
                  {classes.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No classes scheduled for today.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card className="lg:col-span-3">
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
                      {submissions.map((submission: any, index: number) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {submission.student ? submission.student.split(' ').map((n: string) => n[0]).join('') : 'U'}
                              </div>
                              <span className="font-medium">{submission.student}</span>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">{submission.assignment}</td>
                          <td className="py-3 text-muted-foreground">{submission.course}</td>
                          <td className="py-3 text-muted-foreground">{submission.time ? new Date(submission.time).toLocaleString() : '—'}</td>
                          <td className="py-3">
                            <Button variant="outline" size="sm" onClick={() => navigate("/teacher/grading")}>
                              Grade
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {submissions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">No recent submissions.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherDashboard;
