import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Plan, Week } from "../types";

export function usePlan(studentId: string | undefined) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // El plan activo de ese alumno
    const { data: planData, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("student_id", studentId)
      .eq("is_active", true)
      .maybeSingle();

    if (planError) {
      setError(planError.message);
      setLoading(false);
      return;
    }

    setPlan(planData);

    // Si hay plan, sus semanas
    if (planData) {
      const { data: weeksData } = await supabase
        .from("weeks")
        .select("*")
        .eq("plan_id", planData.id)
        .order("number");
      setWeeks(weeksData ?? []);
    } else {
      setWeeks([]);
    }

    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { plan, weeks, loading, error, refetch: fetchPlan };
}
