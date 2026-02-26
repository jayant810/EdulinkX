import { Link } from "react-router-dom";
import { Clock3, Eye, Heart, MessageSquare, MessageSquareQuote, Trash2, UserRoundSearch } from "lucide-react";

import { TagPill } from "./TagPill";

export type QuestionCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[] | string;
  votes?: number;
  likes: number;
  answers: number;
  views: number;
  author_name: string;
  created_at: string;
  liked?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  onViewAnswers?: () => void;
  onLike?: () => void;
  onReply?: () => void;
  onDelete?: () => void;
};

export function QuestionCard({
  slug,
  title,
  excerpt,
  tags,
  votes: _votes,
  likes,
  answers,
  views,
  author_name,
  created_at,
  liked = false,
  isOwner,
  isAdmin,
  onViewAnswers,
  onLike,
  onReply,
  onDelete,
}: QuestionCardProps) {
  const canDelete = isAdmin || isOwner;
  const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary/50">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            to={`/community/q/${slug}`}
            className="text-lg font-semibold text-foreground hover:text-primary"
          >
            {title}
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
          <div className="flex flex-wrap gap-2">
            {parsedTags.map((tag: string) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground whitespace-nowrap">
          <span className="flex items-center gap-1">
            <Clock3 size={12} />
            {new Date(created_at).toLocaleDateString()}
          </span>
          <span>by <span className="font-medium text-foreground">{author_name}</span></span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={onLike}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            liked ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-primary/10"
          }`}
          aria-pressed={liked}
        >
          <Heart size={14} className={liked ? "fill-current" : ""} />
          {likes} likes
        </button>
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-foreground">
          <MessageSquare size={14} />
          {answers} answers
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-foreground">
          <Eye size={14} />
          {views} views
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onViewAnswers}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UserRoundSearch size={14} />
          View answers
        </button>
        <button
          type="button"
          onClick={onReply}
          className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageSquareQuote size={14} />
          Reply
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 size={14} />
            Delete {isAdmin ? "question (admin)" : "my question"}
          </button>
        )}
      </div>
    </div>
  );
}
