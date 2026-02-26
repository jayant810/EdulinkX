import { useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Filter, MessageCircle, Search, PlusCircle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CommunityLayout } from "@/components/layout/CommunityLayout";

import { QuestionCard } from "@/components/community/QuestionCard";
import { TagPill } from "@/components/community/TagPill";
import { useCommunityStore } from "@/lib/communityStore";

export default function CommunityFeed() {
  const [tab, setTab] = useState<"recent" | "trending" | "unanswered">("recent");
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const {
    questions,
    answers,
    deleteQuestion,
    currentUser,
    likedQuestionIds,
    toggleLikeQuestion,
    addAnswer,
    getAnswersForQuestion,
  } = useCommunityStore();
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  
  const tagFilters = useMemo(() => {
    const uniqueTags = new Set<string>();
    questions.forEach((q) => {
      const tags = typeof q.tags === 'string' ? JSON.parse(q.tags) : q.tags;
      if (Array.isArray(tags)) {
        tags.forEach((tag) => uniqueTags.add(tag));
      }
    });
    return ["all", ...Array.from(uniqueTags)];
  }, [questions]);

  const filtered = useMemo(() => {
    return questions
      .map((q) => ({
        ...q,
        answersCount: answers.filter((a) => a.question_id === q.id).length,
      }))
      .filter((question) => {
        const matchesTab =
          tab === "recent"
            ? true
            : tab === "trending"
            ? question.votes > 5 || question.views > 200
            : question.answersCount === 0;
        
        const tags = typeof question.tags === 'string' ? JSON.parse(question.tags) : question.tags;
        const matchesTag = selectedTag === "all" ? true : tags.includes(selectedTag);
        
        const matchesQuery =
          query.length === 0 ||
          question.title.toLowerCase().includes(query.toLowerCase()) ||
          question.body.toLowerCase().includes(query.toLowerCase());
        return matchesTab && matchesTag && matchesQuery;
      })
      .sort((a, b) => {
        if (tab === "trending") return b.votes - a.votes || b.views - a.views;
        if (tab === "recent") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return a.answersCount - b.answersCount;
      });
  }, [answers, questions, query, selectedTag, tab]);

  return (
    <CommunityLayout 
      title="Community" 
      subtitle="Connect with peers, share knowledge, and solve problems together."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="search"
                placeholder="Search questions..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button variant="outline" asChild>
              <Link to="/community/leaderboard" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
            </Button>
          </div>
          <Button asChild>
            <Link to="/community/ask" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Ask Question
            </Link>
          </Button>
        </div>

        <Tabs.Root value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
          <Tabs.List className="flex gap-2 rounded-lg border border-border bg-card p-1 max-w-md">
            {["recent", "trending", "unanswered"].map((value) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize text-foreground transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {value}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value={tab} className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {tagFilters.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  active={selectedTag === tag}
                  onClick={() => setSelectedTag(tag)}
                />
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
                No questions found matching your criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((question) => {
                  const answersCount = answers.filter((a) => a.question_id === question.id).length;
                  const excerpt =
                    question.body.length > 160
                      ? `${question.body.slice(0, 157)}...`
                      : question.body;
                  const isOwner = question.author_name === currentUser.name;
                  const isAdmin = currentUser.role === "admin";
                  const liked = likedQuestionIds.includes(question.id);
                  const isOpen = openQuestionId === question.id;
                  const questionAnswers = getAnswersForQuestion(question.id);

                  return (
                    <div key={question.id} className="space-y-3">
                      <QuestionCard
                        {...question}
                        excerpt={excerpt}
                        answers={answersCount}
                        liked={liked}
                        isOwner={isOwner}
                        isAdmin={isAdmin}
                        onViewAnswers={() =>
                          setOpenQuestionId((prev) => (prev === question.id ? null : question.id))
                        }
                        onLike={() => toggleLikeQuestion(question.id)}
                        onReply={() => setOpenQuestionId((prev) => (prev === question.id ? null : question.id))}
                        onDelete={() => {
                          if (isAdmin || isOwner) {
                            const confirmed = window.confirm("Delete this question? This also removes its answers.");
                            if (confirmed) deleteQuestion(question.id);
                          }
                        }}
                      />
                      <div
                        className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ maxHeight: isOpen ? 800 : 0 }}
                        aria-hidden={!isOpen}
                      >
                        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground shadow-inner">
                          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                            <MessageCircle size={16} />
                            <span>
                              {questionAnswers.length === 0
                                ? "No answers yet. Be the first to respond."
                                : `${questionAnswers.length} answer${questionAnswers.length === 1 ? "" : "s"}.`}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {questionAnswers.map((answer) => (
                              <div
                                key={answer.id}
                                className="rounded-md border border-border bg-background px-3 py-2 shadow-sm"
                              >
                                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground">{answer.author_name}</span>
                                  <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-foreground">{answer.body}</p>
                              </div>
                            ))}
                            <form
                              className="space-y-2"
                              onSubmit={(event) => {
                                event.preventDefault();
                                const draft = drafts[question.id]?.trim();
                                if (!draft) return;
                                addAnswer(question.id, draft);
                                setDrafts((prev) => ({ ...prev, [question.id]: "" }));
                              }}
                            >
                              <label
                                className="block text-xs font-semibold text-muted-foreground"
                                htmlFor={`answer-${question.id}`}
                              >
                                Your answer
                              </label>
                              <textarea
                                id={`answer-${question.id}`}
                                value={drafts[question.id] ?? ""}
                                onChange={(event) =>
                                  setDrafts((prev) => ({ ...prev, [question.id]: event.target.value }))
                                }
                                placeholder="Share your approach or experience..."
                                className="min-h-[96px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              />
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </CommunityLayout>
  );
}
