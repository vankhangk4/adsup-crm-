import { useState, useMemo } from 'react'
import clsx from 'clsx'
import {
  Search,
  Plus,
  Pencil,
  Power,
  UserCog,
  X,
  Check,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { users as mockUsers, roles, permissions, rolePermissions, teleGroups } from '../../data/mockData'

export default function AuthModule() {
  const [tab, setTab] = useState('users')
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [userList, setUserList] = useState(mockUsers)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRolePanel, setShowRolePanel] = useState(false)
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState(null)

  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    department: '',
    teleGroup: '',
    status: 'active',
  })

  const filteredUsers = useMemo(() => {
    let data = [...userList]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)
      )
    }
    if (filterRole !== 'all') {
      data = data.filter((u) => u.roleId === filterRole)
    }
    if (filterStatus !== 'all') {
      data = data.filter((u) => u.status === filterStatus)
    }
    return data
  }, [userList, search, filterRole, filterStatus])

  const handleOpenCreate = () => {
    setSelectedUser(null)
    setUserForm({
      name: '',
      email: '',
      phone: '',
      roleId: '',
      department: '',
      teleGroup: '',
      status: 'active',
    })
    setShowUserModal(true)
  }

  const handleOpenEdit = (user) => {
    setSelectedUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      department: user.department,
      teleGroup: user.teleGroup || '',
      status: user.status,
    })
    setShowUserModal(true)
  }

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email || !userForm.roleId) return

    if (selectedUser) {
      // Edit
      setUserList((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, ...userForm }
            : u
        )
      )
    } else {
      // Create
      const newUser = {
        id: `usr_${Date.now()}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...userForm,
        role: roles.find((r) => r.id === userForm.roleId)?.name || '',
      }
      setUserList((prev) => [...prev, newUser])
    }
    setShowUserModal(false)
  }

  const handleToggleStatus = (userId) => {
    setUserList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      )
    )
  }

  const handleOpenRoleAssign = (user) => {
    setSelectedUser(user)
    setUserForm((prev) => ({ ...prev, roleId: user.roleId }))
    setShowRolePanel(true)
  }

  const handleSaveRoleAssign = () => {
    if (!selectedUser || !userForm.roleId) return
    const newRole = roles.find((r) => r.id === userForm.roleId)
    setUserList((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, roleId: userForm.roleId, role: newRole?.name || '' }
          : u
      )
    )
    setShowRolePanel(false)
  }

  const getRoleBadgeStyle = (roleId) => {
    const role = roles.find((r) => r.id === roleId)
    return {
      color: role?.color || '#6b7280',
      backgroundColor: role?.color ? role.color + '15' : '#f3f4f6',
    }
  }

  const getRoleById = (roleId) => roles.find((r) => r.id === roleId)

  const permGroups = useMemo(() => {
    const groups = {}
    permissions.forEach((p) => {
      if (!groups[p.group]) groups[p.group] = []
      groups[p.group].push(p)
    })
    return groups
  }, [])

  const selectedRolePerms = selectedRoleForPerms
    ? rolePermissions[selectedRoleForPerms] || []
    : []

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Tab Header */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-fit">
        <button
          onClick={() => setTab('users')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            tab === 'users'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Users size={15} />
          Nhân viên
        </button>
        <button
          onClick={() => setTab('roles')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            tab === 'roles'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <ShieldCheck size={15} />
          Vai trò &amp; Quyền
        </button>
      </div>

      {/* ---- NHAN VIEN TAB ---- */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm theo tên, email, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="select-field text-sm"
              >
                <option value="all">Tất cả vai trò</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select-field text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tắt</option>
              </select>
              <button onClick={handleOpenCreate} className="btn-primary text-sm">
                <Plus size={15} />
                Thêm nhân viên
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="table-header text-left">Nhân viên</th>
                  <th className="table-header text-left">Email</th>
                  <th className="table-header text-left">Vai trò</th>
                  <th className="table-header text-left">Nhóm Tele</th>
                  <th className="table-header text-left">Trạng thái</th>
                  <th className="table-header text-left w-32">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-12 text-slate-400">
                      Không tìm thấy nhân viên nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const role = getRoleById(user.roleId)
                    return (
                      <tr key={user.id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-slate-600 text-sm">{user.email}</td>
                        <td className="table-cell">
                          <span
                            className="badge text-[11px] font-medium"
                            style={getRoleBadgeStyle(user.roleId)}
                          >
                            {role?.name || user.role}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-slate-600">
                          {user.teleGroup || '—'}
                        </td>
                        <td className="table-cell">
                          <span
                            className={clsx(
                              'badge text-[11px] font-medium',
                              user.status === 'active'
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-slate-500 bg-slate-100'
                            )}
                          >
                            {user.status === 'active' ? 'Hoạt động' : 'Tắt'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors"
                              title="Sửa"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              className={clsx(
                                'p-1.5 rounded hover:bg-slate-100 transition-colors',
                                user.status === 'active'
                                  ? 'text-amber-500 hover:text-amber-600'
                                  : 'text-emerald-500 hover:text-emerald-600'
                              )}
                              title={user.status === 'active' ? 'Tắt hoạt động' : 'Bật hoạt động'}
                            >
                              <Power size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenRoleAssign(user)}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-purple-600 transition-colors"
                              title="Phân vai trò"
                            >
                              <UserCog size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-medium text-slate-700">{filteredUsers.length}</span> / {userList.length} nhân viên
            </p>
          </div>
        </div>
      )}

      {/* ---- VAI TRO TAB ---- */}
      {tab === 'roles' && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Role Cards */}
          <div className={clsx('lg:w-1/3', selectedRoleForPerms && 'lg:w-1/4')}>
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Danh sách vai trò</h3>
                <span className="text-xs text-slate-400">{roles.length} vai trò</span>
              </div>
              <div className="divide-y divide-slate-100">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleForPerms(selectedRoleForPerms === role.id ? null : role.id)}
                    className={clsx(
                      'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors',
                      selectedRoleForPerms === role.id && 'bg-primary-50 border-l-2 border-l-primary-500'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="font-medium text-slate-800 text-sm">{role.name}</span>
                      </div>
                      <span className="badge text-[11px] font-medium text-slate-500 bg-slate-100">
                        {role.userCount} NV
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 ml-4.5">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className={clsx('flex-1', !selectedRoleForPerms && 'lg:flex-none lg:w-2/3')}>
            {!selectedRoleForPerms ? (
              <div className="card flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={28} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Chọn vai trò để xem quyền hạn</p>
                  <p className="text-sm text-slate-400 mt-1">Click vào một vai trò bên trái</p>
                </div>
              </div>
            ) : (
              (() => {
                const selRole = getRoleById(selectedRoleForPerms)
                return (
                  <div className="card overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selRole?.color }}
                      />
                      <h3 className="font-semibold text-slate-800 text-sm">{selRole?.name}</h3>
                      <span className="text-xs text-slate-400 ml-auto">
                        {selectedRolePerms.length} / {permissions.length} quyền
                      </span>
                    </div>
                    <div className="p-4">
                      {Object.entries(permGroups).map(([groupName, groupPerms]) => (
                        <div key={groupName} className="mb-6 last:mb-0">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            {groupName}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {groupPerms.map((perm) => {
                              const has = selectedRolePerms.includes(perm.key)
                              return (
                                <div
                                  key={perm.id}
                                  className={clsx(
                                    'flex items-center gap-2 px-3 py-2 rounded-md border text-sm',
                                    has
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                      : 'border-slate-100 bg-white text-slate-400'
                                  )}
                                >
                                  <span
                                    className={clsx(
                                      'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                                      has ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                                    )}
                                  >
                                    {has && <Check size={10} className="text-white" />}
                                  </span>
                                  <span className={clsx(!has && 'line-through')}>{perm.name}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()
            )}
          </div>
        </div>
      )}

      {/* ---- USER CREATE/EDIT MODAL ---- */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                {selectedUser ? 'Sửa nhân viên' : 'Thêm nhân viên'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Họ tên *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field"
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Số điện thoại</label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))}
                  className="input-field"
                  placeholder="0912.345.678"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Vai trò *</label>
                <select
                  value={userForm.roleId}
                  onChange={(e) => setUserForm((f) => ({ ...f, roleId: e.target.value }))}
                  className="select-field"
                >
                  <option value="">Chọn vai trò</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Phòng ban</label>
                <select
                  value={userForm.department}
                  onChange={(e) => setUserForm((f) => ({ ...f, department: e.target.value }))}
                  className="select-field"
                >
                  <option value="">Chọn phòng ban</option>
                  {['Tele Sale', 'Page', 'Marketing', 'Quản lý', 'Giám sát', 'Quản trị'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Nhóm Tele</label>
                <select
                  value={userForm.teleGroup}
                  onChange={(e) => setUserForm((f) => ({ ...f, teleGroup: e.target.value }))}
                  className="select-field"
                >
                  <option value="">Không có nhóm</option>
                  {teleGroups.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Trạng thái</label>
                <select
                  value={userForm.status}
                  onChange={(e) => setUserForm((f) => ({ ...f, status: e.target.value }))}
                  className="select-field"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tắt</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button onClick={() => setShowUserModal(false)} className="btn-secondary text-sm">
                Hủy
              </button>
              <button
                onClick={handleSaveUser}
                disabled={!userForm.name || !userForm.email || !userForm.roleId}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={15} />
                {selectedUser ? 'Lưu thay đổi' : 'Thêm nhân viên'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- ROLE ASSIGN PANEL ---- */}
      {showRolePanel && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Phân vai trò cho {selectedUser.name}</h3>
              <button
                onClick={() => setShowRolePanel(false)}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {roles.map((role) => {
                const isSelected = userForm.roleId === role.id
                return (
                  <button
                    key={role.id}
                    onClick={() => setUserForm((f) => ({ ...f, roleId: role.id }))}
                    className={clsx(
                      'w-full text-left px-4 py-3 rounded-lg border transition-all',
                      isSelected
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          'w-5 h-5 rounded border flex items-center justify-center',
                          isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-slate-300'
                        )}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          <span className="font-medium text-slate-800 text-sm">{role.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button onClick={() => setShowRolePanel(false)} className="btn-secondary text-sm">
                Hủy
              </button>
              <button
                onClick={handleSaveRoleAssign}
                disabled={!userForm.roleId}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={15} />
                Lưu vai trò
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
