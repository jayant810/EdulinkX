import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Send, PlusCircle, X, Trash2 } from "lucide-react";
import { useMessageStore, Message, Conversation } from "@/lib/messageStore";
import { useAuth } from "@/auth/AuthProvider";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MessageInterface() {
  const { user } = useAuth();
  const { 
    conversations, 
    activeConversationMessages, 
    fetchMessages, 
    sendMessage, 
    searchUsers, 
    getOrCreateConversation,
    disconnectChat,
    loading 
  } = useMessageStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isNewMsgDialogOpen, setIsNewMsgDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId);
    }
  }, [activeId, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversationMessages]);

  const handleSend = async () => {
    if (!activeId || !messageText.trim() || isSending) return;
    
    setIsSending(true);
    const content = messageText;
    setMessageText(""); // Clear immediately for speed feel

    try {
      await sendMessage(activeId, content);
    } catch (err: any) {
      alert(err.message);
      setMessageText(content); // Restore on error
    } finally {
      setIsSending(false);
    }
  };

  const handleUserSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length >= 2) {
      const results = await searchUsers(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const startNewConversation = async (targetUserId: number) => {
    const convId = await getOrCreateConversation(targetUserId);
    if (convId) {
      setActiveId(convId);
      setIsNewMsgDialogOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const activeConv = conversations.find(c => c.id === activeId);

  const renderUserId = (otherRole: string, studentId?: string, employeeCode?: string) => {
    if (user?.role === 'admin') {
      return otherRole === 'student' ? studentId : employeeCode;
    }
    if (user?.role === 'teacher') {
      if (otherRole === 'student') return studentId;
      if (otherRole === 'teacher') return employeeCode;
    }
    if (user?.role === 'student' && otherRole === 'student') {
      return studentId;
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1 flex flex-col h-full">
        <CardHeader className="pb-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Chats</h3>
            <Dialog open={isNewMsgDialogOpen} onOpenChange={setIsNewMsgDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by name..." 
                      className="pl-9" 
                      value={searchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {searchResults.map((u) => (
                        <div 
                          key={u.id} 
                          className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                          onClick={() => startNewConversation(u.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{u.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {u.name} 
                                {renderUserId(u.role, u.student_id, u.employee_code) && (
                                  <span className="ml-1 text-[10px] text-muted-foreground bg-muted px-1 rounded">
                                    {renderUserId(u.role, u.student_id, u.employee_code)}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Message</Button>
                        </div>
                      ))}
                      {searchQuery.length >= 2 && searchResults.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">No users found or not allowed to message them.</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="divide-y divide-border">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    activeId === conv.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setActiveId(conv.id)}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-r from-primary to-info text-primary-foreground">
                      {conv.other_user_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate text-sm">
                        {conv.other_user_name}
                        {renderUserId(conv.other_user_role, conv.student_id, conv.employee_code) && (
                          <span className="ml-1 text-[9px] text-muted-foreground bg-muted/50 px-1 rounded">
                            {renderUserId(conv.other_user_role, conv.student_id, conv.employee_code)}
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-muted-foreground">
                        {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate capitalize">{conv.other_user_role}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{conv.last_message || 'No messages yet'}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No conversations yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Click the + icon to start a new chat.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden">
        {activeId ? (
          <>
            <CardHeader className="border-b py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-primary to-info text-primary-foreground">
                      {activeConv?.other_user_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm">
                      {activeConv?.other_user_name}
                      {renderUserId(activeConv?.other_user_role || '', activeConv?.student_id, activeConv?.employee_code) && (
                        <span className="ml-1 text-[10px] text-muted-foreground bg-muted px-1 rounded font-normal">
                          {renderUserId(activeConv?.other_user_role || '', activeConv?.student_id, activeConv?.employee_code)}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground capitalize">{activeConv?.other_user_role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role === 'admin' && !activeConv?.is_disconnected_by_admin && activeConv?.other_user_role === 'student' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => disconnectChat(activeId)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  )}
                  {activeConv?.is_disconnected_by_admin && (
                    <Badge variant="outline" className="text-destructive border-destructive">Disconnected</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              <div 
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0"
              >
                {activeConversationMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 ${msg.sender_id === user?.id ? 'justify-end' : ''}`}
                  >
                    {msg.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1">
                        <AvatarFallback className="text-[10px]">{activeConv?.other_user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[70%] ${msg.sender_id === user?.id ? 'order-1' : 'order-2'}`}>
                      <div className={`p-3 rounded-lg text-sm ${
                        msg.sender_id === user?.id 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-muted rounded-tl-none'
                      }`}>
                        <p>{msg.content}</p>
                      </div>
                      <p className={`text-[10px] text-muted-foreground mt-1 ${msg.sender_id === user?.id ? 'text-right' : ''}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                {activeConversationMessages.length === 0 && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                    <p className="text-sm">No messages yet.</p>
                    <p className="text-xs">Send a message to start the conversation.</p>
                  </div>
                )}
                {loading && (
                  <div className="flex justify-center py-4">
                    <div className="animate-pulse flex space-x-2">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Input 
                    placeholder={activeConv?.is_disconnected_by_admin && user?.role === 'student' 
                      ? "Conversation closed by admin" 
                      : "Type your message..."
                    }
                    className="flex-1" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={(activeConv?.is_disconnected_by_admin && user?.role === 'student') || isSending}
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!messageText.trim() || (activeConv?.is_disconnected_by_admin && user?.role === 'student') || isSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Send className="h-8 w-8" />
            </div>
            <h4 className="font-medium text-lg">Your Messages</h4>
            <p className="text-sm max-w-xs mt-2">
              Select a conversation or start a new one to communicate with faculty and students.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
