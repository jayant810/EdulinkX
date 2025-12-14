import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  GraduationCap,
  Users,
  Settings,
  BookOpen,
  Calendar,
  BarChart3,
  FileText,
  Video,
  MessageSquare,
  Bell,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const studentFeatures = [
  { icon: BookOpen, text: "Course Materials & Lectures" },
  { icon: Calendar, text: "Class Schedules & Timetables" },
  { icon: FileText, text: "Assignment Submission" },
  { icon: BarChart3, text: "Grade Tracking & CGPA" },
  { icon: Video, text: "Online Exam Interface" },
  { icon: Bell, text: "Smart Notifications" },
];

const teacherFeatures = [
  { icon: Users, text: "Student Management" },
  { icon: FileText, text: "Exam Creation (MCQ, Short, Long)" },
  { icon: CheckCircle2, text: "Attendance Tracking" },
  { icon: BarChart3, text: "Grading & Feedback" },
  { icon: Video, text: "Content Upload" },
  { icon: MessageSquare, text: "Communication Tools" },
];

const adminFeatures = [
  { icon: Users, text: "User Management" },
  { icon: Settings, text: "Department Configuration" },
  { icon: BarChart3, text: "Analytics Dashboard" },
  { icon: Calendar, text: "Exam Scheduling" },
  { icon: Shield, text: "Role-Based Access" },
  { icon: Globe, text: "Institution Settings" },
];

const Features = () => {
  return (
    <>
      <Helmet>
        <title>Features - EdulinkX College LMS</title>
        <meta name="description" content="Explore EdulinkX features for students, teachers, and administrators. Complete LMS with attendance, grades, exams, and course management." />
      </Helmet>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6">Platform Features</Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Powerful Tools for
              <span className="gradient-primary bg-clip-text text-transparent"> Every User</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              EdulinkX provides role-specific features designed to enhance the educational experience for students, teachers, and administrators.
            </p>
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section id="students" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">For Students</span>
              </div>
              <h2 className="text-3xl font-bold font-display mb-4">
                Your Complete Academic Companion
              </h2>
              <p className="text-muted-foreground mb-8">
                Access everything you need for academic success - from course materials to exam submissions, all in one intuitive platform.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {studentFeatures.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                    <feature.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <Button variant="hero" className="mt-8" asChild>
                <Link to="/login">
                  Access Student Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Card className="shadow-xl">
                <CardHeader className="bg-primary/5 border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Student Dashboard Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-success/10 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-success">92%</div>
                      <div className="text-xs text-muted-foreground">Attendance</div>
                    </div>
                    <div className="bg-info/10 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-info">8.5</div>
                      <div className="text-xs text-muted-foreground">CGPA</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Data Structures</span>
                      <Badge variant="success">A+</Badge>
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Database Systems</span>
                      <Badge variant="info">In Progress</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section id="teachers" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <Card className="shadow-xl">
                <CardHeader className="bg-accent/5 border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Teacher Dashboard Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-primary/10 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-primary">45</div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                    <div className="bg-accent/10 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-accent">3</div>
                      <div className="text-xs text-muted-foreground">Courses</div>
                    </div>
                    <div className="bg-warning/10 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-warning">12</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Grade Submissions</span>
                      <Badge variant="warning">5 Pending</Badge>
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Today's Classes</span>
                      <Badge variant="info">2 Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-accent">For Teachers</span>
              </div>
              <h2 className="text-3xl font-bold font-display mb-4">
                Streamline Your Teaching Workflow
              </h2>
              <p className="text-muted-foreground mb-8">
                Manage courses, create exams, track attendance, and communicate with students - all from a single powerful dashboard.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {teacherFeatures.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                    <feature.icon className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <Button variant="accent" className="mt-8" asChild>
                <Link to="/login">
                  Access Teacher Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Section */}
      <section id="admins" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-warning/10 rounded-full px-4 py-2 mb-6">
                <Settings className="h-5 w-5 text-warning" />
                <span className="text-sm font-medium text-warning">For Administrators</span>
              </div>
              <h2 className="text-3xl font-bold font-display mb-4">
                Complete Institutional Control
              </h2>
              <p className="text-muted-foreground mb-8">
                Manage users, departments, exams, and access comprehensive analytics to make data-driven decisions.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {adminFeatures.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                    <feature.icon className="h-5 w-5 text-warning" />
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-8 bg-warning text-warning-foreground hover:bg-warning/90" asChild>
                <Link to="/login">
                  Access Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Card className="shadow-xl">
                <CardHeader className="bg-warning/5 border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-warning" />
                    Admin Dashboard Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-primary/10 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-primary">2,450</div>
                      <div className="text-xs text-muted-foreground">Total Students</div>
                    </div>
                    <div className="bg-accent/10 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-accent">128</div>
                      <div className="text-xs text-muted-foreground">Faculty Members</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Departments</span>
                      <Badge>12 Active</Badge>
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm">Upcoming Exams</span>
                      <Badge variant="warning">8 Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display mb-4">
            Ready to Experience EdulinkX?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Book a demo to see how EdulinkX can transform your institution's learning experience.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/contact">
              Book a Free Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Features;
