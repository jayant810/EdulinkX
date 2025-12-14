import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  Trash2,
  Save,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

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

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface ShortQuestion {
  id: number;
  question: string;
  marks: number;
}

const TeacherExamCreate = () => {
  const [examType, setExamType] = useState<string>("mcq");
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([
    { id: 1, question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 }
  ]);
  const [shortQuestions, setShortQuestions] = useState<ShortQuestion[]>([
    { id: 1, question: "", marks: 5 }
  ]);

  const addMCQQuestion = () => {
    setMcqQuestions([
      ...mcqQuestions,
      { id: Date.now(), question: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1 }
    ]);
  };

  const addShortQuestion = () => {
    setShortQuestions([
      ...shortQuestions,
      { id: Date.now(), question: "", marks: 5 }
    ]);
  };

  const removeMCQQuestion = (id: number) => {
    setMcqQuestions(mcqQuestions.filter(q => q.id !== id));
  };

  const removeShortQuestion = (id: number) => {
    setShortQuestions(shortQuestions.filter(q => q.id !== id));
  };

  return (
    <>
      <Helmet>
        <title>Create Exam - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "Dr. Patricia Lee", id: "FAC2024001", initials: "PL", gradientFrom: "from-accent", gradientTo: "to-primary" }}
        title="Create Exam"
        subtitle="Design a new exam for your students"
        headerActions={
          <Button variant="outline" asChild>
            <Link to="/teacher/exams">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Exams
            </Link>
          </Button>
        }
      >
        <div className="space-y-6 max-w-4xl">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Exam Title</label>
                  <Input placeholder="e.g., Mid-Term Examination" className="mt-1" />
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
                  <label className="text-sm font-medium">Exam Type</label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ (Multiple Choice)</SelectItem>
                      <SelectItem value="short">Short Answer / Fill in Blanks</SelectItem>
                      <SelectItem value="pdf">Long Answer (PDF Upload)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="60">1 Hour</SelectItem>
                      <SelectItem value="120">2 Hours</SelectItem>
                      <SelectItem value="180">3 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Exam Date</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input type="time" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Instructions</label>
                <Textarea
                  placeholder="Enter exam instructions for students..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          {examType === "mcq" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>MCQ Questions</CardTitle>
                <Badge variant="secondary">{mcqQuestions.length} Questions</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                {mcqQuestions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-lg border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge>Question {qIndex + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Marks:</label>
                          <Input type="number" className="w-16" defaultValue={q.marks} min={1} />
                        </div>
                        {mcqQuestions.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeMCQQuestion(q.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Question</label>
                      <Textarea placeholder="Enter your question..." className="mt-1" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Options (Select correct answer)</label>
                      <RadioGroup defaultValue="0">
                        {q.options.map((_, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <RadioGroupItem value={String(oIndex)} id={`q${q.id}-o${oIndex}`} />
                            <Input placeholder={`Option ${oIndex + 1}`} className="flex-1" />
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addMCQQuestion} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
              </CardContent>
            </Card>
          )}

          {examType === "short" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Short Answer Questions</CardTitle>
                <Badge variant="secondary">{shortQuestions.length} Questions</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                {shortQuestions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-lg border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge>Question {qIndex + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Marks:</label>
                          <Input type="number" className="w-16" defaultValue={q.marks} min={1} />
                        </div>
                        {shortQuestions.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeShortQuestion(q.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Question</label>
                      <Textarea placeholder="Enter your question..." className="mt-1" rows={3} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addShortQuestion} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
              </CardContent>
            </Card>
          )}

          {examType === "pdf" && (
            <Card>
              <CardHeader>
                <CardTitle>Long Answer Exam</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For PDF upload type exams, students will download the question paper and upload their answer sheets as PDF.
                </p>
                <div>
                  <label className="text-sm font-medium">Upload Question Paper (PDF)</label>
                  <Input type="file" accept=".pdf" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Marks</label>
                  <Input type="number" placeholder="100" className="mt-1 w-32" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Save as Draft</Button>
            <Button>
              <Save className="h-4 w-4 mr-2" /> Create Exam
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherExamCreate;