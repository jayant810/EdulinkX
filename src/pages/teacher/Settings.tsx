import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";
import {
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  ClipboardCheck,
  Upload,
  Bell,
  MessageSquare,
  Settings,
  User,
  Lock,
  Globe,
  Save,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const TeacherSettings = () => {
  const { token } = useAuth();
  const userInfo = useUserInfo();
  const { teacherLinks } = useSidebarLinks();

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
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    // Check URL params for google OAuth redirect status
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_connected") === "success") {
      toast.success("Google account connected successfully!");
      // Remove query param without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("google_connected") === "error") {
      toast.error(`Google connection failed: ${params.get("message") || "Unknown error"}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    
    // Check Google status
    fetch(`${API_BASE}/api/auth/google-status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setGoogleConnected(data.connected))
      .catch(err => console.error("Failed to fetch google status", err));

    fetch(`${API_BASE}/api/settings/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to fetch settings", err));
  }, [token]);

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/connect-google`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error("Failed to initiate Google connection");
    }
  };

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
        sidebarLinks={teacherLinks}
        userInfo={userInfo}
        title="Settings"
        subtitle="Manage your account preferences"
      >
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                    {userInfo.initials}
                  </div>
                  <Button variant="outline">Change Photo</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input defaultValue={userInfo.name} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employee ID</label>
                    <Input defaultValue={userInfo.id} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue="patricia.lee@edulink.edu" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input defaultValue="+1 234 567 8901" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Input defaultValue="Computer Science" disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Designation</label>
                    <Input defaultValue="Associate Professor" disabled className="mt-1 bg-muted" />
                  </div>
                </div>
                <Button onClick={() => toast.success("Profile updated (Email/Phone)")}>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Assignment Submissions</p>
                      <p className="text-sm text-muted-foreground">Get notified when students submit</p>
                    </div>
                    <Switch 
                      checked={settings.assignment_updates} 
                      onCheckedChange={(val) => setSettings({...settings, assignment_updates: val})} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Messages</p>
                      <p className="text-sm text-muted-foreground">Notifications for new messages</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Exam Reminders</p>
                      <p className="text-sm text-muted-foreground">Remind about upcoming exams</p>
                    </div>
                    <Switch 
                      checked={settings.exam_reminders} 
                      onCheckedChange={(val) => setSettings({...settings, exam_reminders: val})} 
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSettings} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Current Password</label>
                    <Input 
                      type="password" 
                      className="mt-1" 
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">New Password</label>
                    <Input 
                      type="password" 
                      className="mt-1" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input 
                      type="password" 
                      className="mt-1" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security (Email OTP)</p>
                  </div>
                  <Switch 
                    checked={settings.two_factor_enabled} 
                    onCheckedChange={(val) => setSettings({...settings, two_factor_enabled: val})} 
                  />
                </div>
                <Button onClick={handleUpdatePassword} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" /> Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <Select defaultValue="est">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme</p>
                  </div>
                  <Switch />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Integrations</h4>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border shadow-sm">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Google Calendar & Meet</p>
                        <p className="text-sm text-muted-foreground">
                          {googleConnected 
                            ? "Connected - Ready to host GMeet sessions" 
                            : "Connect to create and manage GMeet classes"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={googleConnected ? "outline" : "default"}
                      onClick={handleConnectGoogle}
                      disabled={googleConnected}
                    >
                      {googleConnected ? "Connected" : "Connect Google Account"}
                    </Button>
                  </div>
                </div>

                <Button onClick={() => toast.success("Preferences saved")}>
                  <Save className="h-4 w-4 mr-2" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
};

export default TeacherSettings;