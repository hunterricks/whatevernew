import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  variant?: "spinner" | "skeleton";
}

export function Loading({ className, variant = "skeleton" }: LoadingProps) {
  if (variant === "skeleton") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-32 w-full bg-muted rounded" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center min-h-[400px]",
      className
    )}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
} 