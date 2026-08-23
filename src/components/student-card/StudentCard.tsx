import type { Student } from "../../types";
import { calcularEdad } from "../../lib/age";

type Props = {
  student: Student;
  onClick: () => void;
};

export default function StudentCard({ student, onClick }: Props) {
  const edad = calcularEdad(student.birth_date);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface border border-outline-variant rounded-2xl p-4 mb-3 shadow-sm transition hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-display font-bold shrink-0">
          {inicial(student.full_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-on-surface truncate">
            {student.full_name ?? "Sin nombre"}
          </p>
          <p className="text-sm text-on-surface-variant">
            {edad != null ? `${edad} años` : "Edad no cargada"}
          </p>
        </div>
        <span className="material-symbols-outlined text-outline">
          chevron_right
        </span>
      </div>

      {(student.objective || student.weekly_frequency != null) && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {student.objective && (
            <span className="text-xs bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-medium">
              {student.objective}
            </span>
          )}
          {student.weekly_frequency != null && (
            <span className="text-xs bg-surface-container text-on-surface-variant px-3 py-1 rounded-full">
              {student.weekly_frequency}x semana
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function inicial(nombre: string | null): string {
  if (!nombre) return "?";
  const partes = nombre.trim().split(" ");
  const primera = partes[0]?.[0] ?? "";
  const segunda = partes[1]?.[0] ?? "";
  return (primera + segunda).toUpperCase();
}
