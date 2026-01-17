
import React, { useState, useEffect } from 'react';
import { User, Ticket, TicketComment, TicketStatus, TicketPriority } from '../types';
import { getTickets, getComments, addComment } from '../services/mockData';

interface TicketDetailProps {
  ticketId: string;
  currentUser: User;
  onBack: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, currentUser, onBack }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const all = getTickets();
    const found = all.find(t => t.id === ticketId);
    if (found) {
      // Check permission
      if (found.userId !== currentUser.id) {
         onBack();
         return;
      }
      setTicket(found);
      setComments(getComments(ticketId));
    }
  }, [ticketId, currentUser.id, onBack]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: TicketComment = {
      id: `comm_${Date.now()}`,
      ticketId: ticketId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: newComment,
      createdAt: new Date().toISOString(),
      isAdmin: false
    };

    addComment(comment);
    setComments([...comments, comment]);
    setNewComment('');
  };

  if (!ticket) return <div className="p-8 text-center">Loading...</div>;

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.NEW: return 'bg-blue-100 text-blue-800';
      case TicketStatus.IN_REVIEW: return 'bg-purple-100 text-purple-800';
      case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
      case TicketStatus.WAITING_ON_CLIENT: return 'bg-red-100 text-red-800';
      case TicketStatus.COMPLETED: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (p: TicketPriority) => {
    switch (p) {
      case TicketPriority.HIGH: return 'text-red-600';
      case TicketPriority.NORMAL: return 'text-blue-600';
      case TicketPriority.LOW: return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm">Ticket ID: <span className="font-mono font-bold">#{ticket.id}</span> • Submitted {new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-50 pb-2">Description</h2>
            <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {/* Activity Log & Communication */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Activity Log & Communication
            </h2>
            
            <div className="space-y-6 mb-8">
              {comments.map((comment) => (
                <div key={comment.id} className={`flex flex-col ${comment.isAdmin ? 'items-start' : 'items-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    comment.isAdmin 
                      ? 'bg-gray-100 text-gray-800 rounded-tl-none' 
                      : 'bg-blue-600 text-white rounded-tr-none shadow-md'
                  }`}>
                    <div className="flex justify-between items-center mb-1 gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        {comment.isAdmin ? comment.authorName : 'You'}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-gray-400 text-sm italic py-4">No comments yet.</p>
              )}
            </div>

            <form onSubmit={handlePostComment} className="border-t border-gray-100 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Add a follow-up comment</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4"
                placeholder="Type your message here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status History Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Status History</h2>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {ticket.statusHistory && ticket.statusHistory.length > 0 ? (
                ticket.statusHistory.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[1.375rem] top-1.5 w-3 h-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className={`text-sm font-bold ${idx === 0 ? 'text-gray-900' : 'text-gray-500'}`}>{entry.status}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(entry.changedAt).toLocaleString()} by {entry.changedBy}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No history available</p>
              )}
            </div>
          </div>

          {/* Request Metadata Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Request Metadata</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">COMPANY</p>
                <p className="text-sm font-semibold text-gray-900">{ticket.companyName || 'N/A'}</p>
              </div>
              {ticket.websiteUrl && (
                <div>
                  <p className="text-xs text-gray-400 font-medium">WEBSITE</p>
                  <a href={ticket.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                    {ticket.websiteUrl}
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 font-medium">CONTACT PERSON</p>
                <p className="text-sm font-semibold text-gray-900">{ticket.contactPerson || 'N/A'}</p>
              </div>
              {ticket.deadline && (
                <div>
                  <p className="text-xs text-gray-400 font-medium">REQUESTED DEADLINE</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(ticket.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="pt-2 border-t border-gray-50"></div>
              <div>
                <p className="text-xs text-gray-400 font-medium">TYPE</p>
                <p className="text-sm font-semibold text-gray-900">{ticket.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">PRIORITY</p>
                <p className={`text-sm font-bold ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">LATEST UPDATE</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium mb-2">ATTACHMENTS</p>
                {ticket.attachments && ticket.attachments.length > 0 ? (
                  <ul className="space-y-2">
                    {ticket.attachments.map((file, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="truncate">{file}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-xs italic">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    No files attached
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Support Policy</h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Standard requests are addressed within 24-48 business hours. High priority requests are prioritized for immediate review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
