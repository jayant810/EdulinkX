import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Answer = {
  id: string;
  questionId: string;
  author: string;
  body: string;
  votes: number;
  accepted?: boolean;
  createdAt: string;
};

export type Question = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  votes: number;
  likes: number;
  views: number;
  author: string;
  createdAt: string;
};

type CommunityState = {
  questions: Question[];
  answers: Answer[];
  likedQuestionIds: string[];
};

type CommunityStore = {
  questions: Question[];
  answers: Answer[];
  likedQuestionIds: string[];
  currentUser: { id: string; name: string; role: "admin" | "user" };
  addQuestion: (input: Omit<Question, "id" | "slug" | "votes" | "likes" | "views" | "createdAt"> & { createdAt?: string }) => Question;
  deleteQuestion: (id: string) => void;
  addAnswer: (questionId: string, input: Omit<Answer, "id" | "questionId" | "votes" | "createdAt" | "accepted"> & { createdAt?: string }) => Answer;
  voteQuestion: (id: string, delta: number) => void;
  voteAnswer: (id: string, delta: number) => void;
  acceptAnswer: (id: string) => void;
  toggleLikeQuestion: (id: string) => void;
  incrementQuestionViews: (id: string) => void;
  getQuestionBySlug: (slug: string) => Question | undefined;
  getAnswersForQuestion: (questionId: string) => Answer[];
};

const STORAGE_KEY = "medai-community";
const currentUser = { id: "user-1", name: "You", role: "admin" as const };

const defaultState: CommunityState = {
  questions: [
    {
      id: "q1",
      slug: "interpreting-ct-scan-findings",
      title: "How do you explain subtle CT scan findings to patients?",
      body: "Looking for guidance on simplifying medical jargon about CT scans while staying accurate and reassuring.",
      tags: ["radiology", "patient-education", "communication"],
      votes: 12,
      likes: 18,
      views: 240,
      author: "Dr. Rao",
      createdAt: "2h ago",
    },
    {
      id: "q2",
      slug: "finetune-gpt-on-medical-notes",
      title: "Best practices to fine-tune GPT models on de-identified medical notes?",
      body: "Curious about tokenization, PHI removal, and evaluation benchmarks for clinical language models.",
      tags: ["nlp", "ai", "compliance"],
      votes: 32,
      likes: 54,
      views: 1200,
      author: "Mina",
      createdAt: "6h ago",
    },
    {
      id: "q3",
      slug: "preventing-hallucinations",
      title: "Techniques to reduce hallucinations in diagnosis suggestions?",
      body: "Trying to reduce hallucinations when suggesting differential diagnoses for rare diseases. What patterns or guardrails have worked best for you?",
      tags: ["safety", "prompting", "guardrails"],
      votes: 20,
      likes: 30,
      views: 540,
      author: "Alex",
      createdAt: "1d ago",
    },
  ],
  answers: [
    {
      id: "a1",
      questionId: "q3",
      author: "Dr. Lee",
      body: "You can reduce hallucinations by pairing retrieval with explicit safety prompts and constraining the model to cite sources.",
      votes: 14,
      accepted: true,
      createdAt: "3h ago",
    },
    {
      id: "a2",
      questionId: "q3",
      author: "Priya",
      body: "For rare diseases, build a custom retrieval index and use contrastive prompts that force the model to compare likely vs unlikely diagnoses.",
      votes: 8,
      createdAt: "1h ago",
    },
  ],
  likedQuestionIds: [],
};

const CommunityContext = createContext<CommunityStore | null>(null);

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function CommunityStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CommunityState>(defaultState);

  // Load from localStorage once
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CommunityState;
        setState(parsed);
      } catch {
        // ignore corrupted data
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const store = useMemo<CommunityStore>(() => {
    const addQuestion: CommunityStore["addQuestion"] = (input) => {
      const id = crypto.randomUUID();
      let slug = slugify(input.title);
      const conflict = state.questions.some((q) => q.slug === slug);
      if (conflict) slug = `${slug}-${state.questions.length + 1}`;
      const createdAt = input.createdAt ?? "Just now";
      const question: Question = {
        id,
        slug,
        title: input.title,
        body: input.body,
        tags: input.tags,
        votes: 0,
        likes: 0,
        views: 0,
        author: input.author,
        createdAt,
      };
      setState((prev) => ({ ...prev, questions: [question, ...prev.questions] }));
      return question;
    };

    const deleteQuestion: CommunityStore["deleteQuestion"] = (id) => {
      setState((prev) => ({
        questions: prev.questions.filter((q) => q.id !== id),
        answers: prev.answers.filter((a) => a.questionId !== id),
        likedQuestionIds: prev.likedQuestionIds.filter((qid) => qid !== id),
      }));
    };

    const addAnswer: CommunityStore["addAnswer"] = (questionId, input) => {
      const id = crypto.randomUUID();
      const createdAt = input.createdAt ?? "Just now";
      const answer: Answer = {
        id,
        questionId,
        author: input.author,
        body: input.body,
        votes: 0,
        createdAt,
      };
      setState((prev) => ({ ...prev, answers: [answer, ...prev.answers] }));
      return answer;
    };

    const voteQuestion: CommunityStore["voteQuestion"] = (id, delta) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => (q.id === id ? { ...q, votes: q.votes + delta } : q)),
      }));
    };

    const voteAnswer: CommunityStore["voteAnswer"] = (id, delta) => {
      setState((prev) => ({
        ...prev,
        answers: prev.answers.map((a) => (a.id === id ? { ...a, votes: a.votes + delta } : a)),
      }));
    };

    const toggleLikeQuestion: CommunityStore["toggleLikeQuestion"] = (id) => {
      setState((prev) => {
        const isLiked = prev.likedQuestionIds.includes(id);
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === id ? { ...q, likes: q.likes + (isLiked ? -1 : 1) } : q
          ),
          likedQuestionIds: isLiked
            ? prev.likedQuestionIds.filter((qid) => qid !== id)
            : [...prev.likedQuestionIds, id],
        };
      });
    };

    const incrementQuestionViews: CommunityStore["incrementQuestionViews"] = (id) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => (q.id === id ? { ...q, views: q.views + 1 } : q)),
      }));
    };

    const acceptAnswer: CommunityStore["acceptAnswer"] = (id) => {
      setState((prev) => {
        const target = prev.answers.find((a) => a.id === id);
        if (!target) return prev;
        return {
          ...prev,
          answers: prev.answers.map((a) =>
            a.questionId === target.questionId ? { ...a, accepted: a.id === id } : a
          ),
        };
      });
    };

    const getQuestionBySlug = (slug: string) => state.questions.find((q) => q.slug === slug);
    const getAnswersForQuestion = (questionId: string) =>
      state.answers.filter((a) => a.questionId === questionId);

    return {
      questions: state.questions,
      answers: state.answers,
      likedQuestionIds: state.likedQuestionIds,
      currentUser,
      addQuestion,
      deleteQuestion,
      addAnswer,
      voteQuestion,
      voteAnswer,
      acceptAnswer,
      toggleLikeQuestion,
      incrementQuestionViews,
      getQuestionBySlug,
      getAnswersForQuestion,
    };
  }, [state]);

  return <CommunityContext.Provider value={store}>{children}</CommunityContext.Provider>;
}

export function useCommunityStore() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunityStore must be used within CommunityStoreProvider");
  return ctx;
}
