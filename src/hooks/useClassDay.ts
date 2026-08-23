import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Exercise, ClassExercise, Day } from "../types";

export function useClassDay(
  studentId: string | undefined,
  forcedDayId?: string,
) {
  const [day, setDay] = useState<Day | null>(null);
  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [items, setItems] = useState<ClassExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [allWeeks, setAllWeeks] = useState<
    { id: string; number: number; month: number }[]
  >([]);
  const [allDays, setAllDays] = useState<Day[]>([]);

  const fetchClass = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // 1) Plan activo
    const { data: plan } = await supabase
      .from("plans")
      .select("id")
      .eq("student_id", studentId)
      .eq("is_active", true)
      .maybeSingle();
    if (!plan) {
      setDay(null);
      setAllWeeks([]);
      setAllDays([]);
      setLoading(false);
      return;
    }

    // 2) Semanas, días, ejercicios y logs (todo de una)
    const { data: weeks } = await supabase
      .from("weeks")
      .select("id, number, month")
      .eq("plan_id", plan.id)
      .order("number");
    const weekIds = (weeks ?? []).map((w) => w.id);
    setAllWeeks(weeks ?? []);
    if (weekIds.length === 0) {
      setDay(null);
      setAllDays([]);
      setLoading(false);
      return;
    }

    const { data: days } = await supabase
      .from("days")
      .select("*")
      .in("week_id", weekIds)
      .order("number");
    const dayIds = (days ?? []).map((d) => d.id);
    setAllDays(days ?? []);

    const { data: exercises } = await supabase
      .from("exercises")
      .select("*")
      .in("day_id", dayIds)
      .order("order_index");

    const { data: logs } = await supabase
      .from("logs")
      .select("exercise_id, done, weight_used")
      .eq("student_id", studentId);

    // Mapas de apoyo
    const logByExercise: Record<
      string,
      { done: boolean; weight_used: string | null }
    > = {};
    for (const l of logs ?? [])
      logByExercise[l.exercise_id] = {
        done: l.done,
        weight_used: l.weight_used,
      };

    const exercisesByDay: Record<string, Exercise[]> = {};
    for (const e of exercises ?? []) {
      (exercisesByDay[e.day_id] ??= []).push(e);
    }

    // Ordenar los días por (semana, día)
    const weekNumberById: Record<string, number> = {};
    for (const w of weeks ?? []) weekNumberById[w.id] = w.number;

    const orderedDays = [...(days ?? [])].sort((a, b) => {
      const wa = weekNumberById[a.week_id],
        wb = weekNumberById[b.week_id];
      return wa !== wb ? wa - wb : a.number - b.number;
    });

    // 3) "Hoy" = primer día que NO esté cerrado.
    // Un día está cerrado cuando TODOS sus ejercicios fueron resueltos
    // (cada uno con "hecho" o "no hecho"), sin importar el resultado.
    const estaCompleto = (d: Day) => {
      const exs = exercisesByDay[d.id] ?? [];
      return exs.length > 0 && exs.every((e) => logByExercise[e.id] !== undefined);
    };
    const today = forcedDayId
      ? (orderedDays.find((d) => d.id === forcedDayId) ?? null)
      : (orderedDays.find((d) => !estaCompleto(d)) ??
        orderedDays[orderedDays.length - 1]);
    if (!today) {
      setDay(null);
      setLoading(false);
      return;
    }

    const todayWeekNumber = weekNumberById[today.week_id];
    setDay(today);

    // Número de semana DENTRO del mes (para que coincida con los chips)
    const todayWeek = (weeks ?? []).find((w) => w.id === today.week_id);
    const todayMonth = todayWeek?.month ?? 1;
    const weeksOfMonth = (weeks ?? [])
      .filter((w) => w.month === todayMonth)
      .sort((a, b) => a.number - b.number);
    const weekInMonth =
      weeksOfMonth.findIndex((w) => w.id === today.week_id) + 1;
    setMonth(todayMonth);
    setWeekNumber(weekInMonth);

    // 4) Para cada ejercicio de hoy: su log + el peso de la semana pasada
    const prevWeek = (weeks ?? []).find(
      (w) => w.number === todayWeekNumber - 1,
    );
    const prevDay = prevWeek
      ? (days ?? []).find(
          (d) => d.week_id === prevWeek.id && d.number === today.number,
        )
      : null;
    const prevExercises = prevDay ? (exercisesByDay[prevDay.id] ?? []) : [];

    const todayExercises = exercisesByDay[today.id] ?? [];
    const built: ClassExercise[] = todayExercises.map((ex) => {
      const log = logByExercise[ex.id];
      // buscar el mismo ejercicio (por nombre) en la semana pasada
      const prev = prevExercises.find((p) => p.name === ex.name);
      const lastWeekWeight = prev
        ? (logByExercise[prev.id]?.weight_used ?? null)
        : null;
      // pending = sin registro; done / notdone = según el registro
      const status = log ? (log.done ? "done" : "notdone") : "pending";
      return {
        exercise: ex,
        status,
        weightUsed: log?.weight_used ?? "",
        lastWeekWeight,
      };
    });

    setItems(built);
    setLoading(false);
  }, [studentId, forcedDayId]);

  useEffect(() => {
    fetchClass();
  }, [fetchClass]);

  return {
    day,
    weekNumber,
    month,
    items,
    setItems,
    loading,
    weeks: allWeeks,
    days: allDays,
    refetch: fetchClass,
  };
}
