// src/pages/student/OnlineClasses.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Radio, CalendarClock, Users } from "lucide-react";
import MeetingRoom from "@/components/MeetingRoom";

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
}

export default function StudentOnlineClasses() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<{ roomId: string; title: string } | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/student/online-classes`, {
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
    // Poll every 15 seconds to see new live classes
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Online Classes</h1>
          <p className="text-slate-500 mt-1">Join live classes or view upcoming schedules</p>
        </div>

        {/* Live Now */}
        {liveClasses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Live Now
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {liveClasses.map((cls) => (
                <Card key={cls.id} className="border-red-200 bg-gradient-to-br from-red-50 to-white shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">{cls.title}</h3>
                        {cls.course_name && <p className="text-sm text-slate-500 mt-1">{cls.course_code} - {cls.course_name}</p>}
                        {cls.teacher_name && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Users className="w-3 h-3" /> {cls.teacher_name}</p>}
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Started {cls.started_at ? new Date(cls.started_at).toLocaleTimeString() : "now"}
                        </p>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 gap-2 font-bold shadow-lg shadow-blue-600/20" onClick={() => setActiveRoom({ roomId: cls.room_id, title: cls.title })}>
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
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-blue-500" /> Upcoming
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scheduledClasses.map((cls) => (
                <Card key={cls.id} className="border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-base text-slate-900">{cls.title}</h3>
                    {cls.course_name && <p className="text-sm text-slate-500 mt-1">{cls.course_code} - {cls.course_name}</p>}
                    {cls.teacher_name && <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Users className="w-3 h-3" /> {cls.teacher_name}</p>}
                    {cls.scheduled_at && (
                      <p className="text-xs text-blue-500 mt-2 flex items-center gap-1 font-semibold">
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
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No classes available</h3>
            <p className="text-slate-500 mt-2">Your teachers haven't started or scheduled any online classes yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
