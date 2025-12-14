import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  ClipboardCheck,
  Upload,
  Bell,
  MessageSquare,
  Settings,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";

const sidebarLinks = [
  { icon: BarChart3, label: "Dashboard", href: "/teacher/dashboard" },
  { icon: Users, label: "My Students", href: "/teacher/students" },
  { icon: BookOpen, label: "Courses", href: "/teacher/courses" },
  { icon: Calendar, label: "Attendance", href: "/teacher/attendance" },
  { icon: FileText, label: "Assignments", href: "/teacher/assignments" },
  { icon: GraduationCap, label: "Exams", href: "/teacher/exams" },
  { icon: ClipboardCheck, label: "Grading", href: "/teacher/grading" },
  { icon: Upload, label: "Materials", href: "/teacher/materials" },
  { icon: Bell, label: "Announcements", href: "/teacher/announcements" },
  { icon: MessageSquare, label: "Messages", href: "/teacher/messages" },
  { icon: Settings, label: "Settings", href: "/teacher/settings" },
];

const studentsForAttendance = [
  { id: "STU2024001", name: "Alice Johnson", rollNo: 1 },
  { id: "STU2024002", name: "Bob Smith", rollNo: 2 },
  { id: "STU2024003", name: "Carol White", rollNo: 3 },
  { id: "STU2024004", name: "David Brown", rollNo: 4 },
  { id: "STU2024005", name: "Emma Davis", rollNo: 5 },
  { id: "STU2024006", name: "Frank Miller", rollNo: 6 },
  { id: "STU2024007", name: "Grace Wilson", rollNo: 7 },
  { id: "STU2024008", name: "Henry Taylor", rollNo: 8 },
];

const attendanceHistory = [
  { date: "Dec 9, 2024", course: "Data Structures", section: "CS-A", present: 42, absent: 3, percentage: 93 },
  { date: "Dec 8, 2024", course: "Algorithms", section: "CS-B", present: 38, absent: 4, percentage: 90 },
  { date: "Dec 7, 2024", course: "Data Structures", section: "CS-A", present: 44, absent: 1, percentage: 98 },
  { date: "Dec 6, 2024", course: "Data Structures Lab", section: "CS-A", present: 40, absent: 5, percentage: 89 },
];

const TeacherAttendance = () => {
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    Object.fromEntries(studentsForAttendance.map(s => [s.id, true]))
  );

  const handleToggle = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = Object.values(attendance).filter(v => !v).length;

  return (
    <>
      <Helmet>
        <title>Attendance - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="Attendance"
        subtitle="Mark and manage class attendance"
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
                      <Select defaultValue="cs301">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cs301">CS301 - Data Structures</SelectItem>
                          <SelectItem value="cs302">CS302 - Algorithms</SelectItem>
                          <SelectItem value="cs301l">CS301L - DS Lab</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="cs-a">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cs-a">CS-A</SelectItem>
                          <SelectItem value="cs-b">CS-B</SelectItem>
                        </SelectContent>
                      </Select>
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
                    {studentsForAttendance.map((student) => (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          attendance[student.id] ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {student.rollNo}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={attendance[student.id] ? "success" : "destructive"}>
                            {attendance[student.id] ? "Present" : "Absent"}
                          </Badge>
                          <Checkbox
                            checked={attendance[student.id]}
                            onCheckedChange={() => handleToggle(student.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Submit Attendance
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
                          <th className="pb-3 font-medium">Section</th>
                          <th className="pb-3 font-medium">Present</th>
                          <th className="pb-3 font-medium">Absent</th>
                          <th className="pb-3 font-medium">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceHistory.map((record, index) => (
                          <tr key={index} className="border-b border-border last:border-0">
                            <td className="py-4 font-medium">{record.date}</td>
                            <td className="py-4 text-muted-foreground">{record.course}</td>
                            <td className="py-4">
                              <Badge variant="secondary">{record.section}</Badge>
                            </td>
                            <td className="py-4 text-success">{record.present}</td>
                            <td className="py-4 text-destructive">{record.absent}</td>
                            <td className="py-4">
                              <Badge variant={record.percentage >= 85 ? "success" : "warning"}>
                                {record.percentage}%
                              </Badge>
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

export default TeacherAttendance;