import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { StudentDetail } from "../types";

export function useStudent(id: string | undefined) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setStudent(data as StudentDetail);
      }
      setLoading(false);
    };

    fetchStudent();
  }, [id]);

  return { student, loading, error };
}
