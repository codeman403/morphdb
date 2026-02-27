import { prisma } from '@/lib/prisma';

/**
 * Check if an idempotency key exists and return cached response
 */
export async function getIdempotencyKey(userId: string, key: string) {
  try {
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (existing && existing.userId === userId && existing.expiresAt > new Date()) {
      return {
        found: true,
        response: JSON.parse(existing.response),
        status: existing.status,
      };
    }

    // Delete expired key
    if (existing && existing.expiresAt <= new Date()) {
      await prisma.idempotencyKey.delete({ where: { key } }).catch(() => {});
    }

    return { found: false };
  } catch {
    return { found: false };
  }
}

/**
 * Store a response for an idempotency key
 */
export async function storeIdempotencyKey(
  userId: string,
  key: string,
  response: unknown,
  status: number
) {
  try {
    // Expire after 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.idempotencyKey.upsert({
      where: { key },
      create: {
        key,
        userId,
        response: JSON.stringify(response),
        status,
        expiresAt,
      },
      update: {
        response: JSON.stringify(response),
        status,
        expiresAt,
      },
    });
  } catch (e) {
    console.error('[Idempotency Error]', e);
  }
}
