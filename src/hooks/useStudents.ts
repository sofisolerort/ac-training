import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Student } from "../types";

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, objective, weekly_frequency, birth_date")
        .eq("role", "student")
        .order("full_name");

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Qué alumnos tienen un plan activo (para agruparlos)
      const { data: plans } = await supabase
        .from("plans")
        .select("student_id")
        .eq("is_active", true);
      const conPlan = new Set((plans ?? []).map((p) => p.student_id));

      setStudents(
        (data ?? []).map((s) => ({ ...s, hasPlan: conPlan.has(s.id) })),
      );
      setLoading(false);
    };

    fetchStudents();
  }, []);

  return { students, loading, error };
}
