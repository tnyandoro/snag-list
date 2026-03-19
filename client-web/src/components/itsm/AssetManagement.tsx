import React, { useState, useMemo } from 'react';
import { useITSM } from '@/context/ITSMContext';
import {
  Search,
  Filter,
  Package,
  Monitor,
  Laptop,
  Server,
  Printer,
  Wifi,
  Shield,
  HardDrive,
  Smartphone,
  Phone,
  Headphones,
  FileText,
  ChevronDown,
  X,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Tag,
} from 'lucide-react';
import { Asset, AssetStatus } from '@/data/mockData';

export default function AssetManagement() {
  const { assets, getUserById, updateAsset } = useITSM();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | ''>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Get unique asset types
  const assetTypes = useMemo(() => {
    return [...new Set(assets.map(a => a.type))].sort();
  }, [assets]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !asset.name.toLowerCase().includes(searchLower) &&
          !asset.serialNumber.toLowerCase().includes(searchLower) &&
          !asset.manufacturer.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (typeFilter && asset.type !== typeFilter) return false;
      if (statusFilter && asset.status !== statusFilter) return false;
      return true;
    });
  }, [assets, search, typeFilter, statusFilter]);

  // Group by type for summary
  const assetSummary = useMemo(() => {
    const summary: Record<string, { total: number; active: number; value: number }> = {};
    assets.forEach(asset => {
      if (!summary[asset.type]) {
        summary[asset.type] = { total: 0, active: 0, value: 0 };
      }
      summary[asset.type].total++;
      if (asset.status === 'active') summary[asset.type].active++;
      summary[asset.type].value += asset.value;
    });
    return summary;
  }, [assets]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      'Desktop': Monitor,
      'Laptop': Laptop,
      'Server': Server,
      'Printer': Printer,
      'Network Switch': Wifi,
      'Firewall': Shield,
      'Storage': HardDrive,
      'NAS': HardDrive,
      'Monitor': Monitor,
      'Mobile': Smartphone,
      'Tablet': Smartphone,
      'Phone': Phone,
      'Headset': Headphones,
      'Video Conferencing': Monitor,
      'Wireless AP': Wifi,
      'UPS': Server,
      'Software License': FileText,
    };
    const Icon = icons[type] || Package;
    return <Icon className="w-5 h-5" />;
  };

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'inactive': return 'text-gray-700 bg-gray-100';
      case 'maintenance': return 'text-yellow-700 bg-yellow-100';
      case 'retired': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const activeCount = assets.filter(a => a.status === 'active').length;

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
        <p className="text-gray-500 mt-1">Track and manage IT assets and configuration items</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
              <p className="text-sm text-gray-500">Total Assets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-gray-500">Total Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{assetTypes.length}</p>
              <p className="text-sm text-gray-500">Asset Types</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Asset list */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                {assetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AssetStatus | '')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          {/* Asset table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Asset</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAssets.map((asset) => {
                    const assignedUser = asset.assignedTo ? getUserById(asset.assignedTo) : null;
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedAsset?.id === asset.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getTypeIcon(asset.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{asset.name}</p>
                              <p className="text-xs text-gray-500">{asset.serialNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{asset.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(asset.status)}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{asset.location}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredAssets.length === 0 && (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Asset details sidebar */}
        <div>
          {selectedAsset ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Asset Details</h3>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="p-3 bg-blue-100 rounded-lg">
                  {getTypeIcon(selectedAsset.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedAsset.name}</h4>
                  <p className="text-sm text-gray-500">{selectedAsset.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                  <p className={`text-sm font-medium mt-1 inline-block px-2 py-1 rounded-full ${getStatusColor(selectedAsset.status)}`}>
                    {selectedAsset.status}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Manufacturer / Model</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedAsset.manufacturer} {selectedAsset.model}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</label>
                  <p className="text-sm font-mono text-gray-900 mt-1">{selectedAsset.serialNumber}</p>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Location</label>
                    <p className="text-sm font-medium text-gray-900">{selectedAsset.location}</p>
                  </div>
                </div>

                {selectedAsset.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Assigned To</label>
                      <p className="text-sm font-medium text-gray-900">
                        {getUserById(selectedAsset.assignedTo)?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Value</label>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedAsset.value)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Purchase Date</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedAsset.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Warranty Expiry</label>
                    <p className={`text-sm font-medium ${
                      new Date(selectedAsset.warrantyExpiry) < new Date() ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(selectedAsset.warrantyExpiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedAsset.tags.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAsset.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an asset to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
