// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { PublicLayout } from "./components/layout/PublicLayout";

import Index from "./pages/Index";
import Features from "./pages/Features";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentAttendance from "./pages/student/Attendance";
import StudentCourses from "./pages/student/Courses";
import StudentAssignments from "./pages/student/Assignments";
import SubmitAssignment from "./pages/student/SubmitAssignment";
import StudentExams from "./pages/student/Exams";
import TakeExam from "./pages/student/TakeExam";
import TakeQuiz from "./pages/student/TakeQuiz";
import StudentGrades from "./pages/student/Grades";
import StudentFees from "./pages/student/Fees";
import StudentNotifications from "./pages/student/Notifications";
import StudentMessages from "./pages/student/Messages";
import StudentSettings from "./pages/student/Settings";
import StudentCoursePlayer from "@/pages/student/StudentCoursePlayer";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherStudents from "./pages/teacher/Students";
import TeacherCourses from "./pages/teacher/Courses";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherExams from "./pages/teacher/Exams";
import TeacherExamCreate from "./pages/teacher/ExamCreate";
import TeacherGrading from "./pages/teacher/Grading";
import TeacherMaterials from "./pages/teacher/Materials";
import TeacherAnnouncements from "./pages/teacher/Announcements";
import TeacherMessages from "./pages/teacher/Messages";
import TeacherSettings from "./pages/teacher/Settings";
import ManageCourse from "@/pages/teacher/ManageCourse";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminTeachers from "./pages/admin/Teachers";
import AdminDepartments from "./pages/admin/Departments";
import AdminCourses from "./pages/admin/Courses";
import AdminAttendance from "./pages/admin/Attendance";
import AdminExams from "./pages/admin/Exams";
import AdminFees from "./pages/admin/Fees";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminRoles from "./pages/admin/Roles";
import AdminSettings from "./pages/admin/Settings";
import AdminMessages from "./pages/admin/Messages";

import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CommunityStoreProvider } from "./lib/communityStore";
import { MessageStoreProvider } from "./lib/messageStore";

// Community Pages
import CommunityFeed from "./pages/shared/CommunityFeed";
import AskQuestion from "./pages/shared/AskQuestion";
import QuestionDetail from "./pages/shared/QuestionDetail";
import Leaderboard from "./pages/shared/Leaderboard";

const queryClient = new QueryClient();

/** Auto-redirect authenticated users away from /login */
const LoginRouteWrapper: React.FC = () => {
  const { isAuthenticated, user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Login />;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <AuthProvider>
          <CommunityStoreProvider>
            <MessageStoreProvider>
              <BrowserRouter>
                <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Route>

                {/* Login (auto-redirect if already logged in) */}
                <Route path="/login" element={<LoginRouteWrapper />} />

                {/* COMMUNITY (protected: all roles) */}
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
                      <CommunityFeed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/ask"
                  element={
                    <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
                      <AskQuestion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/q/:slug"
                  element={
                    <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
                      <QuestionDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/leaderboard"
                  element={
                    <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
                      <Leaderboard />
                    </ProtectedRoute>
                  }
                />

                {/* STUDENT PORTAL (protected: student only) */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/courses"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/assignments/:assignmentId/submit"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SubmitAssignment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exams"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentExams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/exams/:examId/:examType"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TakeExam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/quiz/:quizId/:quizType"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TakeQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/grades"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentGrades />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/fees"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentFees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/notifications"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/messages"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/settings"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentSettings />
                  </ProtectedRoute>
                }
              />

              {/* TEACHER PORTAL (protected: teacher only) */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/courses"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/attendance"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/exams"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherExams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/exams/create"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherExamCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/grading"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherGrading />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/materials"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherMaterials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/announcements"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherAnnouncements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/messages"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/settings"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherSettings />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN PORTAL (protected: admin only) */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminTeachers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDepartments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/attendance"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/exams"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminExams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fees"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminFees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminAnnouncements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminRoles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminMessages />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/student/course/:courseId" 
                element={<StudentCoursePlayer />} 
              />
              <Route 
              path="/teacher/courses/:courseId" 
              element={<ManageCourse />} 
              />

                              {/* 404 */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </BrowserRouter>
                        </MessageStoreProvider>
                      </CommunityStoreProvider>
                    </AuthProvider>      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
