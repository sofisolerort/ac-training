import { useState, useEffect, useMemo } from "react";
import BackButton from "../../components/back-button/BackButton";
import Spinner from "../../components/spinner/Spinner";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { usePlan } from "../../hooks/usePlan";
import { useDays } from "../../hooks/useDays";
import { useConfirm } from "../../components/confirm/useConfirm";
import type { Day } from "../../types";

export default function PlanScreen() {
  const { id: studentId } = useParams();
  const navigate = useNavigate();

  const { plan, weeks, loading, error, refetch } = usePlan(studentId);
  const { confirm, alerta, dialog } = useConfirm();

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Meses presentes (ordenados)
  const months = useMemo(
    () => [...new Set(weeks.map((w) => w.month))].sort((a, b) => a - b),
    [weeks],
  );

  // Semanas del mes seleccionado (ordenadas por número global)
  const weeksOfMonth = useMemo(
    () =>
      weeks
        .filter((w) => w.month === selectedMonth)
        .sort((a, b) => a.number - b.number),
    [weeks, selectedMonth],
  );

  // Al cargar, seleccionar el último mes
  useEffect(() => {
    if (months.length > 0 && selectedMonth === null) {
      setSelectedMonth(months[months.length - 1]);
    }
  }, [months, selectedMonth]);

  // Cuando cambia el mes (o sus semanas), asegurar una semana válida seleccionada
  useEffect(() => {
    if (weeksOfMonth.length === 0) {
      setSelectedWeekId(null);
      return;
    }
    if (!weeksOfMonth.some((w) => w.id === selectedWeekId)) {
      setSelectedWeekId(weeksOfMonth[weeksOfMonth.length - 1].id);
    }
  }, [weeksOfMonth, selectedWeekId]);

  const { days, refetch: refetchDays } = useDays(selectedWeekId ?? undefined);

  const proximoNumeroGlobal = () =>
    weeks.length > 0 ? Math.max(...weeks.map((w) => w.number)) + 1 : 1;

  // --- Acciones ---

  const crearPlan = async () => {
    if (!studentId) return;
    setBusy(true);
    await supabase.from("plans").insert({
      student_id: studentId,
      title: "Plan",
      is_active: true,
    });
    await refetch();
    setBusy(false);
  };

  const agregarMes = async () => {
    if (!plan) return;
    const ok = await confirm({
      title: "Nuevo mes",
      message: "¿Empezar un mes nuevo? Se crea con una semana vacía.",
      confirmLabel: "Crear mes",
    });
    if (!ok) return;
    setBusy(true);
    const nuevoMes = months.length > 0 ? Math.max(...months) + 1 : 1;
    const { data } = await supabase
      .from("weeks")
      .insert({
        plan_id: plan.id,
        number: proximoNumeroGlobal(),
        month: nuevoMes,
      })
      .select()
      .single();
    await refetch();
    setSelectedMonth(nuevoMes);
    if (data) setSelectedWeekId(data.id);
    setBusy(false);
  };

  const agregarSemana = async () => {
    if (!plan || selectedMonth === null) return;
    const ok = await confirm({
      title: "Nueva semana",
      message: "¿Crear una nueva semana vacía en este mes?",
      confirmLabel: "Crear",
    });
    if (!ok) return;
    setBusy(true);
    const { data } = await supabase
      .from("weeks")
      .insert({
        plan_id: plan.id,
        number: proximoNumeroGlobal(),
        month: selectedMonth,
      })
      .select()
      .single();
    await refetch();
    if (data) setSelectedWeekId(data.id);
    setBusy(false);
  };

  const duplicarSemana = async () => {
    if (weeksOfMonth.length === 0) return;
    const ok = await confirm({
      title: "Duplicar semana",
      message:
        "¿Duplicar la última semana de este mes? Se copia con sus días y ejercicios.",
      confirmLabel: "Duplicar",
    });
    if (!ok) return;
    setBusy(true);
    const ultima = weeksOfMonth[weeksOfMonth.length - 1];
    const { data, error } = await supabase.rpc("duplicate_week", {
      p_week_id: ultima.id,
    });
    if (error) {
      await alerta("No se pudo duplicar: " + error.message);
    } else {
      await refetch();
      if (data) setSelectedWeekId(data as string);
    }
    setBusy(false);
  };

  const borrarSemana = async () => {
    if (!selectedWeekId) return;
    const idx = weeksOfMonth.findIndex((w) => w.id === selectedWeekId);
    const ok = await confirm({
      title: `Borrar Semana ${idx + 1}`,
      message:
        "Se eliminan sus días, ejercicios y registros. Esta acción no se puede deshacer.",
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;

    setBusy(true);
    const { error } = await supabase
      .from("weeks")
      .delete()
      .eq("id", selectedWeekId);
    if (error) {
      await alerta("No se pudo borrar: " + error.message);
      setBusy(false);
      return;
    }
    setSelectedWeekId(null);
    await refetch();
    setBusy(false);
  };

  const agregarDia = async () => {
    if (!selectedWeekId) return;
    setBusy(true);
    const proximoNumero =
      days.length > 0 ? days[days.length - 1].number + 1 : 1;
    await supabase.from("days").insert({
      week_id: selectedWeekId,
      number: proximoNumero,
    });
    await refetchDays();
    setBusy(false);
  };

  const borrarDia = async (d: Day) => {
    const ok = await confirm({
      title: `Borrar Día ${d.number}`,
      message:
        "Se eliminan sus ejercicios y registros. Esta acción no se puede deshacer.",
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    await supabase.from("days").delete().eq("id", d.id);
    await refetchDays();
    setBusy(false);
  };

  // --- Render ---

  if (loading) return <Spinner fullScreen />;
  if (error) return <Centrado>Error: {error}</Centrado>;

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-5 py-6">
          <BackButton />
          <p className="text-on-surface-variant mb-4">
            Este alumno todavía no tiene un plan.
          </p>
          <button
            onClick={crearPlan}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98]"
          >
            {busy ? "Creando..." : "Crear plan"}
          </button>
        </div>
        {dialog}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <BackButton />
        <h1 className="text-2xl font-display font-extrabold text-on-surface mb-4">
          {plan.title ?? "Plan"}
        </h1>

        {/* Selector de mes */}
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
          <button
            onClick={agregarMes}
            disabled={busy}
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border border-dashed border-outline text-on-surface-variant transition active:scale-95"
          >
            + Mes
          </button>
        </div>

        {months.length === 0 ? (
          <>
            <p className="text-on-surface-variant mb-4">
              Empezá creando el primer mes del plan.
            </p>
            <button
              onClick={agregarMes}
              disabled={busy}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98]"
            >
              + Crear primer mes
            </button>
          </>
        ) : (
          <>
            {/* Chips de semana (numeradas dentro del mes) */}
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
              <button
                onClick={agregarSemana}
                disabled={busy}
                className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border border-dashed border-outline text-on-surface-variant transition active:scale-95"
              >
                + Semana
              </button>
            </div>

            {/* Días de la semana seleccionada */}
            {weeksOfMonth.length === 0 ? (
              <p className="text-on-surface-variant">
                Agregá la primera semana de este mes.
              </p>
            ) : (
              <>
                {days.length === 0 && (
                  <div className="bg-surface border border-outline-variant rounded-2xl p-6 text-center mb-3">
                    <span className="material-symbols-outlined text-3xl text-outline">
                      exercise
                    </span>
                    <p className="text-on-surface-variant mt-1 text-sm">
                      Esta semana todavía no tiene días.
                    </p>
                  </div>
                )}
                {days.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-stretch gap-2 mb-3 animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <button
                      onClick={() =>
                        navigate(`/alumno/${studentId}/dia/${d.id}`)
                      }
                      className="flex-1 text-left bg-surface border border-outline-variant rounded-2xl p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
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
                    <button
                      onClick={() => borrarDia(d)}
                      disabled={busy}
                      aria-label="Borrar día"
                      className="w-12 rounded-2xl border border-outline-variant flex items-center justify-center text-error transition hover:bg-error/10 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-xl">
                        delete
                      </span>
                    </button>
                  </div>
                ))}

                <button
                  onClick={agregarDia}
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98] mb-2"
                >
                  + Agregar día
                </button>

                <button
                  onClick={duplicarSemana}
                  disabled={busy}
                  className="w-full py-3 rounded-xl border border-primary text-primary font-semibold mt-2 transition hover:bg-primary/10 active:scale-[0.98]"
                >
                  {busy ? "Duplicando..." : "Duplicar semana anterior"}
                </button>

                <button
                  onClick={borrarSemana}
                  disabled={busy}
                  className="w-full py-3 rounded-xl border border-error text-error font-semibold mt-2 inline-flex items-center justify-center gap-1 transition hover:bg-error/10 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                  Borrar esta semana
                </button>
              </>
            )}
          </>
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
