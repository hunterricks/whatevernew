import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  provider: "google" | "apple";
  role?: "client" | "service_provider";
  label?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function LoginButton({
  provider,
  role,
  label,
  variant = "outline",
  size = "default",
  className,
  onClick,
  isLoading
}: LoginButtonProps) {
  const Icon = provider === "google" ? Icons.google : Icons.apple;
  const defaultLabel = `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("w-full", className)}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icon className="mr-2 h-4 w-4" />
      )}
      {label || defaultLabel}
    </Button>
  );
}
