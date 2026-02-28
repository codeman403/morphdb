import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';
import { anonymizeIpAddress, maskUserAgent } from '@/lib/pii-utils';
import { sendEmail, getTrialEndingReminderEmailHTML } from '@/lib/email';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);

/**
 * Sends trial ending reminder emails to users whose trials end today
 * Can be triggered manually by admins or via a scheduled job
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const ip = getClientIp(req.headers);

  const logContext = {
    timestamp: new Date().toISOString(),
    requestId,
    level: 'info',
    action: 'admin_send_trial_reminders',
    ipAddress: anonymizeIpAddress(ip),
    userAgent: maskUserAgent(req.headers.get('user-agent') ?? undefined),
  };

  try {
     const { ok } = await rateLimit(`admin-trial-reminder:${ip}`, 5, 60_000);
     if (!ok) {
       return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
     }

     const supabase = await createClient();
     const { data: { user } } = await supabase.auth.getUser();

     // Check if this is an authenticated admin OR if it's a cron job with valid secret
     const cronSecret = process.env.CRON_SECRET;
     const authHeader = req.headers.get('authorization');
     const isValidCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
     const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? '');

     if (!isValidCron && !isAdmin) {
       console.log(JSON.stringify({
         ...logContext,
         level: 'warn',
         action: 'admin_trial_reminder_unauthorized',
         userEmail: user?.email,
       }));
       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
     }

     // Get the optional userId from the request body
     let userId: string | undefined;
     try {
       const body = await req.json();
       userId = body.userId;
     } catch {
       // If no body, that's fine - we'll do batch sending
     }

     let subscriptionsToRemind;

     if (userId) {
       // Send to a specific user
       subscriptionsToRemind = await prisma.subscription.findMany({
         where: {
           userId,
         },
       });
     } else {
       // Find all users with trials ending today (batch mode)
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       
       const tomorrow = new Date(today);
       tomorrow.setDate(tomorrow.getDate() + 1);

       subscriptionsToRemind = await prisma.subscription.findMany({
         where: {
           status: 'active',
           plan: 'free',
           trialEndsAt: {
             gte: today,
             lt: tomorrow,
           },
         },
       });
     }

     console.log(JSON.stringify({
       ...logContext,
       level: 'info',
       action: 'found_expiring_trials',
       count: subscriptionsToRemind.length,
       isBatch: !userId,
     }));

     let successCount = 0;
     let failureCount = 0;
     const failedEmails: string[] = [];

     // Send reminder emails to each subscription
     for (const subscription of subscriptionsToRemind) {
      try {
        const profile = await prisma.profile.findUnique({
          where: { id: subscription.userId },
        });

        if (!profile || !profile.email) {
          failureCount++;
          console.warn(`[Trial Reminder] Profile not found for user ${subscription.userId}`);
          continue;
        }

        const emailResult = await sendEmail({
          to: profile.email,
          subject: 'Your MorphDB Trial Ends Today! ⏰',
          html: getTrialEndingReminderEmailHTML(profile.name ?? undefined),
        });

        if (emailResult.success) {
          successCount++;
        } else {
          failureCount++;
          failedEmails.push(profile.email);
          console.error(`[Trial Reminder Email Error]`, emailResult.error);
        }
      } catch (e) {
        failureCount++;
        console.error(`[Trial Reminder Processing Error]`, e);
      }
    }

    // Log audit trail
    if (isAdmin) {
      await createAuditLog({
        action: 'send_trial_reminders',
        userId: user!.id,
        resourceType: 'email_batch',
        resourceId: requestId,
        changes: {
          totalUsers: subscriptionsToRemind.length,
          successCount,
          failureCount,
          failedEmails,
        },
        ipAddress: ip,
        userAgent: req.headers.get('user-agent') ?? undefined,
      }).catch(() => {
        // Don't fail if audit log fails
      });
    }

    console.log(JSON.stringify({
      ...logContext,
      level: 'info',
      action: 'admin_trial_reminders_complete',
      adminId: isAdmin ? user!.id : 'cron',
      totalUsers: subscriptionsToRemind.length,
      successCount,
      failureCount,
      failedEmails,
      durationMs: Date.now() - startTime,
    }));

    return NextResponse.json({
      success: true,
      message: 'Trial reminder emails sent',
      stats: {
        totalUsers: subscriptionsToRemind.length,
        successCount,
        failureCount,
        failedEmails: failureCount > 0 ? failedEmails : undefined,
      },
    });
  } catch (e) {
    console.error('[Send Trial Reminders Error]', {
      requestId,
      error: e instanceof Error ? e.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json(
      { error: 'Failed to send trial reminder emails' },
      { status: 500 }
    );
  }
}
