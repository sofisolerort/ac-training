import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Day } from "../types";

export function useDays(weekId: string | undefined) {
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDays = useCallback(async () => {
    if (!weekId) {
      setDays([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("days")
      .select("*")
      .eq("week_id", weekId)
      .order("number");
    setDays(data ?? []);
    setLoading(false);
  }, [weekId]);

  useEffect(() => {
    fetchDays();
  }, [fetchDays]);

  return { days, loading, refetch: fetchDays };
}
