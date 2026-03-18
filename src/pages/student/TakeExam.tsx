import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  FileText,
  Upload,
  Info,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// --- localStorage helpers ---
const STORAGE_PREFIX = "exam_progress_";

function getStorageKey(examId: string) {
  return `${STORAGE_PREFIX}${examId}`;
}

function saveProgress(examId: string, answers: Record<string, any>, timeLeft: number | null) {
  try {
    localStorage.setItem(getStorageKey(examId), JSON.stringify({ answers, timeLeft, savedAt: Date.now() }));
  } catch (e) {
    // Storage full or unavailable — silently ignore
  }
}

function loadProgress(examId: string): { answers: Record<string, any>; timeLeft: number | null } | null {
  try {
    const raw = localStorage.getItem(getStorageKey(examId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearProgress(examId: string) {
  try {
    localStorage.removeItem(getStorageKey(examId));
  } catch {
    // ignore
  }
}

const TakeExam = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    fetchExam();
  }, [id, token]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/student/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load exam");
      const data = await res.json();
      
      setExam(data.exam);
      setQuestions(data.questions || []);
      
      // Try to restore progress from localStorage
      const saved = id ? loadProgress(id) : null;
      if (saved && saved.answers && Object.keys(saved.answers).length > 0) {
        setAnswers(saved.answers);
        // Use saved timer if it's less than the full duration (i.e., student had already started)
        const fullDuration = data.exam.duration_minutes * 60;
        if (saved.timeLeft !== null && saved.timeLeft > 0 && saved.timeLeft < fullDuration) {
          setTimeLeft(saved.timeLeft);
          toast.info("Your previous progress has been restored.");
        } else {
          setTimeLeft(fullDuration);
        }
      } else {
        setTimeLeft(data.exam.duration_minutes * 60);
      }
      
      setLoading(false);
    } catch (err) {
      toast.error("Error loading exam");
      navigate("/student/exams");
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      toast.error("Time is up! Submitting your exam...");
      submitExam();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  // Auto-save to localStorage whenever answers or timeLeft change
  useEffect(() => {
    if (id && exam) {
      saveProgress(id, answers, timeLeft);
    }
  }, [answers, timeLeft, id, exam]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const answeredCount = Object.keys(answers).filter(k => {
    const v = answers[k];
    return v !== undefined && v !== null && v !== "";
  }).length;

  const handleSubmitClick = useCallback(() => {
    // Check if nothing has been answered
    if (answeredCount === 0 && exam?.exam_type !== 'pdf') {
      setShowEmptyWarning(true);
      return;
    }
    if (exam?.exam_type === 'pdf' && !pdfFile) {
      setShowEmptyWarning(true);
      return;
    }
    setShowConfirm(true);
  }, [answeredCount, exam, pdfFile]);

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      let url = `${API_BASE}/api/student/exams/${id}/submit`;
      let options: any = {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      };

      if (exam.exam_type === 'pdf') {
        if (!pdfFile) {
          toast.error("Please upload your answer sheet PDF");
          setIsSubmitting(false);
          return;
        }
        url = `${API_BASE}/api/student/exams/${id}/submit/pdf`;
        const formData = new FormData();
        formData.append("pdf", pdfFile);
        options.body = formData;
      } else if (exam.exam_type === 'short') {
        url = `${API_BASE}/api/student/exams/${id}/submit/short`;
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify({ answers });
      } else {
        url = `${API_BASE}/api/student/exams/${id}/submit/mcq`;
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify({ answers });
      }

      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Submission failed");
      
      const result = await res.json();
      toast.success("Exam submitted successfully!");
      
      // Clear saved progress on successful submission
      if (id) clearProgress(id);
      
      // If MCQ, we might have immediate results
      if (exam.exam_type === 'mcq' && result.score !== undefined) {
        toast.info(`Your Score: ${result.score}`);
      }
      
      navigate("/student/exams");
    } catch (err) {
      toast.error("Error submitting exam");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleExitTest = () => {
    // Progress is already auto-saved via localStorage
    if (id) saveProgress(id, answers, timeLeft);
    toast.info("Your progress has been saved. You can resume before the exam time expires.");
    navigate("/student/exams");
  };

  if (loading) return <DashboardLayout title="Loading..."><div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div></DashboardLayout>;

  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const currentQ = questions[currentIdx];

  return (
    <>
      <DashboardLayout
        title={exam.title}
        subtitle={`${exam.subject} | ${exam.exam_type.toUpperCase()}`}
        headerActions={
          <div className="flex items-center gap-3">
            {/* Exit Test Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowExitConfirm(true)}
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Exit Test
            </Button>

            {/* Timer */}
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border">
              <Timer className={`h-5 w-5 ${timeLeft && timeLeft < 300 ? 'text-destructive animate-pulse' : 'text-primary'}`} />
              <span className={`font-mono font-bold text-lg ${timeLeft && timeLeft < 300 ? 'text-destructive' : ''}`}>
                {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
              </span>
            </div>

            {/* Submit Exam Button (always visible) */}
            <Button 
              variant="hero" 
              size="sm"
              onClick={handleSubmitClick}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-1.5" /> Submit Exam
            </Button>
          </div>
        }
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Info */}
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  Question {currentIdx + 1} of {questions.length}
                </Badge>
                {exam.total_marks && (
                  <Badge variant="secondary">{exam.total_marks} Marks Total</Badge>
                )}
              </div>
              <div className="w-1/3 space-y-1">
                <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                  <span>Completion</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          {exam.exam_type === 'pdf' ? (
            /* PDF Submission Mode */
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Exam Instructions & Paper
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-warning/10 p-4 rounded-lg border border-warning/20 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">Instructions:</p>
                    <p className="text-muted-foreground">{exam.instructions || "Download the question paper, write your answers on paper, scan them into a single PDF, and upload it here."}</p>
                  </div>
                </div>

                {exam.question_paper_url && (
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border-2 border-dashed border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">Question Paper</p>
                        <p className="text-xs text-muted-foreground">Download to view questions</p>
                      </div>
                    </div>
                    <Button asChild variant="hero" size="sm">
                      <a href={exam.question_paper_url} target="_blank" rel="noopener noreferrer">
                        View / Download PDF
                      </a>
                    </Button>
                  </div>
                )}

                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-bold">Upload Your Answer Sheet</h3>
                  <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer relative">
                    <Input 
                      type="file" 
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium text-center">
                      {pdfFile ? pdfFile.name : "Drag and drop or click to upload PDF"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum size: 10MB (PDF Only)</p>
                  </div>
                </div>

                {/* Submit button for PDF mode */}
                <Button 
                  variant="hero" 
                  className="w-full" 
                  onClick={handleSubmitClick} 
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" /> {isSubmitting ? "Submitting..." : "Submit Answer Sheet"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Question-by-Question Mode (MCQ / Short) */
            <div className="space-y-6">
              <Card className="border-none shadow-md min-h-[400px] flex flex-col">
                <CardHeader className="border-b bg-muted/10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg leading-relaxed">
                      {currentQ?.question_text}
                    </CardTitle>
                    <Badge className="ml-4 shrink-0">{currentQ?.marks} Marks</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 flex-1">
                  {exam.exam_type === 'mcq' ? (
                    <RadioGroup 
                      value={answers[currentQ?.id] || ""} 
                      onValueChange={(val) => handleAnswerChange(currentQ?.id, val)}
                      className="space-y-4"
                    >
                      {currentQ?.options && (typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options).map((opt: string, i: number) => (
                        <div key={i} className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${answers[currentQ?.id] === String(i) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50 border-transparent bg-muted/20'}`}>
                          <RadioGroupItem value={String(i)} id={`opt-${i}`} className="sr-only" />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border-2 ${answers[currentQ?.id] === String(i) ? 'bg-primary text-white border-primary' : 'bg-background border-muted'}`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer font-medium py-1">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-4">
                      <Label className="text-sm font-bold text-muted-foreground uppercase">Your Answer:</Label>
                      <Textarea 
                        placeholder="Type your answer here..." 
                        className="min-h-[200px] text-lg p-4 rounded-xl resize-none focus:ring-2 ring-primary/20"
                        value={answers[currentQ?.id] || ""}
                        onChange={(e) => handleAnswerChange(currentQ?.id, e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
                <div className="p-6 border-t bg-muted/5 flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    {questions.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full transition-all ${i === currentIdx ? 'bg-primary w-6' : answers[questions[i].id] ? 'bg-primary/40' : 'bg-muted-foreground/20'}`}
                      />
                    ))}
                  </div>

                  {currentIdx === questions.length - 1 ? (
                    <Button variant="hero" onClick={handleSubmitClick}>
                      <Send className="h-4 w-4 mr-2" /> Finish Exam
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}>
                      Next Question <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Card>

              {/* Question Navigator Grid */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Quick Navigation</p>
                  <div className="flex flex-wrap gap-2">
                    {questions.map((q, i) => (
                      <Button
                        key={i}
                        variant={i === currentIdx ? "hero" : (answers[q.id] ? "secondary" : "outline")}
                        size="sm"
                        className="w-10 h-10 rounded-lg"
                        onClick={() => setCurrentIdx(i)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-info/5 rounded-xl border border-info/20 text-info">
            <Info className="h-5 w-5 shrink-0" />
            <p className="text-xs">Your progress is automatically saved locally. If you lose connection or accidentally close the tab, your answers will be restored when you return (as long as the exam time hasn't expired).</p>
          </div>
        </div>

        {/* Confirmation Dialog - Submit */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ready to submit?</AlertDialogTitle>
              <AlertDialogDescription>
                You have answered {answeredCount} out of {questions.length} questions.
                {answeredCount < questions.length && (
                  <span className="block mt-2 text-warning font-medium">
                    ⚠️ You still have {questions.length - answeredCount} unanswered question(s).
                  </span>
                )}
                Once submitted, you cannot change your answers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Review Answers</AlertDialogCancel>
              <AlertDialogAction onClick={submitExam} disabled={isSubmitting} className="bg-primary">
                {isSubmitting ? "Submitting..." : "Yes, Submit Exam"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Empty Submission Warning Dialog */}
        <AlertDialog open={showEmptyWarning} onOpenChange={setShowEmptyWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-destructive/10 p-2 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <AlertDialogTitle>Nothing Submitted!</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                {exam?.exam_type === 'pdf' 
                  ? "You haven't uploaded your answer sheet PDF yet. Please upload your answers before submitting."
                  : "You haven't answered any questions yet. Please answer at least one question before submitting, or review your answers."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowEmptyWarning(false)}>
                Go Back & Answer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Exit Test Confirmation Dialog */}
        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-warning/10 p-2 rounded-full">
                  <LogOut className="h-6 w-6 text-warning" />
                </div>
                <AlertDialogTitle>Exit Test?</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Your answers will be saved locally. You can return and continue the exam as long as the exam time hasn't expired.
                <span className="block mt-2 font-medium text-foreground">
                  ⏱️ Time remaining: {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                </span>
                <span className="block mt-1 text-xs">
                  Answered: {answeredCount} / {questions.length} questions
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Exam</AlertDialogCancel>
              <AlertDialogAction onClick={handleExitTest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Exit & Save Progress
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </>
  );
};

export default TakeExam;
