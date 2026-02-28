import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAuditEvent } from '@/lib/audit'
import { anonymizeIpAddress, maskUserAgent } from '@/lib/pii-utils'
import { getClientIp } from '@/lib/rate-limit'

/**
 * Cancel a batch migration in progress
 *
 * POST /api/migrate/batch/{batchId}/cancel
 *
 * Authorization: User must own the batch or be an admin
 * Effect: Marks batch status as CANCELLED, stops processing
 * Response: { success: true, cancelledCount: int, completedCount: int }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const ip = getClientIp(req.headers)

  const logContext = {
    timestamp: new Date().toISOString(),
    requestId,
    level: 'info' as const,
    action: 'batch_cancel_request',
    batchId,
    ipAddress: anonymizeIpAddress(ip),
    userAgent: maskUserAgent(req.headers.get('user-agent') ?? undefined),
  }

  try {
    // Authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn' as const,
        action: 'batch_cancel_auth_failed',
      }))
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    // Find the batch
    const batch = await prisma.migrationBatch.findUnique({
      where: { id: batchId },
      include: { results: { select: { id: true, status: true } } },
    })

    if (!batch) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn' as const,
        action: 'batch_not_found',
        userId: user.id,
      }))
      return NextResponse.json({ error: 'Batch not found.' }, { status: 404 })
    }

    // Authorization: User must own the batch or be admin
    const isAdmin = process.env.ADMIN_EMAILS?.split(',').includes(user.email || '')
    if (batch.userId !== user.id && !isAdmin) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn' as const,
        action: 'batch_cancel_unauthorized',
        userId: user.id,
        batchOwnerId: batch.userId,
      }))
      return NextResponse.json({ error: 'Not authorized to cancel this batch.' }, { status: 403 })
    }

    // Check if batch can be cancelled (only if processing)
    const completedCount = batch.results.filter(r => r.status === 'success' || r.status === 'error').length
    const pendingCount = batch.results.length - completedCount

    // If already fully processed, cannot cancel
    if (pendingCount === 0) {
      console.log(JSON.stringify({
        ...logContext,
        level: 'warn' as const,
        action: 'batch_cancel_already_completed',
        userId: user.id,
        completedCount,
      }))
      return NextResponse.json(
        { error: 'Cannot cancel a batch that has already completed processing.' },
        { status: 400 }
      )
    }

    // Mark batch as cancelled by updating any pending results
    await prisma.migrationResult.updateMany({
      where: {
        batchId,
        status: 'pending',
      },
      data: {
        status: 'cancelled',
      },
    })

    // Log the cancellation action
    await logAuditEvent({
      action: 'batch_cancelled',
      adminId: user.id,
      targetResourceId: batchId,
      resourceType: 'batch',
      status: 'success',
      details: {
        completedStatements: completedCount,
        cancelledStatements: pendingCount,
      },
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    })

    console.log(JSON.stringify({
      ...logContext,
      level: 'info' as const,
      action: 'batch_cancelled_successfully',
      userId: user.id,
      completedCount,
      cancelledCount: pendingCount,
      durationMs: Date.now() - startTime,
    }))

    return NextResponse.json({
      success: true,
      completedCount,
      cancelledCount: pendingCount,
      message: `Batch cancellation initiated. ${completedCount} statements were completed, ${pendingCount} cancelled.`,
    })
  } catch (e) {
    console.error('[Batch Cancel Error]', {
      requestId,
      batchId,
      error: e instanceof Error ? e.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    })
    return NextResponse.json({ error: 'Failed to cancel batch.' }, { status: 500 })
  }
}
