import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/auth/AuthProvider";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const AdminAttendance = () => {
  const { token } = useAuth();
  const userInfo = useUserInfo();
  const { adminLinks } = useSidebarLinks();

  const [stats, setStats] = useState<any>(null);
  const [deptAttendance, setDeptAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const [statsRes, deptsRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/attendance/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/admin/attendance/departments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (deptsRes.ok) setDeptAttendance(await deptsRes.json());
      } catch (err) {
        console.error("Failed to fetch attendance data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Attendance - EdulinkX Admin</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={adminLinks}
        userInfo={userInfo}
        title="Attendance"
        subtitle="Institution-wide attendance overview"
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-success">
                    {stats?.overallPercentage || 0}%
                  </p>
                )}
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Below 75%</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-warning">
                    {stats?.below75Count || 0}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Today's Present</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    {stats?.todayPresent || 0}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Today's Absent</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-destructive">
                    {stats?.todayAbsent || 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                deptAttendance.map((d) => (
                  <div key={d.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{d.name}</span>
                      <span className="font-bold">{d.percentage}%</span>
                    </div>
                    <Progress
                      value={d.percentage}
                      className={
                        d.percentage < 75
                          ? "[&>div]:bg-destructive"
                          : d.percentage < 85
                          ? "[&>div]:bg-warning"
                          : ""
                      }
                    />
                  </div>
                ))
              )}
              {!loading && deptAttendance.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No attendance data available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AdminAttendance;
