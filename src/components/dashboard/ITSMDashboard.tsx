import React from 'react';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Flame,
  ShieldAlert,
  HardDrive,
  GitPullRequest,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { DashboardMetrics, User } from '../../types/itsm';

interface ITSMDashboardProps {
  metrics: DashboardMetrics | null;
  onFilterTickets: (filter: { status?: string; priority?: string; type?: string }) => void;
  currentUser: User;
  onNavigate: (view: string) => void;
  onOpenCreateTicket: () => void;
}

export const ITSMDashboard: React.FC<ITSMDashboardProps> = ({
  metrics,
  onFilterTickets,
  currentUser,
  onNavigate,
  onOpenCreateTicket,
}) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        <Activity className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        Loading ITSM Telemetry & Metrics...
      </div>
    );
  }

  const statCards = [
    {
      title: 'Open Tickets',
      value: metrics.openTickets,
      subtext: `${metrics.newTickets} New, ${metrics.inProgressTickets} In Progress`,
      icon: Inbox,
      color: 'from-blue-600 to-blue-700',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50/70 border-blue-200',
      action: () => onFilterTickets({ status: 'ALL' }),
    },
    {
      title: 'Critical & High Priority',
      value: metrics.criticalTickets + metrics.highPriorityTickets,
      subtext: `${metrics.criticalTickets} Critical, ${metrics.highPriorityTickets} High`,
      icon: Flame,
      color: 'from-rose-600 to-rose-700',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50/70 border-rose-200',
      action: () => onFilterTickets({ priority: 'CRITICAL' }),
    },
    {
      title: 'SLA Breached / At Risk',
      value: metrics.slaBreached + metrics.slaAtRisk,
      subtext: `${metrics.slaBreached} Breached, ${metrics.slaAtRisk} <30m remaining`,
      icon: AlertTriangle,
      color: 'from-amber-600 to-amber-700',
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50/70 border-amber-200',
      action: () => onFilterTickets({ status: 'IN_PROGRESS' }),
    },
    {
      title: 'Resolved & Closed',
      value: metrics.resolvedTickets + metrics.closedTickets,
      subtext: `${metrics.slaCompliancePercentage}% SLA Compliance Rate`,
      icon: CheckCircle2,
      color: 'from-emerald-600 to-emerald-700',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50/70 border-emerald-200',
      action: () => onFilterTickets({ status: 'RESOLVED' }),
    },
  ];

  const secondaryCards = [
    {
      title: 'Pending Approvals',
      value: metrics.pendingApprovals,
      label: 'Access & Change RFCs',
      icon: CheckSquare,
      view: 'approvals',
      color: 'text-indigo-600',
    },
    {
      title: 'Active Changes (CAB)',
      value: metrics.activeChanges,
      label: 'Maintenance Windows',
      icon: GitPullRequest,
      view: 'changes',
      color: 'text-amber-600',
    },
    {
      title: 'Open Problems (RCA)',
      value: metrics.openProblems,
      label: 'Known Error Database',
      icon: AlertOctagon,
      view: 'problems',
      color: 'text-purple-600',
    },
    {
      title: 'Monitored Assets',
      value: metrics.activeAssets,
      label: 'Servers, DBs & Network',
      icon: HardDrive,
      view: 'assets',
      color: 'text-cyan-600',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl shadow-sm border border-[#1C5494] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Activity className="w-4 h-4" />
            <span>IT Operations Control Centre</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            National Data Centre (NDC) and State Data Centre (SDC) core systems are running optimally.
            Average resolution time is currently <strong className="text-white">{metrics.avgResolutionTimeHours} hours</strong> with{' '}
            <strong className="text-white">{metrics.slaCompliancePercentage}%</strong> SLA compliance.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold border border-white/20 transition-all"
          >
            SLA Compliance Report
          </button>
          <button
            onClick={onOpenCreateTicket}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4" /> Raise Incident
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`p-4 rounded-xl border ${card.bgColor} shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 group relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600">{card.title}</p>
                  <p className={`text-3xl font-extrabold mt-1 tracking-tight ${card.textColor}`}>
                    {card.value}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">{card.subtext}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-200/60 group-hover:scale-105 transition-transform">
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Click to filter tickets</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Governance Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {secondaryCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(item.view)}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-xs cursor-pointer transition-all flex items-center space-x-3"
            >
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-slate-800">{item.value}</span>
                  <span className="text-[10px] text-blue-600 font-medium hover:underline">View</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 truncate">{item.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Weekly Ticket Influx vs Resolution</h3>
              <p className="text-xs text-slate-500">Daily creation volume vs solved incidents</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
              Last 7 Days
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.ticketsTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="created" name="Tickets Raised" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" name="Tickets Resolved" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Tickets by Priority</h3>
            <p className="text-xs text-slate-500">Active distribution by impact rating</p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.ticketsByPriority || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(metrics.ticketsByPriority || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {(metrics.ticketsByPriority || []).map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}:</span>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tickets by Category</h3>
              <p className="text-xs text-slate-500">Server, Database, Network & Security volume</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.ticketsByCategory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" name="Ticket Volume" fill="#133E6D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technician Workload */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Support Engineer Performance</h3>
              <p className="text-xs text-slate-500">Assigned workload vs resolved count</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.ticketsByTechnician || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="count" name="Total Assigned" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolvedCount" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
