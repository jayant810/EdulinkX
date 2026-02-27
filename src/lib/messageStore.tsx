import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/auth/AuthProvider";

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type Conversation = {
  id: number;
  last_message_at: string;
  is_disconnected_by_admin: boolean;
  other_user_id: number;
  other_user_name: string;
  other_user_role: string;
  student_id?: string;
  employee_code?: string;
  last_message?: string;
  unread_count: number;
  avatar?: string;
};

type MessageStore = {
  conversations: Conversation[];
  activeConversationMessages: Message[];
  loading: boolean;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  searchUsers: (query: string) => Promise<any[]>;
  getOrCreateConversation: (targetUserId: number) => Promise<number>;
  disconnectChat: (conversationId: number) => Promise<void>;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const MessageContext = createContext<MessageStore | null>(null);

export function MessageStoreProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationMessages, setActiveConversationMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  }, [token]);

  const fetchMessages = useCallback(async (conversationId: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/messages/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActiveConversationMessages(data);
      // Mark as read locally
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const sendMessage = async (conversationId: number, content: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId, content })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send message");
      }
      // We don't need to manually update state here because the socket listener 'new_message' 
      // will receive the message we just sent and update the state for us.
    } catch (err) {
      console.error("Send message error:", err);
      throw err;
    }
  };

  const searchUsers = async (query: string) => {
    if (!token || query.length < 2) return [];
    try {
      const res = await fetch(`${API_BASE}/api/messages/search-users?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.users || [];
    } catch (err) {
      console.error("Search users failed:", err);
      return [];
    }
  };

  const getOrCreateConversation = async (targetUserId: number) => {
    if (!token) return 0;
    try {
      const res = await fetch(`${API_BASE}/api/messages/conversation/get-or-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
      });
      const data = await res.json();
      await fetchConversations(); // Refresh list
      return data.conversationId;
    } catch (err) {
      console.error("Get/Create conversation failed:", err);
      return 0;
    }
  };

  const disconnectChat = async (conversationId: number) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/messages/admin/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId })
      });
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, is_disconnected_by_admin: true } : c
      ));
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

  useEffect(() => {
    if (!token || !user) return;

    fetchConversations();

    const newSocket = io(API_BASE, {
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_user_room", user.id);
    });

    newSocket.on("new_message", ({ conversationId, message }: { conversationId: number, message: Message }) => {
      // If it's the current active conversation, add to messages
      setActiveConversationMessages(prev => {
        // Only add if it's the same conversation and not already in state
        if (prev.length > 0 && prev[0].conversation_id !== conversationId) return prev;
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // Update conversation list
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === conversationId);
        if (index === -1) {
          fetchConversations();
          return prev;
        }
        const updated = [...prev];
        const isSelf = message.sender_id === user.id;
        
        updated[index] = { 
          ...updated[index], 
          last_message: message.content, 
          last_message_at: message.created_at,
          unread_count: !isSelf ? updated[index].unread_count + 1 : updated[index].unread_count
        };
        return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      });
    });

    newSocket.on("chat_disconnected", ({ conversationId }: { conversationId: number }) => {
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, is_disconnected_by_admin: true } : c
      ));
    });

    return () => {
      newSocket.close();
    };
  }, [token, user?.id, fetchConversations]);

  const value = useMemo(() => ({
    conversations,
    activeConversationMessages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    searchUsers,
    getOrCreateConversation,
    disconnectChat
  }), [conversations, activeConversationMessages, loading, fetchConversations, fetchMessages]);

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessageStore() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessageStore must be used within MessageStoreProvider");
  return ctx;
}
