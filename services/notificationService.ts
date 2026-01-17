
import { Ticket, TicketComment, User } from '../types';
import { addComment } from './mockData';

/**
 * Simulates sending a notification to external platforms like Microsoft Teams.
 * In a production environment, this would call a Webhook URL.
 */
export const triggerExternalNotifications = async (ticket: Ticket) => {
  console.log(`[INTEGRATION] Sending notification to Microsoft Teams Channel...`);
  console.log(`[TEAMS PAYLOAD]: New Ticket #${ticket.id} - ${ticket.title} (Priority: ${ticket.priority})`);
  
  // Example of how a fetch call to a Teams Webhook would look:
  /*
  await fetch('https://outlook.office.com/webhook/...', {
    method: 'POST',
    body: JSON.stringify({
      "@type": "MessageCard",
      "summary": "New Service Request",
      "sections": [{
        "activityTitle": `New Ticket: ${ticket.title}`,
        "facts": [
          { "name": "Company", "value": ticket.companyName },
          { "name": "Contact", "value": ticket.contactPerson },
          { "name": "Priority", "value": ticket.priority }
        ]
      }]
    })
  });
  */
};

/**
 * Generates the automated system response for new tickets.
 */
export const sendAutomatedResponse = (ticketId: string) => {
  const autoReply: TicketComment = {
    id: `auto_${Date.now()}`,
    ticketId: ticketId,
    authorId: 'system',
    authorName: 'Veye Support System',
    text: "Thank you for submitting your request. One of our team members will contact you shortly.",
    createdAt: new Date().toISOString(),
    isAdmin: true
  };
  addComment(autoReply);
};
