import React, { useState } from 'react';
import {
  Search,
  Filter,
  Flame,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ChevronRight,
  Shield,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Ticket, TicketType, TicketStatus, Priority, User as UserType } from '../../types/itsm';

interface TicketListViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onOpenCreateTicket: () => void;
  onRefresh: () => void;
  currentUser: UserType;
  filterTitle?: string;
}

export const TicketListView: React.FC<TicketListViewProps> = ({
  tickets,
  onSelectTicket,
  onOpenCreateTicket,
  onRefresh,
  currentUser,
  filterTitle = 'All Tickets & Requests',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    if (selectedType !== 'ALL' && t.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    if (selectedGroup !== 'ALL' && t.assignmentGroupName !== selectedGroup) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = t.ticketNumber.toLowerCase().includes(q);
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchReq = t.requesterName.toLowerCase().includes(q);
      const matchTech = t.assignedToName?.toLowerCase().includes(q);
      const matchCat = t.categoryName?.toLowerCase().includes(q);
      const matchAsset = t.assetTag?.toLowerCase().includes(q);
      return matchNum || matchSub || matchReq || matchTech || matchCat || matchAsset;
    }
    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">NEW</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">ASSIGNED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">IN PROGRESS</span>;
      case 'PENDING':
      case 'AWAITING_USER':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">PENDING</span>;
      case 'AWAITING_APPROVAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-pink-100 text-pink-800 border border-pink-200">APPROVAL</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const formatSLATimer = (seconds?: number, slaState?: string) => {
    if (slaState === 'MET') {
      return (
        <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" /> SLA Met
        </span>
      );
    }
    if (slaState === 'BREACHED' || (seconds !== undefined && seconds <= 0)) {
      return (
        <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
          <AlertTriangle className="w-3 h-3 mr-1" /> Breached
        </span>
      );
    }
    if (seconds === undefined) return <span className="text-slate-400 text-xs">-</span>;

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const formatted = `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;

    if (seconds <= 1800) {
      return (
        <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
          <Clock className="w-3 h-3 mr-1 text-amber-600 animate-spin" /> {formatted} (At Risk)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
        <Clock className="w-3 h-3 mr-1 text-slate-500" /> {formatted} remaining
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{filterTitle}</h2>
          <p className="text-xs text-slate-500">
            Total {filteredTickets.length} records matching current filter criteria
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCreateTicket}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Search by Ticket #, Subject, Requester, Asset Tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-blue-600"
            >
              <option value="ALL">Type: All Types</option>
              <option value="INCIDENT">Incidents</option>
              <option value="SERVICE_REQUEST">Service Requests</option>
              <option value="ACCESS_REQUEST">Access Requests</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-blue-600"
            >
              <option value="ALL">Priority: All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-blue-600"
            >
              <option value="ALL">Status: All</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="AWAITING_APPROVAL">Awaiting Approval</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No Tickets Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No service tickets match your selected filters. Try clearing search filters or raise a new request.
            </p>
            <button
              onClick={() => {
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setSelectedPriority('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">SLA Timer</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Assigned Team & Tech</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => {
                  const isIncident = ticket.type === 'INCIDENT';
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      {/* Ticket Number & Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          {isIncident ? (
                            <Flame className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Layers className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          <span className="font-mono font-bold text-blue-900 group-hover:underline">
                            {ticket.ticketNumber}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-600 uppercase font-semibold">
                          {ticket.categoryName || 'General'}
                        </span>
                      </td>

                      {/* Subject & Summary */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <p className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700">
                          {ticket.subject}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                          {ticket.description}
                        </p>
                        {ticket.assetTag && (
                          <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            Asset: {ticket.assetTag}
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>

                      {/* SLA Timer */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {formatSLATimer(ticket.slaRemainingSeconds, ticket.slaState)}
                      </td>

                      {/* Requester */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{ticket.requesterName}</p>
                        <p className="text-[11px] text-slate-600">{ticket.departmentName || 'CSC Ops'}</p>
                      </td>

                      {/* Assigned Group & Tech */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-800">
                          {ticket.assignmentGroupName || 'Unassigned'}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {ticket.assignedToName ? `Tech: ${ticket.assignedToName}` : 'No Engineer Assigned'}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTicket(ticket);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-semibold transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
