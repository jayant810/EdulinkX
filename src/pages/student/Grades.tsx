import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const StudentGrades = () => {
  const { token } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/student/grades`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setGrades(Array.isArray(data) ? data : []));
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Grades - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        title="Academic Records"
        subtitle="View your grades and academic performance"
        headerActions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Marksheet
          </Button>
        }
      >
        <div className="space-y-6">
          <Tabs defaultValue="current" className="space-y-4">
            <TabsList>
              <TabsTrigger value="current">Current Semester</TabsTrigger>
              <TabsTrigger value="history">Semester History</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Semester Results</CardTitle>
                    <Badge variant="warning">In Progress</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3 font-medium">Subject</th>
                          <th className="pb-3 font-medium">Code</th>
                          <th className="pb-3 font-medium text-center">Marks</th>
                          <th className="pb-3 font-medium text-center">Grade</th>
                          <th className="pb-3 font-medium text-center">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((subject, index) => (
                          <tr key={index} className="border-b border-border last:border-0">
                            <td className="py-3 font-medium">{subject.subject}</td>
                            <td className="py-3 text-muted-foreground">{subject.code}</td>
                            <td className="py-3 text-center font-medium">{subject.marks}</td>
                            <td className="py-3 text-center">
                              <Badge variant="success">{subject.grade}</Badge>
                            </td>
                            <td className="py-3 text-center">{subject.credits}</td>
                          </tr>
                        ))}
                        {grades.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">No grades found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Semester-wise Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">Historical records will appear here after graduation from each semester.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentGrades;
