import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    console.log('Sending test email via Resend...');
    console.log('Using API Key ending in:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(-4) : 'NOT FOUND');
    
    // Using a verified sender email or testing with resend's default
    const fromEmail = 'onboarding@resend.dev'; // Resend's testing domain
    
    const data = await resend.emails.send({
      from: fromEmail,
      to: 'delivered@resend.dev', // Resend's testing recipient
      subject: 'Test Email from MorphDB Local',
      html: '<h1>It Works!</h1><p>Your local email setup is working perfectly.</p>'
    });
    
    console.log('Success!', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendTestEmail();
