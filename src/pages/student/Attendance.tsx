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
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/student/attendance/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSummary({
        overallAttendance: data.overall || 0,
        presentClasses: data.present || 0,
        totalClasses: data.total || 0,
        missedClasses: data.absent || 0,
        lowAttendanceCount: data.breakdown?.filter((b: any) => b.percentage < 75).length || 0
      }));

    fetch(`${API_BASE}/api/student/attendance/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSubjects(data));

    fetch(`${API_BASE}/api/student/holidays`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHolidays(data));

  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/student/attendance/calendar?month=${currentMonth + 1}&year=${currentYear}&courseId=${selectedCourse || ""}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        
        const attendanceMap: any = {};
        data.forEach((d: any) => {
          const dateObj = new Date(d.class_date);
          const day = dateObj.getDate();
          attendanceMap[day] = d.status;
        });

        const calendarArray = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
          calendarArray.push({ day: 0, status: "none", title: "" });
        }

        for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
          const dateObj = new Date(currentYear, currentMonth, i);
          const dayOfWeek = dateObj.getDay();
          
          // Check if it's a weekend (Sat=6, Sun=0)
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          // Check if it's a holiday in DB
          const holiday = holidays.find(h => h.holiday_date.split('T')[0] === dateStr);
          
          let status = attendanceMap[i] || "working";
          if (!attendanceMap[i]) {
            if (holiday || isWeekend) status = "holiday";
            else status = "no-class";
          }

          calendarArray.push({
            day: i,
            status: status,
            title: holiday ? holiday.title : (isWeekend ? "Weekend" : "")
          });
        }
        setCalendarDays(calendarArray);
      });

  }, [currentMonth, currentYear, selectedCourse, token, holidays]);

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
                        d.day === 0 
                          ? "invisible" 
                          : d.status === "present"
                          ? "bg-success/20 text-success font-bold"
                          : d.status === "absent"
                          ? "bg-destructive/20 text-destructive font-bold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.day !== 0 && d.day}
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
                <div className="flex justify-between items-center">
                  <CardTitle>Subject-wise Attendance</CardTitle>
                  {selectedCourse && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(null)}>
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.map((subject: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => setSelectedCourse(selectedCourse === subject.id ? null : subject.id)}
                      className={`p-4 rounded-lg cursor-pointer transition border
                        ${selectedCourse === subject.id 
                          ? "ring-2 ring-primary bg-primary/5 border-primary" 
                          : "bg-muted/50 border-transparent hover:border-muted-foreground/20"}`}
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
                            {subject.present_classes || 0}/{subject.total_classes || 0} classes
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
