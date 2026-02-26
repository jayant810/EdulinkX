import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  FileText,
  Trash2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { DialogDescription } from "@/components/ui/dialog";

import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherAssignments = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState({ active: [], past: [] });
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    course_id: "",
    title: "",
    description: "",
    type: "pdf",
    due_date: "",
    max_score: 100,
    duration_minutes: 30,
    questions: []
  });

  const resetForm = () => {
    setFormData({
      course_id: "",
      title: "",
      description: "",
      type: "pdf",
      due_date: "",
      max_score: 100,
      duration_minutes: 30,
      questions: []
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEditClick = async (assignmentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/teacher/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      setFormData({
        course_id: String(data.course_id),
        title: data.title,
        description: data.description || "",
        type: data.type,
        due_date: new Date(data.due_date).toISOString().slice(0, 16),
        max_score: data.max_score,
        duration_minutes: data.duration_minutes || 0,
        questions: data.questions || []
      });
      setIsEditing(true);
      setEditId(assignmentId);
      setIsDialogOpen(true);
    } catch (err) {
      toast.error("Failed to load assignment details");
    }
  };

  const fetchAssignments = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/teacher/assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.active && data.past) {
          setAssignments(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load assignments", err);
        setLoading(false);
      });
  };

  const fetchCourses = () => {
    if (!token) return;
    fetch(`${API_BASE}/api/teacher/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to fetch courses", err));
  };

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, [token]);

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { question_text: "", type: formData.type, options: ["", "", "", ""], correct_answer: "", marks: 1 }
      ]
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_: any, i: number) => i !== index)
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...formData.questions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, questions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id || !formData.title || !formData.due_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing 
        ? `${API_BASE}/api/teacher/assignments/${editId}`
        : `${API_BASE}/api/teacher/assignments`;
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save assignment");

      toast.success(isEditing ? "Assignment updated" : "Assignment created");
      setIsDialogOpen(false);
      fetchAssignments();
      resetForm();
    } catch (err) {
      toast.error("Error saving assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { active = [], past = [] } = assignments;

  return (
    <>
      <Helmet>
        <title>Assignments - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        title="Assignments"
        subtitle="Create and manage assignments"
        headerActions={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
                <DialogDescription>
                  {isEditing ? "Update the details of your assignment below." : "Fill in the details to create a new assignment for your students."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course</label>
                    <Select 
                      value={formData.course_id} 
                      onValueChange={(val) => setFormData({...formData, course_id: val})}
                      disabled={isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={String(course.id)}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Submission Type</label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(val) => setFormData({...formData, type: val, questions: []})}
                      disabled={isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Upload</SelectItem>
                        <SelectItem value="short">Short Answer</SelectItem>
                        <SelectItem value="mcq">MCQ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignment Title</label>
                  <Input 
                    placeholder="e.g., Week 1 Quiz" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description / Instructions</label>
                  <Textarea 
                    placeholder="Provide instructions for students..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Score</label>
                    <Input 
                      type="number" 
                      value={formData.max_score}
                      onChange={(e) => setFormData({...formData, max_score: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (min)</label>
                    <Input 
                      type="number" 
                      placeholder="30"
                      disabled={formData.type === "pdf"}
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input 
                      type="datetime-local" 
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>
                </div>

                {formData.type !== "pdf" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold">Questions</h4>
                      <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                        <Plus className="h-3 w-3 mr-1" /> Add Question
                      </Button>
                    </div>
                    
                    {formData.questions.map((q: any, idx: number) => (
                      <Card key={idx} className="p-4 bg-muted/20 relative group">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 h-6 w-6 text-destructive"
                          onClick={() => removeQuestion(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="space-y-3">
                          <Input 
                            placeholder={`Question ${idx + 1}`} 
                            value={q.question_text}
                            onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
                          />
                          
                          {formData.type === "mcq" && (
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className="flex gap-2 items-center">
                                  <div 
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer text-[10px] ${q.correct_answer === String(oIdx) ? 'bg-success text-success-foreground border-success' : ''}`}
                                    onClick={() => updateQuestion(idx, 'correct_answer', String(oIdx))}
                                  >
                                    {String.fromCharCode(65 + oIdx)}
                                  </div>
                                  <Input 
                                    placeholder={`Option ${oIdx+1}`} 
                                    className="h-8 text-xs" 
                                    value={opt}
                                    onChange={(e) => {
                                      const opts = [...q.options];
                                      opts[oIdx] = e.target.value;
                                      updateQuestion(idx, 'options', opts);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Marks:</label>
                            <Input 
                              type="number" 
                              className="h-7 w-16 text-xs" 
                              value={q.marks}
                              onChange={(e) => updateQuestion(idx, 'marks', Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (isEditing ? "Update Assignment" : "Create Assignment")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }

      >
        <div className="space-y-6">
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Active Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {active.map((assignment: any) => (
                      <div
                        key={assignment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{assignment.title}</h3>
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {assignment.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            {assignment.course_code} - {assignment.course_name}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-[12px]">
                            <span className="flex items-center gap-1 text-warning font-medium">
                              <CalendarIcon className="h-3 w-3" />
                              Due: {new Date(assignment.due_date).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 text-success font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              {assignment.submissions}/{assignment.total} submitted
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-background"
                            onClick={() => navigate("/teacher/grading")}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Submissions
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-background group-hover:border-primary/50 group-hover:text-primary transition-colors"
                            onClick={() => handleEditClick(assignment.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    {active.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                        <p className="text-muted-foreground">No active assignments found.</p>
                        <Button variant="link" onClick={() => setIsDialogOpen(true)}>Create your first assignment</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Past Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3 px-2 font-medium">Assignment</th>
                          <th className="pb-3 px-2 font-medium">Course</th>
                          <th className="pb-3 px-2 font-medium">Type</th>
                          <th className="pb-3 px-2 font-medium">Due Date</th>
                          <th className="pb-3 px-2 font-medium text-center">Stats</th>
                          <th className="pb-3 px-2 font-medium text-center">Graded</th>
                          <th className="pb-3 px-2 font-medium text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {past.map((assignment: any) => (
                          <tr key={assignment.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="py-4 px-2 font-medium">{assignment.title}</td>
                            <td className="py-4 px-2 text-muted-foreground text-sm">{assignment.course_code}</td>
                            <td className="py-4 px-2">
                              <Badge variant="outline" className="text-[10px] uppercase">{assignment.type}</Badge>
                            </td>
                            <td className="py-4 px-2 text-muted-foreground text-sm">
                              {new Date(assignment.due_date).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-2 text-center text-sm font-medium">
                              {assignment.submissions}/{assignment.total}
                            </td>
                            <td className="py-4 px-2 text-center">
                              <Badge variant="success" className="text-[10px]">
                                {assignment.graded}/{assignment.total}
                              </Badge>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => navigate("/teacher/grading")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {past.length === 0 && !loading && (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-muted-foreground">
                              <FileText className="h-12 w-12 mx-auto opacity-10 mb-2" />
                              No past assignments found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TeacherAssignments;