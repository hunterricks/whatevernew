import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';
import { isValidVerificationCode } from '@/lib/verification/generateCode';

export async function POST(request: Request) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidVerificationCode(code)) {
      return NextResponse.json(
        { message: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    const result = await transaction(async (connection) => {
      // Get verification record
      const [[verification]] = await connection.execute(
        `SELECT * FROM email_verifications 
         WHERE user_id = ? AND code = ? AND status = 'pending' 
         AND expires_at > CURRENT_TIMESTAMP`,
        [userId, code]
      );

      if (!verification) {
        throw new Error('Invalid or expired verification code');
      }

      // Update verification status
      await connection.execute(
        `UPDATE email_verifications 
         SET status = 'verified', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [verification.id]
      );

      // Update user's email verification status
      await connection.execute(
        `UPDATE users 
         SET email_verified = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [userId]
      );

      return verification;
    });

    return NextResponse.json({
      message: 'Email verified successfully',
      verification: result
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}