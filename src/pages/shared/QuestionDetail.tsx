import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { BookmarkPlus, CalendarDays, Eye, Heart, MessageSquare, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityLayout } from "@/components/layout/CommunityLayout";

import { AnswerCard } from "@/components/community/AnswerCard";
import { EditorMarkdown } from "@/components/community/EditorMarkdown";
import { TagPill } from "@/components/community/TagPill";
import { useCommunityStore } from "@/lib/communityStore";

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

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getQuestionBySlug(slug).then(q => {
      setQuestion(q);
      setLoading(false);
      if (q && !viewedRef.current) {
        incrementQuestionViews(q.id);
        viewedRef.current = true;
      }
    });
  }, [slug]);

  const answers = useMemo(
    () => (question ? getAnswersForQuestion(question.id) : []),
    [getAnswersForQuestion, question]
  );

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!answerBody.trim()) return;
    if (!question) return;
    await addAnswer(question.id, answerBody.trim());
    setAnswerBody("");
  };

  if (loading) {
    return <CommunityLayout title="Loading..." subtitle=""><div className="p-12 text-center">Loading question...</div></CommunityLayout>;
  }

  if (!question) {
    return (
      <CommunityLayout title="Question Details" subtitle="">
        <div className="rounded-lg border border-border bg-card p-12 text-center text-foreground shadow-sm">
          <p className="font-semibold text-lg">Question not found.</p>
          <p className="text-sm text-muted-foreground mt-1">It may have been removed or the link is broken.</p>
          <Button
            asChild
            variant="default"
            className="mt-6"
          >
            <Link to="/community">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to feed
            </Link>
          </Button>
        </div>
      </CommunityLayout>
    );
  }

  const isOwner = question.author_name === currentUser.name;
  const isAdmin = currentUser.role === "admin";
  const canAccept = isAdmin || isOwner;
  const liked = likedQuestionIds.includes(question.id);
  const parsedTags = typeof question.tags === 'string' ? JSON.parse(question.tags) : question.tags;

  return (
    <CommunityLayout 
      title="Question Details" 
      subtitle={`Asked by ${question.author_name} • ${new Date(question.created_at).toLocaleDateString()}`}
    >
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
            <Link to="/community">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Feed
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-4 flex-1">
              <h2 className="text-2xl font-bold text-foreground leading-tight">{question.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={16} />
                  {new Date(question.created_at).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  {answers.length} answers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={16} />
                  {question.views} views
                </span>
              </div>
              <div className="text-foreground prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap">{question.body}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {parsedTags.map((tag: string) => (
                  <TagPill key={tag} label={tag} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[120px]">
              <Button
                variant={liked ? "default" : "secondary"}
                onClick={() => toggleLikeQuestion(question.id)}
                className="w-full justify-start"
              >
                <Heart size={16} className={`mr-2 ${liked ? "fill-current" : ""}`} />
                {liked ? "Liked" : "Like"} · {question.likes}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSaved((prev) => !prev)}
                className="w-full justify-start"
              >
                <BookmarkPlus size={16} className={`mr-2 ${saved ? "fill-primary" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
              {(isOwner || isAdmin) && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    const confirmed = window.confirm("Delete this question? Answers will be removed too.");
                    if (confirmed) {
                      deleteQuestion(question.id);
                      navigate("/community");
                    }
                  }}
                  className="w-full justify-start bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">{sortedAnswers.length} Answers</h3>
            <span className="text-sm text-muted-foreground">
              Sorted by votes
            </span>
          </div>
          <div className="space-y-4">
            {sortedAnswers.length > 0 ? (
              sortedAnswers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  {...answer}
                  author_name={answer.author_name}
                  created_at={answer.created_at}
                  canAccept={canAccept}
                  onAccept={() => handleAccept(answer.id)}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                No answers yet. Be the first to respond!
              </div>
            )}
          </div>
        </div>

        <form ref={answerFormRef} onSubmit={handleSubmit} className="space-y-4 pt-6 border-t border-border">
          <h3 className="text-xl font-bold text-foreground">Your Answer</h3>
          <EditorMarkdown value={answerBody} onChange={setAnswerBody} placeholder="Share your approach, references, or example prompts." />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!answerBody.trim()}
              className="px-8"
            >
              Post Answer
            </Button>
          </div>
        </form>
      </div>
    </CommunityLayout>
  );
}
