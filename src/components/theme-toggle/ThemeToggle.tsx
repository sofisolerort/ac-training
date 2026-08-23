import { useTheme } from "../../context/theme";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isDark, toggle } = useTheme();

  // Versión compacta: solo un botón redondo con el ícono (para el login)
  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo noche"}
        className="w-10 h-10 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-on-surface-variant transition hover:bg-surface-container active:scale-95"
      >
        <span className="material-symbols-outlined text-xl">
          {isDark ? "light_mode" : "dark_mode"}
        </span>
      </button>
    );
  }

  // Versión fila (para Perfil / Mi cuenta)
  return (
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between bg-surface border border-outline-variant rounded-2xl p-4 mb-3 transition hover:bg-surface-container active:scale-[0.99]"
    >
      <span className="flex items-center gap-3 text-on-surface font-semibold">
        <span className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">
            {isDark ? "dark_mode" : "light_mode"}
          </span>
        </span>
        Modo noche
      </span>

      {/* Interruptor */}
      <span
        className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
          isDark ? "bg-primary" : "bg-outline-variant"
        }`}
      >
        <span
          className={`w-5 h-5 rounded-full bg-surface transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
