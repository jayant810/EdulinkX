// src/pages/teacher/OnlineClasses.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/auth/AuthProvider";
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
  ArrowLeft,
  Radio,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import MeetingRoom from "@/components/MeetingRoom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
  const { token } = useAuth();
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
      const res = await fetch(`${API}/api/online-classes`, {
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
      const res = await fetch(`${API}/api/teacher/courses`, {
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
      const res = await fetch(`${API}/api/online-classes`, {
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
      const res = await fetch(`${API}/api/online-classes/${cls.id}/start`, {
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
      await fetch(`${API}/api/online-classes/${cls.id}/end`, {
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
      await fetch(`${API}/api/online-classes/${cls.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClasses();
    } catch (err) {
      console.error("Delete class failed:", err);
    }
  };

  // If inside a meeting room, show the full-screen room
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Online Classes</h1>
            <p className="text-slate-500 mt-1">Create and manage your virtual classrooms</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 gap-2 font-bold">
            <Plus className="w-4 h-4" /> New Class
          </Button>
        </div>

        {/* Create Class Form */}
        {showForm && (
          <Card className="border-blue-200 shadow-xl shadow-blue-100/50 animate-in slide-in-from-top-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="w-5 h-5 text-blue-600" />
                Create New Class
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  variant={isInstant ? "default" : "outline"}
                  className={isInstant ? "bg-blue-600" : ""}
                  onClick={() => setIsInstant(true)}
                >
                  <Play className="w-4 h-4 mr-2" /> Start Instantly
                </Button>
                <Button
                  variant={!isInstant ? "default" : "outline"}
                  className={!isInstant ? "bg-blue-600" : ""}
                  onClick={() => setIsInstant(false)}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Schedule for Later
                </Button>
              </div>
              <Input placeholder="Class title (e.g. Data Structures - Lecture 5)" value={title} onChange={(e) => setTitle(e.target.value)} className="h-12" />
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.course_code} - {c.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isInstant && (
                <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-12" />
              )}
              <div className="flex gap-3">
                <Button onClick={createClass} className="bg-blue-600 hover:bg-blue-700 font-bold gap-2">
                  {isInstant ? <Play className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  {isInstant ? "Start Class Now" : "Schedule Class"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Classes */}
        {liveClasses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Live Now
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {liveClasses.map((cls) => (
                <Card key={cls.id} className="border-red-200 bg-gradient-to-br from-red-50 to-white shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{cls.title}</h3>
                        {cls.course_name && <p className="text-sm text-slate-500 mt-1">{cls.course_code} - {cls.course_name}</p>}
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Started {cls.started_at ? new Date(cls.started_at).toLocaleTimeString() : "now"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1 font-bold" onClick={() => setActiveRoom({ roomId: cls.room_id, title: cls.title })}>
                          <Video className="w-4 h-4" /> Rejoin
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1 font-bold" onClick={() => endClass(cls)}>
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
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-blue-500" /> Scheduled
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {scheduledClasses.map((cls) => (
                <Card key={cls.id} className="border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{cls.title}</h3>
                        {cls.course_name && <p className="text-sm text-slate-500 mt-1">{cls.course_code} - {cls.course_name}</p>}
                        {cls.scheduled_at && (
                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(cls.scheduled_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1 font-bold" onClick={() => startClass(cls)}>
                          <Play className="w-4 h-4" /> Start
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => deleteClass(cls)}>
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
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Completed
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {endedClasses.map((cls) => (
                <Card key={cls.id} className="border-slate-100 opacity-75">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm">{cls.title}</h3>
                    {cls.course_name && <p className="text-xs text-slate-400 mt-1">{cls.course_code} - {cls.course_name}</p>}
                    <p className="text-xs text-slate-400 mt-2">{cls.ended_at ? new Date(cls.ended_at).toLocaleString() : ""}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && classes.length === 0 && !showForm && (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No online classes yet</h3>
            <p className="text-slate-500 mt-2">Create your first virtual classroom to get started</p>
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700 gap-2 font-bold" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Create Class
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
