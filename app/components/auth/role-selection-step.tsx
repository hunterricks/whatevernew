import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import type { UserRole } from "@/lib/auth";

interface RoleSelectionStepProps {
  email: string;
  onComplete: () => void;
}

export function RoleSelectionStep({ email, onComplete }: RoleSelectionStepProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/update-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          roles: selectedRoles 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update roles');
      }

      toast.success("Account roles updated successfully");
      onComplete();
    } catch (error) {
      console.error("Role update error:", error);
      toast.error("Failed to update roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold text-center mb-2">Welcome Back!</h1>
      <p className="text-center text-gray-600 mb-6">
        Please select how you'd like to use our platform
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          onValueChange={(value) => setSelectedRoles([value as UserRole])}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2 border p-4 rounded-lg">
            <RadioGroupItem value="client" id="client" />
            <Label htmlFor="client" className="flex-1 cursor-pointer">
              <div className="font-medium">I'm a Client</div>
              <div className="text-sm text-gray-500">
                I want to hire professionals
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 border p-4 rounded-lg">
            <RadioGroupItem value="service_provider" id="provider" />
            <Label htmlFor="provider" className="flex-1 cursor-pointer">
              <div className="font-medium">I'm a Service Provider</div>
              <div className="text-sm text-gray-500">
                I want to offer my services
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 border p-4 rounded-lg">
            <RadioGroupItem value="dual" id="dual" />
            <Label htmlFor="dual" className="flex-1 cursor-pointer">
              <div className="font-medium">Both</div>
              <div className="text-sm text-gray-500">
                I want to do both
              </div>
            </Label>
          </div>
        </RadioGroup>

        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700" 
          size="lg"
          disabled={loading || selectedRoles.length === 0}
        >
          {loading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </div>
  );
} 