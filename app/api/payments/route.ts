import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, proposalId, amount } = body;
    const paymentId = uuidv4();

    await transaction(async (connection) => {
      // Create payment record
      await connection.query(`
        INSERT INTO payments (id, job_id, proposal_id, amount)
        VALUES (?, ?, ?, ?)
      `, [paymentId, jobId, proposalId, amount]);

      // Update job payment status
      await connection.query(`
        UPDATE jobs 
        SET payment_status = 'processing'
        WHERE id = ?
      `, [jobId]);
    });

    return NextResponse.json({ id: paymentId });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Error creating payment' },
      { status: 500 }
    );
  }
}