import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const StudentExams = () => {
  const { token } = useAuth();
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [completedExams, setCompletedExams] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/student/exams/upcoming`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUpcomingExams(Array.isArray(data) ? data : []));

    // Simulated completed exams for now
    setCompletedExams([
      {
        id: 4,
        title: "Operating Systems Quiz 1",
        course: "CS304",
        type: "mcq",
        date: "Dec 5, 2024",
        marks: "45/50",
        percentage: 90,
        status: "passed",
      }
    ]);
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Exams - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        title="Exams"
        subtitle="View upcoming and completed exams"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold font-display text-warning">{upcomingExams.length}</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold font-display text-success">{completedExams.length}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="grid gap-4">
                {upcomingExams.map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{exam.subject}</h3>
                            <Badge variant="info">{exam.type}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{exam.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{exam.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span>{exam.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">Instructions</Button>
                          <Button>
                            <Play className="h-4 w-4 mr-1" /> Start
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {upcomingExams.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No upcoming exams.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="p-4 font-medium">Exam</th>
                          <th className="p-4 font-medium">Course</th>
                          <th className="p-4 font-medium">Marks</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedExams.map((exam) => (
                          <tr key={exam.id} className="border-b border-border last:border-0">
                            <td className="p-4 font-medium">{exam.title}</td>
                            <td className="p-4 text-muted-foreground">{exam.course}</td>
                            <td className="p-4 font-medium">{exam.marks}</td>
                            <td className="p-4">
                              <Badge variant="success">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Passed
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default StudentExams;
