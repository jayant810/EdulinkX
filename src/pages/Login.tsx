import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import { GraduationCap, Users, Settings, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeRole, setActiveRole] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    studentId: "",
    employeeCode: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp && formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (isSignUp) {
        const payload: any = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: activeRole,
        };

        if (activeRole === "student") payload.studentId = formData.studentId;
        if (activeRole === "teacher") payload.employeeCode = formData.employeeCode;

        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Signup failed");
          return;
        }

        // Use AuthProvider to set token & user in context
        login(data.token, data.user);
        toast.success("Account created successfully!");

      } else {
        const payload = { email: formData.email, password: formData.password, role: activeRole };
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Login failed");
          return;
        }

        // Use AuthProvider to set token & user in context
        login(data.token, data.user);
        toast.success("Login successful!");
      }

      // Redirect based on role (use the user from context via localStorage fallback)
      // AuthProvider persisted user -> we can rely on localStorage or data above.
      // Prefer the user we just obtained from API (data.user), but safe fallback:
      const storedUser = JSON.parse(localStorage.getItem("edulinkx_user") || "null");
      const user = storedUser ?? (isSignUp ? null : null); // stored by AuthProvider effect

      // If login() updated context, navigate based on the user it set.
      // But since login() writes to localStorage, read it here to be safe:
      const maybeUser = user ?? JSON.parse(window.localStorage.getItem("edulinkx_user") || "null");

      if (maybeUser?.role === "student") navigate("/student/dashboard");
      else if (maybeUser?.role === "teacher") navigate("/teacher/dashboard");
      else navigate("/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred");
    }
  };

  const roleConfig = {
    student: {
      icon: GraduationCap,
      color: "primary",
      title: "Student Portal",
      description: "Access your courses, grades, and academic records",
      idField: "studentId",
      idLabel: "Student ID / Enrollment Number",
      idPlaceholder: "e.g., STU2024001",
    },
    teacher: {
      icon: Users,
      color: "accent",
      title: "Teacher Portal",
      description: "Manage courses, students, and assessments",
      idField: "employeeCode",
      idLabel: "Employee Code",
      idPlaceholder: "e.g., FAC2024001",
    },
    admin: {
      icon: Settings,
      color: "warning",
      title: "Admin Portal",
      description: "Manage institution settings and users",
      idField: null,
      idLabel: null,
      idPlaceholder: null,
    },
  };

  const currentRole = roleConfig[activeRole as keyof typeof roleConfig];
  const IconComponent = currentRole.icon;

  return (
    <>
      <Helmet>
        <title>{isSignUp ? "Sign Up" : "Login"} - EdulinkX</title>
        <meta name="description" content="Access your EdulinkX account. Login as student, teacher, or administrator." />
      </Helmet>

      <section className="min-h-screen py-20 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Back to Home */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-display">
                Edulink<span className="text-primary">X</span>
              </span>
            </div>

            <Card className="shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full bg-${currentRole.color}/10 flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`h-8 w-8 text-${currentRole.color}`} />
                </div>
                <CardTitle className="text-2xl font-display">{currentRole.title}</CardTitle>
                <CardDescription>{currentRole.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Role Tabs */}
                <Tabs value={activeRole} onValueChange={setActiveRole}>
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="student" className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span className="hidden sm:inline">Student</span>
                    </TabsTrigger>
                    <TabsTrigger value="teacher" className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Teacher</span>
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Login/Signup Toggle */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-muted-foreground">{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
                    {isSignUp ? "Login" : "Sign Up"}
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="John Smith" required value={formData.name} onChange={handleChange} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="you@college.edu" required value={formData.email} onChange={handleChange} />
                  </div>

                  {isSignUp && currentRole.idField && (
                    <div className="space-y-2">
                      <Label htmlFor={currentRole.idField}>{currentRole.idLabel}</Label>
                      <Input
                        id={currentRole.idField}
                        name={currentRole.idField}
                        placeholder={currentRole.idPlaceholder || ""}
                        required
                        value={formData[currentRole.idField as keyof typeof formData]}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={formData.password} onChange={handleChange} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required value={formData.confirmPassword} onChange={handleChange} />
                    </div>
                  )}

                  {!isSignUp && (
                    <div className="flex justify-end">
                      <button type="button" className="text-sm text-primary hover:underline">
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <Button type="submit" variant="hero" className="w-full">
                    {isSignUp ? "Create Account" : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
