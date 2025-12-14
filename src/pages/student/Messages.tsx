import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  Calendar,
  BookOpen,
  FileText,
  GraduationCap,
  TrendingUp,
  CreditCard,
  Bell,
  MessageSquare,
  Settings,
  BarChart3,
  Search,
  Send,
  PlusCircle,
} from "lucide-react";

const sidebarLinks = [
  { icon: BarChart3, label: "Dashboard", href: "/student/dashboard" },
  { icon: User, label: "My Profile", href: "/student/profile" },
  { icon: Calendar, label: "Attendance", href: "/student/attendance" },
  { icon: BookOpen, label: "Courses", href: "/student/courses" },
  { icon: FileText, label: "Assignments", href: "/student/assignments" },
  { icon: GraduationCap, label: "Exams", href: "/student/exams" },
  { icon: TrendingUp, label: "Grades", href: "/student/grades" },
  { icon: CreditCard, label: "Fees", href: "/student/fees" },
  { icon: Bell, label: "Notifications", href: "/student/notifications" },
  { icon: MessageSquare, label: "Messages", href: "/student/messages" },
  { icon: Settings, label: "Settings", href: "/student/settings" },
];

const conversations = [
  { id: 1, name: "Dr. Patricia Lee", role: "Faculty - Data Structures", lastMessage: "Please submit your assignment by tomorrow.", time: "10 min ago", unread: 2, avatar: "PL" },
  { id: 2, name: "Prof. James Wilson", role: "Faculty - Database Systems", lastMessage: "Great work on the SQL project!", time: "2 hours ago", unread: 0, avatar: "JW" },
  { id: 3, name: "Academic Office", role: "Administration", lastMessage: "Your fee payment has been received.", time: "1 day ago", unread: 0, avatar: "AO" },
  { id: 4, name: "Dr. Emily Chen", role: "Faculty - Computer Networks", lastMessage: "The lab session is rescheduled to Friday.", time: "2 days ago", unread: 0, avatar: "EC" },
  { id: 5, name: "Library Services", role: "Administration", lastMessage: "Your book return is overdue.", time: "3 days ago", unread: 1, avatar: "LS" },
];

const StudentMessages = () => {
  return (
    <>
      <Helmet>
        <title>Messages - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Messages"
        subtitle="Communicate with faculty and administration"
        headerActions={
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Message
          </Button>
        }
      >
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-9" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      conv.id === 1 ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{conv.name}</h4>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.role}</p>
                      <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  PL
                </div>
                <div>
                  <h4 className="font-medium">Dr. Patricia Lee</h4>
                  <p className="text-xs text-muted-foreground">Faculty - Data Structures</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] p-4 overflow-y-auto space-y-4">
                {/* Received Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
                    PL
                  </div>
                  <div className="max-w-[70%]">
                    <div className="bg-muted rounded-lg rounded-tl-none p-3">
                      <p className="text-sm">Hello John, I noticed you haven't submitted your assignment yet.</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
                  </div>
                </div>

                {/* Sent Message */}
                <div className="flex gap-3 justify-end">
                  <div className="max-w-[70%]">
                    <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-3">
                      <p className="text-sm">I'm working on it, Dr. Lee. I'll submit it by tonight.</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">10:32 AM</p>
                  </div>
                </div>

                {/* Received Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
                    PL
                  </div>
                  <div className="max-w-[70%]">
                    <div className="bg-muted rounded-lg rounded-tl-none p-3">
                      <p className="text-sm">Please submit your assignment by tomorrow. Late submissions won't be accepted.</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">10:35 AM</p>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Type your message..." className="flex-1" />
                  <Button>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentMessages;