type Props = {
  /** Si es true, ocupa toda la pantalla y centra el spinner. Para los "Cargando..." de página completa. */
  fullScreen?: boolean;
  /** Texto opcional debajo del spinner. */
  label?: string;
};

export default function Spinner({ fullScreen = false, label }: Props) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-8 h-8 rounded-full border-4 border-outline-variant border-t-primary animate-spin"
        role="status"
        aria-label="Cargando"
      />
      {label && <p className="text-sm text-on-surface-variant">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return <div className="py-10 flex justify-center">{spinner}</div>;
}
