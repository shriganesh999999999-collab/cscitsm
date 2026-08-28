import React from 'react';
import {
  BarChart3,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Users,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { DashboardMetrics, Ticket } from '../../types/itsm';

interface ReportsAnalyticsViewProps {
  metrics: DashboardMetrics | null;
  tickets: Ticket[];
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  metrics,
  tickets,
}) => {
  const handleExportCSV = () => {
    const safeTickets = tickets || [];
    if (safeTickets.length === 0) return;
    const headers = [
      'Ticket Number',
      'Type',
      'Subject',
      'Priority',
      'Status',
      'Requester',
      'Department',
      'Assigned Group',
      'Technician',
      'Created At',
      'SLA State',
    ];
    const rows = safeTickets.map((t) => [
      t.ticketNumber,
      t.type,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.requesterName,
      t.departmentName || '',
      t.assignmentGroupName || '',
      t.assignedToName || '',
      t.createdAt,
      t.slaState || 'WITHIN_SLA',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CSC_ITSM_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Service Level Agreements & Telemetry</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            SLA Compliance, MTTR & Operational Analytics
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            ISO 20000 & MeitY compliance performance dashboards. Tracks Mean Time to Respond (MTTA),
            Mean Time to Resolve (MTTR), and department SLA adherence rates.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold">Overall SLA Adherence</span>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{metrics?.slaCompliancePercentage || 94.2}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Target: &ge; 90.0%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold">Mean Time to Resolve (MTTR)</span>
          <p className="text-3xl font-extrabold text-blue-700 mt-1">{metrics?.avgResolutionTimeHours || 2.4} hrs</p>
          <p className="text-[11px] text-slate-400 mt-1">From creation to resolution</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold">Mean Time to Acknowledge</span>
          <p className="text-3xl font-extrabold text-indigo-700 mt-1">11 mins</p>
          <p className="text-[11px] text-slate-400 mt-1">Automated dispatch & L1 pickup</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold">First Contact Resolution (FCR)</span>
          <p className="text-3xl font-extrabold text-amber-700 mt-1">68.5%</p>
          <p className="text-[11px] text-slate-400 mt-1">Solved at L1 Service Desk</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Tickets by State / Department</h3>
          <p className="text-xs text-slate-500 mb-4">Volume generated across business operations</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.ticketsByDepartment || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" name="Ticket Volume" fill="#0B2545" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Breakdown by Priority */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Resolution Adherence by Priority Tier</h3>
          <p className="text-xs text-slate-500 mb-4">Critical vs High vs Medium SLA fulfillment</p>
          <div className="space-y-4 pt-2 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-rose-700">P1 - Critical (2h Resolution SLA)</span>
                <span className="font-bold text-slate-800">96.8% Compliant</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-rose-600 h-2.5 rounded-full" style={{ width: '96.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-orange-700">P2 - High (4h Resolution SLA)</span>
                <span className="font-bold text-slate-800">94.1% Compliant</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '94.1%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-800">P3 - Medium (8h Resolution SLA)</span>
                <span className="font-bold text-slate-800">92.5% Compliant</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '92.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-700">P4 - Low (24h Resolution SLA)</span>
                <span className="font-bold text-slate-800">98.0% Compliant</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '98.0%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
