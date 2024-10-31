import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import stripe from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: session.user.id, // Assuming user ID is used as Stripe customer ID
      payment_method_types: ['card'],
      usage: 'off_session', // Allow using this payment method for future payments
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json(
      { message: 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}