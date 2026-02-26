import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Info } from "lucide-react";

import { EditorMarkdown } from "../components/community/EditorMarkdown";
import { TagPill } from "../components/community/TagPill";
import { useCommunityStore } from "../lib/communityStore";

const formSchema = z.object({
  title: z.string().min(8, "Give your question a descriptive title."),
  body: z.string().min(20, "Add more context so others can help."),
  tags: z.array(z.string()).min(1, "Add at least one tag.").max(5, "Max 5 tags."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AskQuestion() {
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState("");
  const { addQuestion, currentUser } = useCommunityStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
      tags: [],
    },
    shouldUnregister: false,
  });

  const title = watch("title");
  const tags = watch("tags") ?? [];
  const body = watch("body") ?? "";

  const slug = useMemo(() => {
    const safeTitle = title ?? "";
    return safeTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }, [title]);

  const addTag = (tag: string) => {
    if (!tag || tags.includes(tag) || tags.length >= 5) return;
    const updated = [...tags, tag];
    setValue("tags", updated, { shouldValidate: true, shouldDirty: true });
  };

  const removeTag = (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setValue("tags", updated, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (data: FormValues) => {
    const created = addQuestion({
      title: data.title,
      body: data.body,
      tags: data.tags,
      author: currentUser.name,
    });
    navigate(`/community/q/${created.slug}`, { state: { focusAnswer: true } });
    return Promise.resolve(created);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Ask the community</h2>
        <p className="text-sm text-muted-foreground">
          Share enough detail so others can provide an actionable answer. Markdown is supported.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <label className="block space-y-2">
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>Title</span>
            {errors.title && <span className="text-destructive">{errors.title.message}</span>}
          </div>
          <input
            type="text"
            placeholder="E.g. How to prevent model hallucinations for rare diseases?"
            {...register("title")}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="block space-y-2">
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>Body</span>
            {errors.body && <span className="text-destructive">{errors.body.message}</span>}
          </div>
          <EditorMarkdown
            value={body}
            onChange={(value) => setValue("body", value, { shouldValidate: true, shouldDirty: true })}
            placeholder="Describe the challenge, what you tried, and what a great answer would include."
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>Tags</span>
            <span className="text-muted-foreground text-xs">Add up to 5 tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagPill key={tag} label={tag} active onClick={() => removeTag(tag)} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Hash className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value.toLowerCase())}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag(tagInput.trim());
                    setTagInput("");
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                addTag(tagInput.trim());
                setTagInput("");
              }}
              className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Add
            </button>
          </div>
          {errors.tags && <p className="text-sm text-destructive">{errors.tags.message}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Info size={16} />
            <span>Preview slug: <span className="font-semibold text-foreground">/community/q/{slug || "your-question"}</span></span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Posting..." : "Post question"}
          </button>
        </div>
      </form>
    </div>
  );
}
