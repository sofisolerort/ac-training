import { useState } from "react";
import BackButton from "../../components/back-button/BackButton";
import Spinner from "../../components/spinner/Spinner";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useExercises } from "../../hooks/useExercises";
import { useConfirm } from "../../components/confirm/useConfirm";
import ExerciseForm, {
  type Values,
} from "../../components/exercise-form/ExerciseForm";
import type { Exercise } from "../../types";

export default function EditDay() {
  const { dayId } = useParams();
  const { exercises, loading, refetch } = useExercises(dayId);
  const { confirm, dialog } = useConfirm();

  // "nuevo" = form de alta al final; o el id del ejercicio que se está editando
  const [modo, setModo] = useState<"none" | "nuevo" | string>("none");
  const [busy, setBusy] = useState(false);

  const guardar = async (values: Values, editandoId?: string) => {
    if (!dayId) return;
    setBusy(true);

    if (editandoId) {
      await supabase
        .from("exercises")
        .update({
          name: values.name,
          reps: values.reps || null,
          weight: values.weight || null,
          note: values.note || null,
          superset_group: values.superset_group || null,
        })
        .eq("id", editandoId);
    } else {
      await supabase.from("exercises").insert({
        day_id: dayId,
        name: values.name,
        reps: values.reps || null,
        weight: values.weight || null,
        note: values.note || null,
        superset_group: values.superset_group || null,
        order_index: exercises.length,
      });
    }

    await refetch();
    setBusy(false);
    setModo("none");
  };

  const borrar = async (ex: Exercise) => {
    const ok = await confirm({
      title: "Borrar ejercicio",
      message: `¿Borrar "${ex.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    await supabase.from("exercises").delete().eq("id", ex.id);
    await refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <BackButton />
        <h1 className="text-2xl font-display font-extrabold text-on-surface mb-4">
          Ejercicios del día
        </h1>

        {loading && <Spinner />}

        {!loading && exercises.length === 0 && modo === "none" && (
          <p className="text-on-surface-variant mb-4">
            Todavía no hay ejercicios.
          </p>
        )}

        {/* Lista de ejercicios */}
        {exercises.map((ex, i) =>
          modo === ex.id ? (
            // Editando este ejercicio: el form aparece en su lugar
            <ExerciseForm
              key={ex.id}
              exercise={ex}
              onSave={(v) => guardar(v, ex.id)}
              onCancel={() => setModo("none")}
              busy={busy}
            />
          ) : (
            <div
              key={ex.id}
              className="bg-surface border border-outline-variant rounded-2xl p-4 mb-3 shadow-sm animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {ex.superset_group && (
                    <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-semibold">
                      Superserie {ex.superset_group}
                    </span>
                  )}
                  <p className="font-bold text-on-surface mt-1">{ex.name}</p>
                  <p className="text-sm text-on-surface-variant">
                    {[ex.reps, ex.weight].filter(Boolean).join(" · ")}
                  </p>
                  {ex.note && (
                    <p className="text-sm text-warning mt-1">{ex.note}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setModo(ex.id)}
                    aria-label="Editar"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant transition hover:bg-surface-container active:scale-95"
                  >
                    <span className="material-symbols-outlined text-xl">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={() => borrar(ex)}
                    aria-label="Borrar"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-error transition hover:bg-error/10 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-xl">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ),
        )}

        {/* Form de alta al final */}
        {modo === "nuevo" && (
          <ExerciseForm
            onSave={(v) => guardar(v)}
            onCancel={() => setModo("none")}
            busy={busy}
          />
        )}

        {/* Botón agregar */}
        {modo === "none" && (
          <button
            onClick={() => setModo("nuevo")}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98] mt-2 inline-flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Agregar ejercicio
          </button>
        )}
      </div>
      {dialog}
    </div>
  );
}
