import { Resend } from 'resend';

// Lazy-load Resend to avoid initialization errors during build
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || process.env.RESEND_TEST_EMAIL || 'noreply@morphdb.ai';
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@morphdb.ai';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 * 
 * Note: If using Resend in test/sandbox mode, emails can only be sent to your 
 * verified email address. For production, verify your domain at resend.com/domains
 * and upgrade to a paid plan.
 */
export async function sendEmail(options: EmailOptions) {
  try {
    // Don't send emails in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && process.env.SEND_EMAILS_IN_DEV !== 'true') {
      console.log('📧 Email would be sent in production:', {
        to: options.to,
        subject: options.subject,
      });
      return { success: true, isDryRun: true };
    }

    const resend = getResendClient();
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || SUPPORT_EMAIL,
    });

    if (response.error) {
      console.error('❌ Email send failed:', response.error);
      
      // Check if it's a test mode limitation
      if (response.error.message?.includes('testing emails')) {
        console.error('⚠️ Resend is in test/sandbox mode. Verify your domain at resend.com/domains');
      }
      
      return { success: false, error: response.error };
    }

    console.log('✅ Email sent successfully:', response.data?.id);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Email template: Welcome email for new users
 */
export function getWelcomeEmailHTML(userName: string | undefined) {
  const displayName = userName || 'there';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MorphDB! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p>Welcome to MorphDB, your AI Co-Pilot for Database Migrations. We're excited to have you on board!</p>
            <p>Here's what you can do with MorphDB:</p>
            <ul>
              <li>🔄 Translate legacy SQL dialects (SQL Server, Oracle, MySQL, PostgreSQL)</li>
              <li>☁️ Convert to modern data warehouses (Snowflake, BigQuery, PostgreSQL, Redshift)</li>
              <li>📊 Maintain complete audit trails of all migrations</li>
              <li>🛡️ Leverage AI to handle complex translations</li>
            </ul>
            <p><strong>Get started:</strong> You have a free 3-day trial to explore all Pro features.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/dashboard" class="cta-button">Go to Dashboard</a>
            <p style="margin-top: 30px; font-size: 14px;">Need help? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/support">support page</a>.</p>
          </div>
          <div class="footer">
            <p>© 2026 MorphDB. All rights reserved.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}">Visit MorphDB</a> | <a href="#">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: Trial started confirmation
 */
export function getTrialStartedEmailHTML(userName: string | undefined) {
  const displayName = userName || 'there';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
          .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your 3-Day Trial is Active! 🚀</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p>Great news! Your free 3-day Pro trial has started. You now have access to all premium features.</p>
            <div class="highlight">
              <strong>⏰ Trial ends in:</strong> 3 days from now<br>
              <strong>🎁 Features unlocked:</strong> All Pro features at no cost
            </div>
            <h3>What you can do now:</h3>
            <ul>
              <li>✅ Unlimited SQL translations (up to Pro tier limits)</li>
              <li>✅ Batch migration support</li>
              <li>✅ Full migration history</li>
              <li>✅ Priority support</li>
            </ul>
            <p>When your trial ends, your account will revert to the Free tier unless you choose to subscribe.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/dashboard" class="cta-button">Start Translating</a>
          </div>
          <div class="footer">
            <p>© 2026 MorphDB. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: Trial expiring soon warning
 */
export function getTrialExpiringEmailHTML(userName: string | undefined, hoursRemaining: number) {
  const displayName = userName || 'there';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
          .highlight { background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Trial is Expiring Soon ⏳</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <div class="highlight">
              <strong>⚠️ Only ${hoursRemaining} hours remaining!</strong><br>
              Your free trial will expire and you'll return to the Free tier.
            </div>
            <p>Don't lose access to Pro features. Subscribe now to continue enjoying:</p>
            <ul>
              <li>✅ Unlimited translations</li>
              <li>✅ Batch operations</li>
              <li>✅ Full history & audit trails</li>
              <li>✅ Priority support</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/#pricing" class="cta-button">View Plans & Subscribe</a>
          </div>
          <div class="footer">
            <p>© 2026 MorphDB. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: Subscription activated
 */
export function getSubscriptionActivatedEmailHTML(userName: string | undefined, planName: string) {
  const displayName = userName || 'there';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
          .highlight { background: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${planName}! 🎊</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p>Thank you for subscribing to the ${planName} plan. Your subscription is now active!</p>
            <div class="highlight">
              <strong>✅ Subscription Active</strong><br>
              Plan: ${planName}<br>
              Billing: Monthly
            </div>
            <p>You now have full access to all ${planName} features:</p>
            <ul>
              <li>✅ Higher translation limits</li>
              <li>✅ Priority support</li>
              <li>✅ Advanced features</li>
              <li>✅ Regular updates</li>
            </ul>
            <p>Your invoice has been sent separately. You'll be charged on the same date each month.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/dashboard" class="cta-button">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>© 2026 MorphDB. All rights reserved.</p>
            <p>Questions? <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/support">Contact Support</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: Support ticket confirmation
 */
export function getSupportTicketEmailHTML(userName: string | undefined, ticketId: string, subject: string) {
  const displayName = userName || 'there';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .highlight { background: #f3e8ff; padding: 15px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
          .ticket-id { font-family: monospace; background: #e9d5ff; padding: 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Support Ticket Received ✓</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p>Thank you for reaching out to MorphDB support. We've received your ticket and our team will review it shortly.</p>
            <div class="highlight">
              <strong>Ticket Information</strong><br>
              <strong>ID:</strong> <span class="ticket-id">${ticketId}</span><br>
              <strong>Subject:</strong> ${subject}<br>
              <strong>Status:</strong> Open
            </div>
            <p>We typically respond to support tickets within 24 hours. Keep this email for your records, and reference the ticket ID when following up.</p>
            <p>In the meantime, check out our <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/docs">documentation</a> for helpful guides.</p>
          </div>
          <div class="footer">
            <p>© 2026 MorphDB. All rights reserved.</p>
            <p>Ticket ID: ${ticketId}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: Batch migration completion
 */
export function getBatchCompletionEmailHTML(userName: string | undefined, batchId: string, successCount: number, failureCount: number) {
  const displayName = userName || 'there';
  const totalCount = successCount + failureCount;
  const successRate = Math.round((successCount / totalCount) * 100);
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .stat-box { background: white; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #e5e7eb; }
          .stat-number { font-size: 24px; font-weight: bold; color: #10b981; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Batch Migration Complete! ✅</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p>Your batch migration has finished processing. Here's the summary:</p>
            <div class="stats">
              <div class="stat-box">
                <div class="stat-number">${successCount}</div>
                <div class="stat-label">Successfully Migrated</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${failureCount}</div>
                <div class="stat-label">Failed</div>
              </div>
            </div>
            <p style="text-align: center; font-size: 16px; color: #10b981;">
              <strong>Success Rate: ${successRate}%</strong>
            </p>
            <p>View the detailed results and download your translated SQL in your dashboard.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/dashboard/history" class="cta-button">View Results</a>
          </div>
          <div class="footer">
            <p>© 2026 MorphDB. All rights reserved.</p>
            <p>Batch ID: ${batchId}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: Admin notification for new support ticket
 */
export function getAdminSupportNotificationEmailHTML(ticketId: string, subject: string, userEmail: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #374151; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .ticket-id { font-family: monospace; background: #e5e7eb; padding: 8px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Support Ticket</h1>
          </div>
          <div class="content">
            <p><strong>New support ticket requires attention</strong></p>
            <p>
              <strong>Ticket ID:</strong> <span class="ticket-id">${ticketId}</span><br>
              <strong>Subject:</strong> ${subject}<br>
              <strong>From:</strong> ${userEmail}
            </p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/dashboard/admin">View in Admin Panel</a></p>
          </div>
          <div class="footer">
            <p>MorphDB Admin Notification</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getTicketStatusUpdateEmailHTML(userName: string | undefined, ticketId: string, newStatus: string) {
  const statusMessages: Record<string, string> = {
    'open': 'has been received and is awaiting review',
    'in_progress': 'is now being reviewed by our support team',
    'resolved': 'has been resolved',
    'closed': 'has been closed',
  };
  const message = statusMessages[newStatus] || 'has been updated';
  const displayName = userName || 'there';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .status-badge { display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; border-radius: 4px; font-weight: bold; text-transform: capitalize; }
          .ticket-info { background: white; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .cta { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Support Ticket Updated</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p>Your support ticket <span class="status-badge">${newStatus}</span> ${message}.</p>
            <div class="ticket-info">
              <strong>Ticket ID:</strong> ${ticketId}<br>
              <strong>Status:</strong> <span class="status-badge">${newStatus}</span>
            </div>
             <p>If you have any questions or need further assistance, please reply to this email or contact our support team.</p>
             <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/dashboard" class="cta">View Your Tickets</a>
           </div>
           <div class="footer">
             <p>© 2025 MorphDB. All rights reserved.</p>
           </div>
         </div>
       </body>
     </html>
   `;
}

export function getSubscriptionCancelledEmailHTML(userName: string | undefined) {
  const displayName = userName || 'there';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #ef4444; border-radius: 4px; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .cta { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; }
          .secondary-cta { display: inline-block; margin-left: 10px; padding: 12px 24px; background: #e5e7eb; color: #333; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Cancelled</h1>
          </div>
          <div class="content">
            <p>Hi ${displayName},</p>
            <p>Your MorphDB subscription has been cancelled. You will lose access to Pro features at the end of your current billing period.</p>
            <div class="info-box">
              <p><strong>We're sorry to see you go!</strong></p>
              <p>If you cancelled by mistake or have concerns about your account, please don't hesitate to reach out to our support team. We'd love to help!</p>
            </div>
            <p>You can still use the free tier with limited functionality. If you'd like to upgrade again in the future, just visit your dashboard.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://morphdb.ai'}/dashboard" class="cta">Back to Dashboard</a>
             <a href="mailto:${SUPPORT_EMAIL}" class="secondary-cta">Contact Support</a>
           </div>
           <div class="footer">
             <p>© 2025 MorphDB. All rights reserved.</p>
           </div>
         </div>
       </body>
     </html>
   `;
}
