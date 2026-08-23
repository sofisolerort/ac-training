import { useAuth } from "../../context/AuthProvider";
import Spinner from "../../components/spinner/Spinner";
import { useStudent } from "../../hooks/useStudent";
import DataRow from "../../components/data-row/DataRow";
import BottomNav from "../../components/bottom-nav/BottomNav";
import ThemeToggle from "../../components/theme-toggle/ThemeToggle";

export default function Profile() {
  const { session, signOut } = useAuth();
  const { student, loading } = useStudent(session?.user.id);

  const inicial = (student?.full_name ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <h1 className="text-2xl font-display font-extrabold text-on-surface mb-6">
          Mi perfil
        </h1>

        {loading && <Spinner />}

        {student && (
          <>
            {/* Encabezado con avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-2xl font-display font-extrabold shadow-sm">
                {inicial}
              </div>
              <div>
                <p className="text-lg font-bold text-on-surface">
                  {student.full_name ?? "Sin nombre"}
                </p>
                {student.objective && (
                  <p className="text-sm text-on-surface-variant">
                    {student.objective}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-outline-variant p-4 mb-6 shadow-sm">
              <DataRow
                label="Peso"
                value={student.weight_kg ? `${student.weight_kg} kg` : null}
              />
              <DataRow
                label="Altura"
                value={student.height_cm ? `${student.height_cm} cm` : null}
              />
              <DataRow label="Lesiones" value={student.injuries} />
            </div>
          </>
        )}

        <ThemeToggle />

        <button
          onClick={signOut}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-outline-variant text-error font-semibold transition hover:bg-error/10 active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Cerrar sesión
        </button>
      </div>
      <BottomNav role="student" />
    </div>
  );
}
