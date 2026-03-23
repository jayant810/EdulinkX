// src/pages/student/OnlineClasses.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Radio, CalendarClock, Users } from "lucide-react";
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
}

export default function StudentOnlineClasses() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<{ roomId: string; title: string } | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/student/online-classes`, {
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

  return (
    <>
      <Helmet><title>Online Classes - EdulinkX</title></Helmet>
      <DashboardLayout title="Online Classes" subtitle="Join live classes or view upcoming schedules">
        <div className="space-y-6">
          {/* Live Now */}
          {liveClasses.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4 text-destructive animate-pulse" /> Live Now
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {liveClasses.map((cls) => (
                  <Card key={cls.id} className="border-destructive/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" /> Live
                            </span>
                          </div>
                          <h3 className="font-semibold">{cls.title}</h3>
                          {cls.course_name && <p className="text-sm text-muted-foreground mt-1">{cls.course_code} - {cls.course_name}</p>}
                          {cls.teacher_name && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Users className="w-3 h-3" /> {cls.teacher_name}</p>}
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Started {cls.started_at ? new Date(cls.started_at).toLocaleTimeString() : "now"}
                          </p>
                        </div>
                        <Button className="gap-2 shrink-0" onClick={() => setActiveRoom({ roomId: cls.room_id, title: cls.title })}>
                          <Video className="w-4 h-4" /> Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {scheduledClasses.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" /> Upcoming
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scheduledClasses.map((cls) => (
                  <Card key={cls.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{cls.title}</h3>
                      {cls.course_name && <p className="text-sm text-muted-foreground mt-1">{cls.course_code} - {cls.course_name}</p>}
                      {cls.teacher_name && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Users className="w-3 h-3" /> {cls.teacher_name}</p>}
                      {cls.scheduled_at && (
                        <p className="text-xs text-primary mt-2 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" /> {new Date(cls.scheduled_at).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && classes.length === 0 && (
            <div className="text-center py-16">
              <Video className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No classes available</h3>
              <p className="text-sm text-muted-foreground mt-1">Your teachers haven't started or scheduled any online classes yet</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
