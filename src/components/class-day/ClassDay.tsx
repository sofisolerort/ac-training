import { supabase } from "../../lib/supabase";
import Spinner from "../spinner/Spinner";
import { useAuth } from "../../context/AuthProvider";
import { useClassDay } from "../../hooks/useClassDay";
import type { ClassExercise, ClassStatus } from "../../types";

type Props = {
  studentId: string | undefined;
  dayId?: string;
};

export default function ClassDay({ studentId, dayId }: Props) {
  const { session } = useAuth();
  const { day, weekNumber, items, setItems, loading } = useClassDay(
    studentId,
    dayId,
  );

  const guardar = async (exId: string, done: boolean, weightUsed: string) => {
    if (!studentId || !session) return;
    await supabase.from("logs").upsert(
      {
        exercise_id: exId,
        student_id: studentId,
        done,
        weight_used: weightUsed || null,
        logged_by: session.user.id, // quién cargó: puede ser Andrés o el alumno
        logged_at: new Date().toISOString(),
      },
      { onConflict: "exercise_id,student_id" },
    );
  };

  const borrarLog = async (exId: string) => {
    if (!studentId) return;
    await supabase
      .from("logs")
      .delete()
      .eq("exercise_id", exId)
      .eq("student_id", studentId);
  };

  // Marcar hecho / no hecho. Si se toca el que ya está activo, vuelve a pendiente.
  const marcar = (item: ClassExercise, estado: ClassStatus) => {
    const revertir = item.status === estado;
    const nuevo: ClassStatus = revertir ? "pending" : estado;
    setItems((prev) =>
      prev.map((i) =>
        i.exercise.id === item.exercise.id ? { ...i, status: nuevo } : i,
      ),
    );
    if (revertir) {
      borrarLog(item.exercise.id);
    } else {
      guardar(item.exercise.id, estado === "done", item.weightUsed);
    }
  };

  const cambiarPeso = (exId: string, valor: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.exercise.id === exId ? { ...i, weightUsed: valor } : i,
      ),
    );
  };

  const guardarPeso = (item: ClassExercise) => {
    if (item.status === "pending") return;
    guardar(item.exercise.id, item.status === "done", item.weightUsed);
  };

  if (loading) return <Spinner />;
  if (!day)
    return <Centrado>Todavía no hay un plan con días cargados.</Centrado>;

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold text-on-surface">
        Día {day.number}
        {day.name ? ` — ${day.name}` : ""}
      </h1>
      <p className="text-primary font-semibold mb-5">Semana {weekNumber}</p>

      {items.length === 0 && (
        <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center animate-fade-in-up">
          <span className="material-symbols-outlined text-4xl text-outline">
            exercise
          </span>
          <p className="text-on-surface-variant mt-2">
            Tu entrenador todavía no cargó ejercicios para este día.
          </p>
        </div>
      )}

      {items.map((item, i) => (
        <div
          key={item.exercise.id}
          className="bg-surface border border-outline-variant rounded-2xl p-4 mb-3 animate-fade-in-up"
          style={{ animationDelay: `${i * 45}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              {item.exercise.superset_group && (
                <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-semibold">
                  Superserie {item.exercise.superset_group}
                </span>
              )}
              <p className="font-bold text-on-surface mt-1">
                {item.exercise.name}
              </p>
              <p className="text-sm text-on-surface-variant">
                {[item.exercise.reps, item.exercise.weight]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {item.exercise.note && (
                <p className="text-sm text-warning mt-1">
                  {item.exercise.note}
                </p>
              )}
              {item.lastWeekWeight && (
                <p className="text-xs text-outline mt-1">
                  Semana pasada: {item.lastWeekWeight}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <input
                  className="w-24 px-3 h-10 rounded-lg border border-outline-variant text-center text-base"
                  placeholder={item.exercise.weight ?? "Peso"}
                  value={item.weightUsed}
                  onChange={(e) =>
                    cambiarPeso(item.exercise.id, e.target.value)
                  }
                  onBlur={() => guardarPeso(item)}
                />
                <span className="text-sm text-on-surface-variant">
                  kg usados
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => marcar(item, "done")}
                aria-label="Marcar como hecho"
                className={`w-11 h-11 rounded-full flex items-center justify-center
                  ${
                    item.status === "done"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-outline border border-outline-variant"
                  }`}
              >
                <span className="material-symbols-outlined text-2xl">check</span>
              </button>
              <button
                onClick={() => marcar(item, "notdone")}
                aria-label="Marcar como no hecho"
                className={`w-11 h-11 rounded-full flex items-center justify-center
                  ${
                    item.status === "notdone"
                      ? "bg-error text-on-primary"
                      : "bg-surface-container text-outline border border-outline-variant"
                  }`}
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Centrado({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-20 text-center text-on-surface-variant">{children}</div>
  );
}
