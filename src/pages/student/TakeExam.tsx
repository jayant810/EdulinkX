import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileText,
  GraduationCap,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

// Mock exam data
const mcqExam = {
  id: 1,
  title: "Data Structures Mid-Term",
  course: "CS301",
  duration: 120, // minutes
  type: "mcq",
  questions: [
    {
      id: 1,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    },
    {
      id: 2,
      question: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
    },
    {
      id: 3,
      question: "What is the worst-case time complexity of quicksort?",
      options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    },
    {
      id: 4,
      question: "Which traversal visits the root node first?",
      options: ["Inorder", "Preorder", "Postorder", "Level order"],
    },
    {
      id: 5,
      question: "What is the height of a complete binary tree with n nodes?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    },
  ],
};

const shortExam = {
  id: 2,
  title: "Database Systems Quiz",
  course: "CS302",
  duration: 60,
  type: "short",
  questions: [
    { id: 1, question: "Define normalization in databases.", marks: 5 },
    { id: 2, question: "What is the difference between DELETE and TRUNCATE?", marks: 5 },
    { id: 3, question: "Explain ACID properties.", marks: 10 },
  ],
};

const TakeExam = () => {
  const { examId, examType } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(120 * 60); // seconds
  const [showReview, setShowReview] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const exam = examType === "mcq" ? mcqExam : examType === "short" ? shortExam : mcqExam;
  const questions = exam.questions;
  const totalQuestions = questions.length;

  // Timer
  useEffect(() => {
    if (examSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setExamSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examSubmitted]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const toggleFlag = (questionId: number) => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlagged(newFlagged);
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  if (examSubmitted) {
    return (
      <>
        <Helmet>
          <title>Exam Submitted - EdulinkX</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display mb-2">Exam Submitted!</h1>
                <p className="text-muted-foreground">Your answers have been successfully submitted.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-left">
                <p className="text-sm"><strong>Exam:</strong> {exam.title}</p>
                <p className="text-sm"><strong>Course:</strong> {exam.course}</p>
                <p className="text-sm"><strong>Questions Answered:</strong> {answeredCount}/{totalQuestions}</p>
              </div>
              <Button asChild className="w-full">
                <Link to="/student/exams">Back to Exams</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (showReview) {
    return (
      <>
        <Helmet>
          <title>Review Answers - EdulinkX</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="font-bold">{exam.title}</h1>
                  <p className="text-xs text-muted-foreground">Review Your Answers</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestion(index);
                        setShowReview(false);
                      }}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        answers[q.id]
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning"
                      } ${flagged.has(q.id) ? "ring-2 ring-warning" : ""}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success/20" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-warning/20" />
                    <span>Unanswered ({totalQuestions - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded ring-2 ring-warning" />
                    <span>Flagged ({flagged.size})</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowReview(false)}>
                    Continue Exam
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Send className="h-4 w-4 mr-2" /> Submit Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Exam?</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <p className="text-muted-foreground">
                          Are you sure you want to submit? You have answered {answeredCount} out of {totalQuestions} questions.
                        </p>
                        {totalQuestions - answeredCount > 0 && (
                          <div className="p-3 rounded-lg bg-warning/10 text-warning flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">{totalQuestions - answeredCount} questions are unanswered!</span>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">Cancel</Button>
                          <Button className="flex-1" onClick={() => setExamSubmitted(true)}>
                            Submit Now
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // PDF Upload Type
  if (examType === "pdf") {
    return (
      <>
        <Helmet>
          <title>{exam.title} - EdulinkX</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="font-bold">{exam.title}</h1>
                  <p className="text-xs text-muted-foreground">{exam.course}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Download the question paper below</li>
                  <li>Write your answers on paper or digitally</li>
                  <li>Scan or convert your answers to PDF format</li>
                  <li>Upload your answer sheet before the timer expires</li>
                </ol>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" /> Download Question Paper
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Answer Sheet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept=".pdf"
                    className="max-w-xs mx-auto"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                </div>
                {pdfFile && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                    <FileText className="h-5 w-5 text-success" />
                    <span className="text-sm">{pdfFile.name}</span>
                    <Badge variant="success">Ready to submit</Badge>
                  </div>
                )}
                <Button className="w-full" disabled={!pdfFile} onClick={() => setExamSubmitted(true)}>
                  <Send className="h-4 w-4 mr-2" /> Submit Answer Sheet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <>
      <Helmet>
        <title>{exam.title} - EdulinkX</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold">{exam.title}</h1>
                <p className="text-xs text-muted-foreground">Question {currentQuestion + 1} of {totalQuestions}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </header>

        {/* Progress */}
        <div className="bg-muted/50 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Progress</span>
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-sm font-medium">{answeredCount}/{totalQuestions}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Question Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Badge variant="secondary">Question {currentQuestion + 1}</Badge>
              <Button
                variant={flagged.has(currentQ.id) ? "destructive" : "ghost"}
                size="sm"
                onClick={() => toggleFlag(currentQ.id)}
              >
                <Flag className="h-4 w-4 mr-1" />
                {flagged.has(currentQ.id) ? "Flagged" : "Flag for Review"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">{currentQ.question}</p>

              {examType === "mcq" && "options" in currentQ && (
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                  className="space-y-3"
                >
                  {(currentQ as typeof mcqExam.questions[0]).options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                        answers[currentQ.id] === String(index)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem value={String(index)} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {examType === "short" && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Your Answer {"marks" in currentQ && `(${(currentQ as typeof shortExam.questions[0]).marks} marks)`}
                  </label>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    rows={6}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            <Button variant="outline" onClick={() => setShowReview(true)}>
              Review All
            </Button>

            {currentQuestion === totalQuestions - 1 ? (
              <Button onClick={() => setShowReview(true)}>
                Review & Submit
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Question Navigator */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      currentQuestion === index
                        ? "bg-primary text-primary-foreground"
                        : answers[q.id]
                        ? "bg-success/20 text-success"
                        : "bg-muted hover:bg-muted/80"
                    } ${flagged.has(q.id) ? "ring-2 ring-warning" : ""}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TakeExam;