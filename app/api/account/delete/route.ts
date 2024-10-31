import { NextResponse } from 'next/server';
import { query, transaction, sqliteDb, isWebContainer } from '@/lib/mysql'; // Adjust the import path as necessary
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import Proposal from '@/models/Proposal';
import Review from '@/models/Review';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

const TIMEOUT_MS = 30000; // 30-second timeout for deletion process

export async function DELETE() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let userId: string;

    if (isWebContainer && sqliteDb) {
      // For web container testing, get userId from request body or set a test userId
      userId = 'test-user-id'; // Replace with dynamic value if needed
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = session.user.id as string;
    }

    if (isWebContainer && sqliteDb) {
      // Delete data from SQLite
      // Begin transaction
      await sqliteDb.run('BEGIN TRANSACTION');

      try {
        // Delete reviews
        await sqliteDb.run(
          'DELETE FROM reviews WHERE reviewer_id = ? OR reviewee_id = ?',
          [userId, userId]
        );

        // Delete jobs
        await sqliteDb.run(
          'DELETE FROM jobs WHERE posted_by = ? OR service_provider_id = ?',
          [userId, userId]
        );

        // Delete proposals
        await sqliteDb.run(
          'DELETE FROM proposals WHERE client_id = ? OR service_provider_id = ?',
          [userId, userId]
        );

        // Delete user
        await sqliteDb.run('DELETE FROM users WHERE id = ?', [userId]);

        // Commit transaction
        await sqliteDb.run('COMMIT');
      } catch (error) {
        // Rollback on error
        await sqliteDb.run('ROLLBACK');
        throw error;
      }

      console.log('Successfully deleted SQLite data for user:', userId);

    } else {
      // Delete data from MongoDB
      await dbConnect();

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Delete reviews
        await Review.deleteMany({
          $or: [{ reviewer: userId }, { reviewee: userId }],
        }).session(session);

        // Delete jobs
        await Job.deleteMany({
          $or: [{ postedBy: userId }, { serviceProvider: userId }],
        }).session(session);

        // Delete proposals
        await Proposal.deleteMany({
          $or: [{ clientId: userId }, { serviceProviderId: userId }],
        }).session(session);

        // Delete user
        await User.findByIdAndDelete(userId).session(session);

        await session.commitTransaction();
        session.endSession();

        console.log('Successfully deleted MongoDB data for user:', userId);
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    return NextResponse.json({
      message: 'Account deleted successfully',
      userId,
    });
  } catch (error: any) {
    console.error('Account deletion error:', error);

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Account deletion timed out' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to delete account',
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}