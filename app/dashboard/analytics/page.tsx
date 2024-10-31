"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
  }, [router, checkAuth]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="text-center mb-16 sticky top-20 bg-background z-10 pb-4">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your performance and insights</p>
      </div>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center">
          <Image src="/images/post-job.jpg" alt="Person posting a job on a laptop" width={300} height={200} className="rounded-lg mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Post a Job</h2>
          <p>Describe your project and receive proposals from qualified professionals</p>
        </div>
        <div className="text-center">
          <Image src="/images/find-talent.jpg" alt="Professional worker with tools" width={300} height={200} className="rounded-lg mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Find Talent</h2>
          <p>Browse through a pool of skilled service providers for your specific needs</p>
        </div>
        <div className="text-center">
          <Image src="/images/secure-payment.jpg" alt="Secure online payment illustration" width={300} height={200} className="rounded-lg mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Secure Payments</h2>
          <p>Use our escrow system for safe and guaranteed transactions</p>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">How WHATEVER™ Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">1</div>
            <h3 className="font-semibold mb-2">Post a Job</h3>
            <p>Describe your project in detail</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">2</div>
            <h3 className="font-semibold mb-2">Receive Proposals</h3>
            <p>Get bids from qualified professionals</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">3</div>
            <h3 className="font-semibold mb-2">Hire the Best</h3>
            <p>Choose the right person for your job</p>
          </div>
          <div>
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">4</div>
            <h3 className="font-semibold mb-2">Get it Done</h3>
            <p>Collaborate and complete your project</p>
          </div>
        </div>
      </section>
    </div>
  );
}