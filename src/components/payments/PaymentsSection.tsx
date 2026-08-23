import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthProvider";
import { usePayments } from "../../hooks/usePayments";
import { useConfirm } from "../confirm/useConfirm";
import type { Payment } from "../../types";

const inputCls =
  "w-full px-3 py-2.5 rounded-lg bg-surface border border-outline-variant text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25";

function formatearFecha(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ¿Pagó en los últimos 31 días?
function alDia(paidOn: string) {
  const dias = (Date.now() - new Date(paidOn).getTime()) / (1000 * 60 * 60 * 24);
  return dias <= 31;
}

const hoy = () => new Date().toISOString().slice(0, 10);

export default function PaymentsSection({ studentId }: { studentId: string }) {
  const { session } = useAuth();
  const { payments, loading, refetch } = usePayments(studentId);
  const { confirm, dialog } = useConfirm();

  // "none" | "nuevo" | id del pago que se edita
  const [modo, setModo] = useState<"none" | "nuevo" | string>("none");
  const [busy, setBusy] = useState(false);
  const [fecha, setFecha] = useState(hoy());
  const [monto, setMonto] = useState("");
  const [periodo, setPeriodo] = useState("");

  const ultimo = payments[0];
  const estaAlDia = ultimo ? alDia(ultimo.paid_on) : false;

  const abrirNuevo = () => {
    setFecha(hoy());
    setMonto("");
    setPeriodo("");
    setModo("nuevo");
  };

  const abrirEdicion = (p: Payment) => {
    setFecha(p.paid_on);
    setMonto(p.amount ?? "");
    setPeriodo(p.period ?? "");
    setModo(p.id);
  };

  const guardarPago = async () => {
    if (!session) return;
    setBusy(true);
    if (modo !== "nuevo") {
      // editar
      await supabase
        .from("payments")
        .update({
          paid_on: fecha,
          amount: monto.trim() || null,
          period: periodo.trim() || null,
        })
        .eq("id", modo);
    } else {
      await supabase.from("payments").insert({
        student_id: studentId,
        paid_on: fecha,
        amount: monto.trim() || null,
        period: periodo.trim() || null,
        created_by: session.user.id,
      });
    }
    setBusy(false);
    setModo("none");
    await refetch();
  };

  const borrar = async (p: Payment) => {
    const ok = await confirm({
      title: "Borrar pago",
      message: `¿Seguro que querés borrar el pago del ${formatearFecha(p.paid_on)}? Esta acción no se puede deshacer.`,
      confirmLabel: "Borrar",
      danger: true,
    });
    if (!ok) return;
    await supabase.from("payments").delete().eq("id", p.id);
    await refetch();
  };

  const Formulario = (
    <div className="border-t border-outline-variant pt-3 mt-1">
      <label className="block text-xs text-on-surface-variant mb-1">
        Fecha del pago
      </label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        onClick={(e) => e.currentTarget.showPicker?.()}
        className={`${inputCls} mb-2`}
      />
      <div className="flex gap-2 mb-3">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Monto (ej: $20.000)"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <input
          className={`${inputCls} flex-1`}
          placeholder="Período (ej: Abril)"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={guardarPago}
          disabled={busy}
          className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-semibold transition hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Guardando..." : modo === "nuevo" ? "Registrar" : "Guardar"}
        </button>
        <button
          onClick={() => setModo("none")}
          className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-semibold transition hover:bg-surface-container active:scale-[0.98]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-on-surface">Pagos</h2>
        {!loading && (
          <span
            className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold ${
              estaAlDia
                ? "bg-primary-container text-on-primary-container"
                : "bg-error/10 text-error"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {estaAlDia ? "check_circle" : "schedule"}
            </span>
            {estaAlDia ? "Al día" : "Pendiente"}
          </span>
        )}
      </div>

      {!loading && payments.length === 0 && modo === "none" && (
        <p className="text-sm text-on-surface-variant mb-3">
          Todavía no hay pagos registrados.
        </p>
      )}

      {/* Lista de pagos */}
      {payments.map((p) =>
        modo === p.id ? (
          <div key={p.id}>{Formulario}</div>
        ) : (
          <div
            key={p.id}
            className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0"
          >
            <span className="text-sm text-on-surface">
              {formatearFecha(p.paid_on)}
              {p.amount ? ` · ${p.amount}` : ""}
              {p.period ? (
                <span className="text-on-surface-variant"> · {p.period}</span>
              ) : (
                ""
              )}
            </span>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => abrirEdicion(p)}
                aria-label="Editar pago"
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant transition hover:bg-surface-container active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                onClick={() => borrar(p)}
                aria-label="Borrar pago"
                className="w-8 h-8 rounded-full flex items-center justify-center text-error transition hover:bg-error/10 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        ),
      )}

      {/* Form de alta */}
      {modo === "nuevo" && Formulario}

      {/* Botón registrar */}
      {modo === "none" && (
        <button
          onClick={abrirNuevo}
          className="w-full mt-3 py-2.5 rounded-lg border border-primary text-primary font-semibold transition hover:bg-primary/10 active:scale-[0.98] inline-flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Registrar pago
        </button>
      )}
      {dialog}
    </div>
  );
}
