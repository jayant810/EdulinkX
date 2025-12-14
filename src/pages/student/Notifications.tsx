import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
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

const notifications = [
  { id: 1, type: "info", title: "New Assignment Posted", message: "A new assignment 'Algorithm Analysis Report' has been posted in Data Structures.", time: "2 hours ago", read: false },
  { id: 2, type: "warning", title: "Exam Schedule Updated", message: "The schedule for Database Systems Mid-Term has been updated to Dec 12, 2024.", time: "5 hours ago", read: false },
  { id: 3, type: "alert", title: "Fee Payment Reminder", message: "Your Semester 6 fee payment is due by December 31, 2024.", time: "1 day ago", read: false },
  { id: 4, type: "success", title: "Assignment Graded", message: "Your assignment 'SQL Query Practice' has been graded. You scored 18/20.", time: "2 days ago", read: true },
  { id: 5, type: "info", title: "New Course Material", message: "Lecture notes for 'Network Protocols' have been uploaded in Computer Networks.", time: "3 days ago", read: true },
  { id: 6, type: "success", title: "Attendance Updated", message: "Your attendance for today's Operating Systems class has been marked.", time: "4 days ago", read: true },
  { id: 7, type: "warning", title: "Low Attendance Warning", message: "Your attendance in Computer Networks is below 85%. Please attend classes regularly.", time: "1 week ago", read: true },
];

const StudentNotifications = () => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Helmet>
        <title>Notifications - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Notifications"
        subtitle="Stay updated with your latest notifications"
        headerActions={
          <Button variant="outline" size="sm">
            Mark all as read
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold font-display text-primary">{notifications.length}</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold font-display text-destructive">{unreadCount}</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold font-display text-warning">
                  {notifications.filter(n => n.type === "alert" || n.type === "warning").length}
                </p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Success</p>
                <p className="text-2xl font-bold font-display text-success">
                  {notifications.filter(n => n.type === "success").length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-4 p-4 rounded-lg transition-colors ${
                      notification.read ? "bg-muted/30" : "bg-muted/50 border-l-2 border-l-primary"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        notification.type === "info"
                          ? "bg-info/10"
                          : notification.type === "warning"
                          ? "bg-warning/10"
                          : notification.type === "alert"
                          ? "bg-destructive/10"
                          : "bg-success/10"
                      }`}
                    >
                      {notification.type === "info" ? (
                        <Info className="h-5 w-5 text-info" />
                      ) : notification.type === "warning" ? (
                        <AlertCircle className="h-5 w-5 text-warning" />
                      ) : notification.type === "alert" ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.read && (
                          <Badge variant="destructive" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
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

export default StudentNotifications;