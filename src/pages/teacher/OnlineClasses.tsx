// src/pages/teacher/OnlineClasses.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  Plus,
  Play,
  Square,
  Trash2,
  Calendar,
  Clock,
  Radio,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import MeetingRoom from "@/components/MeetingRoom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

interface OnlineClass {
  id: number;
  room_id: string;
  title: string;
  course_id: number | null;
  course_name: string | null;
  course_code: string | null;
  department: string | null;
  status: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

interface Course {
  id: number;
  course_name: string;
  course_code: string;
}

export default function TeacherOnlineClasses() {
  const { user, token } = useAuth();
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<{ roomId: string; title: string } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isInstant, setIsInstant] = useState(true);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/online-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setClasses(await res.json());
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/teacher/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || data || []);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, [fetchClasses, fetchCourses]);

  const createClass = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/online-classes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          courseId: courseId ? parseInt(courseId) : null,
          scheduledAt: isInstant ? null : scheduledAt || null,
          instant: isInstant,
        }),
      });
      if (res.ok) {
        const newClass = await res.json();
        setShowForm(false);
        setTitle("");
        setCourseId("");
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

  const startClass = async (cls: OnlineClass) => {
    try {
      const res = await fetch(`${API_BASE}/api/online-classes/${cls.id}/start`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchClasses();
        setActiveRoom({ roomId: cls.room_id, title: cls.title });
      }
    } catch (err) {
      console.error("Start class failed:", err);
    }
  };

  const endClass = async (cls: OnlineClass) => {
    try {
      await fetch(`${API_BASE}/api/online-classes/${cls.id}/end`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClasses();
    } catch (err) {
      console.error("End class failed:", err);
    }
  };

  const deleteClass = async (cls: OnlineClass) => {
    if (!confirm("Delete this scheduled class?")) return;
    try {
      await fetch(`${API_BASE}/api/online-classes/${cls.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClasses();
    } catch (err) {
      console.error("Delete class failed:", err);
    }
  };

  // If inside a meeting room, show the full-screen room (outside layout)
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

  return (
    <>
      <Helmet><title>Online Classes - EdulinkX</title></Helmet>
      <DashboardLayout
        title="Online Classes"
        subtitle="Create and manage your virtual classrooms"
        headerActions={
          <Button onClick={() => setShowForm(true)} variant="hero" size="sm" className="gap-2 font-semibold">
            <Plus className="w-4 h-4" /> New Class
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Create Class Form */}
          {showForm && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="w-5 h-5 text-primary" /> Create New Class
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button variant={isInstant ? "default" : "outline"} onClick={() => setIsInstant(true)}>
                    <Play className="w-4 h-4 mr-2" /> Start Instantly
                  </Button>
                  <Button variant={!isInstant ? "default" : "outline"} onClick={() => setIsInstant(false)}>
                    <Calendar className="w-4 h-4 mr-2" /> Schedule for Later
                  </Button>
                </div>
                <Input placeholder="Class title (e.g. Data Structures - Lecture 5)" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select a course (optional)" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.course_code} - {c.course_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isInstant && <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />}
                <div className="flex gap-3">
                  <Button onClick={createClass} className="font-semibold gap-2">
                    {isInstant ? <Play className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    {isInstant ? "Start Class Now" : "Schedule Class"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Classes */}
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
                        <div>
                          <h3 className="font-semibold">{cls.title}</h3>
                          {cls.course_name && <p className="text-sm text-muted-foreground mt-1">{cls.course_code} - {cls.course_name}</p>}
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Started {cls.started_at ? new Date(cls.started_at).toLocaleTimeString() : "now"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="gap-1" onClick={() => setActiveRoom({ roomId: cls.room_id, title: cls.title })}>
                            <Video className="w-4 h-4" /> Rejoin
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1" onClick={() => endClass(cls)}>
                            <Square className="w-3 h-3" /> End
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Classes */}
          {scheduledClasses.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" /> Scheduled
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {scheduledClasses.map((cls) => (
                  <Card key={cls.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{cls.title}</h3>
                          {cls.course_name && <p className="text-sm text-muted-foreground mt-1">{cls.course_code} - {cls.course_name}</p>}
                          {cls.scheduled_at && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(cls.scheduled_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-200 hover:bg-green-50" onClick={() => startClass(cls)}>
                            <Play className="w-4 h-4" /> Start
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteClass(cls)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ended Classes */}
          {endedClasses.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> Completed
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {endedClasses.map((cls) => (
                  <Card key={cls.id} className="opacity-70">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm">{cls.title}</h3>
                      {cls.course_name && <p className="text-xs text-muted-foreground mt-1">{cls.course_code} - {cls.course_name}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{cls.ended_at ? new Date(cls.ended_at).toLocaleString() : ""}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && classes.length === 0 && !showForm && (
            <div className="text-center py-16">
              <Video className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No online classes yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first virtual classroom to get started</p>
              <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" /> Create Class
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
