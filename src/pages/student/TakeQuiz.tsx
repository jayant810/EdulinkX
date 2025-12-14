import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  GraduationCap,
  FileText,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const quizData = {
  id: 3,
  title: "SQL Quiz",
  course: "Database Systems",
  type: "mcq",
  questions: [
    {
      id: 1,
      question: "Which SQL keyword is used to retrieve data from a database?",
      options: ["GET", "SELECT", "FETCH", "RETRIEVE"],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "What does SQL stand for?",
      options: ["Strong Question Language", "Structured Query Language", "Simple Query Language", "Standard Query Language"],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "Which clause is used to filter records in SQL?",
      options: ["FILTER", "WHERE", "HAVING", "LIMIT"],
      correctAnswer: 1,
    },
    {
      id: 4,
      question: "Which SQL statement is used to insert new data?",
      options: ["ADD", "INSERT INTO", "PUT", "APPEND"],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: "What is the purpose of the GROUP BY clause?",
      options: ["To sort data", "To group rows with same values", "To filter data", "To join tables"],
      correctAnswer: 1,
    },
  ],
};

const shortQuizData = {
  id: 4,
  title: "OS Concepts Short Questions",
  course: "Operating Systems",
  type: "short",
  questions: [
    { id: 1, question: "What is a process in operating systems?", marks: 5 },
    { id: 2, question: "Explain the difference between a thread and a process.", marks: 5 },
    { id: 3, question: "What is virtual memory and why is it used?", marks: 10 },
  ],
};

const TakeQuiz = () => {
  const { quizId, quizType } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const quiz = quizType === "short" ? shortQuizData : quizData;
  const questions = quiz.questions;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  if (quizSubmitted) {
    return (
      <>
        <Helmet>
          <title>Quiz Submitted - EdulinkX</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display mb-2">Quiz Submitted!</h1>
                <p className="text-muted-foreground">Your answers have been saved.</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-left">
                <p className="text-sm"><strong>Quiz:</strong> {quiz.title}</p>
                <p className="text-sm"><strong>Course:</strong> {quiz.course}</p>
                <p className="text-sm"><strong>Answered:</strong> {answeredCount}/{totalQuestions}</p>
              </div>
              <Button asChild className="w-full">
                <Link to="/student/assignments">Back to Assignments</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <>
      <Helmet>
        <title>{quiz.title} - EdulinkX</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold">{quiz.title}</h1>
                <p className="text-xs text-muted-foreground">{quiz.course}</p>
              </div>
            </div>
            <Badge variant="secondary">
              {currentQuestion + 1} / {totalQuestions}
            </Badge>
          </div>
        </header>

        {/* Progress */}
        <div className="bg-muted/50 border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Progress</span>
              <Progress value={progress} className="flex-1 h-2" />
              <span className="text-sm font-medium">{answeredCount}/{totalQuestions}</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-4 space-y-6">
          {/* Question */}
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">Question {currentQuestion + 1}</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">{currentQ.question}</p>

              {quizType !== "short" && "options" in currentQ && (
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                  className="space-y-3"
                >
                  {(currentQ as typeof quizData.questions[0]).options.map((option, index) => (
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

              {quizType === "short" && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Your Answer {"marks" in currentQ && `(${(currentQ as typeof shortQuizData.questions[0]).marks} marks)`}
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

            {currentQuestion === totalQuestions - 1 ? (
              <Button onClick={() => setQuizSubmitted(true)}>
                <Send className="h-4 w-4 mr-1" /> Submit Quiz
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
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentQuestion === index
                        ? "bg-primary text-primary-foreground"
                        : answers[q.id]
                        ? "bg-success/20 text-success"
                        : "bg-muted hover:bg-muted/80"
                    }`}
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

export default TakeQuiz;