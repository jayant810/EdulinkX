import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Upload,
  Clock,
  CheckCircle2,
  Eye,
} from "lucide-react";

import AssignmentPDFModal from "@/pages/student/AssignmentPDFModal";
import AssignmentShortModal from "@/pages/student/AssignmentShortModal";
import { useAuth } from "@/auth/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Assignments() {
  const { token } = useAuth();
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<any[]>([]);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [openShortModal, setOpenShortModal] = useState(false);

  const loadAssignments = () => {
    if (!token) return;
    fetch(`${API_BASE}/api/student/assignments/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPendingAssignments(Array.isArray(data) ? data : []));

    fetch(`${API_BASE}/api/student/assignments/submitted`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSubmittedAssignments(Array.isArray(data) ? data : []));
  };

  useEffect(loadAssignments, [token]);

  return (
    <>
      <Helmet>
        <title>Assignments - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title="Assignments"
        subtitle="View and submit your assignments"
      >
        <div className="space-y-6">

          {/* ===== Stats ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold font-display text-warning">
                  {pendingAssignments.length}
                </p>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold font-display text-success">
                  {submittedAssignments.length}
                </p>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold font-display text-primary">
                  {submittedAssignments.filter(a => a.status === "graded").length}
                </p>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold font-display text-destructive">
                  {pendingAssignments.filter(a => a.daysLeft < 0).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ===== Tabs ===== */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
            </TabsList>

            {/* ===== Pending ===== */}
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{assignment.title}</h3>
                            <Badge
                              variant={assignment.type === "pdf" ? "secondary" : "accent"}
                            >
                              {assignment.type === "pdf"
                                ? "PDF Upload"
                                : assignment.type === "mcq" 
                                  ? "MCQ Quiz"
                                  : "Short Answer"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">{assignment.course_code}</span>
                            {" • "}
                            {assignment.course_name}
                          </p>

                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {assignment.due_date}
                            </p>
                            <p
                              className={`text-xs ${
                                assignment.daysLeft <= 2
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {assignment.daysLeft} days left
                            </p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              assignment.type === "pdf"
                                ? setOpenPdfModal(true)
                                : setOpenShortModal(true);
                            }}
                          >
                            {assignment.type === "pdf" ? (
                              <>
                                <Upload className="h-4 w-4 mr-1" /> Submit
                              </>
                            ) : (
                              "Start"
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingAssignments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No pending assignments.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== Submitted ===== */}
            <TabsContent value="submitted">
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submittedAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{assignment.title}</h3>
                            <Badge
                              variant={assignment.status === "graded" ? "success" : "warning"}
                            >
                              {assignment.status === "graded" ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {assignment.status}
                            </Badge>
                          </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">{assignment.course_code}</span>
                              {" • "}
                              {assignment.course_name}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Marks: {assignment.total_score ?? "Pending"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {new Date(assignment.submitted_at).toLocaleDateString()}
                            </p>
                          </div>

                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    ))}
                    {submittedAssignments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No submitted assignments.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ===== POPUP MODALS ===== */}
        <AssignmentPDFModal
          open={openPdfModal}
          onClose={() => setOpenPdfModal(false)}
          assignment={selectedAssignment}
        />

        <AssignmentShortModal
          open={openShortModal}
          assignment={selectedAssignment}
          onClose={(refresh) => {
            setOpenShortModal(false);
            if (refresh) {
              loadAssignments(); // refetch pending & submitted
            }
          }}
        />
      </DashboardLayout>
    </>
  );
}
