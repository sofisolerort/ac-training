import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Exercise } from "../types";

export function useExercises(dayId: string | undefined) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = useCallback(async () => {
    if (!dayId) {
      setExercises([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("exercises")
      .select("*")
      .eq("day_id", dayId)
      .order("order_index");
    setExercises(data ?? []);
    setLoading(false);
  }, [dayId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { exercises, loading, refetch: fetchExercises };
}
