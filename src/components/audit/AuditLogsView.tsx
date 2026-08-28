import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Lock,
  User,
  Clock,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { AuditLog, User as UserType } from '../../types/itsm';

interface AuditLogsViewProps {
  logs: AuditLog[];
  currentUser: UserType;
  onRefresh: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  currentUser,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  const filteredLogs = (logs || []).filter((l) => {
    if (selectedModule !== 'ALL' && l.module !== selectedModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q) ||
        l.entityId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ISO 27001 & Compliance Registry</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Immutable Audit Trail & Activity Logs
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Cryptographically sealed event logs for all administrative actions, ticket status modifications,
            elevated access approvals, and configuration changes.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition-colors shrink-0"
          title="Refresh Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by User, Action, Entity ID, or change detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium w-full sm:w-auto"
        >
          <option value="ALL">All Audit Modules</option>
          <option value="TICKETS">Tickets & Incidents</option>
          <option value="ACCESS">Elevated Access (CSOC)</option>
          <option value="CHANGES">Change Management (CAB)</option>
          <option value="ASSETS">CMDB Assets</option>
          <option value="AUTH">Authentication & Sessions</option>
          <option value="ADMIN">System Configuration</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details / State Diff</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">
                    {log.userName}
                    <span className="block text-[10px] text-slate-400 font-mono">{log.userRole}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-900 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {log.entityId || '-'}
                  </td>
                  <td className="py-3 px-4 max-w-xs font-sans text-slate-700">
                    <p className="line-clamp-2">{log.details}</p>
                    {log.oldValue && log.newValue && (
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {log.oldValue} &rarr; <strong>{log.newValue}</strong>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                    {log.ipAddress || '10.140.20.10'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
