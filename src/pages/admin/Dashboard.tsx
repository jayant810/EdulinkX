import { useState } from "react";
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
  Building2,
  Shield,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  LayoutGrid,
} from "lucide-react";

const departmentStats = [
  { name: "Computer Science", students: 450, teachers: 28, courses: 24 },
  { name: "Electronics", students: 380, teachers: 22, courses: 20 },
  { name: "Mechanical", students: 420, teachers: 25, courses: 22 },
  { name: "Civil", students: 350, teachers: 20, courses: 18 },
];

const recentActivities = [
  { action: "New student registered", user: "Alice Johnson", time: "10 minutes ago", type: "student" },
  { action: "Teacher assigned to course", user: "Dr. Smith", time: "1 hour ago", type: "teacher" },
  { action: "Exam schedule published", user: "Admin", time: "2 hours ago", type: "exam" },
  { action: "Fee payment received", user: "Bob Williams", time: "3 hours ago", type: "payment" },
];

const upcomingExams = [
  { subject: "Data Structures", department: "CS", date: "Dec 15", students: 180 },
  { subject: "Database Systems", department: "CS", date: "Dec 18", students: 165 },
  { subject: "Network Security", department: "IT", date: "Dec 20", students: 140 },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || "Admin";

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title="Admin Dashboard"
        subtitle="Institution Overview"
        headerActions={
          <div className="flex items-center gap-3">
            <Button variant="hero" size="sm" className="hidden sm:flex">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add User
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
                    <p className="text-2xl font-bold font-display text-primary">2,450</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-success">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Faculty Members</p>
                    <p className="text-2xl font-bold font-display text-accent">128</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-success">
                  <TrendingUp className="h-3 w-3" />
                  <span>+3 new this month</span>
                </div>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                    <p className="text-2xl font-bold font-display text-success">84</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-success" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Across 12 departments</p>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fee Collection</p>
                    <p className="text-2xl font-bold font-display text-warning">92%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-warning" />
                  </div>
                </div>
                <Progress value={92} className="mt-3 h-1.5" />
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Department Overview */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Department Overview</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/departments">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium">Students</th>
                        <th className="pb-3 font-medium">Teachers</th>
                        <th className="pb-3 font-medium">Courses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentStats.map((dept, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{dept.name}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant="secondary">{dept.students}</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="accent">{dept.teachers}</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="info">{dept.courses}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          activity.type === "student"
                            ? "bg-primary/10"
                            : activity.type === "teacher"
                            ? "bg-accent/10"
                            : activity.type === "exam"
                            ? "bg-warning/10"
                            : "bg-success/10"
                        }`}
                      >
                        {activity.type === "student" ? (
                          <Users className="h-4 w-4 text-primary" />
                        ) : activity.type === "teacher" ? (
                          <GraduationCap className="h-4 w-4 text-accent" />
                        ) : activity.type === "exam" ? (
                          <FileText className="h-4 w-4 text-warning" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Exams */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Upcoming Examinations</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/exams">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {upcomingExams.map((exam, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">{exam.department}</Badge>
                      <span className="text-sm text-warning font-medium">{exam.date}</span>
                    </div>
                    <h4 className="font-medium mb-2">{exam.subject}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{exam.students} students</span>
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

export default AdminDashboard;
