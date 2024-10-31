"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentSetupProps {
  onComplete: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

function PaymentForm({ onComplete, setIsLoading }: PaymentSetupProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create a payment intent when the component mounts
    const createSetupIntent = async () => {
      try {
        const response = await fetch("/api/homeowner/payment/setup-intent", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to create setup intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast.error("Failed to initialize payment setup");
      }
    };

    createSetupIntent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsLoading(true);
    try {
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/client`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Save payment method to our backend
      const response = await fetch("/api/homeowner/payment/save-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to save payment method");
      }

      toast.success("Payment method added successfully!");
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set up payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Your payment information is securely processed by Stripe. We never store your card details.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <PaymentElement />
      </Card>

      <div className="space-y-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!stripe}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Save Payment Method
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Your card will only be charged when you book a service
        </p>
      </div>
    </form>
  );
}

export function PaymentSetup(props: PaymentSetupProps) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create a setup intent when the component mounts
    const createSetupIntent = async () => {
      try {
        const response = await fetch("/api/homeowner/payment/setup-intent", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to create setup intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast.error("Failed to initialize payment setup");
      }
    };

    createSetupIntent();
  }, []);

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  );
}</content>