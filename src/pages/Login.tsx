import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import ThemeToggle from "../components/theme-toggle/ThemeToggle";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Barra superior con el toggle de tema */}
      <div className="w-full max-w-md mx-auto px-5 pt-5 flex justify-end">
        <ThemeToggle compact />
      </div>

      <div className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-sm">
          {/* Marca */}
          <div className="mb-10 text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-on-primary shadow-sm mb-4">
              <span className="material-symbols-outlined text-4xl">
                fitness_center
              </span>
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-on-surface">
              AC Training
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Entrená con seguimiento real
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            ¿Sos alumno nuevo?{" "}
            <a href="/registro" className="text-primary font-semibold">
              Creá tu cuenta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
