"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Welcome to WHATEVER™
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Connect with skilled professionals for your home improvement needs
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/login">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-t bg-gray-50 py-12 dark:bg-gray-800/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-xl font-bold">For Homeowners</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Post your project and get matched with qualified professionals
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-xl font-bold">For Professionals</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Find new clients and grow your business
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-xl font-bold">Secure Payments</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Protected payments and guaranteed satisfaction
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to get started?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join our community of homeowners and professionals today
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/register/homeowner">I Need a Professional</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/register/service-provider">I am a Professional</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} WHATEVER™. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link className="text-sm text-gray-500 hover:underline dark:text-gray-400" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="text-sm text-gray-500 hover:underline dark:text-gray-400" href="/terms">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}