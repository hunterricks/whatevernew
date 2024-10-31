import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface OnboardingData {
  businessDetails: {
    licenseNumber?: string;
    insuranceInfo: string;
    serviceArea: string;
    businessStructure: string;
  };
  services: {
    hourlyRate: number;
    availability: string;
    primaryServices: string[];
  };
  profile: {
    bio: string;
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: OnboardingData = await request.json();
    const { businessDetails, services, profile } = body;

    // Validate input
    if (!services.hourlyRate || !services.availability || !services.primaryServices.length) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await transaction(async (connection) => {
      try {
        // Update service provider profile
        await connection.execute(`
          UPDATE service_provider_profiles SET 
            license_number = ?,
            insurance_info = ?,
            service_area = ?,
            business_structure = ?,
            hourly_rate = ?,
            availability = ?,
            bio = ?,
            profile_completion = 100,
            updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [
            businessDetails.licenseNumber || null,
            businessDetails.insuranceInfo,
            businessDetails.serviceArea,
            businessDetails.businessStructure,
            services.hourlyRate,
            services.availability,
            profile.bio,
            session.user.id
          ]
        );

        // Delete existing services first
        await connection.execute(
          'DELETE FROM service_provider_services WHERE provider_id = ?',
          [session.user.id]
        );

        // Save primary services
        for (const serviceId of services.primaryServices) {
          await connection.execute(
            `INSERT INTO service_provider_services (provider_id, service_id)
             VALUES (?, ?)`,
            [session.user.id, serviceId]
          );
        }
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 