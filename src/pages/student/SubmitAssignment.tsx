import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Calendar,
  BookOpen,
  FileText,
  GraduationCap,
  TrendingUp,
  CreditCard,
  Bell,
  MessageSquare,
  Settings,
  BarChart3,
  Upload,
  CheckCircle2,
  ChevronLeft,
  File,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const sidebarLinks = [
  { icon: BarChart3, label: "Dashboard", href: "/student/dashboard" },
  { icon: User, label: "My Profile", href: "/student/profile" },
  { icon: Calendar, label: "Attendance", href: "/student/attendance" },
  { icon: BookOpen, label: "Courses", href: "/student/courses" },
  { icon: FileText, label: "Assignments", href: "/student/assignments" },
  { icon: GraduationCap, label: "Exams", href: "/student/exams" },
  { icon: TrendingUp, label: "Grades", href: "/student/grades" },
  { icon: CreditCard, label: "Fees", href: "/student/fees" },
  { icon: Bell, label: "Notifications", href: "/student/notifications" },
  { icon: MessageSquare, label: "Messages", href: "/student/messages" },
  { icon: Settings, label: "Settings", href: "/student/settings" },
];

const assignmentDetails = {
  id: 1,
  title: "Algorithm Analysis Report",
  course: "Data Structures",
  courseCode: "CS301",
  dueDate: "Dec 12, 2024",
  description: "Analyze the time and space complexity of the sorting algorithms discussed in class. Include detailed explanations with examples.",
  instructions: [
    "Write a minimum of 1500 words",
    "Include code examples for each algorithm",
    "Analyze best, average, and worst-case scenarios",
    "Cite at least 3 academic references",
    "Submit as PDF format only",
  ],
  totalMarks: 20,
};

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Assignment Submitted - EdulinkX</title>
        </Helmet>
        <DashboardLayout
          sidebarLinks={sidebarLinks}
          userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
          title="Assignment Submitted"
          subtitle="Your work has been submitted successfully"
        >
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display mb-2">Submission Successful!</h1>
                <p className="text-muted-foreground">Your assignment has been submitted for review.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-left">
                <p className="text-sm"><strong>Assignment:</strong> {assignmentDetails.title}</p>
                <p className="text-sm"><strong>Course:</strong> {assignmentDetails.course}</p>
                <p className="text-sm"><strong>Files Submitted:</strong> {files.length}</p>
                <p className="text-sm"><strong>Submitted At:</strong> {new Date().toLocaleString()}</p>
              </div>
              <Button asChild>
                <Link to="/student/assignments">Back to Assignments</Link>
              </Button>
            </CardContent>
          </Card>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Submit Assignment - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Submit Assignment"
        subtitle={assignmentDetails.title}
        headerActions={
          <Button variant="outline" asChild>
            <Link to="/student/assignments">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
        }
      >
        <div className="max-w-3xl space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{assignmentDetails.courseCode}</Badge>
                  <CardTitle>{assignmentDetails.title}</CardTitle>
                </div>
                <Badge variant="warning">{assignmentDetails.totalMarks} marks</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{assignmentDetails.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Instructions</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {assignmentDetails.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Due: <strong className="text-warning">{assignmentDetails.dueDate}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your PDF files here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf"
                  multiple
                  className="max-w-xs mx-auto"
                  onChange={handleFileChange}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files</h4>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Additional Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes or comments for your instructor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                disabled={files.length === 0}
                onClick={() => setSubmitted(true)}
              >
                <Upload className="h-4 w-4 mr-2" /> Submit Assignment
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default SubmitAssignment;