import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/mysql';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface ReviewData {
  jobId: string;
  providerId: string;
  publicRating: number;
  privateRating?: number;
  comment: string;
  privateComment?: string;
}

async function updateProviderStats(
  connection: any,
  providerId: string,
  reviewerId: string
) {
  try {
    // Get provider's current stats
    const [[stats]] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT j.id) as total_jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
        AVG(r.rating) as avg_rating
      FROM users u
      LEFT JOIN jobs j ON j.service_provider_id = u.id
      LEFT JOIN reviews r ON r.reviewee_id = u.id AND r.is_private = false
      WHERE u.id = ?
      GROUP BY u.id
    `, [providerId]);

    // Check for repeat client
    const [[previousJobs]] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM jobs j
      WHERE j.posted_by = ?
      AND j.service_provider_id = ?
      AND j.status = 'completed'
    `, [reviewerId, providerId]);

    if (previousJobs.count > 0) {
      await connection.execute(`
        INSERT IGNORE INTO repeat_clients (service_provider_id, client_id)
        VALUES (?, ?)
      `, [providerId, reviewerId]);
    }

    // Update provider stats
    await connection.execute(`
      UPDATE service_provider_stats 
      SET 
        total_jobs = ?,
        completed_jobs = ?,
        average_rating = ?,
        updated_at = NOW()
      WHERE user_id = ?
    `, [
      stats?.total_jobs || 0,
      stats?.completed_jobs || 0,
      stats?.avg_rating || 0,
      providerId
    ]);
  } catch (error) {
    console.error('Error updating provider stats:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviewData: ReviewData = await request.json();

    // Validate ratings
    if (reviewData.publicRating < 1 || reviewData.publicRating > 5) {
      return NextResponse.json(
        { error: 'Public rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (reviewData.privateRating && (reviewData.privateRating < 1 || reviewData.privateRating > 5)) {
      return NextResponse.json(
        { error: 'Private rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const reviewId = uuidv4();

    await transaction(async (connection) => {
      try {
        // Verify job exists and user is authorized
        const [[job]] = await connection.execute(
          'SELECT posted_by FROM jobs WHERE id = ?',
          [reviewData.jobId]
        );

        if (!job || job.posted_by !== userId) {
          throw new Error('Unauthorized or job not found');
        }

        // Insert public review
        await connection.execute(`
          INSERT INTO reviews (
            id, job_id, reviewer_id, reviewee_id,
            rating, comment, is_private, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, false, NOW())
        `, [
          reviewId,
          reviewData.jobId,
          userId,
          reviewData.providerId,
          reviewData.publicRating,
          reviewData.comment
        ]);

        // Insert private review if provided
        if (reviewData.privateRating || reviewData.privateComment) {
          const privateReviewId = uuidv4();
          await connection.execute(`
            INSERT INTO reviews (
              id, job_id, reviewer_id, reviewee_id,
              rating, comment, is_private, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, true, NOW())
          `, [
            privateReviewId,
            reviewData.jobId,
            userId,
            reviewData.providerId,
            reviewData.privateRating,
            reviewData.privateComment
          ]);
        }

        // Update job status
        await connection.execute(
          'UPDATE jobs SET has_review = true WHERE id = ?',
          [reviewData.jobId]
        );

        // Update provider statistics
        await updateProviderStats(connection, reviewData.providerId, userId);

      } catch (error) {
        await connection.rollback();
        throw error;
      }
    });

    return NextResponse.json({ 
      message: 'Review submitted successfully',
      reviewId 
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    if (error.message === 'Unauthorized or job not found') {
      return NextResponse.json(
        { error: 'Unauthorized or job not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error submitting review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId');
    const userId = request.nextUrl.searchParams.get('userId');

    if (!jobId && !userId) {
      return NextResponse.json(
        { error: 'Must provide either jobId or userId' },
        { status: 400 }
      );
    }

    let reviews;
    if (jobId) {
      reviews = await query(`
        SELECT 
          r.*,
          u.name as reviewer_name
        FROM reviews r
        JOIN users u ON u.id = r.reviewer_id
        WHERE r.job_id = ?
        AND r.is_private = false
        ORDER BY r.created_at DESC
      `, [jobId]);
    } else {
      reviews = await query(`
        SELECT 
          r.*,
          u.name as reviewer_name,
          j.title as job_title
        FROM reviews r
        JOIN users u ON u.id = r.reviewer_id
        JOIN jobs j ON j.id = r.job_id
        WHERE r.reviewee_id = ?
        AND r.is_private = false
        ORDER BY r.created_at DESC
      `, [userId]);
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Error fetching reviews' },
      { status: 500 }
    );
  }
}