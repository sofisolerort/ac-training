import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/spinner/Spinner";
import { useStudents } from "../../hooks/useStudents";
import StudentCard from "../../components/student-card/StudentCard";
import Reveal from "../../components/reveal/Reveal";
import BottomNav from "../../components/bottom-nav/BottomNav";

type Filtro = "conPlan" | "sinPlan";

export default function TrainerHome() {
  const { students, loading, error } = useStudents();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>("conPlan");

  const conPlan = students.filter((s) => s.hasPlan);
  const sinPlan = students.filter((s) => !s.hasPlan);
  const lista = filtro === "conPlan" ? conPlan : sinPlan;

  const chip = (activo: boolean) =>
    `px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition active:scale-95 inline-flex items-center gap-2
     ${
       activo
         ? "bg-primary text-on-primary border-primary"
         : "bg-surface text-on-surface-variant border-outline-variant"
     }`;

  const contador = (activo: boolean) =>
    `text-xs px-1.5 py-0.5 rounded-full ${
      activo ? "bg-white/20" : "bg-surface-container"
    }`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <p className="text-sm font-medium text-on-surface-variant">Panel</p>
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-2xl font-display font-extrabold text-on-surface">
            Mis alumnos
          </h1>
          {!loading && !error && students.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-sm">group</span>
              {students.length}
            </span>
          )}
        </div>

        {loading && <Spinner />}
        {error && <p className="text-error">Hubo un problema: {error}</p>}

        {!loading && !error && students.length === 0 && (
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center animate-fade-in-up">
            <span className="material-symbols-outlined text-4xl text-outline">
              group
            </span>
            <p className="text-on-surface-variant mt-2">
              Todavía no tenés alumnos. Compartí el link de registro para sumarlos.
            </p>
          </div>
        )}

        {!loading && !error && students.length > 0 && (
          <>
            {/* Chips de grupo */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              <button
                onClick={() => setFiltro("conPlan")}
                className={chip(filtro === "conPlan")}
              >
                Con plan activo
                <span className={contador(filtro === "conPlan")}>
                  {conPlan.length}
                </span>
              </button>
              <button
                onClick={() => setFiltro("sinPlan")}
                className={chip(filtro === "sinPlan")}
              >
                Sin plan asignado
                <span className={contador(filtro === "sinPlan")}>
                  {sinPlan.length}
                </span>
              </button>
            </div>

            {/* Lista del grupo elegido */}
            {lista.length === 0 ? (
              <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center animate-fade-in-up">
                <span className="material-symbols-outlined text-4xl text-outline">
                  {filtro === "conPlan" ? "assignment_turned_in" : "assignment_late"}
                </span>
                <p className="text-on-surface-variant mt-2">
                  {filtro === "conPlan"
                    ? "Ningún alumno tiene plan activo todavía."
                    : "Todos tus alumnos tienen plan. ¡Bien ahí!"}
                </p>
              </div>
            ) : (
              lista.map((s, i) => (
                <Reveal key={s.id} delay={i * 55}>
                  <StudentCard
                    student={s}
                    onClick={() => navigate(`/alumno/${s.id}`)}
                  />
                </Reveal>
              ))
            )}
          </>
        )}
      </div>
      <BottomNav role="trainer" />
    </div>
  );
}
