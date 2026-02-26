import { CommunityLayout } from "@/components/layout/CommunityLayout";

export default function AdminCommunity() {
  return (
    <CommunityLayout title="Community Administration" subtitle="Moderate questions, answers, and community members.">
      <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-sm">
        Admin moderation tools will live here. Wire this page to /api/v1/admin/community when the backend is ready.
      </div>
    </CommunityLayout>
  );
}
