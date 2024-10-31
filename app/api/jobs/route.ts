import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface JobRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  scope: 'small' | 'medium' | 'large';
  duration: string;
  experienceLevel: string;
  postedBy: string;
  skills?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: JobRequest = await request.json();
    
    // Input validation
    if (!body.title || !body.description || !body.category || 
        !body.location || !body.budgetType || !body.scope || 
        !body.duration || !body.experienceLevel || !body.postedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const jobId = uuidv4();
    
    console.log('Creating new job:', {
      jobId,
      postedBy: body.postedBy,
      title: body.title,
      category: body.category
    });
    
    await transaction(async (connection) => {
      try {
        // Verify user exists first
        const [[userExists]] = await connection.execute(
          'SELECT id FROM users WHERE id = ?',
          [body.postedBy]
        );

        if (!userExists) {
          throw new Error('User not found');
        }

        // Create job
        await connection.execute(`
          INSERT INTO jobs (
            id, title, description, category, location,
            budget, budget_type, scope, duration,
            experience_level, posted_by, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', NOW(), NOW())`,
          [
            jobId,
            body.title,
            body.description,
            body.category,
            body.location,
            body.budget,
            body.budgetType,
            body.scope,
            body.duration,
            body.experienceLevel,
            body.postedBy
          ]
        );

        // Add skills if provided
        if (body.skills?.length) {
          const skillValues = body.skills.map(skill => [jobId, skill]);
          await connection.query(
            `INSERT INTO job_skills (job_id, skill) VALUES ?`,
            [skillValues]
          );
        }
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    });

    return NextResponse.json({ 
      message: 'Job created successfully',
      jobId 
    });

  } catch (error) {
    console.error('Error creating job:', error);
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const userRole = searchParams.get('userRole');
  
  try {
    let jobsQuery = `
      SELECT 
        j.*,
        GROUP_CONCAT(DISTINCT s.name) as skills,
        COUNT(DISTINCT p.id) as proposal_count,
        u.name as client_name,
        sp.name as service_provider_name
      FROM jobs j
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      LEFT JOIN proposals p ON j.id = p.job_id
      LEFT JOIN users u ON j.client_id = u.id
      LEFT JOIN users sp ON j.service_provider_id = sp.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (userId && userRole) {
      if (userRole === 'client') {
        jobsQuery += ' AND j.client_id = ?';
        params.push(userId);
      } else if (userRole === 'service_provider') {
        jobsQuery += ' AND (j.service_provider_id = ? OR j.service_provider_id IS NULL)';
        params.push(userId);
      }
    }

    jobsQuery += ' GROUP BY j.id, u.name, sp.name ORDER BY j.created_at DESC';

    const jobs = await query(jobsQuery, params);
    
    // Parse the skills string into an array
    return NextResponse.json(jobs.map((job: any) => ({
      ...job,
      skills: job.skills ? job.skills.split(',') : []
    })));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
