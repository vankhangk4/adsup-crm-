/**
 * UsersModule - Trang Quản lý Người dùng & Phân quyền
 * Bảng user + Modal chỉnh sửa quyền + Modal quản lý vai trò
 */
import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  Shield,
  Users,
  ChevronDown,
  Inbox,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

// ===== SUB-COMPONENTS =====

function RoleBadge({ role }) {
  const configs = {
    'Quản lý': 'bg-blue-100 text-blue-700',
    'Nhân viên': 'bg-gray-100 text-gray-600',
    'Quản trị viên': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${configs[role] || 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  );
}

function PermissionCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function EmptyState({ message = 'Chưa có dữ liệu' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <Inbox size={28} className="text-gray-300" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  );
}

function LoadingSkeleton({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-b border-gray-50">
          <td className="px-4 py-3">
            <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
          </td>
          <td className="px-3 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="space-y-1">
                <div className="w-28 h-3.5 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-2.5 bg-gray-100 rounded animate-pulse md:hidden" />
              </div>
            </div>
          </td>
          <td className="px-3 py-3 hidden md:table-cell">
            <div className="w-40 h-3.5 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-3 py-3 hidden lg:table-cell">
            <div className="w-28 h-3.5 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-3 py-3">
            <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" />
          </td>
          <td className="px-3 py-3 hidden sm:table-cell">
            <div className="w-20 h-5 bg-gray-200 rounded-lg animate-pulse" />
          </td>
          <td className="px-3 py-3 text-center">
            <div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse mx-auto" />
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

function EditUserModal({ isOpen, user, onClose, allPermissions }) {
  const [scope, setScope] = useState('global');
  const [checkedPerms, setCheckedPerms] = useState(() => {
    // Default some permissions based on role
    const defaults = {};
    if (allPermissions && allPermissions.length > 0) {
      allPermissions.forEach((p) => {
        if (user?.role === 'Quản lý') {
          defaults[p.id] = ['view_lead', 'edit_lead', 'create_lead', 'transfer_lead', 'view_user', 'view_report'].includes(p.id);
        } else {
          defaults[p.id] = ['view_lead', 'create_lead'].includes(p.id);
        }
      });
    }
    return defaults;
  });

  if (!isOpen || !user) return null;

  const scopeOptions = [
    { value: 'global', label: 'Global', desc: 'Toàn quyền truy cập' },
    { value: 'page', label: 'Chỉ trang được gán', desc: 'Chỉ hoạt động với các trang được phân công' },
    { value: 'tele', label: 'Chỉ nhóm Tele được gán', desc: 'Chỉ hoạt động với nhóm Tele được phân công' },
  ];

  const permissionGroups = allPermissions ? [...new Set(allPermissions.map((p) => p.group))] : [];

  const togglePerm = (id) => {
    setCheckedPerms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-[640px] max-h-[88vh] flex flex-col overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Chỉnh sửa quyền</h2>
              <p className="text-xs text-gray-400">{user.name}</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{user.avatar}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email} · {user.department}</p>
            </div>
            <div className="ml-auto">
              <RoleBadge role={user.role} />
            </div>
          </div>

          {/* Scope selection */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Phạm vi truy cập
            </h4>
            <div className="space-y-2">
              {scopeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                    scope === opt.value
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value={opt.value}
                    checked={scope === opt.value}
                    onChange={() => setScope(opt.value)}
                    className="mt-0.5 w-4 h-4 text-blue-500 focus:ring-blue-400 cursor-pointer"
                  />
                  <div>
                    <p className={`text-sm font-medium ${scope === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Hành động
            </h4>
            <div className="space-y-4">
              {permissionGroups.map((group) => (
                <div key={group}>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                    {group}
                  </p>
                  <div className="grid grid-cols-2 gap-0.5 bg-gray-100 rounded-xl p-1">
                    {allPermissions
                      .filter((p) => p.group === group)
                      .map((p) => (
                        <PermissionCheckbox
                          key={p.id}
                          label={p.label}
                          checked={!!checkedPerms[p.id]}
                          onChange={() => togglePerm(p.id)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
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
            Lưu sửa
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageRoleModal({ isOpen, onClose, existingRoles, allPermissions }) {
  const [roleName, setRoleName] = useState('');
  const [checkedPerms, setCheckedPerms] = useState({});
  const [roles, setRoles] = useState(existingRoles || []);

  if (!isOpen) return null;

  const permissionGroups = allPermissions ? [...new Set(allPermissions.map((p) => p.group))] : [];

  const togglePerm = (id) => {
    setCheckedPerms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateRole = () => {
    if (!roleName.trim()) return;
    const newRole = {
      id: Date.now(),
      name: roleName,
      color: 'bg-green-100 text-green-700',
      count: 0,
    };
    setRoles([...roles, newRole]);
    setRoleName('');
    setCheckedPerms({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-[700px] max-h-[88vh] flex flex-col overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Quản lý Vai trò</h2>
              <p className="text-xs text-gray-400">Định nghĩa và phân quyền cho vai trò</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Existing roles */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Vai trò hiện có
            </h4>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${r.color}`}
                >
                  <span>{r.name}</span>
                  <span className="text-[11px] opacity-70">({r.count} người)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Create new role */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Tạo vai trò mới
            </h4>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Nhập tên vai trò (ví dụ: Tele Senior)..."
                  className="input-field text-sm"
                />
              </div>
              <button
                onClick={handleCreateRole}
                disabled={!roleName.trim()}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={14} />
                Tạo mới
              </button>
            </div>
          </div>

          {/* Permissions for new role */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quyền hạn
            </h4>
            <div className="space-y-4">
              {permissionGroups.map((group) => (
                <div key={group}>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                    {group}
                  </p>
                  <div className="grid grid-cols-2 gap-0.5 bg-gray-100 rounded-xl p-1">
                    {allPermissions
                      .filter((p) => p.group === group)
                      .map((p) => (
                        <PermissionCheckbox
                          key={p.id}
                          label={p.label}
                          checked={!!checkedPerms[p.id]}
                          onChange={() => togglePerm(p.id)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function UsersModule() {
  // State with empty initial values
  const [users, setUsers] = useState([]);
  const [rolesInit, setRolesInit] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter options derived from loaded data
  const filterRoles = rolesInit.map((r) => r.name);
  const filterDepts = [...new Set(users.map((u) => u.department).filter(Boolean))];

  // Fetch data placeholder
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Example: fetch('/api/users')
        // const usersRes = await fetch('/api/users');
        // const usersData = await usersRes.json();
        // setUsers(usersData);

        // Example: fetch('/api/roles')
        // const rolesRes = await fetch('/api/roles');
        // const rolesData = await rolesRes.json();
        // setRolesInit(rolesData);

        // Example: fetch('/api/permissions')
        // const permsRes = await fetch('/api/permissions');
        // const permsData = await permsRes.json();
        // setAllPermissions(permsData);

        // Placeholder: simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUsers([]);
        setRolesInit([]);
        setAllPermissions([]);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery);
    const matchRole = !filterRole || u.role === filterRole;
    const matchDept = !filterDept || u.department === filterDept;
    return matchSearch && matchRole && matchDept;
  });

  const toggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: !u.status } : u))
    );
  };

  const handleEditUser = (user) => {
    setActiveUser(user);
    setIsEditModalOpen(true);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredUsers.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleSelect = (id) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const activeCount = users.filter((u) => u.status).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Quản trị Người dùng</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {users.length} người dùng · {activeCount} đang hoạt động
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors flex items-center gap-2"
          >
            <Shield size={15} />
            Vai trò
          </button>
          <PrimaryButton icon={Plus}>
            Tạo mới
          </PrimaryButton>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-xl transition-colors ${
                filterRole || filterDept
                  ? 'border-blue-300 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter size={14} />
              Lọc
              {(filterRole || filterDept) && (
                <span className="w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {(filterRole ? 1 : 0) + (filterDept ? 1 : 0)}
                </span>
              )}
            </button>

            {showFilter && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Vai trò</p>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer"
                  >
                    <option value="">Tất cả</option>
                    {filterRoles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Phòng ban</p>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer"
                  >
                    <option value="">Tất cả</option>
                    {filterDepts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                {(filterRole || filterDept) && (
                  <button
                    onClick={() => { setFilterRole(''); setFilterDept(''); }}
                    className="w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>

          {selectedRows.size > 0 && (
            <span className="text-xs text-blue-500 font-medium">
              Đã chọn: {selectedRows.size}
            </span>
          )}
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2.5 font-semibold w-8">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                />
              </th>
              <th className="text-left px-3 py-2.5 font-semibold">Người dùng</th>
              <th className="text-left px-3 py-2.5 font-semibold hidden md:table-cell">Email</th>
              <th className="text-left px-3 py-2.5 font-semibold hidden lg:table-cell">Số điện thoại</th>
              <th className="text-left px-3 py-2.5 font-semibold w-24">Vai trò</th>
              <th className="text-left px-3 py-2.5 font-semibold w-28 hidden sm:table-cell">Phòng ban</th>
              <th className="text-center px-3 py-2.5 font-semibold w-24">Trạng thái</th>
              <th className="text-center px-3 py-2.5 font-semibold w-28">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingSkeleton rows={5} />
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <EmptyState message={error} />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-gray-400 text-sm">
                  <EmptyState message={searchQuery || filterRole || filterDept ? 'Không tìm thấy người dùng nào' : 'Chưa có dữ liệu'} />
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                    selectedRows.has(user.id) ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(user.id)}
                      onChange={() => handleSelect(user.id)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${user.avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{user.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400 md:hidden">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{user.phone}</span>
                  </td>
                  <td className="px-3 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                      {user.department}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className="inline-flex items-center gap-1"
                      title={user.status ? 'Đang hoạt động' : 'Không hoạt động'}
                    >
                      {user.status ? (
                        <ToggleRight size={24} className="text-green-500" />
                      ) : (
                        <ToggleLeft size={24} className="text-gray-300" />
                      )}
                      <span className={`text-xs font-medium ${user.status ? 'text-green-600' : 'text-gray-400'}`}>
                        {user.status ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Phân quyền / Sửa"
                      >
                        <Shield size={14} />
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
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Hiển thị {filteredUsers.length} / {users.length} người dùng
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" disabled>
              ‹
            </button>
            <button className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">2</button>
            <button className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">3</button>
            <button className="px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditUserModal
        isOpen={isEditModalOpen}
        user={activeUser}
        onClose={() => setIsEditModalOpen(false)}
        allPermissions={allPermissions}
      />

      <ManageRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        existingRoles={rolesInit}
        allPermissions={allPermissions}
      />
    </div>
  );
}
