/**
 * ChannelsModule - Trang Quản lý Nguồn Chat đa kênh
 * Bố cục: Top Cards + Bảng quản lý + Modal phân công nhân viên
 */
import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  CheckCircle,
  Wifi,
  WifiOff,
  MessageSquare,
  Users,
  Inbox,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

// ===== EMPTY STATE COMPONENT =====

function EmptyState({ message = 'Chưa có dữ liệu' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <Inbox size={28} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}

// ===== LOADING SKELETON =====

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-gray-50">
          <td className="px-4 py-3">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-3 py-3">
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-40 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="w-16 h-5 bg-gray-200 rounded-lg animate-pulse" />
          </td>
          <td className="px-3 py-3">
            <div className="w-20 h-5 bg-gray-200 rounded-lg animate-pulse" />
          </td>
          <td className="px-3 py-3">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
              <div className="w-8 h-3 bg-gray-200 rounded animate-pulse ml-1" />
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="flex items-center justify-center gap-1">
              <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ===== SUB-COMPONENTS =====

function PlatformIcon({ platform, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 12 : 20;

  if (platform === 'facebook') {
    return (
      <div className={`${sizeClass} bg-blue-500 rounded-lg flex items-center justify-center`}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </div>
    );
  }
  if (platform === 'zalo') {
    return (
      <div className={`${sizeClass} bg-blue-400 rounded-lg flex items-center justify-center`}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.94c-.28.44-.8.58-1.24.58-.76 0-1.36-.36-1.72-.88-.32-.48-.56-.84-.92-1.08-.24-.16-.36-.16-.6 0-.36.24-.6.6-.84.88-.2.24-.36.4-.6.44-.28.04-.52-.16-.76-.36-.44-.4-.72-1-.72-1.6 0-.2.04-.36.12-.52.12-.28.44-.44.8-.44.44 0 .76.16 1.04.48.2.24.28.48.32.72.04.2-.04.36-.12.52-.16.32-.36.64-.68.88-.36.28-.56.56-.56.92 0 .2.08.36.24.48.16.16.4.2.68.16.28-.04.6-.12.92-.32.28-.16.52-.28.76-.28.36 0 .64.12.8.44.12.24.12.52.04.8-.08.36-.24.72-.48 1.08-.2.28-.32.52-.32.8 0 .16.04.28.12.4zm-2.52-8.84c-.28.24-.64.32-1 .24-.4-.08-.72-.36-.84-.76-.08-.32 0-.68.28-.92.28-.28.64-.36 1.04-.28.4.08.72.36.84.76.08.32 0 .68-.28.92zm.36 6.12c-.2.2-.48.28-.76.2-.28-.08-.52-.28-.64-.6-.12-.36-.08-.72.16-.96.2-.2.48-.28.76-.2.28.08.52.28.64.6.12.36.08.72-.16.96z" />
        </svg>
      </div>
    );
  }
  if (platform === 'instagram') {
    return (
      <div className={`${sizeClass} bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center`}>
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      </div>
    );
  }
  return (
    <div className={`${sizeClass} bg-gray-400 rounded-lg flex items-center justify-center`}>
      <MessageSquare size={iconSize} className="text-white" />
    </div>
  );
}

function ChannelCard({ channel }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
      <PlatformIcon platform={channel.platform} size="lg" />
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800">{channel.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500">
            {channel.nickCount} Nick kết nối
          </span>
          <span className="text-gray-300">|</span>
          <span className={`text-xs font-medium flex items-center gap-1 ${channel.status ? 'text-green-500' : 'text-gray-400'}`}>
            {channel.status ? <Wifi size={11} /> : <WifiOff size={11} />}
            {channel.status ? 'Đã kết nối' : 'Đã ngắt kết nối'}
          </span>
        </div>
      </div>
      <ChevronDown size={16} className="text-gray-300" />
    </div>
  );
}

function StaffPill({ staff, onRemove, compact = false }) {
  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-amber-500',
    offline: 'bg-gray-300',
  };
  const statusLabels = {
    online: 'Online',
    busy: 'Bận',
    offline: 'Offline',
  };

  return (
    <div className={`flex items-center gap-1.5 bg-gray-50 rounded-lg border border-gray-200 px-2 py-1 ${compact ? 'scale-90 origin-left' : ''}`}>
      <div className={`w-5 h-5 rounded-full ${statusColors[staff.status]} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-[8px] font-bold">{staff.avatar}</span>
      </div>
      <span className="text-xs text-gray-700 font-medium">{staff.name}</span>
      <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${staff.status === 'online' ? 'text-green-600 bg-green-100' : staff.status === 'busy' ? 'text-amber-600 bg-amber-100' : 'text-gray-400 bg-gray-100'}`}>
        {statusLabels[staff.status]}
      </span>
      {onRemove && (
        <button
          onClick={() => onRemove(staff.id)}
          className="ml-0.5 p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}

function AssignModal({ isOpen, onClose, page, roles, staffOptions }) {
  const [selectedRole, setSelectedRole] = useState('page_staff');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedName, setSelectedName] = useState('');

  if (!isOpen) return null;

  const handleAddStaff = () => {
    if (!selectedName) return;
    const found = staffOptions.find((s) => s.name === selectedName);
    if (found && !selectedStaff.find((s) => s.id === found.id)) {
      setSelectedStaff([
        ...selectedStaff,
        { ...found, role: selectedRole, status: 'online' },
      ]);
    }
    setSelectedName('');
  };

  const handleRemoveStaff = (id) => {
    setSelectedStaff(selectedStaff.filter((s) => s.id !== id));
  };

  const availableOptions = staffOptions.filter(
    (s) => !selectedStaff.find((sel) => sel.id === s.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[680px] max-h-[85vh] flex flex-col overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Phân công nhân viên Page</h2>
              <p className="text-xs text-gray-400">{page?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* LEFT: Role selection */}
          <div className="w-52 border-r border-gray-100 p-4 bg-gray-50/50">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
              Vai trò
            </h4>
            <div className="space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 ${
                    selectedRole === role.id
                      ? 'bg-blue-500 text-white shadow-sm shadow-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <p className={`text-xs font-semibold ${selectedRole === role.id ? '' : 'text-gray-700'}`}>
                    {role.name}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${selectedRole === role.id ? 'text-blue-200' : 'text-gray-400'}`}>
                    {role.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Staff form */}
          <div className="flex-1 p-4 flex flex-col">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
              Thêm nhân viên
            </h4>

            {/* Add staff form */}
            <div className="flex items-center gap-2 mb-4">
              <select
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 cursor-pointer"
              >
                <option value="">-- Chọn tên nhân viên --</option>
                {availableOptions.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={handleAddStaff}
                disabled={!selectedName}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
              >
                Thêm
              </button>
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-[11px] text-gray-500">Vai trò:</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                {roles.find((r) => r.id === selectedRole)?.name}
              </span>
            </div>

            {/* Assigned staff list */}
            <div className="flex-1 overflow-y-auto">
              <h5 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                Danh sách nhân viên ({selectedStaff.length})
              </h5>
              {selectedStaff.length > 0 ? (
                <div className="space-y-2">
                  {selectedStaff.map((staff) => (
                    <StaffPill
                      key={staff.id}
                      staff={staff}
                      onRemove={handleRemoveStaff}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                    <Users size={18} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400">Chưa có nhân viên nào</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">Chọn tên để thêm nhân viên</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <Check size={14} />
                Lưu phân công
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpandedRow({ page }) {
  const [expanded, setExpanded] = useState(page.expanded || false);

  return (
    <>
      <tr
        className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td colSpan={7} className="px-4 py-2">
          <div className="flex items-center justify-center">
            <button className="flex items-center gap-1 text-[11px] text-blue-500 font-medium hover:text-blue-600">
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? 'Thu gọn' : 'Xem danh sách Nick'}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-blue-50/30 px-8 py-3">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Nick kết nối với {page.name}
              </p>
              {/* Placeholder: Replace with actual nick data fetched from API */}
              {/* Example: page.nicks?.map(nick => ()) */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                  <MessageSquare size={18} className="text-gray-300" />
                </div>
                <p className="text-xs text-gray-400">Chưa có Nick nào được kết nối</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ===== MAIN COMPONENT =====

export default function ChannelsModule() {
  // Data states - initialized empty, populated via useEffect
  const [channels, setChannels] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [allStaffOptions, setAllStaffOptions] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [expandedPages, setExpandedPages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePage, setActivePage] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== FETCH DATA =====
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Example: fetch('/api/channels')
        // const channelsRes = await fetch('/api/channels');
        // if (!channelsRes.ok) throw new Error('Failed to fetch channels');
        // const channelsData = await channelsRes.json();

        // Example: fetch('/api/roles')
        // const rolesRes = await fetch('/api/roles');
        // if (!rolesRes.ok) throw new Error('Failed to fetch roles');
        // const rolesData = await rolesRes.json();

        // Example: fetch('/api/staff')
        // const staffRes = await fetch('/api/staff');
        // if (!staffRes.ok) throw new Error('Failed to fetch staff');
        // const staffData = await staffRes.json();

        // Placeholder data - replace with API calls above
        // setChannels(channelsData);
        // setRolesList(rolesData);
        // setAllStaffOptions(staffData);
        // setActiveChannel(channelsData[0] || null);

        // Temporary: clear placeholder data
        setChannels([]);
        setRolesList([]);
        setAllStaffOptions([]);
        setActiveChannel(null);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
        console.error('ChannelsModule fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Flatten pages from active channel
  const pageList = activeChannel?.pageList || [];

  const toggleSelectAll = () => {
    if (selectedRows.size === pageList.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(pageList.map((p) => p.id)));
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const handleOpenModal = (page) => {
    setActivePage(page);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    // Trigger data refetch by toggling the effect
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Example: fetch('/api/channels')
        // const channelsRes = await fetch('/api/channels');
        // const channelsData = await channelsRes.json();
        // setChannels(channelsData);
        // setActiveChannel(channelsData[0] || null);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  };

  return (
    <div className="space-y-4">
      {/* Top Cards */}
      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeleton for channel cards
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </>
        ) : error ? (
          // Error state for channel cards
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-red-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <X size={16} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-500">Lỗi tải dữ liệu</p>
                  <p className="text-xs text-gray-400">Vui lòng thử lại</p>
                </div>
              </div>
            ))}
          </>
        ) : channels.length > 0 ? (
          channels.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
            />
          ))
        ) : (
          // Empty state for channel cards
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-dashed border-gray-200 p-5 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                    <Inbox size={18} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400">Chưa có kênh</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Table section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {activeChannel && <PlatformIcon platform={activeChannel.platform} size="sm" />}
              <h2 className="text-base font-semibold text-gray-800">
                {activeChannel?.name || 'Kênh'}
              </h2>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {pageList.length} trang
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Channel switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg mr-2">
              {channels.length > 0 ? (
                channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                      activeChannel?.id === ch.id
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <PlatformIcon platform={ch.platform} size="sm" />
                  </button>
                ))
              ) : (
                // Placeholder channel switcher when no channels
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-3 py-1.5">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 transition-colors w-44"
              />
            </div>

            <button onClick={handleRefresh} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Làm mới">
              <RefreshCw size={14} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Xuất file">
              <Download size={14} />
            </button>
            <PrimaryButton icon={Plus} size="sm">
              Thêm trang
            </PrimaryButton>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2.5 font-semibold w-8">
                <input
                  type="checkbox"
                  checked={selectedRows.size === pageList.length && pageList.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                />
              </th>
              <th className="text-left px-3 py-2.5 font-semibold w-20">ID Trang</th>
              <th className="text-left px-3 py-2.5 font-semibold">Tên Trang</th>
              <th className="text-left px-3 py-2.5 font-semibold w-24">Nền tảng</th>
              <th className="text-left px-3 py-2.5 font-semibold w-28">Nhóm Trang</th>
              <th className="text-left px-3 py-2.5 font-semibold w-32">Nhân viên phụ trách</th>
              <th className="text-center px-3 py-2.5 font-semibold w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingSkeleton />
            ) : pageList.length > 0 ? (
              pageList.map((page) => (
                <>
                  <tr
                    key={page.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedRows.has(page.id) ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(page.id)}
                        onChange={() => toggleSelect(page.id)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono text-gray-500">{page.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={page.platform} size="sm" />
                        <span className="text-sm font-medium text-gray-800">{page.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                        page.platform === 'facebook' ? 'bg-blue-50 text-blue-600' :
                        page.platform === 'zalo' ? 'bg-blue-50 text-blue-500' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {page.platform === 'facebook' ? 'Facebook' :
                         page.platform === 'zalo' ? 'Zalo' : 'Instagram'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        {page.group}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {page.staff && page.staff.length > 0 ? (
                          <>
                            <div className="flex -space-x-1.5">
                              {page.staff.slice(0, 3).map((staff, i) => (
                                <div
                                  key={staff.id}
                                  className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center"
                                >
                                  <span className="text-white text-[8px] font-bold">
                                    {staff.avatar}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1">{page.staff.length} NV</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa có</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenModal(page)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Phân công nhân viên"
                        >
                          <Users size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Sửa">
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Xóa">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expandable row */}
                  {page.platform === 'facebook' && (
                    <ExpandedRow key={`exp-${page.id}`} page={page} />
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <EmptyState message="Chưa có dữ liệu" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AssignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        page={activePage}
        roles={rolesList}
        staffOptions={allStaffOptions}
      />
    </div>
  );
}
