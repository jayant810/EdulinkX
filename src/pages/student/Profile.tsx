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
  Mail,
  Phone,
  MapPin,
  Users,
  Edit,
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

const StudentProfile = () => {
  return (
    <>
      <Helmet>
        <title>My Profile - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="My Profile"
        subtitle="View and manage your profile information"
        headerActions={
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  JS
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold font-display">John Smith</h2>
                  <p className="text-muted-foreground">Computer Science Engineering</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="default">Semester 6</Badge>
                    <Badge variant="secondary">Section A</Badge>
                    <Badge variant="info">Batch 2021-2025</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="text-xl font-bold font-display">STU2024001</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">John Michael Smith</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">15 March 2003</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">Male</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p className="font-medium">O+</p>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>john.smith@student.edu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+1 234 567 8900</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>123 College Road, City, State 12345</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent/Guardian Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent/Guardian Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Father's Name</p>
                  <p className="font-medium">Robert Smith</p>
                  <p className="text-sm text-muted-foreground mt-1">+1 234 567 8901</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mother's Name</p>
                  <p className="font-medium">Sarah Smith</p>
                  <p className="text-sm text-muted-foreground mt-1">+1 234 567 8902</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Guardian Email</p>
                  <p className="font-medium">robert.smith@email.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">Computer Science</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Program</p>
                    <p className="font-medium">B.Tech</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current CGPA</p>
                    <p className="font-medium text-primary">8.5 / 10.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admission Year</p>
                    <p className="font-medium">2021</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-medium">21CS101</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration No.</p>
                    <p className="font-medium">REG2021CS0156</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Academic Status</p>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mentor</p>
                    <p className="font-medium">Dr. Patricia Lee</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentProfile;