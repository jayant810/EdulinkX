type TagPillProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function TagPill({ label, active, onClick }: TagPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-transparent bg-primary text-primary-foreground shadow"
          : "border-border bg-secondary text-foreground hover:bg-primary/10"
      }`}
    >
      #{label}
    </button>
  );
}
