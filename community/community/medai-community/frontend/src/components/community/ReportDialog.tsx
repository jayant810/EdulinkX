import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Flag, X } from "lucide-react";

type ReportDialogProps = {
  trigger?: React.ReactNode;
  targetLabel?: string;
};

export function ReportDialog({ trigger, targetLabel = "item" }: ReportDialogProps) {
  const [reason, setReason] = useState("");

  const closeAndReset = (onClose?: () => void) => {
    setReason("");
    onClose?.();
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition hover:border-destructive hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Flag size={16} />
            Report
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-fadeIn" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg focus:outline-none">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Report {targetLabel}
            </Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Tell us what is wrong. Moderators will review flagged content.
          </Dialog.Description>
          <div className="mt-4 space-y-3">
            <label className="flex flex-col gap-2 text-sm text-foreground">
              Reason
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Spam, incorrect info, abusive content..."
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close
              className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => closeAndReset()}
            >
              Cancel
            </Dialog.Close>
            <Dialog.Close
              className="rounded-md bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground shadow transition hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => closeAndReset()}
            >
              Submit report
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
