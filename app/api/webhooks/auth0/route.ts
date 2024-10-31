import { NextResponse } from 'next/server';
import { ManagementClient } from 'auth0';
import { syncUserMetadata } from '@/lib/auth/syncMetadata';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

// Verify webhook signature
const verifySignature = (payload: string, signature: string) => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.AUTH0_WEBHOOK_SECRET!);
  const expectedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('auth0-signature');

    // Verify webhook signature
    if (!signature || !verifySignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);

    switch (event.type) {
      case 'user.created':
        await syncUserMetadata(event.user);
        break;
      
      case 'user.updated':
        await syncUserMetadata(event.user);
        break;
      
      case 'user.deleted':
        // Handle user deletion
        // Add your logic here
        break;

      default:
        console.log('Unhandled webhook event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}