import { Routes, Route, Navigate } from "react-router-dom";
import Spinner from "./components/spinner/Spinner";
import { useAuth } from "./context/AuthProvider";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrainerHome from "./pages/trainer/TrainerHome";
import StudentDetail from "./pages/trainer/StudentDetail";
import PlanScreen from "./pages/trainer/PlanScreen";
import EditDay from "./pages/trainer/EditDay";
import GiveClass from "./pages/trainer/GiveClass";
import EditStudent from "./pages/trainer/EditStudent";
import Account from "./pages/trainer/Account";
import StudentHome from "./pages/student/StudentHome";
import MyDay from "./pages/student/MyDay";
import MyRoutine from "./pages/student/MyRoutine";
import Profile from "./pages/student/Profile";

function App() {
  const { session, role, loading } = useAuth();

  // Mientras averigua si hay sesión y qué rol, no mostramos nada
  if (loading || (session && !role)) {
    return (
      <Spinner fullScreen />
    );
  }

  // Sin sesión → login o registro
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Con sesión, según el rol
  if (role === "trainer") {
    return (
      <Routes>
        <Route path="/" element={<TrainerHome />} />
        <Route path="/alumno/:id" element={<StudentDetail />} />
        <Route path="/alumno/:id/plan" element={<PlanScreen />} />
        <Route path="/alumno/:id/dia/:dayId" element={<EditDay />} />
        <Route path="/alumno/:id/clase" element={<GiveClass />} />
        <Route path="/alumno/:id/editar" element={<EditStudent />} />
        <Route path="/mi-cuenta" element={<Account />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (role === "student") {
    return (
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/mi-rutina" element={<MyRoutine />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/mi-dia" element={<MyDay />} />
        <Route path="/mi-dia/:dayId" element={<MyDay />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Tiene sesión pero el rol no cargó (raro). Mostramos algo en vez de nada.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-on-surface">
      <p>No pudimos cargar tu perfil.</p>
      <LogoutButton />
    </div>
  );
}

function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <button
      onClick={signOut}
      className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant"
    >
      Cerrar sesión
    </button>
  );
}

export default App;
