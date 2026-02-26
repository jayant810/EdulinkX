import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { Bell, Eye, FileText, ShieldCheck } from "lucide-react";
import { CommunityLayout } from "@/components/layout/CommunityLayout";

const switchClasses =
  "relative h-6 w-11 rounded-full border border-border bg-secondary shadow-inner transition data-[state=checked]:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const thumbClasses =
  "block h-5 w-5 translate-x-1 rounded-full bg-card shadow transition data-[state=checked]:translate-x-5";

export default function CommunitySettings() {
  const [editorMode, setEditorMode] = useState<"markdown" | "rich">("markdown");
  const [profilePublic, setProfilePublic] = useState(true);
  const [notifications, setNotifications] = useState({
    answers: true,
    mentions: true,
    digest: false,
  });

  return (
    <CommunityLayout title="Community Settings" subtitle="Manage your community preferences and notifications.">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-foreground">
              <FileText size={16} />
              <h3 className="font-semibold">Editor mode</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Markdown is enabled now. Rich text is coming later.
            </p>
            <div className="flex gap-2">
              {(["markdown", "rich"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setEditorMode(mode)}
                  disabled={mode === "rich"}
                  className={`flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    editorMode === mode ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary/10"
                  } ${mode === "rich" ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Eye size={16} />
              <h3 className="font-semibold">Profile visibility</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Show your community profile to others. It includes reputation and recent answers.
            </p>
            <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">Public profile</span>
              <Switch.Root
                className={switchClasses}
                checked={profilePublic}
                onCheckedChange={setProfilePublic}
                id="profile-visibility"
              >
                <Switch.Thumb className={thumbClasses} />
              </Switch.Root>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Bell size={16} />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: "answers", label: "Notify me when my question gets a new answer" },
              { key: "mentions", label: "Notify me when someone mentions me" },
              { key: "digest", label: "Weekly community digest" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
              >
                <span className="text-sm text-foreground">{item.label}</span>
                <Switch.Root
                  className={switchClasses}
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                  }
                  id={`notif-${item.key}`}
                >
                  <Switch.Thumb className={thumbClasses} />
                </Switch.Root>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
