import { useState } from 'react'
import {
  GitBranch,
  Users,
  Clock,
  History,
  Settings,
  Plus,
  X,
  ChevronDown,
  UserPlus,
  Zap,
} from 'lucide-react'
import clsx from 'clsx'
import {
  routingRules as initialRules,
  teleGroupsExtended,
  leadQueues,
  assignmentLogs,
  routingStats,
  services,
  pages,
} from '../../data/mockData'

const OPERATORS = {
  equals: 'bằng',
  in: 'trong',
  contains: 'chứa',
  not_equals: 'không bằng',
}

const FIELD_LABELS = {
  service: 'Dịch vụ',
  page: 'Page',
  isHot: 'Lead nóng',
  interestLevel: 'Mức độ quan tâm',
  campaignName: 'Chiến dịch',
  source: 'Nguồn',
}

const ACTION_LABELS = {
  assign_tele_group: 'Chia nhóm Tele',
  assign_tele_user: 'Chia nhân viên Tele',
  set_priority: 'Đặt ưu tiên',
  notify_leader: 'Thông báo trưởng nhóm',
}

const ACTION_VALUES = {
  assign_tele_group: {
    tg_001: 'Nhóm Lõm Hóp – Hà Nội',
    tg_002: 'Nhóm Mí – Hà Nội',
    tg_003: 'Nhóm Filler – SG',
    tg_004: 'Nhóm Da Liễu',
  },
  assign_tele_user: {
    round_robin: 'Round Robin',
    least_load: 'Nhân viên ít việc nhất',
    specific: 'Chỉ định',
  },
  set_priority: {
    high: 'Cao',
    normal: 'Bình thường',
    low: 'Thấp',
  },
  notify_leader: {
    yes: 'Có',
    no: 'Không',
  },
}

function formatWaitingTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remMins = mins % 60
  return `${hrs}h ${remMins}m`
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getServiceName(id) {
  const s = services.find((x) => x.id === id)
  return s ? s.name : id
}

function getPageName(id) {
  const p = pages.find((x) => x.id === id)
  return p ? p.name : id
}

// ---- Rule Card ----
function RuleCard({ rule, onEdit, onToggle }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-800">{rule.name}</h4>
            <span className="badge-gray text-xs">
              P{rule.priority}
            </span>
          </div>
          <span className={rule.isActive ? 'badge-green' : 'badge-gray'}>
            {rule.isActive ? 'Đang bật' : 'Tắt'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(rule.id)}
            className={clsx(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              rule.isActive ? 'bg-green-500' : 'bg-slate-300'
            )}
          >
            <span
              className={clsx(
                'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm',
                rule.isActive ? 'translate-x-4' : 'translate-x-1'
              )}
            />
          </button>
          <button
            onClick={() => onEdit(rule)}
            className="btn-secondary text-xs px-3 py-1"
          >
            <Settings size={12} className="inline mr-1" />
            Sửa
          </button>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-500 font-medium mb-1.5">Điều kiện:</p>
        <div className="flex flex-wrap gap-1.5">
          {rule.conditions.map((cond, i) => (
            <span key={i} className="badge-blue text-xs">
              {FIELD_LABELS[cond.field] || cond.field} {OPERATORS[cond.operator] || cond.operator}{' '}
              {Array.isArray(cond.value)
                ? cond.value.map((v) => getServiceName(v) || getPageName(v) || v).join(', ')
                : String(cond.value)}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 font-medium mb-1.5">Hành động:</p>
        <div className="flex flex-wrap gap-1.5">
          {rule.actions.map((action, i) => (
            <span key={i} className="badge-yellow text-xs">
              {ACTION_LABELS[action.type] || action.type}:{' '}
              {ACTION_VALUES[action.type]?.[action.value] || action.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Rule Editor Modal ----
function RuleEditor({ rule, onSave, onClose }) {
  const [name, setName] = useState(rule.name)
  const [priority, setPriority] = useState(rule.priority)
  const [isActive, setIsActive] = useState(rule.isActive)
  const [conditions, setConditions] = useState([...rule.conditions])
  const [actions, setActions] = useState([...rule.actions])

  const addCondition = () => {
    setConditions([...conditions, { field: 'service', operator: 'equals', value: '' }])
  }

  const removeCondition = (idx) => {
    setConditions(conditions.filter((_, i) => i !== idx))
  }

  const updateCondition = (idx, key, val) => {
    const updated = [...conditions]
    updated[idx] = { ...updated[idx], [key]: val }
    setConditions(updated)
  }

  const addAction = () => {
    setActions([...actions, { type: 'assign_tele_group', value: 'tg_001' }])
  }

  const removeAction = (idx) => {
    setActions(actions.filter((_, i) => i !== idx))
  }

  const updateAction = (idx, key, val) => {
    const updated = [...actions]
    updated[idx] = { ...updated[idx], [key]: val }
    setActions(updated)
  }

  const handleSave = () => {
    onSave({ ...rule, name, priority, isActive, conditions, actions })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-xl">
          <h3 className="font-semibold text-slate-800">Chỉnh sửa Rule</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tên rule</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full text-sm"
                placeholder="Tên rule..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Ưu tiên</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="input-field w-full text-sm"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600">Bật rule:</label>
            <button
              onClick={() => setIsActive(!isActive)}
              className={clsx(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                isActive ? 'bg-green-500' : 'bg-slate-300'
              )}
            >
              <span
                className={clsx(
                  'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm',
                  isActive ? 'translate-x-4' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">Điều kiện</label>
              <button onClick={addCondition} className="btn-secondary text-xs px-2 py-1">
                <Plus size={12} className="inline mr-0.5" /> Thêm
              </button>
            </div>
            <div className="space-y-2">
              {conditions.map((cond, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                  <select
                    value={cond.field}
                    onChange={(e) => updateCondition(i, 'field', e.target.value)}
                    className="select-field text-xs w-32"
                  >
                    <option value="service">Dịch vụ</option>
                    <option value="page">Page</option>
                    <option value="isHot">Lead nóng</option>
                    <option value="interestLevel">Mức độ quan tâm</option>
                    <option value="campaignName">Chiến dịch</option>
                  </select>
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(i, 'operator', e.target.value)}
                    className="select-field text-xs w-24"
                  >
                    <option value="equals">bằng</option>
                    <option value="in">trong</option>
                    <option value="contains">chứa</option>
                    <option value="not_equals">không bằng</option>
                  </select>
                  {cond.operator === 'in' ? (
                    <select
                      value={Array.isArray(cond.value) ? cond.value[0] || '' : ''}
                      onChange={(e) =>
                        updateCondition(
                          i,
                          'value',
                          [e.target.value]
                        )
                      }
                      className="select-field text-xs flex-1"
                    >
                      <option value="">-- Chọn --</option>
                      {cond.field === 'service' &&
                        services.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      {cond.field === 'page' &&
                        pages.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                  ) : (
                    <input
                      value={cond.value}
                      onChange={(e) => updateCondition(i, 'value', e.target.value)}
                      className="input-field text-xs flex-1"
                      placeholder="Giá trị..."
                    />
                  )}
                  <button
                    onClick={() => removeCondition(i)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">Hành động</label>
              <button onClick={addAction} className="btn-secondary text-xs px-2 py-1">
                <Plus size={12} className="inline mr-0.5" /> Thêm
              </button>
            </div>
            <div className="space-y-2">
              {actions.map((action, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(i, 'type', e.target.value)}
                    className="select-field text-xs w-40"
                  >
                    <option value="assign_tele_group">Chia nhóm Tele</option>
                    <option value="assign_tele_user">Chia nhân viên</option>
                    <option value="set_priority">Đặt ưu tiên</option>
                    <option value="notify_leader">Thông báo TL</option>
                  </select>
                  <select
                    value={action.value}
                    onChange={(e) => updateAction(i, 'value', e.target.value)}
                    className="select-field text-xs flex-1"
                  >
                    {action.type === 'assign_tele_group' &&
                      Object.entries(ACTION_VALUES.assign_tele_group).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    {action.type === 'assign_tele_user' &&
                      Object.entries(ACTION_VALUES.assign_tele_user).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    {action.type === 'set_priority' &&
                      Object.entries(ACTION_VALUES.set_priority).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    {action.type === 'notify_leader' &&
                      Object.entries(ACTION_VALUES.notify_leader).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => removeAction(i)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-slate-200 sticky bottom-0 bg-white rounded-b-xl">
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button onClick={handleSave} className="btn-primary">Lưu</button>
        </div>
      </div>
    </div>
  )
}

// ---- Tele Group Card ----
function TeleGroupCard({ group }) {
  const loadColor =
    group.currentLoad >= 90 ? 'bg-red-500' :
    group.currentLoad >= 70 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-800">{group.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            TL: {group.leaderName}
          </p>
        </div>
        <span className={clsx(
          group.status === 'busy' ? 'badge-red' : 'badge-green'
        )}>
          {group.status === 'busy' ? 'Bận' : 'Hoạt động'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-800">{group.memberCount}</div>
          <div className="text-xs text-slate-500">Nhân viên</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-800">{group.avgResponseTime}</div>
          <div className="text-xs text-slate-500">Phản hồi TB</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-800">{group.currentLoad}%</div>
          <div className="text-xs text-slate-500">Tải hiện tại</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Mức tải</span>
          <span>{group.currentLoad}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={clsx('h-2 rounded-full transition-all', loadColor)}
            style={{ width: `${group.currentLoad}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 font-medium mb-1.5">Dịch vụ phụ trách:</p>
        <div className="flex flex-wrap gap-1">
          {group.assignedServices.map((svc) => (
            <span
              key={svc.id}
              className="badge-gray text-xs"
            >
              {svc.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Queue Table ----
function QueueTab({ queues }) {
  const [selectedGroup, setSelectedGroup] = useState('')

  const priorityClass = {
    high: 'badge-red',
    normal: 'badge-blue',
    low: 'badge-gray',
  }

  const priorityLabel = {
    high: 'Cao',
    normal: 'Bình thường',
    low: 'Thấp',
  }

  const handleAssign = (queue) => {
    alert(`Đã gán lead "${queue.customerName}" cho nhóm được chọn.`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Đang chờ trong hàng đợi ({queues.length})
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="select-field text-xs w-48"
          >
            <option value="">Tất cả nhóm</option>
            {teleGroupsExtended.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Khách hàng</th>
              <th className="table-header">Dịch vụ</th>
              <th className="table-header">Page</th>
              <th className="table-header">Chờ</th>
              <th className="table-header">Ưu tiên</th>
              <th className="table-header">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {queues.map((q) => (
              <tr key={q.leadId} className="table-row">
                <td className="table-cell font-medium">{q.customerName}</td>
                <td className="table-cell">
                  <span className="badge-gray text-xs">{q.service.name}</span>
                </td>
                <td className="table-cell text-slate-500 text-sm">{q.page.name}</td>
                <td className="table-cell">
                  <span className="text-sm text-slate-600">{formatWaitingTime(q.waitingSince)}</span>
                </td>
                <td className="table-cell">
                  <span className={priorityClass[q.priority]}>{priorityLabel[q.priority]}</span>
                </td>
                <td className="table-cell">
                  <button
                    onClick={() => handleAssign(q)}
                    className="btn-primary text-xs px-2 py-1"
                  >
                    <UserPlus size={11} className="inline mr-0.5" />
                    Gán thủ công
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Assignment Log Table ----
function LogTab({ logs }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Lịch sử chia số ({logs.length})
        </h3>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Khách hàng</th>
              <th className="table-header">Dịch vụ</th>
              <th className="table-header">Nhân viên</th>
              <th className="table-header">Nhóm Tele</th>
              <th className="table-header">Phương thức</th>
              <th className="table-header">Rule áp dụng</th>
              <th className="table-header">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="table-row">
                <td className="table-cell font-medium">{log.customerName}</td>
                <td className="table-cell">
                  <span className="badge-gray text-xs">{log.service}</span>
                </td>
                <td className="table-cell text-sm text-slate-600">{log.teleUserName}</td>
                <td className="table-cell text-sm text-slate-500">{log.teleGroupName}</td>
                <td className="table-cell">
                  <span className={log.method === 'auto' ? 'badge-blue' : 'badge-yellow'}>
                    {log.method === 'auto' ? 'Tự động' : 'Thủ công'}
                  </span>
                </td>
                <td className="table-cell text-sm text-slate-500">
                  {log.ruleApplied || '—'}
                </td>
                <td className="table-cell text-xs text-slate-500">{formatDateTime(log.assignedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Main Module ----
export default function RoutingModule() {
  const [activeTab, setActiveTab] = useState('rules')
  const [rules, setRules] = useState(initialRules)
  const [editingRule, setEditingRule] = useState(null)
  const [, setTick] = useState(0)

  const tabs = [
    { id: 'rules', label: 'Rule chia số', icon: GitBranch },
    { id: 'groups', label: 'Nhóm Tele', icon: Users },
    { id: 'queue', label: 'Queue chờ', icon: Clock },
    { id: 'logs', label: 'Lịch sử chia', icon: History },
  ]

  const handleToggleRule = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    )
  }

  const handleSaveRule = (updatedRule) => {
    setRules((prev) =>
      prev.map((r) => (r.id === updatedRule.id ? updatedRule : r))
    )
    setEditingRule(null)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Zap size={18} className="text-blue-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{routingStats.leadsToday}</div>
            <div className="text-xs text-slate-500">Lead hôm nay</div>
          </div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <GitBranch size={18} className="text-green-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{routingStats.autoAssigned}</div>
            <div className="text-xs text-slate-500">Tự động chia</div>
          </div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <UserPlus size={18} className="text-yellow-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{routingStats.manualAssigned}</div>
            <div className="text-xs text-slate-500">Thủ công chia</div>
          </div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Clock size={18} className="text-red-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{routingStats.inQueue}</div>
            <div className="text-xs text-slate-500">Đang chờ</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-fit">
        {tabs.map((tab) => {
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
      <div className="flex-1 min-h-0">
        {activeTab === 'rules' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Danh sách rule ({rules.length})
              </h3>
              <button className="btn-primary text-sm">
                <Plus size={14} className="inline mr-1" />
                Thêm rule
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={setEditingRule}
                  onToggle={handleToggleRule}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {teleGroupsExtended.map((group) => (
              <TeleGroupCard key={group.id} group={group} />
            ))}
          </div>
        )}

        {activeTab === 'queue' && <QueueTab queues={leadQueues} />}

        {activeTab === 'logs' && <LogTab logs={assignmentLogs} />}
      </div>

      {/* Rule Editor Modal */}
      {editingRule && (
        <RuleEditor
          rule={editingRule}
          onSave={handleSaveRule}
          onClose={() => setEditingRule(null)}
        />
      )}
    </div>
  )
}
