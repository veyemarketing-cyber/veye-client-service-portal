
import React, { useState, useEffect } from 'react';
import { User, Ticket, TicketStatus } from '../types';
import { getTickets } from '../services/mockData';

interface DashboardProps {
  currentUser: User;
  onViewTicket: (id: string) => void;
  onCreateTicket: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onViewTicket, onCreateTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    // Only fetch tickets belonging to the current user
    const all = getTickets();
    setTickets(all.filter(t => t.userId === currentUser.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, [currentUser.id]);

  const stats = {
    total: tickets.length,
    active: tickets.filter(t => t.status !== TicketStatus.COMPLETED).length,
    completed: tickets.filter(t => t.status === TicketStatus.COMPLETED).length
  };

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser.name}</h1>
          <p className="text-gray-500">Managing service requests for {currentUser.companyName}</p>
        </div>
        <button 
          onClick={onCreateTicket}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit a Service Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Tasks</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Recent Service Requests</h2>
        </div>
        {tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-6 py-3">Ticket ID</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewTicket(ticket.id)}>
                    <td className="px-6 py-4 text-sm font-mono font-medium text-blue-600">#{ticket.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">{ticket.title}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{ticket.description.substring(0, 40)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500">{ticket.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">No requests found. Click the button above to start your first request.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
