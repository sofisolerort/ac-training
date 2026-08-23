import { useState, useEffect, useMemo } from "react";
import Spinner from "../../components/spinner/Spinner";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useStudent } from "../../hooks/useStudent";
import { useConfirm } from "../../components/confirm/useConfirm";

const inputCls =
  "w-full px-3 py-2.5 rounded-lg bg-surface border border-outline-variant text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { student, loading } = useStudent(id);
  const { confirm, dialog } = useConfirm();

  const [form, setForm] = useState<Record<string, string>>({});
  const [inicial, setInicial] = useState<string>("{}");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (student) {
      const base = {
        full_name: student.full_name ?? "",
        birth_date: student.birth_date ?? "",
        objective: student.objective ?? "",
        weight_kg: student.weight_kg?.toString() ?? "",
        height_cm: student.height_cm?.toString() ?? "",
        weekly_frequency: student.weekly_frequency?.toString() ?? "",
        training_days: student.training_days ?? "",
        injuries: student.injuries ?? "",
        injuries_hurt: student.injuries_hurt ?? "",
        recent_surgeries: student.recent_surgeries ?? "",
        heart_lung_condition: student.heart_lung_condition ?? "",
        medical_insurance: student.medical_insurance ?? "",
        emergency_contact: student.emergency_contact ?? "",
        inactive_since: student.inactive_since ?? "",
      };
      setForm(base);
      setInicial(JSON.stringify(base));
    }
  }, [student]);

  const set = (campo: string, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  // ¿hay cambios sin guardar?
  const dirty = useMemo(
    () => JSON.stringify(form) !== inicial,
    [form, inicial],
  );

  const guardar = async () => {
    if (!id) return;
    setBusy(true);
    await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        birth_date: form.birth_date || null,
        objective: form.objective || null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weekly_frequency: form.weekly_frequency
          ? Number(form.weekly_frequency)
          : null,
        training_days: form.training_days || null,
        injuries: form.injuries || null,
        injuries_hurt: form.injuries_hurt || null,
        recent_surgeries: form.recent_surgeries || null,
        heart_lung_condition: form.heart_lung_condition || null,
        medical_insurance: form.medical_insurance || null,
        emergency_contact: form.emergency_contact || null,
        inactive_since: form.inactive_since || null,
      })
      .eq("id", id);
    setBusy(false);
    navigate(-1);
  };

  // Salir: si hay cambios, preguntar
  const salir = async () => {
    if (dirty) {
      const guardarAntes = await confirm({
        title: "Cambios sin guardar",
        message:
          "Hiciste cambios en la ficha. ¿Querés guardarlos antes de salir?",
        confirmLabel: "Guardar",
        cancelLabel: "Salir sin guardar",
      });
      if (guardarAntes) {
        await guardar();
        return;
      }
    }
    navigate(-1);
  };

  if (loading) return <Spinner fullScreen />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <button
          onClick={salir}
          aria-label="Volver"
          className="group inline-flex items-center gap-2 mb-5 text-on-surface-variant"
        >
          <span className="w-9 h-9 rounded-full bg-surface border border-outline-variant flex items-center justify-center transition group-hover:bg-surface-container group-active:scale-95">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </span>
          <span className="text-sm font-medium">Volver</span>
        </button>

        <h1 className="text-2xl font-display font-extrabold text-on-surface mb-4">
          Editar ficha
        </h1>

        <Campo label="Nombre y apellido" value={form.full_name} onChange={(v) => set("full_name", v)} />

        {/* Fecha con calendario */}
        <div className="mb-3">
          <label className="block text-xs text-on-surface-variant mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => set("birth_date", e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
            className={inputCls}
          />
        </div>

        <Campo label="Objetivo" value={form.objective} onChange={(v) => set("objective", v)} />
        <Campo label="Peso (kg)" type="number" value={form.weight_kg} onChange={(v) => set("weight_kg", v)} />
        <Campo label="Altura (cm)" type="number" value={form.height_cm} onChange={(v) => set("height_cm", v)} />
        <Campo label="Frecuencia (veces por semana)" type="number" value={form.weekly_frequency} onChange={(v) => set("weekly_frequency", v)} />
        <Campo label="Días y horarios" placeholder="Ej: Lun y Mié 18h, Vie 19h" value={form.training_days} onChange={(v) => set("training_days", v)} />
        <Campo label="Lesiones" value={form.injuries} onChange={(v) => set("injuries", v)} />
        <Campo label="¿Duelen / molestan?" value={form.injuries_hurt} onChange={(v) => set("injuries_hurt", v)} />
        <Campo label="Operaciones recientes" value={form.recent_surgeries} onChange={(v) => set("recent_surgeries", v)} />
        <Campo label="Enfermedad cardíaca / respiratoria" value={form.heart_lung_condition} onChange={(v) => set("heart_lung_condition", v)} />
        <Campo label="Seguro médico" value={form.medical_insurance} onChange={(v) => set("medical_insurance", v)} />
        <Campo label="Contacto de emergencia" value={form.emergency_contact} onChange={(v) => set("emergency_contact", v)} />
        <Campo label="Hace cuánto no entrena" value={form.inactive_since} onChange={(v) => set("inactive_since", v)} />

        <div className="flex gap-2 mt-5">
          <button
            onClick={salir}
            className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold transition hover:bg-surface-container active:scale-[0.98]"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={busy || !dirty}
            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Guardando..." : "Guardar ficha"}
          </button>
        </div>
      </div>
      {dialog}
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-on-surface-variant mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}
