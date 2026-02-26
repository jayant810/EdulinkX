import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Mail,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherStudents = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/teacher/students`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        // Add derived fields (attendance, grade, trend) since DB doesn't have them yet
        const enriched = data.map((s: any) => {
          const cgpa = parseFloat(s.cgpa) || 0;

          let grade = "C";
          if (cgpa >= 9) grade = "A+";
          else if (cgpa >= 8) grade = "A";
          else if (cgpa >= 7) grade = "B+";
          else if (cgpa >= 6) grade = "B";

          return {
            ...s,
            attendance: Math.floor(60 + Math.random() * 40), // temporary demo
            grade,
            trend: cgpa >= 7 ? "up" : "down"
          };
        });

        setStudents(enriched);
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token]);

  return (
    <>
      <Helmet>
        <title>My Students - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title="My Students"
        subtitle="View and manage enrolled students"
      >
        <div className="space-y-6">

          {/* Loading */}
          {loading && <p className="text-muted-foreground">Loading students...</p>}

          {/* Students Table */}
          {!loading && (
            <Card>
              <CardHeader>
                <CardTitle>Student List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">Student</th>
                        <th className="pb-3 font-medium">Course</th>
                        <th className="pb-3 font-medium">Section</th>
                        <th className="pb-3 font-medium">Attendance</th>
                        <th className="pb-3 font-medium">Grade</th>
                        <th className="pb-3 font-medium">Trend</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-border last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {student.name.split(" ").map((n: string) => n[0]).join("")}
                              </div>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground">{student.course}</td>
                          <td className="py-4">
                            <Badge variant="secondary">{student.section}</Badge>
                          </td>
                          <td className="py-4">
                            <Badge variant={student.attendance >= 85 ? "success" : student.attendance >= 75 ? "warning" : "destructive"}>
                              {student.attendance}%
                            </Badge>
                          </td>
                          <td className="py-4 font-medium">{student.grade}</td>
                          <td className="py-4">
                            {student.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-muted-foreground">
                            No students found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherStudents;
