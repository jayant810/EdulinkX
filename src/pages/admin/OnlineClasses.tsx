// src/pages/admin/OnlineClasses.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Radio, CalendarClock, CheckCircle2, Users, Building2, BookOpen, Clock } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface OnlineClass {
  id: number;
  room_id: string;
  title: string;
  course_name: string | null;
  course_code: string | null;
  department: string | null;
  teacher_name: string | null;
  status: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export default function AdminOnlineClasses() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/online-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setClasses(await res.json());
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClasses();
    const interval = setInterval(fetchClasses, 15000);
    return () => clearInterval(interval);
  }, [fetchClasses]);

  const liveClasses = classes.filter((c) => c.status === "live");
  const scheduledClasses = classes.filter((c) => c.status === "scheduled");
  const endedClasses = classes.filter((c) => c.status === "ended");

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      live: "bg-red-100 text-red-700",
      scheduled: "bg-blue-100 text-blue-700",
      ended: "bg-slate-100 text-slate-600",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.ended}`}>
        {status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Online Classes Monitor</h1>
          <p className="text-slate-500 mt-1">Overview of all virtual classrooms across departments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-100"><Radio className="w-6 h-6 text-red-600" /></div>
              <div>
                <p className="text-2xl font-black text-red-700">{liveClasses.length}</p>
                <p className="text-sm text-slate-500 font-semibold">Live Now</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-100"><CalendarClock className="w-6 h-6 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-black text-blue-700">{scheduledClasses.length}</p>
                <p className="text-sm text-slate-500 font-semibold">Scheduled</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-100"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
              <div>
                <p className="text-2xl font-black text-green-700">{endedClasses.length}</p>
                <p className="text-sm text-slate-500 font-semibold">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="w-5 h-5 text-blue-600" /> All Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && classes.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No online classes created yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-3">Title</th>
                      <th className="p-3">Teacher</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {classes.map((cls) => (
                      <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{cls.title}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Users className="w-3.5 h-3.5" /> {cls.teacher_name || "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Building2 className="w-3.5 h-3.5" /> {cls.department || "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-slate-600">
                            <BookOpen className="w-3.5 h-3.5" /> {cls.course_code ? `${cls.course_code}` : "—"}
                          </span>
                        </td>
                        <td className="p-3"><StatusBadge status={cls.status} /></td>
                        <td className="p-3 text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.status === "live" && cls.started_at && new Date(cls.started_at).toLocaleTimeString()}
                          {cls.status === "scheduled" && cls.scheduled_at && new Date(cls.scheduled_at).toLocaleString()}
                          {cls.status === "ended" && cls.ended_at && new Date(cls.ended_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
