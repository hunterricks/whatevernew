"use client";

import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  skills?: string[];
  proposal_count?: number;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
}

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

export default function MyJobsPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [jobsData, setJobsData] = useState<JobsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
  }, [router, checkAuth]);

  const fetchJobs = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs?userId=${user.id}&userRole=${user.activeRole}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobsData(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
      setError('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user?.id, user?.activeRole]);

  const getStatusBadge = (status: Job['status']) => {
    const variants: Record<Job['status'], "default" | "secondary" | "success" | "destructive"> = {
      open: "default",
      in_progress: "secondary",
      completed: "success",
      cancelled: "destructive"
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8 sticky top-20 bg-background z-10 pb-4">
        <h1 className="text-3xl font-bold">
          {user.activeRole === 'client' ? 'My Posted Jobs' : 'My Active Jobs'}
        </h1>
        <Button asChild>
          <Link href={user.activeRole === 'client' ? '/post-job' : '/browse-jobs'}>
            {user.activeRole === 'client' ? 'Post New Job' : 'Find More Jobs'}
          </Link>
        </Button>
      </div>

      {isWebContainer && (
        <Alert variant="warning" className="mb-8">
          <AlertDescription>
            Web Container Mode: You can view both client and service provider jobs
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {!jobsData?.jobs?.length ? (
          <div className="text-center text-muted-foreground py-8">
            No jobs found.
          </div>
        ) : (
          jobsData.jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    {getStatusBadge(job.status)}
                  </div>
                  <Button asChild>
                    <Link href={`/jobs/${job.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.description}</p>
                <div className="flex gap-4 text-sm">
                  <p>Budget: ${job.budget}</p>
                  <p>Location: {job.location}</p>
                  <p>Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                  {job.proposal_count !== undefined && (
                    <p>Proposals: {job.proposal_count}</p>
                  )}
                </div>
                {job.skills && job.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}