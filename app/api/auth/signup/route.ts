import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { provider, token, role } = data;

    // Handle OAuth signup
    if (provider) {
      switch (provider) {
        case 'google': {
          const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
          });
          const payload = ticket.getPayload();
          if (!payload) throw new Error('Invalid Google token');

          const { email, given_name, family_name } = payload;
          
          // Check if user exists
          let user = await User.findOne({ email });
          
          if (!user) {
            // Create new user from Google data
            user = await User.create({
              firstName: given_name,
              lastName: family_name,
              name: `${given_name} ${family_name}`,
              email,
              password: '', // No password for OAuth users
              role,
              provider: 'google',
              onboardingCompleted: false,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }

          // Generate JWT
          const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
          );

          const response = NextResponse.json({
            message: 'User authenticated successfully',
            userId: user._id,
            role: user.role,
            redirectUrl: role === 'client' 
              ? '/client/onboarding' 
              : '/service-provider/onboarding'
          });

          response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 86400,
            path: '/',
          });

          return response;
        }

        case 'apple': {
          // Implement Apple Sign-in verification
          // Similar structure to Google but with Apple-specific verification
          break;
        }

        default:
          return NextResponse.json(
            { error: 'Unsupported OAuth provider' },
            { status: 400 }
          );
      }
    }

    // Handle email/password signup (existing code)
    const { firstName, lastName, email, password } = data;
    // ... rest of your existing email/password signup code ...
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Error creating user', details: errorMessage },
      { status: 500 }
    );
  }
}
