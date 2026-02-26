import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  ChevronRight,
  PlayCircle,
  FolderOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherCourses = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/teacher/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []));
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Courses - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title="My Courses"
        subtitle="Manage your courses and content"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold font-display text-primary">{courses.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <Badge variant="secondary">{course.code}</Badge>
                  <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Section {course.section || "-"}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted/50 rounded">
                      <Users className="h-4 w-4 mx-auto text-primary" />
                      <p>{course.students}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <PlayCircle className="h-4 w-4 mx-auto text-accent" />
                      <p>{course.lecturesDone}/{course.totalLectures}</p>
                      <p className="text-xs text-muted-foreground">Lectures</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <FolderOpen className="h-4 w-4 mx-auto text-success" />
                      <p>{course.materials}</p>
                      <p className="text-xs text-muted-foreground">Materials</p>
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link to={`/teacher/courses/${course.id}`}>
                      Manage Course <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>

                </CardContent>
              </Card>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No courses assigned yet.
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherCourses;
