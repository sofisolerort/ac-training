import { useAuth } from "../../context/AuthProvider";
import { useStudent } from "../../hooks/useStudent";
import DataRow from "../../components/data-row/DataRow";
import BottomNav from "../../components/bottom-nav/BottomNav";
import ThemeToggle from "../../components/theme-toggle/ThemeToggle";

export default function Account() {
  const { session, signOut } = useAuth();
  const { student } = useStudent(session?.user.id);

  const nombre = student?.full_name ?? "Andrés";
  const inicial = nombre.trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <h1 className="text-2xl font-display font-extrabold text-on-surface mb-6">
          Mi cuenta
        </h1>

        {/* Encabezado con avatar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-2xl font-display font-extrabold shadow-sm">
            {inicial}
          </div>
          <div>
            <p className="text-lg font-bold text-on-surface">{nombre}</p>
            <p className="text-sm text-on-surface-variant">Entrenador</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-outline-variant p-4 mb-6 shadow-sm">
          <DataRow label="Email" value={session?.user.email ?? null} />
        </div>

        <ThemeToggle />

        <button
          onClick={signOut}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-outline-variant text-error font-semibold transition hover:bg-error/10 active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Cerrar sesión
        </button>
      </div>
      <BottomNav role="trainer" />
    </div>
  );
}
