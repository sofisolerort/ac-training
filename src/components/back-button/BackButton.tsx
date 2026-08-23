import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Volver" }: { label?: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Volver"
      className="group inline-flex items-center gap-2 mb-5 text-on-surface-variant"
    >
      <span className="w-9 h-9 rounded-full bg-surface border border-outline-variant flex items-center justify-center transition group-hover:bg-surface-container group-active:scale-95">
        <span className="material-symbols-outlined text-xl">arrow_back</span>
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
