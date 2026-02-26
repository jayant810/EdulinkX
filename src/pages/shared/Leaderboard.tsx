import { useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Medal, Sparkles, Trophy } from "lucide-react";
import { CommunityLayout } from "@/components/layout/CommunityLayout";

import { LeaderboardTop3 } from "@/components/community/LeaderboardTop3";

const leaderboardData = {
  weekly: [
    { name: "Mina", score: 1280, role: "AI Safety" },
    { name: "Dr. Lee", score: 880, role: "Clinician" },
    { name: "Alex", score: 720, role: "Research" },
    { name: "Priya", score: 640, role: "Data Scientist" },
  ],
  monthly: [
    { name: "Dr. Lee", score: 4200, role: "Clinician" },
    { name: "Mina", score: 3980, role: "AI Safety" },
    { name: "Jon", score: 3100, role: "Community" },
    { name: "Kai", score: 2800, role: "MLE" },
  ],
  alltime: [
    { name: "Mina", score: 12040, role: "AI Safety" },
    { name: "Jon", score: 11010, role: "Community" },
    { name: "Dr. Lee", score: 10550, role: "Clinician" },
    { name: "Priya", score: 9700, role: "Data Scientist" },
  ],
};

export default function Leaderboard() {
  const [range, setRange] = useState<"weekly" | "monthly" | "alltime">("weekly");

  const entries = useMemo(() => leaderboardData[range], [range]);
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <CommunityLayout 
      title="Leaderboard" 
      subtitle="Celebrate the most active and helpful members of our community."
    >
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-tight">Top Contributors</h2>
              <p className="text-sm text-muted-foreground">
                Reputation points are earned from accepted answers and upvotes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2 text-xs font-medium text-muted-foreground">
            <Sparkles size={14} className="text-primary" />
            Updated in real-time
          </div>
        </div>

        <Tabs.Root value={range} onValueChange={(value) => setRange(value as typeof range)}>
          <Tabs.List className="flex gap-2 rounded-lg border border-border bg-card p-1 max-w-md">
            {["weekly", "monthly", "alltime"].map((value) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize text-foreground transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {value}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value={range} className="mt-6 space-y-6">
            <LeaderboardTop3 entries={top3} rangeLabel={range} />

            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Rankers</span>
              </div>
              <div className="grid grid-cols-1 gap-0 divide-y divide-border md:grid-cols-2 md:divide-y-0 md:divide-x">
                {rest.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {index + 4}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {entry.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{entry.role ?? "Contributor"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">{entry.score}</span>
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">Points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </CommunityLayout>
  );
}

