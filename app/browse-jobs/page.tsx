"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useRouter } from 'next/navigation';
import { debounce } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: string;
  location: string;
  timeline: string;
  posted_by: string;
  created_at: string;
  poster_name: string;
  skills: string[];
}

export default function BrowseJobsPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("open");

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
  }, [router, checkAuth]);

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        userId: user.id,
        userRole: user.activeRole,
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/jobs?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.activeRole, selectedStatus, selectedCategory, searchTerm]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 500),
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8 sticky top-20 bg-background z-10 pb-4">
        <h1 className="text-3xl font-bold">Browse Jobs</h1>
        {user.activeRole === 'client' && (
          <Button asChild>
            <Link href="/post-job">Post New Job</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 mb-6 md:grid-cols-3">
        <Input
          placeholder="Search jobs..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full"
        />
        <Select
          value={selectedCategory || undefined}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="writing">Writing</SelectItem>
            <SelectItem value="admin">Admin Support</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No jobs found matching your criteria.
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Posted by {job.poster_name}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/jobs/${job.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.description}</p>
                <div className="flex gap-4 text-sm">
                  <p>Budget: ${job.budget.toLocaleString()}</p>
                  <p>Location: {job.location}</p>
                  <p>Timeline: {job.timeline}</p>
                  <p>Posted: {new Date(job.created_at).toLocaleDateString()}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
