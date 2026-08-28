import { Spinner } from "@/components/ui/spinner";

export function ButtonLoadingLabel({
  label,
  spinnerSize = 16,
}: {
  label: string;
  spinnerSize?: number;
}) {
  return (
    <span className="inline-flex items-center">
      <Spinner size={spinnerSize} className="mr-2" />
      {label}
    </span>
  );
}
