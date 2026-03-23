import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Plus,
  Video,
  File,
  Download,
  Trash2,
  Eye,
  FolderOpen,
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

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherMaterials = () => {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ name: "", course_id: "", material_type: "document", file: null as File | null });

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/teacher/materials`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMaterials(await res.json());
    } catch (err) {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/teacher/courses`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCourses(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMaterials();
      fetchCourses();
    }
  }, [token]);

  const handleUpload = async () => {
    if (!uploadData.name || !uploadData.course_id || !uploadData.file) {
      return toast.error("Please fill all required fields");
    }
    const formData = new FormData();
    formData.append("name", uploadData.name);
    formData.append("course_id", uploadData.course_id);
    formData.append("material_type", uploadData.material_type);
    formData.append("file", uploadData.file);

    try {
      const res = await fetch(`${API_BASE}/api/teacher/materials`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        toast.success("Material uploaded successfully");
        setIsUploadOpen(false);
        setUploadData({ name: "", course_id: "", material_type: "document", file: null });
        fetchMaterials();
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading material");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/teacher/materials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Material deleted");
        fetchMaterials();
      }
    } catch (err) {
      toast.error("Error deleting material");
    }
  };

  return (
    <>
      <Helmet>
        <title>Materials - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="Course Materials"
        subtitle="Upload and manage course content"
        headerActions={
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Course Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Material Name</label>
                  <Input 
                    placeholder="Enter material name" 
                    className="mt-1" 
                    value={uploadData.name}
                    onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <Select onValueChange={(v) => setUploadData({...uploadData, course_id: v})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Material Type</label>
                  <Select defaultValue="document" onValueChange={(v) => setUploadData({...uploadData, material_type: v})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Lecture</SelectItem>
                      <SelectItem value="pdf">PDF / Notes</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Upload File</label>
                  <Input type="file" className="mt-1" onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})} />
                </div>
                <Button className="w-full" onClick={handleUpload}>
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold font-display text-primary">59</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Videos</p>
                <p className="text-2xl font-bold font-display text-accent">18</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold font-display text-success">35</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-info">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold font-display text-info">4.2 GB</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="cs301">Data Structures</SelectItem>
                <SelectItem value="cs302">Algorithms</SelectItem>
                <SelectItem value="cs301l">DS Lab</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Materials List */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        material.type === "video" ? "bg-accent/10" : material.type === "pdf" ? "bg-destructive/10" : "bg-primary/10"
                      }`}>
                        {material.type === "video" ? (
                          <Video className="h-6 w-6 text-accent" />
                        ) : material.type === "pdf" ? (
                          <File className="h-6 w-6 text-destructive" />
                        ) : (
                          <FileText className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{material.course}</Badge>
                          <span className="text-xs text-muted-foreground">{material.size}</span>
                          <span className="text-xs text-muted-foreground">• {material.uploaded}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => material.file_url ? window.open((material.file_url.startsWith('http') ? '' : API_BASE) + material.file_url, '_blank') : null}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => material.file_url ? window.open((material.file_url.startsWith('http') ? '' : API_BASE) + material.file_url, '_blank') : null}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(material.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherMaterials;