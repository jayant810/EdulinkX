import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthProvider";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherHolidays = () => {
  const { token } = useAuth();
  const userInfo = useUserInfo();
  const { teacherLinks } = useSidebarLinks();

  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/holidays`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHolidays(data);
      }
    } catch (err) {
      console.error("Failed to fetch holidays", err);
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHolidays();
  }, [token]);

  return (
    <>
      <Helmet><title>Holidays - Teacher</title></Helmet>
      <DashboardLayout
        sidebarLinks={teacherLinks}
        userInfo={userInfo ? { ...userInfo, id: String(userInfo.id) } : undefined}
        title="Academic Holidays"
        subtitle="View academic holidays and non-working days"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Upcoming Holidays</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-left font-bold">
                      <th className="p-4">Date</th>
                      <th className="p-4">Holiday Title</th>
                      <th className="p-4">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {holidays.map((h, idx) => (
                      <tr key={idx}>
                        <td className="p-4 font-mono">{new Date(h.holiday_date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium">{h.title}</td>
                        <td className="p-4 text-xs">
                          {h.is_weekend ? <span className="text-muted-foreground uppercase">Weekend</span> : <span className="text-primary font-bold uppercase">Gazetted</span>}
                        </td>
                      </tr>
                    ))}
                    {holidays.length === 0 && !loading && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No holidays coming up.</td></tr>}
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

export default TeacherHolidays;
