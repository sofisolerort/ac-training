import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Payment } from "../types";

export function usePayments(studentId: string | undefined) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!studentId) {
      setPayments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", studentId)
      .order("paid_on", { ascending: false });
    setPayments(data ?? []);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, refetch: fetchPayments };
}
