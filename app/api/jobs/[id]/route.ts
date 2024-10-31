import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = await params.id;
    const [job] = await query(`
      SELECT 
        j.*,
        u.name as poster_name,
        p.status as payment_status,
        p.amount as payment_amount
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN payments p ON j.id = p.job_id
      WHERE j.id = ?
    `, [jobId]);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Error fetching job' },
      { status: 500 }
    );
  }
}