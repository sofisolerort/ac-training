import { useNavigate } from "react-router-dom";
import Spinner from "../../components/spinner/Spinner";
import { useAuth } from "../../context/AuthProvider";
import { useClassDay } from "../../hooks/useClassDay";
import BottomNav from "../../components/bottom-nav/BottomNav";

export default function StudentHome() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { day, weekNumber, month, items, loading } = useClassDay(session?.user.id);

  const completos = items.filter((i) => i.status === "done").length;
  const progreso = items.length > 0 ? (completos / items.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <p className="text-sm font-medium text-on-surface-variant">Bienvenido</p>
        <h1 className="text-2xl font-display font-extrabold text-on-surface mb-6">
          Tu entrenamiento
        </h1>

        {loading && <Spinner />}

        {!loading && !day && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center animate-fade-in-up">
            <span className="material-symbols-outlined text-4xl text-outline">
              exercise
            </span>
            <p className="text-on-surface-variant mt-2">
              Todavía no tenés una rutina asignada.
            </p>
          </div>
        )}

        {!loading && day && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm animate-fade-in-up">
            <span className="inline-flex items-center gap-1 text-xs bg-info-container text-on-info-container px-3 py-1 rounded-full font-semibold">
              <span className="material-symbols-outlined text-sm">today</span>
              Hoy
            </span>
            <h2 className="text-2xl font-display font-extrabold text-on-surface mt-3">
              Día {day.number}
              {day.name ? ` — ${day.name}` : ""}
            </h2>
            <p className="text-on-surface-variant mt-1">
              Mes {month} · Semana {weekNumber} · {items.length} ejercicios
            </p>

            {/* Barra de progreso */}
            {completos > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>Progreso</span>
                  <span>
                    {completos}/{items.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/mi-dia")}
              className="w-full mt-5 py-3.5 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98] inline-flex items-center justify-center gap-1"
            >
              {completos > 0 ? "Continuar" : "Empezar"}
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </div>
      <BottomNav role="student" />
    </div>
  );
}
