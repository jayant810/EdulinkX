// src/pages/admin/OnlineClasses.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Radio, CalendarClock, CheckCircle2, Users, Building2, BookOpen, Clock, Square, LogIn } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import MeetingRoom from "@/components/MeetingRoom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

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
  const [activeRoom, setActiveRoom] = useState<{ roomId: string; title: string } | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/online-classes`, {
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

  const endClass = async (cls: OnlineClass) => {
    if (!confirm(`End "${cls.title}" by ${cls.teacher_name}?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/online-classes/${cls.id}/end`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClasses();
    } catch (err) {
      console.error("End class failed:", err);
    }
  };

  // If admin joined a meeting
  if (activeRoom) {
    return (
      <MeetingRoom
        roomId={activeRoom.roomId}
        isAdmin={false}
        onLeave={() => {
          setActiveRoom(null);
          fetchClasses();
        }}
      />
    );
  }

  const liveClasses = classes.filter((c) => c.status === "live");
  const scheduledClasses = classes.filter((c) => c.status === "scheduled");
  const endedClasses = classes.filter((c) => c.status === "ended");

  return (
    <>
      <Helmet><title>Online Classes Monitor - EdulinkX</title></Helmet>
      <DashboardLayout title="Online Classes" subtitle="Monitor all virtual classrooms across departments">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Live Now</p>
                    <p className="text-2xl font-bold font-display text-destructive">{liveClasses.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold font-display text-primary">{scheduledClasses.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarClock className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold font-display text-success">{endedClasses.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> All Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!loading && classes.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No online classes created yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">Title</th>
                        <th className="pb-3 font-medium">Teacher</th>
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium">Course</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls) => (
                        <tr key={cls.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 font-medium">{cls.title}</td>
                          <td className="py-3">
                            <span className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Users className="w-3.5 h-3.5" /> {cls.teacher_name || "—"}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Building2 className="w-3.5 h-3.5" /> {cls.department || "—"}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="flex items-center gap-1 text-muted-foreground text-sm">
                              <BookOpen className="w-3.5 h-3.5" /> {cls.course_code || "—"}
                            </span>
                          </td>
                          <td className="py-3">
                            {cls.status === "live" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" /> Live
                              </span>
                            )}
                            {cls.status === "scheduled" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Scheduled</span>
                            )}
                            {cls.status === "ended" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">Ended</span>
                            )}
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cls.status === "live" && cls.started_at && new Date(cls.started_at).toLocaleTimeString()}
                              {cls.status === "scheduled" && cls.scheduled_at && new Date(cls.scheduled_at).toLocaleString()}
                              {cls.status === "ended" && cls.ended_at && new Date(cls.ended_at).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3">
                            {cls.status === "live" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setActiveRoom({ roomId: cls.room_id, title: cls.title })}>
                                  <LogIn className="w-3.5 h-3.5" /> Join
                                </Button>
                                <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => endClass(cls)}>
                                  <Square className="w-3 h-3" /> End
                                </Button>
                              </div>
                            )}
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
      </DashboardLayout>
    </>
  );
}
