import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface LoginButtonProps {
  provider: 'google' | 'apple';
  onClick: () => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function LoginButton({ 
  provider, 
  onClick, 
  variant = 'default',
  size = 'default',
  className = ''
}: LoginButtonProps) {
  const icon = provider === 'google' ? (
    <Icons.google className="h-5 w-5 mr-2" />
  ) : (
    <Icons.apple className="h-5 w-5 mr-2" />
  );

  const text = provider === 'google' ? 'Continue with Google' : 'Continue with Apple';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
    >
      {icon}
      {text}
    </Button>
  );
} 