
/**
 * Veye Media Routed Intake API
 * Endpoint: /api/intake
 * 
 * Handles incoming service requests and routes them to Email and/or Microsoft Teams.
 */

export const config = {
  maxDuration: 10, // Seconds
};

export default async function handler(req: any, res: any) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  try {
    const { 
      fullName, 
      organization, 
      email, 
      message, 
      deliveryPreference,
      priority = 'Normal',
      deadline = 'Not specified'
    } = req.body;

    // 2. Validate required fields
    if (!fullName || !organization || !email || !message || !deliveryPreference) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Missing required fields: fullName, organization, email, message, deliveryPreference' 
      });
    }

    // Sanitize inputs
    const cleanName = String(fullName).trim();
    const cleanOrg = String(organization).trim();
    const cleanEmail = String(email).trim();
    const cleanMsg = String(message).trim();

    const results: any[] = [];

    // 3. Route to Microsoft Teams if preferred
    if (deliveryPreference === 'teams' || deliveryPreference === 'both') {
      const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.error('Missing TEAMS_WEBHOOK_URL environment variable');
      } else {
        const teamsPayload = {
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "themeColor": priority === 'High' ? "FF0000" : "0078D7",
          "summary": "New Veye Media Service Request",
          "sections": [{
            "activityTitle": `New Service Request: ${cleanOrg}`,
            "activitySubtitle": `Submitted by ${cleanName}`,
            "facts": [
              { "name": "Company", "value": cleanOrg },
              { "name": "Contact", "value": cleanName },
              { "name": "Email", "value": cleanEmail },
              { "name": "Priority", "value": priority },
              { "name": "Deadline", "value": deadline }
            ],
            "markdown": true,
            "text": `**Message / Request Details:**\n\n${cleanMsg}`
          }],
          "potentialAction": [{
            "@type": "OpenUri",
            "name": "View in Portal",
            "targets": [{ "os": "default", "uri": `https://${process.env.VERCEL_URL || 'portal.veyemedia.com'}` }]
          }]
        };

        const teamsRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamsPayload),
        });

        results.push({ service: 'teams', ok: teamsRes.ok });
      }
    }

    // 4. Route to Email if preferred
    if (deliveryPreference === 'email' || deliveryPreference === 'both') {
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@veyemedia.com';
      const toEmail = process.env.CONTACT_TO_EMAIL || 'vmccoy@veyemarketing.com';

      if (!resendKey) {
        console.error('Missing RESEND_API_KEY environment variable');
      } else {
        const emailBody = `
          <h2>New Service Request</h2>
          <p><strong>From:</strong> ${cleanName} (${cleanEmail})</p>
          <p><strong>Organization:</strong> ${cleanOrg}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Deadline:</strong> ${deadline}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${cleanMsg}</p>
        `;

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: `Veye Portal <${fromEmail}>`,
            to: [toEmail],
            subject: `[${priority}] Service Request: ${cleanOrg}`,
            html: emailBody,
          }),
        });

        results.push({ service: 'email', ok: emailRes.ok });
      }
    }

    // 5. Final Response
    return res.status(200).json({ 
      ok: true, 
      message: 'Intake routed successfully.',
      details: results 
    });

  } catch (error: any) {
    console.error('Intake API Error:', error);
    return res.status(500).json({ 
      ok: false, 
      message: 'Internal Server Error during routing.',
      error: error.message 
    });
  }
}
