type LeaderboardEntry = {
  name: string;
  score: number;
  role?: string;
};

type LeaderboardTop3Props = {
  entries: LeaderboardEntry[];
  rangeLabel: string;
};

const cardBase =
  "flex flex-col items-center gap-2 rounded-lg border border-border bg-gradient-to-b from-primary/15 to-card px-4 py-5 text-center shadow";

export function LeaderboardTop3({ entries, rangeLabel }: LeaderboardTop3Props) {
  const [first, second, third] = entries;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {second && (
        <div className={`${cardBase} order-2 md:order-1`}>
          <span className="text-sm text-muted-foreground">2nd · {rangeLabel}</span>
          <p className="text-lg font-semibold text-foreground">{second.name}</p>
          <p className="text-2xl font-bold text-primary">{second.score}</p>
          <span className="text-xs text-muted-foreground">{second.role ?? "Contributor"}</span>
        </div>
      )}
      {first && (
        <div className={`${cardBase} order-1 md:order-2`}>
          <span className="text-sm text-muted-foreground">1st · {rangeLabel}</span>
          <p className="text-lg font-semibold text-foreground">{first.name}</p>
          <p className="text-3xl font-black text-primary">{first.score}</p>
          <span className="text-xs text-muted-foreground">{first.role ?? "Top helper"}</span>
        </div>
      )}
      {third && (
        <div className={`${cardBase} order-3 md:order-3`}>
          <span className="text-sm text-muted-foreground">3rd · {rangeLabel}</span>
          <p className="text-lg font-semibold text-foreground">{third.name}</p>
          <p className="text-2xl font-bold text-primary">{third.score}</p>
          <span className="text-xs text-muted-foreground">{third.role ?? "Contributor"}</span>
        </div>
      )}
    </div>
  );
}
