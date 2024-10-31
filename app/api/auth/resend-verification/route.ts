import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const verificationId = uuidv4();
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 30 * 60000); // 30 minutes from now

    await transaction(async (connection) => {
      // Invalidate any existing verification codes
      await connection.execute(
        `UPDATE email_verifications 
         SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND status = 'pending'`,
        [userId]
      );

      // Create new verification code
      await connection.execute(
        `INSERT INTO email_verifications 
         (id, user_id, code, expires_at, created_at, updated_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [verificationId, userId, code, expiresAt]
      );

      // In a real app, send email here
      // For web container mode, we'll just log the code
      if (process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer') {
        console.log('Verification code:', code);
      }
    });

    return NextResponse.json({
      message: 'Verification code sent successfully',
      verificationId
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { message: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}