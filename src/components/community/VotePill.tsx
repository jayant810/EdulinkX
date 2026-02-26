import { ArrowDown, ArrowUp, CheckCircle } from "lucide-react";

type VotePillProps = {
  value: number;
  direction?: "vertical" | "horizontal";
  accepted?: boolean;
  onUpvote?: () => void;
  onDownvote?: () => void;
};

export function VotePill({
  value,
  direction = "vertical",
  accepted,
  onUpvote,
  onDownvote,
}: VotePillProps) {
  const isVertical = direction === "vertical";

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-border bg-card text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isVertical ? "flex-col px-2 py-3" : "px-2 py-1"
      }`}
    >
      <button
        type="button"
        onClick={onUpvote}
        className="rounded-full p-1 text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Upvote"
      >
        <ArrowUp size={16} />
      </button>
      <span className="font-semibold text-foreground">{value}</span>
      <button
        type="button"
        onClick={onDownvote}
        className="rounded-full p-1 text-muted-foreground transition hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Downvote"
      >
        <ArrowDown size={16} />
      </button>
      {accepted && (
        <span
          className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary"
          title="Accepted answer"
        >
          <CheckCircle size={14} />
          Accepted
        </span>
      )}
    </div>
  );
}
