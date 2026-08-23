import { useState, useCallback } from "react";
import ConfirmDialog from "./ConfirmDialog";

type Options = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  hideCancel?: boolean;
};

// Reemplaza a window.confirm / window.alert por un modal lindo dentro de la app.
export function useConfirm() {
  const [options, setOptions] = useState<Options | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: Options) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  // Aviso de un solo botón (como window.alert)
  const alerta = useCallback(
    (message: string, title?: string) => {
      return confirm({
        title,
        message,
        confirmLabel: "Entendido",
        hideCancel: true,
      });
    },
    [confirm],
  );

  const cerrar = (valor: boolean) => {
    if (resolver) resolver(valor);
    setOptions(null);
    setResolver(null);
  };

  const dialog = options ? (
    <ConfirmDialog
      {...options}
      onConfirm={() => cerrar(true)}
      onCancel={() => cerrar(false)}
    />
  ) : null;

  return { confirm, alerta, dialog };
}
