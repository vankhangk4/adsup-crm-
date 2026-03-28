import { useState } from 'react'
import {
  Users,
  LayoutGrid,
  Briefcase,
  FileText,
  Target,
  CheckSquare,
  Square,
} from 'lucide-react'
import clsx from 'clsx'
import {
  users,
  pages,
  services,
  scriptTemplates,
  userPagePermissions,
  userServicePermissions,
  userScriptPermissions,
  userLeadScopePermissions,
} from '../../data/mockData'

const TABS = [
  { id: 'page', label: 'Quyền theo Page', icon: LayoutGrid },
  { id: 'service', label: 'Quyền theo Dịch vụ', icon: Briefcase },
  { id: 'script', label: 'Quyền theo Script', icon: FileText },
  { id: 'lead_scope', label: 'Phạm vi Lead', icon: Target },
]

// Group users by department
function groupByDepartment(userList) {
  const groups = {}
  userList.forEach((u) => {
    const dept = u.department || 'Khác'
    if (!groups[dept]) groups[dept] = []
    groups[dept].push(u)
  })
  return groups
}

// Permission checkbox cell
function PermCell({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-center w-8 h-8 rounded transition-colors hover:bg-slate-100"
      title={checked ? 'Bỏ phân quyền' : 'Cấp phân quyền'}
    >
      {checked ? (
        <CheckSquare size={16} className="text-primary-600" />
      ) : (
        <Square size={16} className="text-slate-300" />
      )}
    </button>
  )
}

// Toggle switch
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={clsx(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        checked ? 'bg-primary-600' : 'bg-slate-200'
      )}
    >
      <span
        className={clsx(
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-1'
        )}
      />
    </button>
  )
}

export default function PermissionModule() {
  // ---- State ----
  const [activeTab, setActiveTab] = useState('page')
  const [filterUser, setFilterUser] = useState('')
  const [filterScript, setFilterScript] = useState('')

  // Page permissions (local copy)
  const [pagePerms, setPagePerms] = useState(() =>
    userPagePermissions.map((p) => ({ ...p }))
  )

  // Service permissions (local copy)
  const [servicePerms, setServicePerms] = useState(() =>
    userServicePermissions.map((p) => ({ ...p }))
  )

  // Script permissions (local copy)
  const [scriptPerms, setScriptPerms] = useState(() =>
    userScriptPermissions.map((p) => ({ ...p }))
  )

  // Lead scope permissions (local copy)
  const [leadScopes, setLeadScopes] = useState(() =>
    userLeadScopePermissions.map((s) => ({ ...s }))
  )

  // ---- Stats ----
  const totalUsers = users.length
  const pagesAssigned = pagePerms.filter((p) => p.canView || p.canEdit).length
  const servicesAssigned = servicePerms.filter((p) => p.canHandle).length
  const scriptsAssigned = scriptPerms.filter((p) => p.canUse).length

  // ---- Handlers ----
  const togglePagePerm = (userId, pageId, field) => {
    setPagePerms((prev) =>
      prev.map((p) =>
        p.userId === userId && p.pageId === pageId
          ? { ...p, [field]: !p[field] }
          : p
      )
    )
  }

  const toggleServicePerm = (userId, serviceId) => {
    setServicePerms((prev) =>
      prev.map((p) =>
        p.userId === userId && p.serviceId === serviceId
          ? { ...p, canHandle: !p.canHandle }
          : p
      )
    )
  }

  const toggleScriptPerm = (userId, scriptId) => {
    setScriptPerms((prev) =>
      prev.map((p) =>
        p.userId === userId && p.scriptId === scriptId
          ? { ...p, canUse: !p.canUse }
          : p
      )
    )
  }

  const changeLeadScope = (userId, newScope) => {
    setLeadScopes((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, scope: newScope } : s))
    )
  }

  // ---- Helpers ----
  const getPagePerm = (userId, pageId) =>
    pagePerms.find((p) => p.userId === userId && p.pageId === pageId)
  const getServicePerm = (userId, serviceId) =>
    servicePerms.find((p) => p.userId === userId && p.serviceId === serviceId)
  const getScriptPerm = (userId, scriptId) =>
    scriptPerms.find((p) => p.userId === userId && p.scriptId === scriptId)
  const getLeadScope = (userId) =>
    leadScopes.find((s) => s.userId === userId)

  const scopeLabels = {
    all: 'Tất cả',
    assigned: 'Được giao',
    group: 'Theo nhóm',
  }
  const scopeDescriptions = {
    all: 'Xem và quản lý mọi lead trong hệ thống',
    assigned: 'Chỉ xem và quản lý lead được chia trực tiếp',
    group: 'Xem và quản lý lead của nhóm làm việc',
  }
  const scopeBadgeColors = {
    all: 'badge-green',
    assigned: 'badge-blue',
    group: 'badge-yellow',
  }

  // Filtered users for script tab
  const filteredScriptRows = scriptPerms.filter((sp) => {
    const user = users.find((u) => u.id === sp.userId)
    const script = scriptTemplates.find((s) => s.id === sp.scriptId)
    const matchUser =
      !filterUser || (user && user.name.toLowerCase().includes(filterUser.toLowerCase()))
    const matchScript =
      !filterScript ||
      (script && script.name.toLowerCase().includes(filterScript.toLowerCase()))
    return matchUser && matchScript
  })

  const deptGroups = groupByDepartment(users)

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalUsers}</div>
            <div className="text-xs text-slate-500">Nhân viên</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <LayoutGrid size={20} className="text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{pagesAssigned}</div>
            <div className="text-xs text-slate-500">Phân quyền Page</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Briefcase size={20} className="text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{servicesAssigned}</div>
            <div className="text-xs text-slate-500">Phân quyền Dịch vụ</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <FileText size={20} className="text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{scriptsAssigned}</div>
            <div className="text-xs text-slate-500">Phân quyền Script</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'page' && (
        <PageMatrix
          pages={pages}
          deptGroups={deptGroups}
          getPagePerm={getPagePerm}
          togglePagePerm={togglePagePerm}
        />
      )}

      {activeTab === 'service' && (
        <ServiceMatrix
          services={services}
          deptGroups={deptGroups}
          getServicePerm={getServicePerm}
          toggleServicePerm={toggleServicePerm}
        />
      )}

      {activeTab === 'script' && (
        <ScriptTable
          users={users}
          scriptTemplates={scriptTemplates}
          filteredScriptRows={filteredScriptRows}
          filterUser={filterUser}
          setFilterUser={setFilterUser}
          filterScript={filterScript}
          setFilterScript={setFilterScript}
          getScriptPerm={getScriptPerm}
          toggleScriptPerm={toggleScriptPerm}
        />
      )}

      {activeTab === 'lead_scope' && (
        <LeadScopeTable
          users={users}
          getLeadScope={getLeadScope}
          changeLeadScope={changeLeadScope}
          scopeLabels={scopeLabels}
          scopeDescriptions={scopeDescriptions}
          scopeBadgeColors={scopeBadgeColors}
        />
      )}
    </div>
  )
}

// ---- Page Matrix ----
function PageMatrix({ pages, deptGroups, getPagePerm, togglePagePerm }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-header text-left w-52 sticky left-0 bg-slate-50 z-10">
                Nhân viên
              </th>
              {pages.map((page) => (
                <th key={page.id} className="table-header text-center min-w-[120px]">
                  <div className="leading-tight">
                    <div className="font-medium">{page.name}</div>
                    <span className="text-xs text-slate-400">{page.type}</span>
                  </div>
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-header sticky left-0 bg-slate-50 z-10" />
              {pages.map((page) => (
                <th key={page.id} className="table-header text-center py-1.5">
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-xs text-slate-500">Xem</span>
                    <span className="text-xs text-slate-500">Sửa</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(deptGroups).map(([dept, deptUsers]) => (
              <>
                <tr key={dept} className="bg-slate-100">
                  <td colSpan={pages.length + 1} className="table-header text-left px-3 py-1.5 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    {dept}
                  </td>
                </tr>
                {deptUsers.map((user) => (
                  <tr key={user.id} className="table-row hover:bg-slate-50">
                    <td className="table-cell sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    {pages.map((page) => {
                      const perm = getPagePerm(user.id, page.id)
                      return (
                        <td key={page.id} className="table-cell text-center">
                          <div className="flex items-center justify-center gap-4">
                            <PermCell
                              checked={!!perm?.canView}
                              onChange={() => togglePagePerm(user.id, page.id, 'canView')}
                            />
                            <PermCell
                              checked={!!perm?.canEdit}
                              onChange={() => togglePagePerm(user.id, page.id, 'canEdit')}
                            />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Service Matrix ----
function ServiceMatrix({ services, deptGroups, getServicePerm, toggleServicePerm }) {
  // Group services by group
  const serviceGroups = {}
  services.forEach((s) => {
    if (!serviceGroups[s.group]) serviceGroups[s.group] = []
    serviceGroups[s.group].push(s)
  })

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-header text-left w-52 sticky left-0 bg-slate-50 z-10">
                Nhân viên
              </th>
              {services.map((svc) => (
                <th
                  key={svc.id}
                  className="table-header text-center min-w-[90px]"
                >
                  <div className="leading-tight">
                    <div
                      className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: svc.color }}
                    />
                    <div className="font-medium text-xs">{svc.name}</div>
                  </div>
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-header sticky left-0 bg-slate-50 z-10" />
              {services.map((svc) => (
                <th key={svc.id} className="table-header text-center py-1.5">
                  <span className="text-xs text-slate-500">Xử lý</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(deptGroups).map(([dept, deptUsers]) => (
              <>
                <tr key={dept} className="bg-slate-100">
                  <td colSpan={services.length + 1} className="table-header text-left px-3 py-1.5 font-semibold text-slate-700 text-xs uppercase tracking-wide">
                    {dept}
                  </td>
                </tr>
                {deptUsers.map((user) => (
                  <tr key={user.id} className="table-row hover:bg-slate-50">
                    <td className="table-cell sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    {services.map((svc) => {
                      const perm = getServicePerm(user.id, svc.id)
                      return (
                        <td key={svc.id} className="table-cell text-center">
                          <PermCell
                            checked={!!perm?.canHandle}
                            onChange={() => toggleServicePerm(user.id, svc.id)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Script Table ----
function ScriptTable({
  users,
  scriptTemplates,
  filteredScriptRows,
  filterUser,
  setFilterUser,
  filterScript,
  setFilterScript,
  getScriptPerm,
  toggleScriptPerm,
}) {
  // Group by user for display
  const userScriptsMap = {}
  filteredScriptRows.forEach((sp) => {
    if (!userScriptsMap[sp.userId]) userScriptsMap[sp.userId] = []
    userScriptsMap[sp.userId].push(sp)
  })

  return (
    <div className="flex flex-col gap-3">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Lọc theo nhân viên..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="input-field pl-9 text-sm w-full"
          />
          <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Lọc theo kịch bản..."
            value={filterScript}
            onChange={(e) => setFilterScript(e.target.value)}
            className="input-field pl-9 text-sm w-full"
          />
          <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-header text-left">Nhân viên</th>
              <th className="table-header text-left">Kịch bản</th>
              <th className="table-header text-left">Danh mục</th>
              <th className="table-header text-center">Sử dụng</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(userScriptsMap).map(([userId, perms]) => {
              const user = users.find((u) => u.id === userId)
              if (!user) return null
              return perms.map((sp, idx) => {
                const script = scriptTemplates.find((s) => s.id === sp.scriptId)
                if (!script) return null
                return (
                  <tr key={`${userId}-${sp.scriptId}`} className="table-row hover:bg-slate-50">
                    {idx === 0 && (
                      <td
                        className="table-cell"
                        rowSpan={perms.length}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-slate-400">{user.department}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="table-cell">
                      <div className="font-medium text-sm">{script.name}</div>
                    </td>
                    <td className="table-cell">
                      <span className="badge-gray">{script.category}</span>
                    </td>
                    <td className="table-cell text-center">
                      <Toggle
                        checked={sp.canUse}
                        onChange={() => toggleScriptPerm(userId, sp.scriptId)}
                      />
                    </td>
                  </tr>
                )
              })
            })}
            {Object.keys(userScriptsMap).length === 0 && (
              <tr>
                <td colSpan={4} className="table-cell text-center text-slate-400 py-8">
                  Không có kết quả phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Lead Scope Table ----
function LeadScopeTable({
  users,
  getLeadScope,
  changeLeadScope,
  scopeLabels,
  scopeDescriptions,
  scopeBadgeColors,
}) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="table-header text-left">Nhân viên</th>
            <th className="table-header text-left">Phòng ban</th>
            <th className="table-header text-center">Phạm vi</th>
            <th className="table-header text-left">Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const scope = getLeadScope(user.id)
            const currentScope = scope?.scope || 'assigned'
            return (
              <tr key={user.id} className="table-row hover:bg-slate-50">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.role}</div>
                    </div>
                  </div>
                </td>
                <td className="table-cell text-slate-600">{user.department}</td>
                <td className="table-cell text-center">
                  <select
                    value={currentScope}
                    onChange={(e) => changeLeadScope(user.id, e.target.value)}
                    className="select-field text-sm mx-auto"
                  >
                    <option value="all">{scopeLabels.all}</option>
                    <option value="assigned">{scopeLabels.assigned}</option>
                    <option value="group">{scopeLabels.group}</option>
                  </select>
                </td>
                <td className="table-cell text-slate-500 text-sm">
                  {scopeDescriptions[currentScope]}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
