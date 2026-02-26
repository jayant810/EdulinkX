import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const StudentCourses = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/student/courses`, {
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
        title="Courses"
        subtitle="Access your enrolled courses and materials"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="hover:shadow-lg transition">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary">{course.code}</Badge>
                  <Badge variant="info">{course.credits || 0} Credits</Badge>
                </div>
                <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {course.instructor}
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {Math.round(course.progress || 0)}%
                      </span>
                    </div>
                    <Progress value={course.progress || 0} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {course.completedLectures}/{course.totalLectures} Lectures
                    </span>
                    <span className="text-muted-foreground">
                      {course.materials} Materials
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/student/course/${course.id}`)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Continue
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        window.open(
                          `${API_BASE}/api/student/course/${course.id}/materials`,
                          "_blank"
                        );
                      }}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No courses enrolled yet.
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentCourses;
