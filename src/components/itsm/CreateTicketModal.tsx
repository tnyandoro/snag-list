import React, { useState } from 'react';
import { useITSM } from '@/context/ITSMContext';
import { X, AlertCircle, Ticket, AlertTriangle, RefreshCw } from 'lucide-react';
import { categories, priorities, ticketTypes, TicketType, Priority } from '@/data/mockData';

export default function CreateTicketModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, createTicket, currentUser } = useITSM();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'incident' as TicketType,
    priority: 'medium' as Priority,
    category: 'Hardware',
    subcategory: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isCreateModalOpen) return null;

  const subcategories: Record<string, string[]> = {
    Email: ['Outlook', 'Exchange Server', 'Mobile Email'],
    Network: ['VPN', 'WiFi', 'Active Directory', 'File Share', 'Performance'],
    Hardware: ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Workstation', 'Peripherals', 'AV Equipment'],
    Software: ['Installation', 'Licensing', 'Updates', 'Deployment', 'Development'],
    Access: ['Password Reset', 'Account Creation', 'VPN', 'RDP', 'Database', 'API', 'File Share', 'Active Directory', 'VDI'],
    Application: ['CRM', 'ERP', 'SharePoint', 'Teams', 'Desktop App', 'Browser', 'Project Management', 'BI Tools'],
    Security: ['Certificates', 'Antivirus', 'MFA', 'Firewall'],
    Database: ['SQL Server', 'Performance'],
    Infrastructure: ['Server', 'Backup', 'Storage'],
    Telephony: ['PBX', 'VoIP'],
    Mobile: ['MDM', 'Device'],
    Storage: ['Cloud', 'NAS', 'SAN'],
    Training: ['Software', 'Security'],
    Data: ['Migration', 'Backup'],
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const dueHours = formData.priority === 'critical' ? 4 : formData.priority === 'high' ? 8 : formData.priority === 'medium' ? 24 : 72;
    const dueDate = new Date(Date.now() + dueHours * 60 * 60 * 1000).toISOString();

    createTicket({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      category: formData.category,
      subcategory: formData.subcategory || formData.category,
      status: 'new',
      dueDate,
      requesterId: currentUser.id,
      assigneeId: null,
      tags: [formData.category.toLowerCase(), formData.type],
      slaBreached: false,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'incident',
      priority: 'medium',
      category: 'Hardware',
      subcategory: '',
    });
    setErrors({});
    setIsCreateModalOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertCircle className="w-5 h-5" />;
      case 'problem':
        return <AlertTriangle className="w-5 h-5" />;
      case 'change':
        return <RefreshCw className="w-5 h-5" />;
      default:
        return <Ticket className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsCreateModalOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Ticket</h2>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Type selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {ticketTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {getTypeIcon(type.value)}
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of the issue"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information about the issue..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Priority and Category row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategory */}
          {subcategories[formData.category] && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select subcategory</option>
                {subcategories[formData.category].map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          {/* SLA info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-1">Expected Response Time</h4>
            <p className="text-sm text-blue-700">
              Based on {formData.priority} priority, this ticket should be resolved within{' '}
              <strong>
                {formData.priority === 'critical' ? '4 hours' : formData.priority === 'high' ? '8 hours' : formData.priority === 'medium' ? '24 hours' : '72 hours'}
              </strong>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(false)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
