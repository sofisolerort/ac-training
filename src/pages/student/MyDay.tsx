import { useParams } from "react-router-dom";
import BackButton from "../../components/back-button/BackButton";
import { useAuth } from "../../context/AuthProvider";
import ClassDay from "../../components/class-day/ClassDay";

export default function MyDay() {
  const { session } = useAuth();
  const { dayId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-6">
        <BackButton />
        <ClassDay studentId={session?.user.id} dayId={dayId} />
      </div>
    </div>
  );
}
