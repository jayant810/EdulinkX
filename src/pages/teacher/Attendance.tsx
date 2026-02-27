import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { BulkUpload } from "@/components/shared/BulkUpload";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const attendanceTemplate = [
  { student_id: "STU001", status: "present" },
  { student_id: "STU002", status: "absent" }
];

const TeacherAttendance = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = () => {
    fetch(`${API_BASE}/api/teacher/attendance/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []));
  };

  const loadStudents = () => {
    if (!token || !selectedCourse || !selectedDate) {
      setStudents([]);
      return;
    }
    // Load students and existing records for selected course and date
    fetch(`${API_BASE}/api/teacher/courses/${selectedCourse}/students?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const studentList = data.students || [];
        setStudents(studentList);
        // If existing records found, use them; otherwise default to all present
        if (data.existingRecords && Object.keys(data.existingRecords).length > 0) {
          setAttendance(data.existingRecords);
        } else {
          setAttendance(Object.fromEntries(studentList.map((s: any) => [s.id, true])));
        }
      })
      .catch(err => {
        console.error("Error loading students:", err);
        setStudents([]);
      });
  };

  useEffect(() => {
    if (!token) return;
    // Load courses
    fetch(`${API_BASE}/api/teacher/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        if (data.length > 0) {
          const firstCourseId = String(data[0].id);
          setSelectedCourse(firstCourseId);
        }
      });

    loadHistory();
  }, [token]);

  useEffect(() => {
    loadStudents();
  }, [selectedCourse, selectedDate, token]);

  const handleToggle = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulkAttendance = async (data: any[]) => {
    if (!selectedCourse || !selectedDate) {
      toast.error("Please select a course and date first");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/teacher/attendance/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          date: selectedDate,
          attendance: data
        })
      });

      if (!res.ok) throw new Error("Bulk attendance upload failed");

      toast.success(`Successfully uploaded attendance for ${data.length} students`);
      loadStudents();
      loadHistory();
    } catch (err) {
      toast.error("Failed to upload attendance");
      console.error(err);
    }
  };

  const handleSubmitAttendance = async () => {
    if (!selectedCourse || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          date: selectedDate,
          records: attendance
        })
      });

      if (!res.ok) throw new Error("Failed to submit");

      toast.success("Attendance updated successfully");
      loadHistory();
        
    } catch (err) {
      toast.error("Error submitting attendance");
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = Object.values(attendance).filter(v => !v).length;

  return (
    <>
      <Helmet>
        <title>Attendance - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        title="Attendance"
        subtitle="Mark and manage class attendance"
        headerActions={
          <BulkUpload 
            onUpload={handleBulkAttendance} 
            templateData={attendanceTemplate} 
            templateFileName="attendance_template.xlsx"
            buttonText="Bulk Upload Attendance"
          />
        }
      >
        <div className="space-y-6">
          <Tabs defaultValue="mark" className="space-y-4">
            <TabsList>
              <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="mark">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Mark Attendance</CardTitle>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Select Course</label>
                        <Select value={selectedCourse} onValueChange={(val) => setSelectedCourse(val)}>
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select Course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c: any) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.course_code || c.code} - {c.course_name || c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Select Date</label>
                        <Input 
                          type="date" 
                          className="w-[160px]" 
                          value={selectedDate} 
                          onChange={(e) => setSelectedDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Badge variant="success" className="px-4 py-2">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Present: {presentCount}
                    </Badge>
                    <Badge variant="destructive" className="px-4 py-2">
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent: {absentCount}
                    </Badge>
                  </div>

                  <div className="grid gap-2">
                    {students.map((student: any) => (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          attendance[student.id] ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {student.roll_number || "—"}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.student_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={attendance[student.id] ? "success" : "destructive"}>
                            {attendance[student.id] ? "Present" : "Absent"}
                          </Badge>
                          <Checkbox
                            checked={attendance[student.id] || false}
                            onCheckedChange={() => handleToggle(student.id)}
                          />
                        </div>
                      </div>
                    ))}
                    {students.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No students found for this course.</p>
                    )}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button onClick={handleSubmitAttendance} disabled={loading || students.length === 0}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Course</th>
                          <th className="pb-3 font-medium text-center">Present</th>
                          <th className="pb-3 font-medium text-center">Absent</th>
                          <th className="pb-3 font-medium text-center">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((record: any, index) => (
                          <tr key={index} className="border-b border-border last:border-0">
                            <td className="py-4 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="py-4 text-muted-foreground">{record.course}</td>
                            <td className="py-4 text-success text-center">{record.present}</td>
                            <td className="py-4 text-destructive text-center">{record.absent}</td>
                            <td className="py-4 text-center">
                              <Badge variant={record.percentage >= 85 ? "success" : "warning"}>
                                {record.percentage}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        {history.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground">No attendance history found.</td>
                          </tr>
                        )}
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

export default TeacherAttendance;
