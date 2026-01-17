
export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export enum TicketStatus {
  NEW = 'New',
  IN_REVIEW = 'In Review',
  IN_PROGRESS = 'In Progress',
  WAITING_ON_CLIENT = 'Waiting on Client',
  COMPLETED = 'Completed'
}

export enum TicketPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High'
}

export enum TicketType {
  WEBSITE_UPDATE = 'Website Update',
  CONTENT_CHANGE = 'Content Change',
  TECHNICAL_ISSUE = 'Technical Issue',
  SYSTEM_QUESTION = 'System Question',
  OTHER = 'Other'
}

export interface StatusHistoryEntry {
  status: TicketStatus;
  changedAt: string;
  changedBy: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyName: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  title: string;
  type: TicketType;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  websiteUrl: string;
  contactPerson: string;
  deadline: string;
  attachments?: string[];
  statusHistory: StatusHistoryEntry[];
}
