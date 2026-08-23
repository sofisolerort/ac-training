import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/back-button/BackButton";
import Spinner from "../../components/spinner/Spinner";
import { useStudent } from "../../hooks/useStudent";
import { calcularEdad } from "../../lib/age";
import DataRow from "../../components/data-row/DataRow";
import PaymentsSection from "../../components/payments/PaymentsSection";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { student, loading, error } = useStudent(id);

  if (loading) {
    return <Spinner fullScreen />;
  }

  if (error || !student) {
    return <Centrado>No se pudo cargar el alumno.</Centrado>;
  }

  const edad = calcularEdad(student.birth_date);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-6">
        {/* Volver */}
        <BackButton />

        {/* Encabezado */}
        <h1 className="text-3xl font-display font-extrabold text-on-surface animate-fade-in-up">
          {student.full_name ?? "Sin nombre"}
        </h1>
        <p className="text-on-surface-variant mb-6">
          {edad != null ? `${edad} años` : "Edad no cargada"}
          {student.objective ? ` · ${student.objective}` : ""}
        </p>

        {/* Datos generales */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 mb-4 animate-fade-in-up">
          <h2 className="text-sm font-bold text-on-surface mb-2">Datos</h2>
          <DataRow
            label="Peso"
            value={student.weight_kg ? `${student.weight_kg} kg` : null}
          />
          <DataRow
            label="Altura"
            value={student.height_cm ? `${student.height_cm} cm` : null}
          />
          <DataRow
            label="Frecuencia"
            value={
              student.weekly_frequency
                ? `${student.weekly_frequency}x semana`
                : null
            }
          />
          <DataRow label="Días y horarios" value={student.training_days} />
          <DataRow label="Inactivo desde" value={student.inactive_since} />
        </div>

        {/* Salud — destacado */}
        <div className="bg-surface rounded-2xl border-2 border-primary/20 p-4 mb-4 animate-fade-in-up" style={{ animationDelay: "0.06s" }}>
          <h2 className="text-sm font-bold text-primary mb-2">Salud</h2>
          <DataRow label="Lesiones" value={student.injuries} />
          <DataRow label="¿Duelen / molestan?" value={student.injuries_hurt} />
          <DataRow
            label="Operaciones recientes"
            value={student.recent_surgeries}
          />
          <DataRow
            label="Enfermedad cardíaca / respiratoria"
            value={student.heart_lung_condition}
          />
        </div>

        {/* Emergencia */}
        <div className="bg-surface rounded-2xl border border-outline-variant p-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.12s" }}>
          <h2 className="text-sm font-bold text-on-surface mb-2">Emergencia</h2>
          <DataRow label="Seguro médico" value={student.medical_insurance} />
          <DataRow
            label="Contacto de emergencia"
            value={student.emergency_contact}
          />
        </div>

        {/* Pagos */}
        {student.id && <PaymentsSection studentId={student.id} />}

        {/* Acciones */}
        <button
          onClick={() => navigate(`/alumno/${student.id}/editar`)}
          className="w-full py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold mb-3"
        >
          Editar ficha
        </button>
        <button
          onClick={() => navigate(`/alumno/${student.id}/plan`)}
          className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98] mb-3"
        >
          Ver plan
        </button>
        <button
          onClick={() => navigate(`/alumno/${student.id}/clase`)}
          className="w-full py-3 rounded-xl border border-primary text-primary font-semibold"
        >
          Dar clase de hoy
        </button>
      </div>
    </div>
  );
}

function Centrado({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
      {children}
    </div>
  );
}
