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

const materials = [
  { id: 1, name: "Lecture 1 - Introduction to Data Structures", type: "video", course: "Data Structures", size: "245 MB", uploaded: "Dec 1, 2024" },
  { id: 2, name: "Binary Trees Notes", type: "pdf", course: "Data Structures", size: "2.5 MB", uploaded: "Dec 3, 2024" },
  { id: 3, name: "Sorting Algorithms Slides", type: "pdf", course: "Algorithms", size: "5.2 MB", uploaded: "Dec 5, 2024" },
  { id: 4, name: "Lecture 2 - Arrays and Linked Lists", type: "video", course: "Data Structures", size: "312 MB", uploaded: "Dec 6, 2024" },
  { id: 5, name: "Assignment 1 Template", type: "document", course: "Data Structures", size: "1.1 MB", uploaded: "Dec 7, 2024" },
  { id: 6, name: "Graph Theory Lecture", type: "video", course: "Algorithms", size: "428 MB", uploaded: "Dec 8, 2024" },
];

const TeacherMaterials = () => {
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
          <Dialog>
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
                  <Input placeholder="Enter material name" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs301">CS301 - Data Structures</SelectItem>
                      <SelectItem value="cs302">CS302 - Algorithms</SelectItem>
                      <SelectItem value="cs301l">CS301L - DS Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Material Type</label>
                  <Select>
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
                  <Input type="file" className="mt-1" />
                </div>
                <Button className="w-full">
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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