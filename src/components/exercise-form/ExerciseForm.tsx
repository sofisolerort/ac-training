import { useState } from "react";
import type { Exercise } from "../../types";

type Props = {
  exercise?: Exercise; // si viene, es edición
  onSave: (values: Values) => void;
  onCancel: () => void;
  busy?: boolean;
};

export type Values = {
  name: string;
  reps: string;
  weight: string;
  note: string;
  superset_group: string;
};

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25";

export default function ExerciseForm({ exercise, onSave, onCancel, busy }: Props) {
  const [name, setName] = useState(exercise?.name ?? "");
  const [reps, setReps] = useState(exercise?.reps ?? "");
  const [weight, setWeight] = useState(exercise?.weight ?? "");
  const [note, setNote] = useState(exercise?.note ?? "");
  const [group, setGroup] = useState(exercise?.superset_group ?? "");
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    if (!name.trim()) {
      setError("El ejercicio necesita un nombre.");
      return;
    }
    setError(null);
    onSave({
      name: name.trim(),
      reps: reps.trim(),
      weight: weight.trim(),
      note: note.trim(),
      superset_group: group.trim(),
    });
  };

  return (
    <div className="bg-surface border-2 border-primary/30 rounded-2xl p-4 mb-3 shadow-sm">
      <p className="text-sm font-semibold text-primary mb-3">
        {exercise ? "Editar ejercicio" : "Nuevo ejercicio"}
      </p>

      <input
        className={`${inputCls} mb-2`}
        placeholder="Nombre (ej: Prensa)"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError(null);
        }}
        autoFocus
      />
      <div className="flex gap-2 mb-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Reps (ej: 4x10)"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <input
          className={`${inputCls} flex-1`}
          placeholder="Peso (ej: 70kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      <input
        className={`${inputCls} mb-2`}
        placeholder="Aclaración (ej: ojo artrosis)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <input
        className={`${inputCls} mb-3`}
        placeholder="Superserie: A, B... (vacío si va solo)"
        value={group}
        onChange={(e) => setGroup(e.target.value)}
      />

      {error && (
        <div className="flex items-center gap-2 text-error text-sm bg-error/10 rounded-lg px-3 py-2 mb-3">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={guardar}
          disabled={busy}
          className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-semibold transition hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-semibold transition hover:bg-surface-container active:scale-[0.98]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
