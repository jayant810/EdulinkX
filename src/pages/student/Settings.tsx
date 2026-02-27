import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";
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
  Lock,
  Mail,
  Phone,
  Shield,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const StudentSettings = () => {
  const { token } = useAuth();
  const { userInfo } = useUserInfo();
  const { studentLinks } = useSidebarLinks();

  const [settings, setSettings] = useState({
    email_notifications: true,
    windows_notifications: true,
    assignment_updates: true,
    exam_reminders: true,
    grade_updates: true,
    fee_reminders: true,
    attendance_alerts: true,
    two_factor_enabled: false
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/settings/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to fetch settings", err));
  }, [token]);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings/notifications`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      toast.success("Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return null; // Prevent crash if userInfo is not yet loaded

  return (
    <>
      <Helmet>
        <title>Settings - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        sidebarLinks={studentLinks}
        userInfo={userInfo}
        title="Settings"
        subtitle="Manage your account settings and preferences"
      >
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-3xl font-bold text-primary-foreground">
                      {userInfo.initials}
                    </div>
                    <Button variant="outline">Change Photo</Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Full Name</Label>
                      <Input id="name" defaultValue={userInfo.name} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input id="studentId" defaultValue={userInfo.id} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={userInfo.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue="+1 234 567 8900" />
                    </div>
                  </div>
                  <Button onClick={() => toast.success("Profile updated (Email/Phone)")}>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to be contacted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch 
                      checked={settings.email_notifications} 
                      onCheckedChange={(val) => setSettings({...settings, email_notifications: val})} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Windows Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive native OS notifications</p>
                    </div>
                    <Switch 
                      checked={settings.windows_notifications} 
                      onCheckedChange={(val) => setSettings({...settings, windows_notifications: val})} 
                    />
                  </div>
                  <Button onClick={handleSaveSettings} disabled={loading}>Save Preferences</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Assignment Updates</p>
                    <p className="text-sm text-muted-foreground">New assignments and deadlines</p>
                  </div>
                  <Switch 
                    checked={settings.assignment_updates} 
                    onCheckedChange={(val) => setSettings({...settings, assignment_updates: val})} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Exam Reminders</p>
                    <p className="text-sm text-muted-foreground">Upcoming exam notifications</p>
                  </div>
                  <Switch 
                    checked={settings.exam_reminders} 
                    onCheckedChange={(val) => setSettings({...settings, exam_reminders: val})} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Grade Updates</p>
                    <p className="text-sm text-muted-foreground">When grades are posted</p>
                  </div>
                  <Switch 
                    checked={settings.grade_updates} 
                    onCheckedChange={(val) => setSettings({...settings, grade_updates: val})} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Fee Reminders</p>
                    <p className="text-sm text-muted-foreground">Payment due date alerts</p>
                  </div>
                  <Switch 
                    checked={settings.fee_reminders} 
                    onCheckedChange={(val) => setSettings({...settings, fee_reminders: val})} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Attendance Alerts</p>
                    <p className="text-sm text-muted-foreground">Low attendance warnings</p>
                  </div>
                  <Switch 
                    checked={settings.attendance_alerts} 
                    onCheckedChange={(val) => setSettings({...settings, attendance_alerts: val})} 
                  />
                </div>
                <Button onClick={handleSaveSettings} disabled={loading}>Save Notification Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleUpdatePassword} disabled={loading}>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">Secure your account with two-factor authentication (Email OTP)</p>
                    </div>
                    <Switch 
                      checked={settings.two_factor_enabled} 
                      onCheckedChange={(val) => setSettings({...settings, two_factor_enabled: val})} 
                    />
                  </div>
                  <Button onClick={handleSaveSettings} disabled={loading} className="mt-4">Update Security Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
};

export default StudentSettings;