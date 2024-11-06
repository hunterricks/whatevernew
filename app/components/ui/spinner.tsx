import { Icons } from "@/components/icons";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={`animate-spin ${className || ''}`}>
      <Icons.spinner />
    </div>
  );
} 