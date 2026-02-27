/**
 * Audit Logging Utilities
 *
 * Provides functions for creating audit logs, managing soft deletes,
 * and tracking changes for compliance and data recovery.
 */

import { prisma } from '@/lib/prisma'
import { anonymizeIpAddress, maskUserAgent } from '@/lib/pii-utils'

/**
 * Create an audit log entry for tracking admin actions
 * Required for compliance, SOC 2, and data recovery
 *
 * @param params - Audit log parameters
 */
export async function createAuditLog(params: {
  action: string
  userId: string
  resourceType: string
  resourceId: string
  changes: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90) // 90-day retention

    await prisma.auditLog.create({
      data: {
        action: params.action,
        userId: params.userId,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        changes: JSON.stringify(params.changes),
        ipAddress: anonymizeIpAddress(params.ipAddress),
        userAgent: maskUserAgent(params.userAgent),
        expiresAt,
      },
    })
  } catch (error) {
    console.error('[Audit Log Error]', {
      action: params.action,
      resourceType: params.resourceType,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    // Don't throw - audit logging failures shouldn't break the main operation
  }
}

/**
 * Soft delete a migration batch permanently
 * Sets deletedAt and deletedBy for audit trail
 *
 * @param batchId - ID of batch to delete
 * @param deletedBy - Admin user ID who deleted it
 */
export async function softDeleteBatch(
  batchId: string,
  deletedBy: string
): Promise<void> {
  try {
    const batch = await prisma.migrationBatch.findUnique({
      where: { id: batchId },
    })

    if (!batch) {
      throw new Error('Batch not found')
    }

    const before = batch

    await prisma.migrationBatch.update({
      where: { id: batchId },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    })

    // Log the deletion
    await createAuditLog({
      action: 'batch_deleted',
      userId: deletedBy,
      resourceType: 'batch',
      resourceId: batchId,
      changes: {
        before: {
          id: before.id,
          userId: before.userId,
          deletedAt: before.deletedAt,
          deletedBy: before.deletedBy,
        },
        after: {
          id: batchId,
          userId: before.userId,
          deletedAt: new Date(),
          deletedBy,
        },
      },
    })
  } catch (error) {
    console.error('[Soft Delete Error]', {
      batchId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

/**
 * Get audit trail for a specific resource
 * Shows all changes and admin actions on a resource
 *
 * @param resourceType - Type of resource ("user", "batch", "subscription")
 * @param resourceId - ID of the resource
 * @param limit - Maximum number of entries to return (default 50)
 */
export async function getAuditTrail(
  resourceType: string,
  resourceId: string,
  limit: number = 50
) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        resourceType,
        resourceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return logs.map(log => ({
      id: log.id,
      action: log.action,
      userId: log.userId,
      changes: JSON.parse(log.changes),
      createdAt: log.createdAt,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    }))
  } catch (error) {
    console.error('[Audit Trail Error]', {
      resourceType,
      resourceId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return []
  }
}

/**
 * Clean up expired audit logs (older than 90 days)
 * Should be run daily via cron job or scheduled task
 *
 * @returns Number of deleted audit logs
 */
export async function cleanupExpiredAuditLogs(): Promise<number> {
  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    if (result.count > 0) {
      console.log(`[Audit Log Cleanup] Deleted ${result.count} expired audit logs`)
    }

    return result.count
  } catch (error) {
    console.error('[Audit Cleanup Error]', error)
    return 0
  }
}

/**
 * Track changes between two objects
 * Returns a structured diff for audit trails
 *
 * @param before - Object before changes
 * @param after - Object after changes
 * @returns Object with changed fields
 */
export function diffObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Record<string, unknown> {
  const changes: Record<string, unknown> = {}
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of allKeys) {
    const beforeValue = before[key]
    const afterValue = after[key]

    // Only include if values differ
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes[key] = {
        before: beforeValue,
        after: afterValue,
      }
    }
  }

  return changes
}

/**
 * Check if a batch is soft deleted
 *
 * @param batchId - Batch ID to check
 * @returns true if batch is deleted
 */
export async function isBatchDeleted(batchId: string): Promise<boolean> {
  try {
    const batch = await prisma.migrationBatch.findUnique({
      where: { id: batchId },
      select: { deletedAt: true },
    })

    return batch?.deletedAt !== null
  } catch {
    return false
  }
}

/**
 * Get all non-deleted batches for a user
 * Filters out soft-deleted batches
 *
 * @param userId - User ID
 * @param limit - Maximum results
 */
export async function getUserActiveBatches(userId: string, limit: number = 50) {
  try {
    const batches = await prisma.migrationBatch.findMany({
      where: {
        userId,
        deletedAt: null, // Only active batches
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return batches
  } catch (error) {
    console.error('[Get Active Batches Error]', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return []
  }
}

/**
 * Log structured audit event with context
 * Used for important operations like admin actions
 *
 * @param params - Audit event parameters
 */
export async function logAuditEvent(params: {
  action: string
  adminId: string
  targetUserId?: string
  targetResourceId?: string
  resourceType: string
  status: 'success' | 'failure'
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  try {
    const changes = {
      action: params.action,
      status: params.status,
      timestamp: new Date().toISOString(),
      details: params.details,
    }

    if (params.targetResourceId) {
      await createAuditLog({
        action: params.action,
        userId: params.adminId,
        resourceType: params.resourceType,
        resourceId: params.targetResourceId,
        changes,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      })
    }
  } catch (error) {
    console.error('[Audit Event Log Error]', {
      action: params.action,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
