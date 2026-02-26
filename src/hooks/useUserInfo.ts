import { useAuth } from "@/auth/AuthProvider";

export const useUserInfo = () => {
  const { user } = useAuth();

  return {
    name: user?.name || "User",
    id: user?.studentId || user?.employeeCode || user?.id || "",
    initials: user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U",
    gradientFrom: user?.role === "admin" ? "from-slate-700" : user?.role === "teacher" ? "from-blue-600" : "from-primary",
    gradientTo: user?.role === "admin" ? "to-slate-900" : user?.role === "teacher" ? "to-blue-800" : "to-info",
  };
};
