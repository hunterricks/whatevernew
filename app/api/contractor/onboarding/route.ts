import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessDetails, services, profile } = body;

    // Update contractor profile
    await query(
      `UPDATE contractor_profiles SET 
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

    // Save primary services
    for (const serviceId of services.primaryServices) {
      await query(
        `INSERT INTO contractor_services (contractor_id, service_id)
         VALUES (?, ?)`,
        [session.user.id, serviceId]
      );
    }

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