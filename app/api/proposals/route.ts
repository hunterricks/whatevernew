import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const serviceProviderId = searchParams.get('serviceProviderId');
    const role = searchParams.get('role');

    let conditions = [];
    const params: any[] = [];

    if (jobId) {
      conditions.push('p.job_id = ?');
      params.push(jobId);
    }

    if (role !== 'client') {
      if (!serviceProviderId) {
        return NextResponse.json(
          { error: 'serviceProviderId is required' },
          { status: 400 }
        );
      }
      conditions.push('p.service_provider_id = ?');
      params.push(serviceProviderId);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const proposals = await query(`
      SELECT 
        p.id as _id,
        p.price,
        p.estimated_duration as estimatedDuration,
        p.status,
        p.created_at as createdAt,
        j.id as 'job._id',
        j.title as 'job.title',
        j.status as 'job.status',
        j.description as 'job.description',
        j.budget as 'job.budget',
        u.name as service_provider_name
      FROM proposals p
      LEFT JOIN jobs j ON p.job_id = j.id
      LEFT JOIN users u ON p.service_provider_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `, params);

    // Transform the flat results into nested objects
    const transformedProposals = proposals.map(p => ({
      _id: p._id,
      price: p.price,
      estimatedDuration: p.estimatedDuration,
      status: p.status,
      createdAt: p.createdAt,
      job: {
        _id: p['job._id'],
        title: p['job.title'],
        status: p['job.status'],
        description: p['job.description'],
        budget: p['job.budget']
      },
      serviceProviderName: p.service_provider_name
    }));

    return NextResponse.json(transformedProposals);
  } catch (error) {
    console.error('Error in GET /api/proposals:', error);
    return NextResponse.json(
      { error: 'Error fetching proposals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Ensure all required fields have values or null (not undefined)
    const proposal = {
      id: data.id || null,
      job_id: data.job_id || null,
      service_provider_id: data.service_provider_id || null,
      price: data.price || null,
      status: data.status || 'pending',
      created_at: new Date().toISOString(),
      // ... other fields
    };

    // Validate required fields
    const requiredFields = ['job_id', 'service_provider_id', 'price'];
    for (const field of requiredFields) {
      if (!proposal[field]) {
        return new Response(
          JSON.stringify({ 
            error: `Missing required field: ${field}`,
            received: data 
          }), 
          { status: 400 }
        );
      }
    }

    const result = await query(
      'INSERT INTO proposals SET ?',
      [proposal]
    );

    return new Response(JSON.stringify(result), {
      status: 201,
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return new Response(JSON.stringify({ error: 'Failed to create proposal' }), {
      status: 500,
    });
  }
}