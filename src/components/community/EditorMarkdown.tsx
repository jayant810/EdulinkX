import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";

type EditorMarkdownProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function EditorMarkdown({ value, onChange, placeholder, disabled }: EditorMarkdownProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const safeContent = useMemo(() => DOMPurify.sanitize(value), [value]);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-4">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            tab === "write" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            tab === "preview" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
          }`}
        >
          Preview
        </button>
      </div>
      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={8}
          className="w-full resize-y rounded-b-lg bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <div className="rounded-b-lg bg-background px-4 py-3 text-foreground">
          {value ? (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                {safeContent}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
