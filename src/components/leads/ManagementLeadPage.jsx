/**
 * ManagementLeadPage - Trang Quản lý Lead
 * Route: /leads
 * Sử dụng MasterLayout + BadgeStatus + PrimaryButton + SearchInput
 */
import { useState, useEffect } from 'react';
import {
  Phone,
  Edit2,
  Trash2,
  Plus,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Inbox,
} from 'lucide-react';
import BadgeStatus from '../common/BadgeStatus';
import PrimaryButton from '../common/PrimaryButton';
import SearchInput from '../common/SearchInput';
import { TableSkeleton } from '../common/SkeletonLoader';
import { useToast } from '../../contexts/ToastContext';

export default function ManagementLeadPage() {
  // Data state
  const [leads, setLeads] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [leadServices, setLeadServices] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'followup' | 'closed'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterService, setFilterService] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Async state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const toast = useToast();

  // Fetch all data from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Example: fetch('/api/leads')
      // const res = await fetch('/api/leads');
      // if (!res.ok) throw new Error('Failed to fetch leads');
      // const data = await res.json();

      // Example: fetch('/api/leads/meta') for filter dropdowns
      // const metaRes = await fetch('/api/leads/meta');
      // const meta = await metaRes.json();

      // Placeholder: simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // After real API integration, set data like:
      // setLeads(data.leads || []);
      // setLeadStatuses(data.statuses || []);
      // setLeadSources(data.sources || []);
      // setLeadServices(data.services || []);
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      toast.error(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tab counts
  const counts = {
    list: leads.filter((l) => ['Mới', 'Đang xử lý', 'Chưa liên hệ', 'Đã liên hệ'].includes(l.status)).length,
    followup: leads.filter((l) => l.followUp && l.followUp !== '-').length,
    closed: leads.filter((l) => ['Thành công', 'Từ chối'].includes(l.status)).length,
  };

  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !filterStatus || lead.status === filterStatus;
    const matchSource = !filterSource || lead.source === filterSource;
    const matchService = !filterService || lead.service === filterService;
    return matchSearch && matchStatus && matchSource && matchService;
  });

  const handleSelectAll = () => {
    if (selectedRows.size === filteredLeads.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleSelect = (id) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const prioritySymbol = {
    'Cao': '!',
    'Trung bình': '~',
    'Thấp': '↓',
  };

  const priorityColor = {
    'Cao': 'bg-red-100 text-red-600',
    'Trung bình': 'bg-amber-100 text-amber-600',
    'Thấp': 'bg-green-100 text-green-600',
  };

  const sourceIcon = {
    'Facebook': 'F',
    'Website': 'W',
    'Google Ads': 'G',
    'Zalo': 'Z',
    'Giới thiệu': 'GI',
    'Hotline': 'HL',
    'Shopee': 'S',
  };

  // Empty State Component
  const EmptyState = () => (
    <tr>
      <td colSpan={10} className="px-4 py-16 text-center text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <Inbox size={32} className="text-gray-300" />
          <p>Chưa có dữ liệu</p>
        </div>
      </td>
    </tr>
  );

  // Loading skeleton rows
  const LoadingSkeletonRows = () =>
    Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} className="border-b border-gray-50">
        {Array.from({ length: 10 }).map((_, j) => (
          <td key={j} className="px-4 py-3">
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          </td>
        ))}
      </tr>
    ));

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Quản lý Lead</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {leads.length} leads · {counts.list} tiếp cận · {counts.followup} hẹn follow-up · {counts.closed} đã chốt
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="px-5 pt-4 pb-0 border-b border-gray-100">
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg w-fit mb-3">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={14} />
              Danh sách Lead tiếp cận
              <span className="text-[11px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {counts.list}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('followup')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'followup'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar size={14} />
              Lịch hẹn Follow-up
              <span className="text-[11px] bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">
                {counts.followup}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'closed'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle size={14} />
              Lead đã chốt
              <span className="text-[11px] bg-green-200 text-green-700 px-1.5 py-0.5 rounded-full">
                {counts.closed}
              </span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          {/* Quick action buttons */}
          <PrimaryButton icon={Plus} size="sm" variant="primary">
            Hoạt động
          </PrimaryButton>
          <PrimaryButton icon={Clock} size="sm" variant="secondary">
            Giờ hẹn gọi
          </PrimaryButton>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <SearchInput
            placeholder="Tìm theo tên, SĐT, ID..."
            value={searchQuery}
            onChange={setSearchQuery}
            debounceMs={0}
            size="sm"
            className="w-56"
          />

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-xl transition-colors ${
                filterStatus || filterSource || filterService
                  ? 'border-blue-300 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter size={14} />
              Lọc
              {(filterStatus || filterSource || filterService) && (
                <span className="w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {(filterStatus ? 1 : 0) + (filterSource ? 1 : 0) + (filterService ? 1 : 0)}
                </span>
              )}
            </button>

            {showFilter && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Trạng thái</p>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Tất cả</option>
                    {leadStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Nguồn Lead</p>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Tất cả</option>
                    {leadSources.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Dịch vụ</p>
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Tất cả</option>
                    {leadServices.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {(filterStatus || filterSource || filterService) && (
                  <button
                    onClick={() => { setFilterStatus(''); setFilterSource(''); setFilterService(''); }}
                    className="w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>

          {selectedRows.size > 0 && (
            <span className="text-xs text-blue-500 font-medium px-2">
              Đã chọn: {selectedRows.size}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 uppercase tracking-wide">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <th key={i} className="text-left px-4 py-3 font-semibold">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <LoadingSkeletonRows />
              </tbody>
            </table>
          ) : error ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 uppercase tracking-wide">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <th key={i} className="text-left px-4 py-3 font-semibold">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-red-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <p>{error}</p>
                      <button
                        onClick={fetchData}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-2.5 font-semibold w-8">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-3 py-2.5 font-semibold w-12">PRI</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Khách hàng</th>
                  <th className="text-left px-3 py-2.5 font-semibold w-28">SĐT</th>
                  <th className="text-left px-3 py-2.5 font-semibold w-28">Nguồn Lead</th>
                  <th className="text-left px-3 py-2.5 font-semibold w-36 hidden md:table-cell">Dịch vụ quan tâm</th>
                  <th className="text-left px-3 py-2.5 font-semibold w-28">Trạng thái</th>
                  <th className="text-left px-3 py-2.5 font-semibold w-32 hidden lg:table-cell">Follow-up</th>
                  <th className="text-left px-3 py-2.5 font-semibold w-36 hidden sm:table-cell">Người phụ trách</th>
                  <th className="text-center px-3 py-2.5 font-semibold w-28">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors ${
                        selectedRows.has(lead.id) ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(lead.id)}
                          onChange={() => handleSelect(lead.id)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                        />
                      </td>

                      {/* Priority */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded ${priorityColor[lead.priority]}`}
                        >
                          {prioritySymbol[lead.priority]}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">{lead.avatar}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{lead.name}</p>
                            <p className="text-[11px] text-gray-400 md:hidden">{lead.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-3 py-3">
                        <span className="text-sm text-gray-700">{lead.phone}</span>
                      </td>

                      {/* Source */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-[9px] font-bold rounded">
                            {sourceIcon[lead.source] || lead.source?.charAt(0)}
                          </span>
                          <span className="text-xs text-gray-600">{lead.source}</span>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          {lead.service}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <BadgeStatus status={lead.status} size="sm" />
                      </td>

                      {/* Follow-up */}
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-gray-400" />
                          <span className={`text-xs ${lead.followUp && lead.followUp !== '-' ? 'text-gray-700' : 'text-gray-400'}`}>
                            {lead.followUp !== '-' ? lead.followUp?.split(' ')[1] : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Assigned to */}
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className={`text-xs ${lead.assignedTo === '-' ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                          {lead.assignedTo === '-' ? 'Chưa gán' : lead.assignedTo}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                            title="Gọi"
                          >
                            <Phone size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                            title="Sửa"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors"
                            title="Xóa"
                            onClick={() => toast.success('Đã xóa lead thành công')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyState />
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Hiển thị {filteredLeads.length} / {leads.length} leads
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-100 rounded-lg transition-colors cursor-not-allowed" disabled>
              ‹
            </button>
            <button className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">2</button>
            <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
