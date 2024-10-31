export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  // ... other job fields
}

export interface Proposal {
  id: string;
  jobId: string;
  serviceProviderId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  // ... other proposal fields
} 