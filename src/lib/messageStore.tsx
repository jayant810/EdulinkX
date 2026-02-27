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

      // Check for unread messages to send native notifications for "ignored" messages
      if ("Notification" in window && Notification.permission === "granted") {
        const unreadConvs = data.filter((c: Conversation) => c.unread_count > 0);
        if (unreadConvs.length > 3) {
          new Notification("EdulinkX - Unread Messages", {
            body: `You have unread messages in ${unreadConvs.length} different conversations.`,
            icon: "/favicon.jpg"
          });
        } else {
          unreadConvs.forEach((conv: Conversation) => {
            new Notification(`Unread from ${conv.other_user_name}`, {
              body: `You have ${conv.unread_count} new message(s).`,
              icon: "/favicon.jpg"
            });
          });
        }
      }
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
      if (!token || !user) return;
      
      // Create optimistic message
      const tempId = Date.now();
      const optimisticMessage: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        sender_name: user.name,
        content: content,
        is_read: true,
        created_at: new Date().toISOString()
      };
  
      // Update UI immediately
      setActiveConversationMessages(prev => [...prev, optimisticMessage]);
      
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
          // Rollback on error
          setActiveConversationMessages(prev => prev.filter(m => m.id !== tempId));
          const errData = await res.json();
          throw new Error(errData.error || "Failed to send message");
        }
        
        const newMessage = await res.json();
        // Replace optimistic message with real one
        setActiveConversationMessages(prev => prev.map(m => m.id === tempId ? newMessage : m));
        
      } catch (err) {
        console.error("Send message error:", err);
        // Ensure rollback if not already handled
        setActiveConversationMessages(prev => prev.filter(m => m.id !== tempId));
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

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    newSocket.on("connect", () => {
      newSocket.emit("join_user_room", user.id);
    });

    newSocket.on("new_message", ({ conversationId, message }: { conversationId: number, message: Message }) => {
      // If it's the current active conversation, add to messages
      setActiveConversationMessages(prev => {
        if (prev.length > 0 && prev[0].conversation_id !== conversationId) return prev;
        
        // Check for duplicates (both real ID and optimistic match)
        const exists = prev.some(m => 
          m.id === message.id || 
          (m.sender_id === message.sender_id && m.content === message.content && Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime()) < 5000)
        );
        
        if (exists) return prev;
        return [...prev, message];
      });

      // Show native notification if not from self and permission granted
      if (message.sender_id !== user.id && "Notification" in window && Notification.permission === "granted") {
        new Notification(`New message from ${message.sender_name}`, {
          body: message.content,
          icon: "/favicon.jpg"
        });
      }

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
