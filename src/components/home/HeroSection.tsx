import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Users, BookOpen, Award, ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.05),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm animate-fade-up">
              <span className="flex items-center gap-2">
                🎓 Trusted by 500+ Colleges
                <ChevronRight className="h-4 w-4" />
              </span>
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6 animate-fade-up stagger-1">
              Transform Your
              <span className="block gradient-primary bg-clip-text text-transparent">
                College Education
              </span>
              Experience
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up stagger-2">
              EdulinkX is a comprehensive learning management system designed for modern educational institutions. Streamline academics, enhance collaboration, and empower students to succeed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up stagger-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/contact">
                  Book a Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/features">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Overview
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border animate-fade-up stagger-4">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-3xl font-bold font-display text-foreground">
                  <Users className="h-6 w-6 text-primary" />
                  50K+
                </div>
                <p className="text-sm text-muted-foreground mt-1">Active Students</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-3xl font-bold font-display text-foreground">
                  <BookOpen className="h-6 w-6 text-accent" />
                  1000+
                </div>
                <p className="text-sm text-muted-foreground mt-1">Courses Delivered</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-3xl font-bold font-display text-foreground">
                  <Award className="h-6 w-6 text-warning" />
                  98%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-fade-up stagger-5">
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                <div className="bg-sidebar p-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                    <div className="w-3 h-3 rounded-full bg-warning/80" />
                    <div className="w-3 h-3 rounded-full bg-success/80" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-sidebar-foreground/50">EdulinkX Dashboard</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-primary/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-primary">92%</div>
                      <div className="text-xs text-muted-foreground">Attendance</div>
                    </div>
                    <div className="bg-accent/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-accent">8.5</div>
                      <div className="text-xs text-muted-foreground">CGPA</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Mathematics 101</span>
                      <Badge variant="success">Completed</Badge>
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Physics Lab</span>
                      <Badge variant="info">In Progress</Badge>
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Computer Science</span>
                      <Badge variant="warning">Due Soon</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg p-4 border border-border animate-pulse-glow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Top Performer</div>
                    <div className="text-xs text-muted-foreground">This Semester</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">5 Courses</div>
                    <div className="text-xs text-muted-foreground">Enrolled</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
