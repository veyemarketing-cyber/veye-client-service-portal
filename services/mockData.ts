
import { User, UserRole, Ticket, TicketStatus, TicketPriority, TicketType, TicketComment } from '../types';

export const initialUsers: User[] = [
  {
    id: 'user_1',
    email: 'demo@client.com',
    name: 'John Doe',
    role: UserRole.CLIENT,
    companyName: 'Acme Corp'
  },
  {
    id: 'user_2',
    email: 'admin@veye.com',
    name: 'Veye Admin',
    role: UserRole.ADMIN,
    companyName: 'Veye Media'
  }
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TIC-1024',
    userId: 'user_1',
    title: 'Update home page banner text',
    type: TicketType.WEBSITE_UPDATE,
    description: 'Please change the home page headline to: "Empowering Your Vision with Agentic AI".',
    priority: TicketPriority.NORMAL,
    status: TicketStatus.IN_PROGRESS,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    companyName: 'Acme Corp',
    websiteUrl: 'https://acme.com',
    contactPerson: 'John Doe',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    statusHistory: [
      { status: TicketStatus.NEW, changedAt: new Date(Date.now() - 86400000 * 2).toISOString(), changedBy: 'System' },
      { status: TicketStatus.IN_REVIEW, changedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), changedBy: 'Veye Admin' },
      { status: TicketStatus.IN_PROGRESS, changedAt: new Date(Date.now() - 3600000).toISOString(), changedBy: 'Veye Admin' },
    ]
  },
  {
    id: 'TIC-1025',
    userId: 'user_1',
    title: 'Broken login link on staging',
    type: TicketType.TECHNICAL_ISSUE,
    description: 'The login button on staging.acme.com leads to a 404 error.',
    priority: TicketPriority.HIGH,
    status: TicketStatus.NEW,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    companyName: 'Acme Corp',
    websiteUrl: 'https://staging.acme.com',
    contactPerson: 'John Doe',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    statusHistory: [
      { status: TicketStatus.NEW, changedAt: new Date().toISOString(), changedBy: 'System' }
    ]
  },
  {
    id: 'TIC-1020',
    userId: 'user_1',
    title: 'Q4 Performance Report Content',
    type: TicketType.CONTENT_CHANGE,
    description: 'The attached PDF contains the data for the Q4 landing page.',
    priority: TicketPriority.LOW,
    status: TicketStatus.COMPLETED,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    companyName: 'Acme Corp',
    websiteUrl: 'https://acme.com/reports',
    contactPerson: 'John Doe',
    deadline: new Date(Date.now() - 86400000 * 5).toISOString(),
    statusHistory: [
      { status: TicketStatus.NEW, changedAt: new Date(Date.now() - 86400000 * 10).toISOString(), changedBy: 'System' },
      { status: TicketStatus.COMPLETED, changedAt: new Date(Date.now() - 86400000 * 5).toISOString(), changedBy: 'Veye Admin' },
    ]
  }
];

const INITIAL_COMMENTS: TicketComment[] = [
  {
    id: 'c1',
    ticketId: 'TIC-1024',
    authorId: 'user_2',
    authorName: 'Support Agent',
    text: 'We are working on this now. Expected deployment in 2 hours.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isAdmin: true
  }
];

export const getTickets = (): Ticket[] => {
  const saved = localStorage.getItem('veye_tickets');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('veye_tickets', JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
};

export const saveTicket = (ticket: Ticket) => {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticket.id);
  if (index >= 0) {
    tickets[index] = ticket;
  } else {
    tickets.push(ticket);
  }
  localStorage.setItem('veye_tickets', JSON.stringify(tickets));
};

export const getComments = (ticketId: string): TicketComment[] => {
  const saved = localStorage.getItem('veye_comments');
  const allComments: TicketComment[] = saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  return allComments.filter(c => c.ticketId === ticketId);
};

export const addComment = (comment: TicketComment) => {
  const saved = localStorage.getItem('veye_comments');
  const allComments: TicketComment[] = saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  allComments.push(comment);
  localStorage.setItem('veye_comments', JSON.stringify(allComments));
};
