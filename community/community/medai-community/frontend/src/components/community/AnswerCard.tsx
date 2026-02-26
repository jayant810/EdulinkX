import { useMemo } from "react";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import { BadgeCheck, Calendar, Flag } from "lucide-react";
import remarkGfm from "remark-gfm";

import { ReportDialog } from "./ReportDialog";

type AnswerCardProps = {
  author: string;
  createdAt: string;
  body: string;
  votes?: number;
  accepted?: boolean;
  canAccept?: boolean;
  onAccept?: () => void;
};

export function AnswerCard({
  author,
  createdAt,
  body,
  votes: _votes,
  accepted,
  canAccept,
  onAccept,
}: AnswerCardProps) {
  const preview = useMemo(() => {
    const safeBody = DOMPurify.sanitize(body);
    return (
      <div className="prose prose-slate max-w-none text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
          {safeBody}
        </ReactMarkdown>
      </div>
    );
  }, [body]);

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col items-center gap-2">
        {accepted && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary"
            title="Accepted answer"
          >
            <BadgeCheck size={14} />
            Accepted
          </span>
        )}
        <ReportDialog trigger={<span className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-destructive"><Flag size={14} />Report</span>} targetLabel="answer" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck size={16} className="text-primary" />
            <span className="text-foreground font-medium">{author}</span>
            <span className="inline-flex items-center gap-1 text-xs">
              <Calendar size={14} />
              {createdAt}
            </span>
          </div>
          {canAccept && !accepted && (
            <button
              type="button"
              onClick={onAccept}
              className="rounded-md border border-primary bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Accept answer
            </button>
          )}
          {accepted && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
              <BadgeCheck size={14} />
              Accepted
            </span>
          )}
        </div>
        <div className="rounded-md border border-border bg-background/60 p-3 text-foreground">{preview}</div>
      </div>
    </div>
  );
}
