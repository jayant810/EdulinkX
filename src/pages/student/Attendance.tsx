import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const StudentAttendance = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { token } = useAuth();
  
  const [summary, setSummary] = useState({
    overallAttendance: 0,
    presentClasses: 0,
    totalClasses: 0,
    missedClasses: 0,
    lowAttendanceCount: 0
  });

  const [subjects, setSubjects] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/student/attendance/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSummary(data));

    fetch(`${API_BASE}/api/student/attendance/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSubjects(data));

  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/student/attendance/calendar?month=${currentMonth + 1}&year=${currentYear}&courseId=${selectedCourse || ""}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const attendanceMap: any = {};
        data.forEach((d: any) => {
          const day = new Date(d.date).getDate();
          attendanceMap[day] = d.status;
        });

        const calendarArray = [];
        for (let i = 1; i <= daysInMonth; i++) {
          calendarArray.push({
            day: i,
            status: attendanceMap[i] || "holiday"
          });
        }
        setCalendarDays(calendarArray);
      });

  }, [currentMonth, currentYear, selectedCourse, token]);

  return (
    <>
      <Helmet>
        <title>Attendance - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title="Attendance"
        subtitle="Track your attendance across all subjects"
      >
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className="text-2xl font-bold font-display text-primary">
                  {summary.overallAttendance}%
                </p>
                <Progress value={summary.overallAttendance} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Classes Attended</p>
                <p className="text-2xl font-bold font-display text-success">
                  {summary.presentClasses}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Out of {summary.totalClasses} classes
                </p>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Classes Missed</p>
                <p className="text-2xl font-bold font-display text-destructive">
                  {summary.missedClasses}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This semester</p>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Low Attendance</p>
                <p className="text-2xl font-bold font-display text-warning">
                  {summary.lowAttendanceCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Subject below 75%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(y => y - 1);
                      } else {
                        setCurrentMonth(m => m - 1);
                      }
                    }}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition"
                  >
                    ←
                  </button>
                  <span className="text-sm">
                    {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(y => y + 1);
                      } else {
                        setCurrentMonth(m => m + 1);
                      }
                    }}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition"
                  >
                    →
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-muted-foreground font-medium py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d, i) => (
                    <div key={i}
                      className={`aspect-square flex items-center justify-center rounded-md text-xs ${
                        d.status === "present"
                          ? "bg-success/20 text-success"
                          : d.status === "absent"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.day}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-success/20" />
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-destructive/20" />
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-muted" />
                    <span>Holiday/No Class</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject-wise */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Subject-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.map((subject: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => setSelectedCourse(subject.course_id)}
                      className={`p-4 rounded-lg cursor-pointer transition bg-muted/50 
                        ${selectedCourse === subject.course_id ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">{subject.code}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            subject.percentage >= 90 ? "success" :
                            subject.percentage >= 75 ? "warning" : "destructive"
                          }>
                            {subject.percentage}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {subject.present}/{subject.total} classes
                          </p>
                        </div>
                      </div>
                      <Progress value={subject.percentage} className="h-2" />
                    </div>
                  ))}
                  {subjects.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No attendance records found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentAttendance;
