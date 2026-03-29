/**
 * PermissionsPage - Trang Quản lý Vai trò & Phân quyền
 * Route: /permissions
 */
import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  X,
  Check,
  ChevronDown,
  Lock,
  Users,
  CheckSquare,
  Inbox,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import * as permissionService from '../../services/permissionService';

// ===== SUB-COMPONENTS =====

function PermissionCheckbox({ label, checked, onChange, disabled = false }) {
  return (
    <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function RoleModal({ isOpen, onClose, role, mode, permissionGroups = [] }) {
  const isEdit = mode === 'edit';
  const [roleName, setRoleName] = useState(role?.name || '');
  const [roleDesc, setRoleDesc] = useState(role?.description || '');
  const [checkedPerms, setCheckedPerms] = useState(() => {
    const defaults = {};
    permissionGroups.forEach((g) =>
      (g.permissions || []).forEach((p) => {
        defaults[p.id] = role?.permissions?.includes(p.id) || false;
      })
    );
    return defaults;
  });

  if (!isOpen) return null;

  const togglePerm = (id) => {
    setCheckedPerms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGroup = (groupPermissions, value) => {
    setCheckedPerms((prev) => {
      const next = { ...prev };
      groupPermissions.forEach((p) => {
        next[p.id] = value;
      });
      return next;
    });
  };

  const totalPermissions = permissionGroups.reduce((sum, g) => sum + (g.permissions || []).length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[700px] max-h-[88vh] flex flex-col overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                {isEdit ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}
              </h2>
              <p className="text-xs text-gray-400">
                {isEdit ? role?.name : 'Định nghĩa quyền hạn cho vai trò'}
              </p>
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
          {/* Role info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tên vai trò
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Nhập tên vai trò (ví dụ: Tele Senior)..."
                className="input-field mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Mô tả
              </label>
              <input
                type="text"
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                placeholder="Mô tả ngắn về vai trò này..."
                className="input-field mt-1 text-sm"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Quyền hạn
              </h4>
              <span className="text-[11px] text-gray-400">
                {Object.values(checkedPerms).filter(Boolean).length} / {totalPermissions} đã chọn
              </span>
            </div>

            <div className="space-y-5">
              {permissionGroups.map((group) => {
                const groupPerms = group.permissions || [];
                const groupChecked = groupPerms.filter((p) => checkedPerms[p.id]).length;
                const allChecked = groupChecked === groupPerms.length;
                const someChecked = groupChecked > 0 && groupChecked < groupPerms.length;

                return (
                  <div key={group.group} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Group header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={13} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">{group.group}</span>
                        <span className="text-[11px] text-gray-400 bg-white px-1.5 py-0.5 rounded">
                          {groupChecked}/{groupPerms.length}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleGroup(groupPerms, !allChecked)}
                        className="text-[11px] text-blue-500 hover:text-blue-600 font-medium"
                      >
                        {allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>

                    {/* Permission checkboxes */}
                    <div className="bg-white p-1 grid grid-cols-2 gap-0">
                      {groupPerms.map((p) => (
                        <PermissionCheckbox
                          key={p.id}
                          label={p.label}
                          checked={!!checkedPerms[p.id]}
                          onChange={() => togglePerm(p.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
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
            {isEdit ? 'Lưu thay đổi' : 'Tạo vai trò'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== EMPTY STATE =====

function EmptyState({ message = 'Chưa có dữ liệu' }) {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-16 text-center text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <Inbox size={32} className="text-gray-300" />
          <p>{message}</p>
        </div>
      </td>
    </tr>
  );
}

// ===== SKELETON LOADER =====

function TableSkeleton({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-b border-gray-50">
          {/* ID */}
          <td className="px-4 py-4">
            <div className="h-3 w-6 bg-gray-200 rounded animate-pulse" />
          </td>
          {/* Role */}
          <td className="px-3 py-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </td>
          {/* Description */}
          <td className="px-3 py-4 hidden md:table-cell">
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </td>
          {/* Permissions */}
          <td className="px-3 py-4 hidden lg:table-cell">
            <div className="flex flex-wrap gap-1">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </td>
          {/* User count */}
          <td className="px-3 py-4 text-center">
            <div className="h-3 w-6 bg-gray-200 rounded animate-pulse mx-auto" />
          </td>
          {/* Actions */}
          <td className="px-3 py-4">
            <div className="flex items-center justify-center gap-1">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ===== MAIN COMPONENT =====

export default function PermissionsPage() {
  // API placeholder: fetch('/api/permissions/roles') → { roles: [...], permissionGroups: [...] }
  // API placeholder: fetch('/api/permissions/groups') → permissionGroups
  const [roles, setRoles] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        permissionService.listRoles({ page_size: 100 }),
        permissionService.listPermissions({ page_size: 100 }),
      ]);

      const rolesData = rolesRes?.data?.items || rolesRes?.data || rolesRes || [];
      const permsData = permsRes?.data?.items || permsRes?.data || permsRes || [];

      // Normalize roles
      const normalizedRoles = rolesData.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        permissions: [],
        userCount: 0,
        color: 'bg-green-100 text-green-700',
        isSystem: false,
      }));

      // Normalize permissions into groups
      const permGroupsMap = {};
      permsData.forEach((p) => {
        const groupName = p.module || 'Chung';
        if (!permGroupsMap[groupName]) {
          permGroupsMap[groupName] = { group: groupName, permissions: [] };
        }
        permGroupsMap[groupName].permissions.push({
          id: p.id,
          code: p.code,
          label: p.name,
        });
      });

      setRoles(normalizedRoles);
      setPermissionGroups(Object.values(permGroupsMap));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);
  const totalPermissions = permissionGroups.reduce((sum, g) => sum + (g.permissions || []).length, 0);

  const handleOpenCreate = () => {
    setActiveRole(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role) => {
    setActiveRole(role);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Quản lý Vai trò & Phân quyền</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {roles.length} vai trò · {totalUsers} người dùng được gán
          </p>
        </div>
        <PrimaryButton icon={Plus} onClick={handleOpenCreate}>
          Thêm vai trò
        </PrimaryButton>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tổng vai trò', value: roles.length, color: 'blue' },
          { label: 'Người dùng', value: totalUsers, color: 'green' },
          { label: 'Nhóm quyền', value: permissionGroups.length, color: 'purple' },
          { label: 'Quyền hạn', value: totalPermissions, color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
              <Shield size={18} className={`text-${stat.color}-500`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-[11px] text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vai trò..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2.5 font-semibold w-12">ID</th>
              <th className="text-left px-3 py-2.5 font-semibold">Vai trò</th>
              <th className="text-left px-3 py-2.5 font-semibold hidden md:table-cell">Mô tả</th>
              <th className="text-left px-3 py-2.5 font-semibold hidden lg:table-cell">Quyền hạn</th>
              <th className="text-center px-3 py-2.5 font-semibold w-28">Người dùng</th>
              <th className="text-center px-3 py-2.5 font-semibold w-24">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={5} />
            ) : filteredRoles.length === 0 ? (
              <EmptyState message={searchQuery ? 'Không tìm thấy vai trò nào' : 'Chưa có dữ liệu'} />
            ) : (
              filteredRoles.map((role) => {
                const permLabels = permissionGroups
                  .flatMap((g) => g.permissions || [])
                  .filter((p) => role.permissions.includes(p.id))
                  .slice(0, 3)
                  .map((p) => p.label);

                return (
                  <tr
                    key={role.id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono text-gray-400">#{role.id}</span>
                    </td>

                    {/* Role */}
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl ${role.color.replace('text-', 'bg-').replace('bg-', 'bg-')} bg-opacity-20 flex items-center justify-center`}>
                          <Shield size={15} className={role.color} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">{role.name}</span>
                            {role.isSystem && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                                <Lock size={8} />
                                System
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-3 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500">{role.description}</span>
                    </td>

                    {/* Permissions preview */}
                    <td className="px-3 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {permLabels.map((l) => (
                          <span key={l} className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            {l}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                            +{role.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* User count */}
                    <td className="px-3 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users size={12} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{role.userCount}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(role)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={activeRole}
        mode={modalMode}
        permissionGroups={permissionGroups}
      />
    </div>
  );
}
