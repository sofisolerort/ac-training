export type Student = {
  id: string;
  full_name: string | null;
  objective: string | null;
  weekly_frequency: number | null;
  birth_date: string | null;
  hasPlan?: boolean;
};

export type StudentDetail = Student & {
  training_days: string | null;
  email: string | null;
  phone: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  injuries: string | null;
  injuries_hurt: string | null;
  recent_surgeries: string | null;
  heart_lung_condition: string | null;
  medical_insurance: string | null;
  emergency_contact: string | null;
  inactive_since: string | null;
  notes: string | null;
};

export type Plan = {
  id: string;
  student_id: string;
  title: string | null;
  is_active: boolean;
};

export type Week = {
  id: string;
  plan_id: string;
  number: number;
  month: number;
};

export type Day = {
  id: string;
  week_id: string;
  number: number;
  name: string | null;
};

export type Exercise = {
  id: string;
  day_id: string;
  name: string;
  reps: string | null;
  weight: string | null;
  note: string | null;
  superset_group: string | null;
  order_index: number;
};

export type ClassStatus = "pending" | "done" | "notdone";

export type ClassExercise = {
  exercise: Exercise;
  status: ClassStatus;
  weightUsed: string;
  lastWeekWeight: string | null;
};

export type Payment = {
  id: string;
  student_id: string;
  paid_on: string;
  amount: string | null;
  period: string | null;
  note: string | null;
  created_at: string;
};
