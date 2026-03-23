// src/pages/admin/OnlineClasses.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video, Radio, CalendarClock, CheckCircle2, Users, Building2,
  BookOpen, Clock, Square, LogIn, Plus, Play, Calendar, XCircle,
  AlertTriangle
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import MeetingRoom from "@/components/MeetingRoom";
import { io, Socket } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || "https://web-meet.duckdns.org";

interface OnlineClass {
  id: number;
  room_id: string;
  title: string;
  course_name: string | null;
  course_code: string | null;
  department: string | null;
  teacher_name: string | null;
  status: string;
  audience_type: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  created_by_role: string | null;
}

export default function AdminOnlineClasses() {
  const { token, user } = useAuth();
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<{ roomId: string; title: string } | null>(null);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [audienceType, setAudienceType] = useState("everyone");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isInstant, setIsInstant] = useState(true);

  // Socket ref for force-ending rooms
  const socketRef = useRef<Socket | null>(null);

  const getSocket = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io(SIGNALING_SERVER, {
        path: "/socket.io/",
        transports: ["websocket"],
        reconnection: false,
      });
    }
    return socketRef.current;
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

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

  const createClass = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/online-classes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          audienceType,
          audienceTarget: null,
          scheduledAt: isInstant ? null : scheduledAt || null,
          instant: isInstant,
        }),
      });
      if (res.ok) {
        const newClass = await res.json();
        setShowForm(false);
        setTitle("");
        setAudienceType("everyone");
        setScheduledAt("");
        fetchClasses();
        if (isInstant) {
          setActiveRoom({ roomId: newClass.room_id, title: newClass.title });
        }
      }
    } catch (err) {
      console.error("Create class failed:", err);
    }
  };

  const endClass = async (cls: OnlineClass) => {
    if (!confirm(`End "${cls.title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/online-classes/${cls.id}/end`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Force-end via signaling server
        const s = getSocket();
        s.emit("force-end-room", cls.room_id);
        fetchClasses();
      }
    } catch (err) {
      console.error("End class failed:", err);
    }
  };

  const endAllClasses = async () => {
    if (!confirm("End ALL live meetings? This will kick everyone out of all active meetings.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/online-classes/end-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Force-end each room via signaling server
        const s = getSocket();
        data.rooms?.forEach((roomId: string) => {
          s.emit("force-end-room", roomId);
        });
        fetchClasses();
      }
    } catch (err) {
      console.error("End all failed:", err);
    }
  };

  // If admin joined a meeting
  if (activeRoom) {
    return (
      <MeetingRoom
        roomId={activeRoom.roomId}
        isAdmin={true}
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

  const audienceLabel = (type: string | null) => {
    switch (type) {
      case "everyone": return "Everyone";
      case "teachers_only": return "Teachers Only";
      case "students_only": return "Students Only";
      case "teachers_and_students": return "Teachers & Students";
      case "department": return "Department";
      case "course": return "Course";
      default: return type || "—";
    }
  };

  return (
    <>
      <Helmet><title>Online Classes Monitor - EdulinkX</title></Helmet>
      <DashboardLayout
        title="Online Classes"
        subtitle="Monitor and manage all virtual classrooms"
        headerActions={
          <div className="flex gap-2">
            {liveClasses.length > 0 && (
              <Button variant="destructive" size="sm" className="gap-2 font-semibold" onClick={endAllClasses}>
                <AlertTriangle className="w-4 h-4" /> End All ({liveClasses.length})
              </Button>
            )}
            <Button onClick={() => setShowForm(true)} variant="hero" size="sm" className="gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Create Meeting
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Create Meeting Form */}
          {showForm && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="w-5 h-5 text-primary" /> Create Admin Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button variant={isInstant ? "default" : "outline"} onClick={() => setIsInstant(true)}>
                    <Play className="w-4 h-4 mr-2" /> Start Instantly
                  </Button>
                  <Button variant={!isInstant ? "default" : "outline"} onClick={() => setIsInstant(false)}>
                    <Calendar className="w-4 h-4 mr-2" /> Schedule
                  </Button>
                </div>
                <Input placeholder="Meeting title (e.g. Faculty Meeting, Department Sync)" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Who should see this meeting?</label>
                  <Select value={audienceType} onValueChange={setAudienceType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone (All users)</SelectItem>
                      <SelectItem value="teachers_only">Teachers Only</SelectItem>
                      <SelectItem value="students_only">Students Only</SelectItem>
                      <SelectItem value="teachers_and_students">Teachers & Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!isInstant && <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />}
                <div className="flex gap-3">
                  <Button onClick={createClass} className="font-semibold gap-2">
                    {isInstant ? <Play className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    {isInstant ? "Start Meeting Now" : "Schedule Meeting"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                        <th className="pb-3 font-medium">Created By</th>
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium">Audience</th>
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
                              {cls.created_by_role === "admin" && (
                                <span className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-bold ml-1">Admin</span>
                              )}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Building2 className="w-3.5 h-3.5" /> {cls.department || "—"}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {audienceLabel(cls.audience_type)}
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
