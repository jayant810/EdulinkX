import { useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Medal, Sparkles } from "lucide-react";

import { LeaderboardTop3 } from "../components/community/LeaderboardTop3";

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
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Leaderboard</h2>
            <p className="text-sm text-muted-foreground">
              Reputation points are earned from accepted answers and upvotes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm text-foreground">
            <Sparkles size={16} className="text-primary" />
            Updated every few minutes with cached scores.
          </div>
        </div>
      </div>

      <Tabs.Root value={range} onValueChange={(value) => setRange(value as typeof range)}>
        <Tabs.List className="flex gap-2 rounded-lg border border-border bg-card p-2">
          {["weekly", "monthly", "alltime"].map((value) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="w-full rounded-md px-3 py-2 text-sm font-medium capitalize text-foreground transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {value}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value={range} className="mt-4 space-y-4">
          <LeaderboardTop3 entries={top3} rangeLabel={range} />

          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 gap-3 divide-y divide-border md:grid-cols-2 md:divide-y-0 md:divide-x">
              {rest.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Medal size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      #{index + 4} {entry.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.role ?? "Contributor"}</p>
                  </div>
                  <span className="text-lg font-bold text-foreground">{entry.score}</span>
                </div>
              ))}
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
