import { useState } from "react";
import BackButton from "../../components/back-button/BackButton";
import { useParams } from "react-router-dom";
import Spinner from "../../components/spinner/Spinner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthProvider";
import { useConfirm } from "../../components/confirm/useConfirm";
import { useClassDay } from "../../hooks/useClassDay";
import type { ClassExercise, ClassStatus } from "../../types";

export default function GiveClass() {
  const { id: studentId } = useParams();
  const { session } = useAuth();
  const { confirm, dialog } = useConfirm();

  // día forzado por el selector (si es undefined, se usa el "hoy" automático)
  const [forcedDayId, setForcedDayId] = useState<string | undefined>(undefined);

  const { day, weekNumber, items, setItems, loading, weeks, days, refetch } =
    useClassDay(studentId, forcedDayId);

  // Guarda (o actualiza) el registro de un ejercicio
  const guardar = async (exId: string, done: boolean, weightUsed: string) => {
    if (!studentId || !session) return;
    await supabase.from("logs").upsert(
      {
        exercise_id: exId,
        student_id: studentId,
        done,
        weight_used: weightUsed || null,
        logged_by: session.user.id,
        logged_at: new Date().toISOString(),
      },
      { onConflict: "exercise_id,student_id" },
    );
  };

  // Borra el registro de un ejercicio (vuelve a "pendiente")
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
      prev.map((i) => (i.exercise.id === exId ? { ...i, weightUsed: valor } : i)),
    );
  };

  const guardarPeso = (item: ClassExercise) => {
    // solo guardamos el peso si ya hay un estado cargado
    if (item.status === "pending") return;
    guardar(item.exercise.id, item.status === "done", item.weightUsed);
  };

  // Cerrar el día: los que quedaron pendientes se marcan como NO hechos
  // (los ya hechos o ya marcados como no hechos quedan como están).
  const finalizarDia = async () => {
    if (!studentId || !session || items.length === 0) return;
    const pendientes = items.filter((i) => i.status === "pending");
    if (pendientes.length === 0) return;

    const ok = await confirm({
      title: "Finalizar día",
      message:
        pendientes.length === 1
          ? "Queda 1 ejercicio sin marcar. Se va a registrar como no hecho y el día quedará cerrado."
          : `Quedan ${pendientes.length} ejercicios sin marcar. Se van a registrar como no hechos y el día quedará cerrado.`,
      confirmLabel: "Finalizar",
    });
    if (!ok) return;

    setItems((prev) =>
      prev.map((i) =>
        i.status === "pending" ? { ...i, status: "notdone" as ClassStatus } : i,
      ),
    );
    await Promise.all(
      pendientes.map((i) =>
        supabase.from("logs").upsert(
          {
            exercise_id: i.exercise.id,
            student_id: studentId,
            done: false,
            weight_used: i.weightUsed || null,
            logged_by: session.user.id,
            logged_at: new Date().toISOString(),
          },
          { onConflict: "exercise_id,student_id" },
        ),
      ),
    );
    await refetch();
  };

  if (loading) return <Spinner fullScreen />;
  if (!day)
    return <Centrado>Este alumno no tiene un plan con días cargados.</Centrado>;

  const diasDeLaSemana = days
    .filter((d) => d.week_id === day.week_id)
    .sort((a, b) => a.number - b.number);

  const diaFinalizado =
    items.length > 0 && items.every((i) => i.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <BackButton />

        {/* Selector de semana */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {weeks.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                const primerDia = days
                  .filter((d) => d.week_id === w.id)
                  .sort((a, b) => a.number - b.number)[0];
                if (primerDia) setForcedDayId(primerDia.id);
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border
                ${
                  w.id === day.week_id
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface-variant border-outline-variant"
                }`}
            >
              Sem {w.number}
            </button>
          ))}
        </div>

        {/* Selector de día */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {diasDeLaSemana.map((d) => (
            <button
              key={d.id}
              onClick={() => setForcedDayId(d.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border
                ${
                  d.id === day.id
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface-variant border-outline-variant"
                }`}
            >
              Día {d.number}
              {d.name ? ` · ${d.name}` : ""}
            </button>
          ))}
        </div>

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
              Este día todavía no tiene ejercicios. Cargalos desde el plan.
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

              {/* Botones hecho / no hecho */}
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
                  <span className="material-symbols-outlined text-2xl">
                    check
                  </span>
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
                  <span className="material-symbols-outlined text-2xl">
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Finalizar día */}
        {items.length > 0 && (
          <button
            onClick={finalizarDia}
            disabled={diaFinalizado}
            className={`w-full py-3 rounded-xl font-semibold mt-2 inline-flex items-center justify-center gap-1
              ${
                diaFinalizado
                  ? "bg-surface-container text-on-surface-variant"
                  : "bg-primary text-on-primary"
              }`}
          >
            <span className="material-symbols-outlined text-lg">
              {diaFinalizado ? "task_alt" : "done_all"}
            </span>
            {diaFinalizado ? "Día finalizado" : "Finalizar día"}
          </button>
        )}
      </div>

      {dialog}
    </div>
  );
}

function Centrado({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-on-surface-variant px-6 text-center">
      {children}
    </div>
  );
}
