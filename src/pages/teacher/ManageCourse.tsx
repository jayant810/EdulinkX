import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { 
  ChevronLeft, PlayCircle, Plus, FileText, Upload, Trash2, 
  Clock, CheckCircle2, Pause, Play, Save, Sparkles, Brain 
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function ManageCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  
  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [newLecture, setNewLecture] = useState<any>({
    title: "",
    sub_title: "",
    video_url: "",
    notes_url: "",
    lecture_order: 1,
    is_interactive: false,
    interactions: [],
    video_type: 'url'
  });

  const loadData = async () => {
    if (!token || !courseId) return;
    setLoading(true);
    try {
      const courseRes = await fetch(`${API_BASE}/api/teacher/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (courseRes.status === 403) {
        toast.error("You do not have permission to manage this course");
        navigate("/teacher/courses");
        return;
      }
      
      const courseData = await courseRes.json();
      setCourse(courseData);

      const lecturesRes = await fetch(`${API_BASE}/api/teacher/courses/${courseId}/lectures`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lecturesData = await lecturesRes.json();
      setLectures(Array.isArray(lecturesData) ? lecturesData : []);
      
      setNewLecture(prev => ({ 
        ...prev, 
        lecture_order: (Array.isArray(lecturesData) ? lecturesData.length : 0) + 1 
      }));
    } catch (err) {
      console.error("Failed to load course data", err);
      toast.error("Error loading course data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId, token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setNewLecture(prev => ({ ...prev, video_url: data.url, video_type: 'local' }));
      toast.success("Video uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const addInteractionAtCurrentTime = () => {
    if (!previewVideoRef.current) return;
    
    const currentTime = Math.floor(previewVideoRef.current.currentTime);
    previewVideoRef.current.pause();
    setIsPlaying(false);

    setNewLecture(prev => ({
      ...prev,
      is_interactive: true,
      interactions: [
        ...prev.interactions,
        { time: currentTime, question: "", options: ["", "", "", ""], correct: 0 }
      ]
    }));
    toast.info(`Captured frame at ${currentTime}s`);
  };

  const updateInteraction = (index: number, field: string, value: any) => {
    const updated = [...newLecture.interactions];
    updated[index] = { ...updated[index], [field]: value };
    setNewLecture(prev => ({ ...prev, interactions: updated }));
  };

  const addLecture = async () => {
    if (!newLecture.title || !newLecture.video_url) {
      toast.error("Title and Video URL are required");
      return;
    }

    try {
      toast.loading("Adding lecture & generating AI summary...", { id: "add-lecture" });
      const res = await fetch(`${API_BASE}/api/teacher/courses/${courseId}/lectures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newLecture)
      });

      if (!res.ok) throw new Error("Failed to add lecture");

      toast.success("Lecture added! AI summary generated automatically.", { id: "add-lecture" });
      loadData();
      setNewLecture({
        title: "",
        sub_title: "",
        video_url: "",
        notes_url: "",
        lecture_order: lectures.length + 2,
        is_interactive: false,
        interactions: [],
        video_type: 'url'
      });
    } catch (err) {
      toast.error("Failed to add lecture", { id: "add-lecture" });
    }
  };

  const deleteLecture = async (lectureId: number) => {
    if (!window.confirm("Are you sure you want to delete this lecture? This action cannot be undone and will delete any uploaded video file.")) return;

    try {
      const res = await fetch(`${API_BASE}/api/teacher/courses/${courseId}/lectures/${lectureId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Lecture deleted successfully");
      loadData();
    } catch (err) {
      toast.error("Failed to delete lecture");
    }
  };

  const getFullVideoUrl = (url: string, type: string) => {
    if (!url) return "";
    return type === 'local' ? `${API_BASE}${url}` : url;
  };

  if (loading) return <div className="p-12 text-center">Loading course details...</div>;
  if (!course) return null;

  return (
    <>
      <Helmet>
        <title>Manage {course.course_name} - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title={course.course_name}
        subtitle={`${course.course_code} • Curriculum Management`}
        headerActions={
          <Button variant="outline" size="sm" onClick={() => navigate("/teacher/courses")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      >
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* LEFT: ADD LECTURE & PREVIEW */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="text-lg flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">1</div> Video Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lecture Title</label>
                      <Input value={newLecture.title} onChange={e => setNewLecture({...newLecture, title: e.target.value})} placeholder="e.g., Understanding Recursion" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Video Source</label>
                      <div className="flex gap-2">
                        <Button 
                          variant={newLecture.video_type === 'url' ? 'accent' : 'outline'} 
                          size="sm" className="flex-1"
                          onClick={() => setNewLecture({...newLecture, video_type: 'url'})}
                        >External URL</Button>
                        <Button 
                          variant={newLecture.video_type === 'local' ? 'accent' : 'outline'} 
                          size="sm" className="flex-1"
                          onClick={() => setNewLecture({...newLecture, video_type: 'local'})}
                        >Local Upload</Button>
                      </div>
                    </div>
                  </div>

                  {newLecture.video_type === 'url' ? (
                    <Input placeholder="Enter Video URL (MP4, YouTube, etc.)" value={newLecture.video_url} onChange={e => setNewLecture({...newLecture, video_url: e.target.value})} />
                  ) : (
                    <div className="flex gap-4 items-center border p-4 rounded-lg bg-muted/30">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <Input type="file" accept="video/*" onChange={handleFileUpload} disabled={uploading} className="bg-background" />
                        <p className="text-[10px] text-muted-foreground mt-1">Maximum size: 100MB</p>
                      </div>
                      {uploading && <Clock className="h-5 w-5 animate-spin" />}
                    </div>
                  )}

                  {/* PREVIEW PLAYER */}
                  {newLecture.video_url && (
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-primary" /> Video Preview & Editor
                        </label>
                        <Badge variant="outline">Live Preview</Badge>
                      </div>
                      <div className="relative group bg-black rounded-xl overflow-hidden aspect-video shadow-2xl border-4 border-muted">
                        <video 
                          ref={previewVideoRef}
                          src={getFullVideoUrl(newLecture.video_url, newLecture.video_type)}
                          className="w-full h-full"
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                        <div className={`absolute bottom-4 left-4 right-4 flex justify-center gap-2 transition-opacity ${!isPlaying ? 'opacity-100' : 'group-hover:opacity-100 opacity-0'}`}>
                          <Button 
                            type="button"
                            variant="glass" size="sm" 
                            onClick={() => {
                              if(previewVideoRef.current?.paused) previewVideoRef.current.play();
                              else previewVideoRef.current?.pause();
                            }}
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button 
                            type="button"
                            variant="hero" size="sm"
                            onClick={addInteractionAtCurrentTime}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Interaction Here
                          </Button>
                        </div>
                      </div>
                      <p className="text-[11px] text-center text-muted-foreground">
                        Pause the video and click <strong>"Add Interaction Here"</strong> to insert a quiz at that specific frame.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* INTERACTIONS LIST */}
              {newLecture.interactions.length > 0 && (
                <Card className="border-info/30 bg-info/5 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info font-bold">2</div>
                      Knowledge Checkpoints
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {newLecture.interactions.map((inter: any, idx: number) => (
                      <div key={idx} className="p-4 bg-background border rounded-xl shadow-sm space-y-4 relative group">
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="bg-info/20 text-info">Timestamp: {inter.time}s</Badge>
                          <Button 
                            variant="ghost" size="xs" 
                            onClick={() => setNewLecture({...newLecture, interactions: newLecture.interactions.filter((_:any, i:number) => i !== idx)})}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <Input 
                            placeholder="Question Text" 
                            value={inter.question} 
                            onChange={e => updateInteraction(idx, 'question', e.target.value)} 
                            className="font-bold border-none bg-muted/30 focus-visible:ring-info"
                          />
                          <div className="grid md:grid-cols-2 gap-3">
                            {inter.options.map((opt: string, oIdx: number) => (
                              <div key={oIdx} className="flex gap-2 items-center">
                                <div 
                                  className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all shadow-sm ${inter.correct === oIdx ? 'bg-success text-success-foreground border-success ring-2 ring-success/20' : 'bg-muted/50 hover:border-info'}`}
                                  onClick={() => updateInteraction(idx, 'correct', oIdx)}
                                >
                                  {String.fromCharCode(65 + oIdx)}
                                </div>
                                <Input 
                                  placeholder={`Option ${oIdx+1}`} 
                                  className={`h-9 ${inter.correct === oIdx ? 'border-success bg-success/5' : ''}`}
                                  value={opt} 
                                  onChange={e => {
                                    const opts = [...inter.options];
                                    opts[oIdx] = e.target.value;
                                    updateInteraction(idx, 'options', opts);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button className="w-full h-14 text-lg shadow-xl" variant="hero" onClick={addLecture} disabled={uploading || !newLecture.video_url}>
                <Save className="h-5 w-5 mr-2" /> Save Complete Lecture
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" /> AI Summary will be generated automatically after saving.
              </p>
            </div>

            {/* RIGHT: CURRICULUM OVERVIEW */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="sticky top-24 border-none shadow-lg">
                <CardHeader className="border-b bg-muted/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Curriculum</CardTitle>
                    <Badge variant="secondary">{lectures.length} Total</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[70vh] overflow-y-auto divide-y">
                    {lectures.map((l) => (
                      <div key={l.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {l.lecture_order}
                          </div>
                          <div>
                            <p className="text-sm font-semibold truncate max-w-[150px]">{l.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {l.is_interactive && <Badge variant="accent" className="text-[8px] px-1 py-0 h-3">Interactive</Badge>}
                              {l.ai_summary ? (
                                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3 bg-success/10 text-success border-success/20">Summary Ready</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 opacity-50">No Summary</Badge>
                              )}
                              <p className="text-[10px] text-muted-foreground">{l.video_type === 'local' ? 'Uploaded' : 'URL'}</p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" size="xs" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteLecture(l.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {lectures.length === 0 && (
                      <div className="p-12 text-center text-xs text-muted-foreground">
                        No lectures yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
