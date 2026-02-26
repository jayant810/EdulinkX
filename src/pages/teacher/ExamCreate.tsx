import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Plus,
  Trash2,
  Save,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

interface ShortQuestion {
  id: number;
  question: string;
  marks: number;
}

const TeacherExamCreate = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [examData, setExamData] = useState({
    title: "",
    course_id: "",
    exam_type: "mcq",
    duration: "60",
    date: "",
    time: "",
    instructions: "",
    total_marks: 100
  });

  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([
    { id: 1, question: "", options: ["", "", "", ""], correctAnswer: "0", marks: 1 }
  ]);
  const [shortQuestions, setShortQuestions] = useState<ShortQuestion[]>([
    { id: 1, question: "", marks: 5 }
  ]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/teacher/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCourses)
      .catch(err => console.error("Failed to load courses", err));
  }, [token]);

  const handleCreateExam = async () => {
    if (!examData.title || !examData.course_id || !examData.date || !examData.time) {
      toast.error("Please fill in all basic exam details");
      return;
    }

    setLoading(true);
    try {
      const questions = examData.exam_type === "mcq" ? mcqQuestions : shortQuestions;
      
      const res = await fetch(`${API_BASE}/api/teacher/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...examData,
          questions
        })
      });

      if (!res.ok) throw new Error("Failed to create exam");

      toast.success("Exam created successfully!");
      navigate("/teacher/exams");
    } catch (err) {
      toast.error("Error creating exam");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMCQQuestion = () => {
    setMcqQuestions([
      ...mcqQuestions,
      { id: Date.now(), question: "", options: ["", "", "", ""], correctAnswer: "0", marks: 1 }
    ]);
  };

  const addShortQuestion = () => {
    setShortQuestions([
      ...shortQuestions,
      { id: Date.now(), question: "", marks: 5 }
    ]);
  };

  const updateMCQOption = (qId: number, oIndex: number, value: string) => {
    setMcqQuestions(mcqQuestions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[oIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  return (
    <>
      <Helmet>
        <title>Create Exam - EdulinkX</title>
      </Helmet>
      <DashboardLayout
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
                  <Input 
                    placeholder="e.g., Mid-Term Examination" 
                    className="mt-1"
                    value={examData.title}
                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <Select onValueChange={(val) => setExamData({ ...examData, course_id: val })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.course_code} - {c.course_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Exam Type</label>
                  <Select 
                    value={examData.exam_type} 
                    onValueChange={(val) => setExamData({ ...examData, exam_type: val })}
                  >
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
                  <label className="text-sm font-medium">Duration (Minutes)</label>
                  <Input 
                    type="number" 
                    className="mt-1" 
                    value={examData.duration}
                    onChange={(e) => setExamData({ ...examData, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Exam Date</label>
                  <Input 
                    type="date" 
                    className="mt-1" 
                    value={examData.date}
                    onChange={(e) => setExamData({ ...examData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input 
                    type="time" 
                    className="mt-1" 
                    value={examData.time}
                    onChange={(e) => setExamData({ ...examData, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Instructions</label>
                <Textarea
                  placeholder="Enter exam instructions for students..."
                  className="mt-1"
                  rows={4}
                  value={examData.instructions}
                  onChange={(e) => setExamData({ ...examData, instructions: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          {examData.exam_type === "mcq" && (
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
                          <Input 
                            type="number" 
                            className="w-16" 
                            value={q.marks} 
                            onChange={(e) => setMcqQuestions(mcqQuestions.map(mq => mq.id === q.id ? { ...mq, marks: parseInt(e.target.value) } : mq))}
                            min={1} 
                          />
                        </div>
                        {mcqQuestions.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => setMcqQuestions(mcqQuestions.filter(mq => mq.id !== q.id))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Question</label>
                      <Textarea 
                        placeholder="Enter your question..." 
                        className="mt-1" 
                        rows={2} 
                        value={q.question}
                        onChange={(e) => setMcqQuestions(mcqQuestions.map(mq => mq.id === q.id ? { ...mq, question: e.target.value } : mq))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Options (Select correct answer)</label>
                      <RadioGroup 
                        value={q.correctAnswer}
                        onValueChange={(val) => setMcqQuestions(mcqQuestions.map(mq => mq.id === q.id ? { ...mq, correctAnswer: val } : mq))}
                      >
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <RadioGroupItem value={String(oIndex)} id={`q${q.id}-o${oIndex}`} />
                            <Input 
                              placeholder={`Option ${oIndex + 1}`} 
                              className="flex-1" 
                              value={opt}
                              onChange={(e) => updateMCQOption(q.id, oIndex, e.target.value)}
                            />
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

          {examData.exam_type === "short" && (
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
                          <Input 
                            type="number" 
                            className="w-16" 
                            value={q.marks} 
                            onChange={(e) => setShortQuestions(shortQuestions.map(sq => sq.id === q.id ? { ...sq, marks: parseInt(e.target.value) } : sq))}
                            min={1} 
                          />
                        </div>
                        {shortQuestions.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => setShortQuestions(shortQuestions.filter(sq => sq.id !== q.id))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Question</label>
                      <Textarea 
                        placeholder="Enter your question..." 
                        className="mt-1" 
                        rows={3} 
                        value={q.question}
                        onChange={(e) => setShortQuestions(shortQuestions.map(sq => sq.id === q.id ? { ...sq, question: e.target.value } : sq))}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addShortQuestion} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={handleCreateExam} disabled={loading}>
              <Save className="h-4 w-4 mr-2" /> {loading ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherExamCreate;

// export default TeacherExamCreate;