import { Loader2, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  pendingLabel?: string;
  error?: string;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
  confirmLabel = "Delete",
  pendingLabel = "Deleting…",
  error,
}: ConfirmationModalProps) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    const trigger = document.activeElement;
    element.showModal();
    cancel.current?.focus();
    return () => {
      element.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      aria-busy={loading}
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) onClose();
      }}
      className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-xl font-semibold text-white">{title}</h2>

          <button
            type="button"
            aria-label="Close confirmation"
            onClick={onClose}
            disabled={loading}
            className="text-zinc-400 transition hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <p id={messageId} className="mt-4 text-sm text-zinc-300">{message}</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancel}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? pendingLabel : confirmLabel}
          </button>
        </div>
    </dialog>
  );
};

export default ConfirmationModal;
