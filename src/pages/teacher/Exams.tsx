// import { Helmet } from "react-helmet-async";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  // Users,
  BookOpen,
  // Calendar,
  // FileText,
  // GraduationCap,
  ClipboardCheck,
  Upload,
  Bell,
  MessageSquare,
  Settings,
  // Plus,
  // Eye,
  // Edit,
  // Clock,
  // CheckCircle2,
  // UserPlus,
} from "lucide-react";
// import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  GraduationCap,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  UserPlus,
  FileText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherExams = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/teacher/exams`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (data && data.upcoming && data.past) {
          setExams(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load exams", err);
        setLoading(false);
      });
  }, [token]);

  const { upcoming = [], past = [] } = exams;

  return (
    <>
      <Helmet>
        <title>Exams - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        title="Exam Management"
        subtitle="Create and manage exams"
        headerActions={
          <Button asChild>
            <Link to="/teacher/exams/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Link>
          </Button>
        }
      >
        <div className="space-y-6">
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Exams</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="grid gap-4">
                {upcoming.map((exam: any) => (
                  <Card key={exam.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{exam.title}</h3>
                            <Badge variant={exam.exam_type === "mcq" ? "info" : "secondary"}>
                              {exam.exam_type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">Course: {exam.course_code} - {exam.course_name}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(exam.exam_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {exam.start_time} ({exam.duration_minutes}m)
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {exam.questions} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {exam.enrolled} Enrolled
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-1" /> Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {upcoming.length === 0 && !loading && (
                  <p className="text-center text-muted-foreground py-8">No upcoming exams found.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle>Past Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {past.map((exam: any) => (
                      <div key={exam.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{exam.title}</h3>
                              <Badge variant="secondary">{exam.exam_type.toUpperCase()}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{exam.course_name} • {new Date(exam.exam_date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Submitted</p>
                              <p className="font-medium">{exam.submitted}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Graded</p>
                              <Badge variant="success">{exam.graded}</Badge>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Avg. Score</p>
                              <p className="font-medium text-primary">{exam.avgScore || 0}%</p>
                            </div>
                            <Button variant="outline" size="sm">Results</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {past.length === 0 && !loading && (
                      <p className="text-center text-muted-foreground py-8">No past exams found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherExams;