import React, { useState } from 'react';
import {
  HardDrive,
  Server,
  Shield,
  Search,
  Plus,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Flame,
  X,
  Building,
} from 'lucide-react';
import { Asset, User as UserType } from '../../types/itsm';

interface AssetManagementViewProps {
  assets: Asset[];
  currentUser: UserType;
  onCreateAsset: (data: any) => Promise<void>;
  onFilterAssetTickets?: (assetTag: string) => void;
}

export const AssetManagementView: React.FC<AssetManagementViewProps> = ({
  assets,
  currentUser,
  onCreateAsset,
  onFilterAssetTickets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'SERVER' | 'DATABASE' | 'NETWORK' | 'STORAGE' | 'LAPTOP' | 'FIREWALL'>('SERVER');
  const [ipAddress, setIpAddress] = useState('');
  const [hostname, setHostname] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAssets = (assets || []).filter((a) => {
    if (selectedType !== 'ALL' && a.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.assetTag.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.ipAddress?.toLowerCase().includes(q) ||
        a.hostname?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTag.trim() || !name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateAsset({
        assetTag,
        name,
        type,
        ipAddress,
        hostname,
        serialNumber,
      });
      setShowCreateModal(false);
      setAssetTag('');
      setName('');
      setIpAddress('');
      setHostname('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HardDrive className="w-4 h-4" />
            <span>Configuration Management Database (CMDB)</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            IT Asset & Infrastructure Inventory
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live CMDB inventory of physical servers, cloud VMs, core switches, and enterprise workstations.
            Directly map incidents and changes to Configuration Items (CIs).
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register Asset (CI)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Asset Tag, Name, IP address, or Hostname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
          >
            <option value="ALL">All CI Types</option>
            <option value="SERVER">Server</option>
            <option value="DATABASE">Database Cluster</option>
            <option value="NETWORK">Network Switch</option>
            <option value="FIREWALL">Firewall</option>
            <option value="LAPTOP">Laptop / Workstation</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_USE">In Production (In Use)</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((ast) => (
          <div
            key={ast.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                  <Server className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {ast.assetTag}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {ast.status}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{ast.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{ast.hostname || 'No Hostname'}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="font-mono font-medium text-slate-800">{ast.ipAddress || '10.140.x.x'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium text-slate-800">{ast.locationName || 'NDC (Delhi)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Serial No:</span>
                  <span className="font-mono text-slate-700">{ast.serialNumber}</span>
                </div>
              </div>
            </div>

            {onFilterAssetTickets && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onFilterAssetTickets(ast.assetTag)}
                  className="w-full py-1.5 bg-slate-50 hover:bg-blue-50 text-blue-700 font-semibold rounded-lg text-xs border border-slate-200 hover:border-blue-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>View Incidents Linked to CI</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Register Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Register Asset / CI into CMDB</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Asset Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC-SRV-NDC-09"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="SERVER">Physical / Cloud Server</option>
                    <option value="DATABASE">Database Instance</option>
                    <option value="NETWORK">Network Switch / Router</option>
                    <option value="FIREWALL">Firewall Appliance</option>
                    <option value="STORAGE">SAN / NAS Storage</option>
                    <option value="LAPTOP">Corporate Laptop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Asset / Host Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSC National Aadhaar Auth Gateway Node 09"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">IP Address</label>
                  <input
                    type="text"
                    placeholder="10.140.20.99"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Hostname FQDN</label>
                  <input
                    type="text"
                    placeholder="auth09.ndc.csc.gov.in"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Serial Number / Asset UID</label>
                <input
                  type="text"
                  placeholder="CSC-HW-2026-991827"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800"
                >
                  {isSubmitting ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
