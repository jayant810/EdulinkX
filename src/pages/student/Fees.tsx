import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
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

const feeHistory = [
  { id: 1, semester: "Semester 6", amount: 45000, dueDate: "Dec 31, 2024", status: "pending", paidOn: null },
  { id: 2, semester: "Semester 5", amount: 45000, dueDate: "Jul 15, 2024", status: "paid", paidOn: "Jul 10, 2024" },
  { id: 3, semester: "Semester 4", amount: 42000, dueDate: "Dec 31, 2023", status: "paid", paidOn: "Dec 25, 2023" },
  { id: 4, semester: "Semester 3", amount: 42000, dueDate: "Jul 15, 2023", status: "paid", paidOn: "Jul 12, 2023" },
  { id: 5, semester: "Semester 2", amount: 40000, dueDate: "Dec 31, 2022", status: "paid", paidOn: "Dec 28, 2022" },
  { id: 6, semester: "Semester 1", amount: 40000, dueDate: "Jul 15, 2022", status: "paid", paidOn: "Jul 8, 2022" },
];

const StudentFees = () => {
  const pendingAmount = feeHistory.filter(f => f.status === "pending").reduce((acc, f) => acc + f.amount, 0);
  const paidAmount = feeHistory.filter(f => f.status === "paid").reduce((acc, f) => acc + f.amount, 0);

  return (
    <>
      <Helmet>
        <title>Fees - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={sidebarLinks}
        userInfo={{ name: "John Smith", id: "STU2024001", initials: "JS" }}
        title="Fee Management"
        subtitle="View and manage your fee payments"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold font-display text-warning">₹{pendingAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold font-display text-success">₹{paidAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-2xl font-bold font-display text-destructive">Dec 31</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant="warning" className="mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Current Due */}
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Semester 6 Fees Due</h3>
                    <p className="text-muted-foreground">Due by December 31, 2024</p>
                    <p className="text-2xl font-bold mt-2">₹45,000</p>
                  </div>
                </div>
                <Button variant="hero" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fee History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border">
                      <th className="pb-3 font-medium">Semester</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Due Date</th>
                      <th className="pb-3 font-medium">Paid On</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeHistory.map((fee) => (
                      <tr key={fee.id} className="border-b border-border last:border-0">
                        <td className="py-4 font-medium">{fee.semester}</td>
                        <td className="py-4">₹{fee.amount.toLocaleString()}</td>
                        <td className="py-4 text-muted-foreground">{fee.dueDate}</td>
                        <td className="py-4 text-muted-foreground">{fee.paidOn ?? "-"}</td>
                        <td className="py-4">
                          <Badge variant={fee.status === "paid" ? "success" : "warning"}>
                            {fee.status === "paid" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {fee.status}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {fee.status === "paid" && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentFees;