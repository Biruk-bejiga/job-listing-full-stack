import { prisma } from './prisma';

/**
 * Remove a user and all dependent records in a single transaction.
 * Steps performed:
 *  - find jobs posted by the user
 *  - delete applications submitted by the user
 *  - delete applications that belong to the user's jobs
 *  - delete the user's jobs
 *  - delete the user
 *
 * Note: Prisma's MongoDB connector does not support DB-level cascade deletes,
 * so we perform application-level cascading inside a transaction.
 */
export async function deleteUserCascade(userId: string) {
  if (!userId) throw new Error('userId is required');

  // Use a transaction to ensure atomicity
  return prisma.$transaction(async (tx) => {
    // 1) Find jobs posted by this user (to remove their applications too)
    const jobs = await tx.job.findMany({ where: { employerId: userId }, select: { id: true } });
    const jobIds = jobs.map((j) => j.id);

    // 2) Delete applications submitted by the user (apps where applicantId = userId)
    await tx.application.deleteMany({ where: { applicantId: userId } });

    // 3) If the user had posted jobs, delete applications for those jobs
    if (jobIds.length > 0) {
      await tx.application.deleteMany({ where: { jobId: { in: jobIds } } });

      // 4) Delete the jobs posted by the user
      await tx.job.deleteMany({ where: { id: { in: jobIds } } });
    }

    // 5) Finally delete the user
    await tx.user.delete({ where: { id: userId } });
  });
}

/**
 * Remove a job and all its applications in a single transaction.
 * Steps performed:
 *  - delete applications with jobId
 *  - delete the job
 */
export async function deleteJobCascade(jobId: string) {
  if (!jobId) throw new Error('jobId is required');

  return prisma.$transaction(async (tx) => {
    await tx.application.deleteMany({ where: { jobId } });
    await tx.job.delete({ where: { id: jobId } });
  });
}

/**
 * Example usage (not executed here):
 *
 * import { deleteUserCascade } from '@/lib/cascade';
 * await deleteUserCascade('652f9a8e...');
 *
 */
