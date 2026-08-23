type Props = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  hideCancel = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 animate-backdrop"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-surface rounded-2xl border border-outline-variant p-5 shadow-xl animate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-display font-bold text-on-surface mb-1">
            {title}
          </h2>
        )}
        <p className="text-on-surface-variant mb-5">{message}</p>

        <div className="flex gap-2">
          {!hideCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold transition hover:bg-surface-container active:scale-[0.98]"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-on-primary transition hover:brightness-95 active:scale-[0.98] ${
              danger ? "bg-error" : "bg-primary"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
