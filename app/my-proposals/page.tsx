"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { toast } from "sonner";

interface Proposal {
  _id: string;
  status: string;
  price: number;
  estimatedDuration: string;
  createdAt: string;
  job: {
    _id: string;
    title: string;
  };
}

export default function MyProposals() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
  }, [router, checkAuth]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/proposals?serviceProviderId=${user.id}`, {
          headers: {
            'x-user-id': user.id,
            'x-user-role': user.activeRole
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch proposals');
        }

        const data = await response.json();
        setProposals(data.proposals || []);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        toast.error('Failed to load proposals');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id && user.activeRole === 'service_provider') {
      fetchProposals();
    }
  }, [user?.id, user?.activeRole]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "success" | "destructive"> = {
      pending: "default",
      accepted: "success",
      rejected: "destructive",
      withdrawn: "secondary"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (!user || user.activeRole !== 'service_provider') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8 sticky top-20 bg-background z-10 pb-4">
        <h1 className="text-3xl font-bold">My Proposals</h1>
        <Button asChild>
          <Link href="/browse-jobs">Browse More Jobs</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No proposals found. Browse jobs to submit proposals.
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <Card key={proposal._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {proposal.job.title}
                    </CardTitle>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${proposal.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {proposal.estimatedDuration}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                  </p>
                  <Button asChild variant="outline">
                    <Link href={`/jobs/${proposal.job._id}`}>View Job</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}