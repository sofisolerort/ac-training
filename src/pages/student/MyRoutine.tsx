import { useState, useEffect, useMemo } from "react";
import Spinner from "../../components/spinner/Spinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { usePlan } from "../../hooks/usePlan";
import { useDays } from "../../hooks/useDays";
import BottomNav from "../../components/bottom-nav/BottomNav";

export default function MyRoutine() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { plan, weeks, loading } = usePlan(session?.user.id);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);

  // Meses presentes (ordenados)
  const months = useMemo(
    () => [...new Set(weeks.map((w) => w.month))].sort((a, b) => a - b),
    [weeks],
  );

  // Semanas del mes elegido
  const weeksOfMonth = useMemo(
    () =>
      weeks
        .filter((w) => w.month === selectedMonth)
        .sort((a, b) => a.number - b.number),
    [weeks, selectedMonth],
  );

  // Al cargar, arrancar en el último mes (el actual)
  useEffect(() => {
    if (months.length > 0 && selectedMonth === null) {
      setSelectedMonth(months[months.length - 1]);
    }
  }, [months, selectedMonth]);

  // Mantener una semana válida seleccionada dentro del mes
  useEffect(() => {
    if (weeksOfMonth.length === 0) {
      setSelectedWeekId(null);
      return;
    }
    if (!weeksOfMonth.some((w) => w.id === selectedWeekId)) {
      setSelectedWeekId(weeksOfMonth[0].id);
    }
  }, [weeksOfMonth, selectedWeekId]);

  const { days } = useDays(selectedWeekId ?? undefined);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <h1 className="text-2xl font-display font-extrabold text-on-surface mb-4">
          Mi rutina
        </h1>

        {loading && <Spinner />}
        {!loading && !plan && (
          <p className="text-on-surface-variant">Todavía no tenés rutina.</p>
        )}

        {plan && months.length === 0 && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center animate-fade-in-up">
            <span className="material-symbols-outlined text-4xl text-outline">
              calendar_month
            </span>
            <p className="text-on-surface-variant mt-2">
              Tu entrenador todavía no armó tu plan.
            </p>
          </div>
        )}

        {plan && months.length > 0 && (
          <>
            {/* Meses */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition active:scale-95
                    ${
                      m === selectedMonth
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface text-on-surface-variant border-outline-variant"
                    }`}
                >
                  Mes {m}
                </button>
              ))}
            </div>

            {/* Semanas del mes (numeradas dentro del mes) */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {weeksOfMonth.map((w, i) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWeekId(w.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition active:scale-95
                    ${
                      w.id === selectedWeekId
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface text-on-surface-variant border-outline-variant"
                    }`}
                >
                  Sem {i + 1}
                </button>
              ))}
            </div>

            {/* Días */}
            {weeksOfMonth.length > 0 && days.length === 0 && (
              <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center animate-fade-in-up">
                <span className="material-symbols-outlined text-4xl text-outline">
                  exercise
                </span>
                <p className="text-on-surface-variant mt-2">
                  Tu entrenador todavía no cargó días en esta semana.
                </p>
              </div>
            )}

            {days.map((d, i) => (
              <button
                key={d.id}
                onClick={() => navigate(`/mi-dia/${d.id}`)}
                className="w-full text-left bg-surface border border-outline-variant rounded-2xl p-4 mb-3 shadow-sm transition hover:border-primary/40 hover:shadow-md active:scale-[0.99] animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <p className="font-bold text-on-surface">
                  Día {d.number}
                  {d.name ? ` — ${d.name}` : ""}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  Ver ejercicios{" "}
                  <span className="material-symbols-outlined text-base align-middle">
                    chevron_right
                  </span>
                </p>
              </button>
            ))}
          </>
        )}
      </div>
      <BottomNav role="student" />
    </div>
  );
}
