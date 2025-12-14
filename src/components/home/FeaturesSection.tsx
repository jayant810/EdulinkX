import { Card, CardContent } from "@/components/ui/card";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Shield,
  Clock,
  FileText,
  Video,
  MessageSquare,
  Bell,
  Settings
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Student Portal",
    description: "Complete academic management with attendance, grades, and course materials in one place.",
    color: "primary",
  },
  {
    icon: Users,
    title: "Teacher Dashboard",
    description: "Powerful tools for course management, grading, and student performance tracking.",
    color: "accent",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    description: "Create, organize, and deliver course content with multimedia support.",
    color: "info",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automated timetables, exam schedules, and event management.",
    color: "warning",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Comprehensive insights into student performance and institutional metrics.",
    color: "success",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with role-based access control.",
    color: "destructive",
  },
];

const additionalFeatures = [
  { icon: Clock, text: "Attendance Tracking" },
  { icon: FileText, text: "Assignment Management" },
  { icon: Video, text: "Video Lectures" },
  { icon: MessageSquare, text: "Communication Hub" },
  { icon: Bell, text: "Smart Notifications" },
  { icon: Settings, text: "Custom Configuration" },
];

const colorVariants: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
};

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Everything You Need for
            <span className="gradient-primary bg-clip-text text-transparent"> Modern Education</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete ecosystem designed to streamline academic operations and enhance the learning experience for everyone.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="hover"
              className="group opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-xl ${colorVariants[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold font-display mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          <h3 className="text-xl font-semibold font-display mb-6 text-center">
            And Much More...
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.text}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <feature.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-center">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
