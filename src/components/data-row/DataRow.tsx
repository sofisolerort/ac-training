type Props = {
  label: string;
  value: string | number | null;
};

export default function DataRow({ label, value }: Props) {
  return (
    <div className="py-3 border-b border-outline-variant last:border-0">
      <p className="text-xs text-on-surface-variant mb-0.5">{label}</p>
      <p className="text-on-surface">
        {value != null && value !== "" ? value : "—"}
      </p>
    </div>
  );
}
