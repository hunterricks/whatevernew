import { query } from './mysql';

interface UserStats {
  average_rating: number;
  total_jobs: number;
  completed_jobs: number;
  response_rate: number;
  repeat_clients: number;
  total_clients: number;
  recent_ratings: number[];
}

export async function calculateSuccessScore(userId: string): Promise<number> {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Get comprehensive user stats from MySQL
  const [stats] = await query<UserStats[]>(`
    SELECT 
      COALESCE(AVG(r.rating), 0) as average_rating,
      COUNT(DISTINCT j.id) as total_jobs,
      COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
      (
        SELECT COUNT(DISTINCT client_id) 
        FROM repeat_clients 
        WHERE service_provider_id = u.id
      ) as repeat_clients,
      (
        SELECT COUNT(DISTINCT posted_by) 
        FROM jobs 
        WHERE service_provider_id = u.id
      ) as total_clients,
      COALESCE(
        (
          SELECT AVG(rating) 
          FROM reviews 
          WHERE reviewee_id = u.id 
          AND created_at >= ?
        ), 0
      ) as recent_rating
    FROM users u
    LEFT JOIN reviews r ON r.reviewee_id = u.id
    LEFT JOIN jobs j ON j.service_provider_id = u.id
    WHERE u.id = ?
    GROUP BY u.id
  `, [threeMonthsAgo.toISOString(), userId]);

  if (!stats) {
    return 0;
  }

  // Calculate component scores
  const ratingScore = stats.average_rating * 20; // Convert 5-star to 100-point scale
  const completionScore = stats.total_jobs ? (stats.completed_jobs / stats.total_jobs) * 100 : 0;
  const repeatScore = stats.total_clients ? (stats.repeat_clients / stats.total_clients) * 100 : 0;
  const recentScore = stats.recent_ratings ? stats.recent_ratings * 20 : 0;

  // Weight the components
  const score = (
    (ratingScore * 0.3) +      // 30% weight on overall ratings
    (completionScore * 0.2) +  // 20% weight on job completion
    (repeatScore * 0.2) +      // 20% weight on repeat clients
    (recentScore * 0.3)        // 30% weight on recent performance
  );

  // Round to 2 decimal places
  const finalScore = Math.round(score * 100) / 100;

  // Update the user's success score in the database
  await query(`
    UPDATE user_stats 
    SET 
      success_score = ?,
      last_calculated = NOW()
    WHERE user_id = ?
  `, [finalScore, userId]);

  return finalScore;
}

// Helper function to get a user's current success score
export async function getCurrentSuccessScore(userId: string): Promise<number> {
  const [stats] = await query<Array<{ success_score: number }>>(`
    SELECT success_score 
    FROM user_stats 
    WHERE user_id = ?
  `, [userId]);

  return stats?.success_score || 0;
} 