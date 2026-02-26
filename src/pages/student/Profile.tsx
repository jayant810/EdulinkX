import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/auth/AuthProvider";
import {
  User,
  GraduationCap,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Users,
  Edit,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const StudentProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/student/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setProfile(data.profile);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-destructive text-center">Profile details not available. Please complete your registration.</div>;
  }

  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Helmet>
        <title>My Profile - EdulinkX</title>
      </Helmet>

      <DashboardLayout
        title="My Profile"
        subtitle="View and manage your profile information"
        headerActions={
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-info flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {initials}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold font-display">{profile.full_name}</h2>
                  <p className="text-muted-foreground">{profile.department}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge>Semester {profile.semester}</Badge>
                    <Badge variant="secondary">Section {profile.section}</Badge>
                    <Badge variant="info">Batch {profile.batch}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="text-xl font-bold font-display">{profile.student_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Full Name" value={profile.full_name} />
                  <InfoItem label="Date of Birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : ""} />
                  <InfoItem label="Gender" value={profile.gender} />
                  <InfoItem label="Blood Group" value={profile.blood_group} />
                </div>
                <div className="pt-4 border-t space-y-3">
                  <Row icon={Mail} value={profile.email} />
                  <Row icon={Phone} value={profile.phone} />
                  <Row icon={MapPin} value={profile.address} />
                </div>
              </CardContent>
            </Card>

            {/* Parent/Guardian */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent / Guardian Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GuardianItem label="Father" name={profile.father_name} phone={profile.father_phone} />
                <GuardianItem label="Mother" name={profile.mother_name} phone={profile.mother_phone} />
                <div className="pt-4 border-t">
                  <InfoItem label="Guardian Email" value={profile.guardian_email} />
                </div>
              </CardContent>
            </Card>

            {/* Academic */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <InfoItem label="Department" value={profile.department} />
                  <InfoItem label="Program" value={profile.program} />
                  <InfoItem label="CGPA" value={profile.current_cgpa ? `${profile.current_cgpa} / 10` : ""} highlight />
                  <InfoItem label="Admission Year" value={profile.admission_year} />
                  <InfoItem label="Roll Number" value={profile.roll_number} />
                  <InfoItem label="Registration No." value={profile.registration_number} />
                  <div>
                    <p className="text-sm text-muted-foreground">Academic Status</p>
                    <Badge variant="success">{profile.academic_status}</Badge>
                  </div>
                  <InfoItem label="Mentor" value={profile.mentor_name} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

const InfoItem = ({ label, value, highlight = false }: any) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={`font-medium ${highlight ? "text-primary" : ""}`}>{value || "—"}</p>
  </div>
);

const Row = ({ icon: Icon, value }: any) => (
  <div className="flex items-center gap-3">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span>{value || "—"}</span>
  </div>
);

const GuardianItem = ({ label, name, phone }: any) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}'s Name</p>
    <p className="font-medium">{name || "—"}</p>
    <p className="text-sm text-muted-foreground mt-1">{phone || "—"}</p>
  </div>
);

export default StudentProfile;
