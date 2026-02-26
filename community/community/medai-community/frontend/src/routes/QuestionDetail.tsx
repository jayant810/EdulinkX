import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BookmarkPlus, CalendarDays, Eye, Heart, MessageSquare } from "lucide-react";

import { AnswerCard } from "../components/community/AnswerCard";
import { EditorMarkdown } from "../components/community/EditorMarkdown";
import { TagPill } from "../components/community/TagPill";
import { useCommunityStore } from "../lib/communityStore";

export default function QuestionDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { focusAnswer?: boolean } | null;
  const answerFormRef = useRef<HTMLFormElement | null>(null);
  const {
    getQuestionBySlug,
    getAnswersForQuestion,
    addAnswer,
    acceptAnswer,
    currentUser,
    deleteQuestion,
    likedQuestionIds,
    toggleLikeQuestion,
    incrementQuestionViews,
  } = useCommunityStore();
  const [answerBody, setAnswerBody] = useState("");
  const [saved, setSaved] = useState(false);
  const viewedRef = useRef(false);

  const question = useMemo(() => (slug ? getQuestionBySlug(slug) : undefined), [getQuestionBySlug, slug]);
  const answers = useMemo(
    () => (question ? getAnswersForQuestion(question.id) : []),
    [getAnswersForQuestion, question]
  );
  useEffect(() => {
    if (!question) {
      navigate("/community");
    } else {
      if (!viewedRef.current) {
        incrementQuestionViews(question.id);
        viewedRef.current = true;
      }
    }
  }, [navigate, question, incrementQuestionViews]);

  useEffect(() => {
    if (locationState?.focusAnswer && answerFormRef.current) {
      answerFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [locationState]);

  const sortedAnswers = useMemo(() => {
    return [...answers].sort((a, b) => Number(Boolean(b.accepted)) - Number(Boolean(a.accepted)) || b.votes - a.votes);
  }, [answers]);

  const handleAccept = (id: string) => {
    if (!canAccept) return;
    acceptAnswer(id);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!answerBody.trim()) return;
    if (!question) return;
    addAnswer(question.id, { author: currentUser.name, body: answerBody.trim() });
    setAnswerBody("");
  };

  if (!question) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-foreground shadow-sm">
        <p className="font-semibold">Question not found.</p>
        <p className="text-sm text-muted-foreground">It may have been removed.</p>
        <button
          type="button"
          onClick={() => navigate("/community")}
          className="mt-3 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to feed
        </button>
      </div>
    );
  }

  const isOwner = question.author === currentUser.name;
  const isAdmin = currentUser.role === "admin";
  const canAccept = isAdmin || isOwner;
  const liked = likedQuestionIds.includes(question.id);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">{question.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={16} />
                {question.createdAt}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={16} />
                {answers.length} answers
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye size={16} />
                {question.views} views
              </span>
              <span>Asked by {question.author}</span>
            </div>
            <p className="text-foreground">{question.body}</p>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
        </div>
        <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => toggleLikeQuestion(question.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                liked ? "bg-primary text-primary-foreground border border-primary" : "border border-border bg-secondary text-foreground hover:bg-primary/10"
              }`}
              aria-pressed={liked}
            >
              <Heart size={16} className={liked ? "fill-current" : ""} />
              {liked ? "Liked" : "Like"} · {question.likes}
            </button>
            <button
              type="button"
              onClick={() => setSaved((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BookmarkPlus size={16} />
              {saved ? "Saved" : "Save"}
            </button>
            {(isOwner || isAdmin) && (
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm("Delete this question? Answers will be removed too.");
                  if (confirmed) {
                    deleteQuestion(question.id);
                    navigate("/community");
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">Answers</h3>
          <span className="text-sm text-muted-foreground">
            Accepted answers appear first. Showing {sortedAnswers.length} responses.
          </span>
        </div>
        <div className="space-y-4">
          {sortedAnswers.map((answer) => (
            <AnswerCard
              key={answer.id}
              {...answer}
              canAccept={canAccept}
              onAccept={() => handleAccept(answer.id)}
            />
          ))}
        </div>
      </div>

      <form ref={answerFormRef} onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">Your answer</h3>
          <span className="text-sm text-muted-foreground">You are responding to: {slug}</span>
        </div>
        <EditorMarkdown value={answerBody} onChange={setAnswerBody} placeholder="Share your approach, references, or example prompts." />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Post answer
          </button>
        </div>
      </form>
    </div>
  );
}
