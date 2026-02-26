import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, X, Brain, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AssignmentShortModal({ open, onClose, assignment }) {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignmentType, setAssignmentType] = useState<string>("short");

  // confirmation dialog states
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Load questions
  useEffect(() => {
    if (!assignment || !open || !token) return;

    setLoading(true);
    fetch(`${API_BASE}/api/assignments/${assignment.id}/questions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setAssignmentType(data.type || "short");
        // Default to 30 mins if not specified
        setTimeLeft((assignment.duration_minutes || 30) * 60);
        setAnswers({});
        setSubmitted(false);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [assignment, open, token]);

  // Timer countdown
  useEffect(() => {
    if (!open || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [open, timeLeft, submitted]);

  const handleAnswerChange = (qid: any, text: string) => {
    setAnswers(prev => ({ ...prev, [qid]: text }));
  };

  // At least one answer typed?
  const hasAtLeastOneAnswer = Object.values(answers).some(
    (ans) => String(ans).trim().length > 0
  );

  // Any unanswered questions?
  const unansweredCount = questions.filter(
    (q: any) => !answers[q.id] || String(answers[q.id]).trim() === ""
  ).length;

  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Submit to backend
  const finalizeSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/assignments/${assignment.id}/submit/short`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ answers })
        }
      );

      if (!res.ok) throw new Error("Submission failed");
      
      const data = await res.json();
      setFinalScore(data.score);
      setSubmitted(true);
      toast.success("Assignment submitted successfully!");
    } catch (err) {
      toast.error("Error submitting assignment");
    }
  };

  // Timer format
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!assignment) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-background shadow-2xl"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold font-display">{assignment.title}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  {assignmentType === 'mcq' ? 'Multiple Choice Assessment' : 'Short Answer Assessment'}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full shadow-inner ${timeLeft < 300 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted text-foreground'}`}>
                  <Clock className="h-4 w-4" />
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmQuit(true)}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!submitted ? (
              <div className="space-y-8 pb-6">
                {loading ? (
                  <div className="py-20 text-center text-muted-foreground">Loading questions...</div>
                ) : (
                  questions.map((q: any, index) => (
                    <div key={q.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-lg font-medium pt-0.5 leading-tight">
                          {q.question_text}
                        </p>
                      </div>

                      {assignmentType === "mcq" ? (
                        <RadioGroup 
                          value={answers[q.id] || ""} 
                          onValueChange={(val) => handleAnswerChange(q.id, val)}
                          className="grid md:grid-cols-2 gap-3 pl-11"
                        >
                          {(q.options || []).map((opt: string, oIdx: number) => (
                            <div key={oIdx} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${answers[q.id] === String(oIdx) ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted'}`}>
                              <RadioGroupItem value={String(oIdx)} id={`q-${q.id}-opt-${oIdx}`} />
                              <Label htmlFor={`q-${q.id}-opt-${oIdx}`} className="flex-1 cursor-pointer font-medium">{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <Textarea
                          value={answers[q.id] || ""}
                          placeholder="Type your detailed answer here..."
                          className="min-h-[120px] bg-muted/20 border-none focus-visible:ring-primary text-base p-4 ml-11 resize-none no-select w-[calc(100%-2.75rem)]"
                          onPaste={(e) => e.preventDefault()}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))
                )}

                <div className="pt-6 border-t ml-11">
                  <Button
                    variant="hero"
                    className="w-full h-14 text-lg shadow-xl"
                    disabled={!hasAtLeastOneAnswer || loading}
                    onClick={() => {
                      if (unansweredCount > 0) setConfirmSubmit(true);
                      else finalizeSubmit();
                    }}
                  >
                    Finish & Submit Assignment
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground mt-3 uppercase tracking-widest font-bold">
                    Secure Assessment Mode Active • Paste Disabled
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 space-y-6">
                <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-success/20">
                  <CheckCircle2 className="h-12 w-12 text-success" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">Well Done!</h3>
                  <p className="text-muted-foreground max-w-[300px] mx-auto text-lg">
                    Your assessment has been recorded and sent to your instructor.
                  </p>
                  {assignmentType === 'mcq' && finalScore !== null && (
                    <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 inline-block px-8">
                      <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-1">Your Score</p>
                      <p className="text-4xl font-black text-primary">
                        {finalScore} <span className="text-xl text-muted-foreground font-medium">/ {assignment.max_score}</span>
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="px-12 h-12 text-lg" onClick={() => onClose(true)}>Close Portal</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM QUIT */}
      <Dialog open={confirmQuit} onOpenChange={setConfirmQuit}>
        <DialogContent className="max-w-sm text-center p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-xl font-bold">Discard Progress?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            If you leave now, your answers will not be saved and you'll have to start over.
          </DialogDescription>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <Button variant="outline" onClick={() => setConfirmQuit(false)}>
              Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmQuit(false);
                onClose(false);
              }}
            >
              Quit Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM SUBMIT WITH UNANSWERED */}
      <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <DialogContent className="max-w-sm text-center p-8">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-warning" />
          </div>
          <DialogTitle className="text-xl font-bold">Submit Incomplete?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            You have <strong>{unansweredCount}</strong> unanswered questions. Are you sure you want to finish now?
          </DialogDescription>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
              Go Back
            </Button>
            <Button
              variant="hero"
              onClick={() => {
                setConfirmSubmit(false);
                finalizeSubmit();
              }}
            >
              Yes, Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
