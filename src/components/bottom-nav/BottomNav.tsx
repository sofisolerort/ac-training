import { useLocation, useNavigate } from "react-router-dom";

type Tab = { label: string; icon: string; path: string };

const TABS: Record<"trainer" | "student", Tab[]> = {
  student: [
    { label: "Inicio", icon: "home", path: "/" },
    { label: "Mi rutina", icon: "list_alt", path: "/mi-rutina" },
    { label: "Perfil", icon: "person", path: "/perfil" },
  ],
  trainer: [
    { label: "Alumnos", icon: "group", path: "/" },
    { label: "Mi cuenta", icon: "person", path: "/mi-cuenta" },
  ],
};

export default function BottomNav({ role }: { role: "trainer" | "student" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = TABS[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map((tab) => {
          const activa = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition active:scale-90
                ${activa ? "text-primary font-semibold" : "text-outline"}`}
            >
              <span
                key={activa ? "on" : "off"}
                className={`material-symbols-outlined text-2xl ${activa ? "animate-pop" : ""}`}
                style={{
                  fontVariationSettings: activa
                    ? '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24'
                    : undefined,
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
