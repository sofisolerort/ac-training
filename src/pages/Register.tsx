import { useState } from "react";
import { useAuth } from "../context/AuthProvider";

export default function Register() {
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (nombre.trim().length < 2) {
      setError("Poné tu nombre");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña necesita al menos 6 caracteres");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, nombre.trim());
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }
    setListo(true);
  };

  if (listo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-5">
        <div className="w-full max-w-sm text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-on-primary shadow-sm mb-4">
            <span className="material-symbols-outlined text-4xl">check</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-on-surface mb-2">
            ¡Cuenta creada!
          </h1>
          <p className="text-on-surface-variant">
            Ya podés ingresar. Tu entrenador va a completar tu plan.
          </p>
          <a
            href="/login"
            className="block w-full mt-6 py-3.5 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98]"
          >
            Ir a ingresar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-on-primary shadow-sm mb-4">
            <span className="material-symbols-outlined text-4xl">
              fitness_center
            </span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-on-surface">
            AC Training
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Creá tu cuenta de alumno
          </p>
        </div>

        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Nombre y apellido
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Email
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              type="email"
              placeholder="tucorreo@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Contraseña
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
              Repetir contraseña
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              type="password"
              placeholder="Volvé a escribirla"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-error text-sm bg-error/10 rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-semibold shadow-sm transition hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          ¿Ya tenés cuenta?{" "}
          <a href="/login" className="text-primary font-semibold">
            Ingresá
          </a>
        </p>
      </div>
    </div>
  );
}
