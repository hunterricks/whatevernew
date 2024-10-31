import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import stripe from '@/lib/stripe';
import { query } from '@/lib/mysql';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the payment method ID from the setup intent
    const setupIntent = await stripe.setupIntents.retrieve(
      request.headers.get('Setup-Intent-Id') as string
    );

    if (!setupIntent.payment_method) {
      throw new Error('No payment method found');
    }

    // Save the payment method ID to the user's profile
    await query(
      `UPDATE client_profiles 
       SET payment_method_id = ?, 
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [setupIntent.payment_method, session.user.id]
    );

    return NextResponse.json({
      message: 'Payment method saved successfully',
    });
  } catch (error) {
    console.error('Error saving payment method:', error);
    return NextResponse.json(
      { message: 'Failed to save payment method' },
      { status: 500 }
    );
  }
}