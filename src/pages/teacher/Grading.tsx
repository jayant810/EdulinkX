import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ClipboardCheck,
  CheckCircle2,
  Send,
  Download,
  Eye,
  Clock,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherGrading = () => {
  const { token } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [gradedSubmissions, setGradedSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [aiGrading, setAiGrading] = useState<string | null>(null); // submission id being graded

  const fetchQuestions = async (sourceId: string, submitType: string) => {
    try {
      const endpoint = submitType === 'exam' 
        ? `${API_BASE}/api/teacher/exams/${sourceId}`
        : `${API_BASE}/api/teacher/assignments/${sourceId}`;
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSelectedQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Failed to fetch questions", err);
    }
  };

  const fetchSubmissions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pendingRes, gradedRes] = await Promise.all([
        fetch(`${API_BASE}/api/teacher/submissions/pending`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/teacher/submissions/graded`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const pending = await pendingRes.json();
      const graded = await gradedRes.json();

      setPendingSubmissions(Array.isArray(pending) ? pending : []);
      setGradedSubmissions(Array.isArray(graded) ? graded : []);
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  const handleGradeSubmit = async () => {
    if (!selectedSubmission || !gradeData.score) {
      toast.error("Please enter a score");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/submissions/${selectedSubmission.id}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...gradeData, submit_type: selectedSubmission.submit_type })
      });

      if (!res.ok) throw new Error("Failed to submit grade");

      toast.success("Grade submitted successfully");
      setIsDialogOpen(false);
      fetchSubmissions();
      setGradeData({ score: "", feedback: "" });
    } catch (err) {
      toast.error("Error submitting grade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGrade = async (submission: any) => {
    setAiGrading(submission.id);
    try {
      let result;
      if (submission.type === 'short' || submission.type === 'mcq') {
        // Fetch questions first
        const endpoint = submission.submit_type === 'exam' 
          ? `${API_BASE}/api/teacher/exams/${submission.source_id}`
          : `${API_BASE}/api/teacher/assignments/${submission.source_id}`;
        
        const qRes = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        const qData = await qRes.json();
        const questions = qData.questions || [];
        
        let answersObj: Record<string, string> = {};
        try { answersObj = JSON.parse(submission.submission_text); } catch(e) {}
        
        const batchPayload = questions.map((q: any) => ({
          student_answer: answersObj[q.id] || "",
          expected_answer: q.correct_answer || q.expected_answer || "",
          question_context: q.question_text || q.question || "",
          method: "gemini"
        }));

        const res = await fetch(`${API_BASE}/api/teacher/ai-grade/batch-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ answers: batchPayload })
        });
        if (!res.ok) throw new Error("AI batch grading failed");
        result = await res.json();
        
        let totalScore = 0;
        let combinedFeedback = "";
        if (result.results) {
          result.results.forEach((r: any, idx: number) => {
            const marks = questions[idx]?.marks || 1;
            if (r.grading_result) {
              totalScore += (r.grading_result.score / 100) * marks;
              combinedFeedback += `Q${idx+1}: ${r.grading_result.feedback}\n\n`;
            } else if (r.similarity_score !== undefined) {
              const score = r.passed ? marks : 0;
              totalScore += score;
              combinedFeedback += `Q${idx+1}: Similarity ${r.similarity_score}%\n\n`;
            }
          });
        }
        
        setGradeData({ score: String(Math.round(totalScore)), feedback: combinedFeedback.trim() });
        setSelectedQuestions(questions);
        setSelectedSubmission(submission);
        setIsDialogOpen(true);
        toast.success("AI grading complete! Review the results.");
      } else if (submission.submission_text) {
        // Text-based grading (single short answer fallback)
        const res = await fetch(`${API_BASE}/api/teacher/ai-grade/text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            student_answer: submission.submission_text,
            expected_answer: submission.expected_answer || submission.assignment,
            method: "gemini",
            question_context: submission.assignment
          })
        });
        if (!res.ok) throw new Error("AI grading failed");
        result = await res.json();
        const score = result.grading_result?.score ?? result.final_marks ?? 0;
        const feedback = result.grading_result?.feedback ?? `Similarity: ${result.similarity_score}%`;
        setGradeData({ score: String(score), feedback });
        setSelectedSubmission(submission);
        setIsDialogOpen(true);
        toast.success("AI grading complete! Review the results.");
      } else if (submission.file_url) {
        // Image/PDF grading
        const fileRes = await fetch(`${API_BASE}${submission.file_url}`);
        const blob = await fileRes.blob();
        const formData = new FormData();
        formData.append("file", blob, "submission.jpg");
        formData.append("exam_id", "default");
        formData.append("question_idx", "0");
        formData.append("method", "gemini");
        formData.append("gemini_prompt", submission.assignment || "");

        const res = await fetch(`${API_BASE}/api/teacher/ai-grade/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!res.ok) throw new Error("AI grading failed");
        result = await res.json();
        const score = result.grading_result?.score ?? result.final_marks ?? 0;
        const feedback = result.grading_result?.feedback ?? `Similarity: ${result.similarity_score}%`;
        setGradeData({ score: String(score), feedback });
        setSelectedSubmission(submission);
        setIsDialogOpen(true);
        toast.success("AI grading complete! Review the results.");
      } else {
        toast.error("No submission content to grade");
        return;
      }
    } catch (err) {
      console.error("AI grading error", err);
      toast.error("AI grading failed. Try again.");
    } finally {
      setAiGrading(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Grading - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        title="Grading"
        subtitle="Review and grade student submissions"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold font-display text-warning">{pendingSubmissions.length}</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Graded Total</p>
                <p className="text-2xl font-bold font-display text-success">{gradedSubmissions.length}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="graded">Graded</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Pending Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shadow-sm">
                            {submission.student.split(' ').map((n: any) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">{submission.student}</p>
                              <Badge variant="outline" className="text-[10px] uppercase">
                                {submission.type}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{submission.assignment}</p>
                            <p className="text-xs text-muted-foreground">{submission.course} • {new Date(submission.submitted_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {submission.file_url && (
                            <Button variant="outline" size="sm" className="bg-background">
                              <Download className="h-4 w-4 mr-1" /> View PDF
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => handleAIGrade(submission)}
                            disabled={aiGrading === submission.id}
                          >
                            {aiGrading === submission.id ? (
                              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Grading...</>
                            ) : (
                              <><Sparkles className="h-4 w-4 mr-1" /> AI Grade</>
                            )}
                          </Button>
                            <Dialog open={isDialogOpen && selectedSubmission?.id === submission.id} onOpenChange={(open) => {
                              setIsDialogOpen(open);
                              if (open) {
                                setSelectedSubmission(submission);
                                fetchQuestions(submission.source_id, submission.submit_type);
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="hero" onClick={() => {
                                  setSelectedSubmission(submission);
                                  fetchQuestions(submission.source_id, submission.submit_type);
                                }}>
                                  <ClipboardCheck className="h-4 w-4 mr-1" /> Grade
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Grade Submission</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="p-4 rounded-lg bg-muted/50 border border-primary/10">
                                    <p className="font-bold">{submission.student}</p>
                                    <p className="text-sm text-muted-foreground">{submission.assignment}</p>
                                  </div>
                                  
                                  {(submission.type === 'short' || submission.type === 'mcq') && selectedQuestions.length > 0 ? (
                                    <div className="space-y-4">
                                      {selectedQuestions.map((q: any, i: number) => {
                                        let ans = "";
                                        try {
                                          const parsed = JSON.parse(submission.submission_text);
                                          ans = parsed[q.id] || "";
                                        } catch(e) { ans = submission.submission_text; }
                                        
                                        return (
                                          <div key={q.id} className="p-4 rounded-lg border bg-background space-y-2">
                                            <p className="text-sm font-medium"><span className="text-muted-foreground font-bold">Q{i+1}:</span> {q.question_text || q.question}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                              <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
                                                <p className="text-[10px] font-bold text-primary uppercase mb-1">Student Answer</p>
                                                <p className="text-sm font-medium">{ans || <span className="italic text-muted-foreground">No Answer</span>}</p>
                                              </div>
                                              {(q.correct_answer || q.expected_answer) && (
                                                <div className="bg-success/5 p-3 rounded-md border border-success/10">
                                                  <p className="text-[10px] font-bold text-success uppercase mb-1">Expected Answer</p>
                                                  <p className="text-sm">{q.correct_answer || q.expected_answer}</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : submission.submission_text ? (
                                    <div className="p-4 rounded-lg border bg-background">
                                      <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Student Response:</label>
                                      <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                                    </div>
                                  ) : null}

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Score Obtained</label>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      value={gradeData.score}
                                      onChange={(e) => setGradeData({...gradeData, score: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Total Possible</label>
                                    <Input type="number" value={submission.max_score} disabled className="bg-muted/50" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Feedback (Optional)</label>
                                  <Textarea 
                                    placeholder="Enter feedback for the student..." 
                                    rows={4}
                                    value={gradeData.feedback}
                                    onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button variant="hero" className="w-full" onClick={handleGradeSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Grade"}
                                  </Button>
                                </DialogFooter>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                    {pendingSubmissions.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-success opacity-20 mb-4" />
                        <p className="text-muted-foreground">All caught up! No pending submissions.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graded">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Graded Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3 px-2 font-medium">Student</th>
                          <th className="pb-3 px-2 font-medium">Assignment</th>
                          <th className="pb-3 px-2 font-medium">Course</th>
                          <th className="pb-3 px-2 font-medium text-center">Score</th>
                          <th className="pb-3 px-2 font-medium">Graded On</th>
                          <th className="pb-3 px-2 font-medium text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradedSubmissions.map((submission) => (
                          <tr key={submission.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-xs font-bold text-success shadow-sm border border-success/20">
                                  {submission.student.split(' ').map((n: any) => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{submission.student}</p>
                                  <p className="text-[10px] text-muted-foreground">{submission.student_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2 font-medium text-sm">{submission.assignment}</td>
                            <td className="py-4 px-2 text-muted-foreground text-sm">{submission.course}</td>
                            <td className="py-4 px-2 text-center">
                              <Badge variant="success" className="text-[10px]">
                                {submission.score}/{submission.max_score}
                              </Badge>
                            </td>
                            <td className="py-4 px-2 text-muted-foreground text-sm">
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-2 text-center">
                              <Dialog open={isViewDialogOpen && selectedSubmission?.id === submission.id} onOpenChange={(open) => {
                                setIsViewDialogOpen(open);
                                if (open) {
                                  setSelectedSubmission(submission);
                                  fetchQuestions(submission.source_id, submission.submit_type);
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                                    setSelectedSubmission(submission);
                                    fetchQuestions(submission.source_id, submission.submit_type);
                                  }}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>View Graded Submission</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 pt-4">
                                    <div className="p-4 rounded-lg bg-muted/50 border border-primary/10 flex justify-between items-center">
                                      <div>
                                        <p className="font-bold">{submission.student}</p>
                                        <p className="text-sm text-muted-foreground">{submission.assignment}</p>
                                      </div>
                                      <Badge variant="success" className="text-lg py-1 px-3">
                                        {submission.score} / {submission.max_score}
                                      </Badge>
                                    </div>
                                    
                                    {(submission.type === 'short' || submission.type === 'mcq') && selectedQuestions.length > 0 ? (
                                      <div className="space-y-4">
                                        {selectedQuestions.map((q: any, i: number) => {
                                          let ans = "";
                                          try {
                                            const parsed = JSON.parse(submission.submission_text);
                                            ans = parsed[q.id] || "";
                                          } catch(e) { ans = submission.submission_text; }
                                          
                                          return (
                                            <div key={q.id} className="p-4 rounded-lg border bg-background space-y-2">
                                              <p className="text-sm font-medium"><span className="text-muted-foreground font-bold">Q{i+1}:</span> {q.question_text || q.question}</p>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
                                                  <p className="text-[10px] font-bold text-primary uppercase mb-1">Student Answer</p>
                                                  <p className="text-sm font-medium">{ans || <span className="italic text-muted-foreground">No Answer</span>}</p>
                                                </div>
                                                {(q.correct_answer || q.expected_answer) && (
                                                  <div className="bg-success/5 p-3 rounded-md border border-success/10">
                                                    <p className="text-[10px] font-bold text-success uppercase mb-1">Expected Answer</p>
                                                    <p className="text-sm">{q.correct_answer || q.expected_answer}</p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : submission.submission_text ? (
                                      <div className="p-4 rounded-lg border bg-background">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Student Response:</label>
                                        <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                                      </div>
                                    ) : submission.file_url ? (
                                      <div className="p-4 rounded-lg border bg-background text-center">
                                        <Button asChild variant="outline">
                                          <a href={`${API_BASE}${submission.file_url}`} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4 mr-2" /> Download PDF Submission
                                          </a>
                                        </Button>
                                      </div>
                                    ) : null}
                                    
                                    {submission.feedback && (
                                      <div className="mt-4 p-4 rounded-lg bg-secondary/20 border border-secondary/30">
                                        <label className="text-[10px] font-bold text-secondary-foreground uppercase mb-1 block">Feedback Given</label>
                                        <p className="text-sm whitespace-pre-wrap text-foreground/80">{submission.feedback}</p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))}
                        {gradedSubmissions.length === 0 && !loading && (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                              <AlertCircle className="h-12 w-12 mx-auto opacity-10 mb-2" />
                              No graded submissions yet.
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

export default TeacherGrading;