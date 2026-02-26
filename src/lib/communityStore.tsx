import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/auth/AuthProvider";

export type Answer = {
  id: string;
  question_id: string;
  author_id: number;
  author_name: string;
  body: string;
  votes: number;
  accepted?: boolean;
  created_at: string;
};

export type Question = {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[] | string;
  votes: number;
  likes: number;
  views: number;
  author_id: number;
  author_name: string;
  created_at: string;
  answersCount?: number;
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
  currentUser: { id: string | number; name: string; role: "admin" | "teacher" | "student" };
  addQuestion: (input: { title: string; body: string; tags: string[] }) => Promise<Question>;
  deleteQuestion: (id: string) => void;
  addAnswer: (questionId: string, body: string) => Promise<Answer>;
  voteQuestion: (id: string, delta: number) => void;
  voteAnswer: (id: string, delta: number) => void;
  acceptAnswer: (id: string) => void;
  toggleLikeQuestion: (id: string) => void;
  incrementQuestionViews: (id: string) => void;
  getQuestionBySlug: (slug: string) => Promise<Question | undefined>;
  getAnswersForQuestion: (questionId: string) => Answer[];
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const CommunityContext = createContext<CommunityStore | null>(null);

export function CommunityStoreProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [likedQuestionIds, setLikedQuestionIds] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const currentUser = useMemo(() => ({
    id: user?.id || 0,
    name: user?.name || "Anonymous",
    role: user?.role || "student"
  }), [user]);

  // Initial Fetch
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/community/questions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          console.error("Community questions data is not an array:", data);
        }
      })
      .catch(err => console.error("Failed to fetch community questions:", err));

    // WebSocket setup
    const newSocket = io(API_BASE, {
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on("new_question", (question: Question) => {
      setQuestions(prev => [question, ...prev]);
    });

    return () => {
      newSocket.close();
    };
  }, [token]);

  // Handle Question Specific WebSocket Events
  const subscribeToQuestion = (questionId: string) => {
    if (!socket) return;

    socket.on(`new_answer_${questionId}`, (answer: Answer) => {
      setAnswers(prev => {
        if (prev.find(a => a.id === answer.id)) return prev;
        return [...prev, answer];
      });
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, answersCount: (q.answersCount || 0) + 1 } : q
      ));
    });

    socket.on(`question_liked_${questionId}`, ({ likes }: { likes: number }) => {
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, likes } : q));
    });

    socket.on(`question_viewed_${questionId}`, ({ views }: { views: number }) => {
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, views } : q));
    });

    return () => {
      socket.off(`new_answer_${questionId}`);
      socket.off(`question_liked_${questionId}`);
      socket.off(`question_viewed_${questionId}`);
    };
  };

  const store = useMemo<CommunityStore>(() => {
    const addQuestion = async (input: { title: string; body: string; tags: string[] }) => {
      const res = await fetch(`${API_BASE}/api/community/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(input)
      });
      const data = await res.json();
      return data;
    };

    const addAnswer = async (questionId: string, body: string) => {
      const res = await fetch(`${API_BASE}/api/community/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ body })
      });
      const data = await res.json();
      return data;
    };

    const getQuestionBySlug = async (slug: string) => {
      const res = await fetch(`${API_BASE}/api/community/questions/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      
      if (data.id) {
        subscribeToQuestion(data.id);
      }

      if (data.answers) {
        setAnswers(prev => {
          const others = prev.filter(a => a.question_id !== data.id);
          return [...others, ...data.answers];
        });
      }
      return data;
    };

    const deleteQuestion = (id: string) => {
      setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const getAnswersForQuestion = (questionId: string) =>
      answers.filter((a) => a.question_id === questionId);

    const toggleLikeQuestion = async (id: string) => {
      setLikedQuestionIds(prev => prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]);
      await fetch(`${API_BASE}/api/community/questions/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    };

    const incrementQuestionViews = async (id: string) => {
      await fetch(`${API_BASE}/api/community/questions/${id}/view`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    };

    const voteQuestion = () => {};
    const voteAnswer = () => {};
    const acceptAnswer = () => {};

    return {
      questions,
      answers,
      likedQuestionIds,
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
  }, [questions, answers, likedQuestionIds, currentUser, token, socket]);

  return <CommunityContext.Provider value={store}>{children}</CommunityContext.Provider>;
}

export function useCommunityStore() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunityStore must be used within CommunityStoreProvider");
  return ctx;
}
