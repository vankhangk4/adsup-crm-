import { useState } from 'react'
import {
  Activity,
  Users,
  Clock,
  Bot,
  ChevronDown,
  ChevronRight,
  Filter,
  Download,
  Settings,
  Shield,
  Bell,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  HardDrive,
  Calendar,
} from 'lucide-react'
import clsx from 'clsx'
import {
  activity_logs,
  system_settings,
  ai_agents,
  backup_history,
} from '../../data/mockData'

const ACTION_LABELS = {
  đăng_nhập: 'Đăng nhập',
  tạo_lead: 'Tạo Lead',
  sửa_lead: 'Sửa Lead',
  chia_lead: 'Chia Lead',
  đổi_quyền: 'Đổi quyền',
  sửa_script: 'Sửa Script',
  duyệt_script: 'Duyệt Script',
  thêm_user: 'Thêm User',
  cấu_hình: 'Cấu hình',
}

const CAPABILITY_LABELS = {
  gợi_ý_script: 'Gợi ý script',
  gợi_câu_trả_lời: 'Gợi câu trả lời',
  chấm_lead_nóng_lạnh: 'Chấm lead nóng/lạnh',
  nhắc_follow_up: 'Nhắc follow-up',
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  const date = d.toLocaleDateString('vi-VN')
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function formatDateTime(ts) {
  const d = new Date(ts)
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getActionBadgeClass(action) {
  switch (action) {
    case 'đăng_nhập': return 'badge-blue'
    case 'tạo_lead': return 'badge-green'
    case 'sửa_lead': return 'badge-yellow'
    case 'chia_lead': return 'badge-green'
    case 'đổi_quyền': return 'badge-red'
    case 'sửa_script': return 'badge-yellow'
    case 'duyệt_script': return 'badge-green'
    case 'thêm_user': return 'badge-green'
    case 'cấu_hình': return 'badge-gray'
    default: return 'badge-gray'
  }
}

// ---- Stats Row ----
function StatsRow() {
  const todayLogs = activity_logs.filter(log => {
    const logDate = new Date(log.timestamp).toDateString()
    const today = new Date().toDateString()
    return logDate === today
  })

  const activeUsersCount = new Set(activity_logs.map(l => l.userId)).size
  const aiActive = ai_agents.some(a => a.status === 'active')

  const stats = [
    {
      label: 'Hoạt động hôm nay',
      value: todayLogs.length,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Người dùng hoạt động',
      value: activeUsersCount,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Uptime hệ thống',
      value: '99.9%',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'AI Agent',
      value: aiActive ? 'Bật' : 'Tắt',
      icon: Bot,
      color: aiActive ? 'text-emerald-600' : 'text-slate-400',
      bg: aiActive ? 'bg-emerald-50' : 'bg-slate-50',
      valueClass: aiActive ? 'text-emerald-600' : 'text-slate-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', s.bg)}>
              <Icon size={20} className={s.color} />
            </div>
            <div>
              <div className={clsx('text-xl font-bold', s.valueClass || 'text-slate-800')}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---- Activity Logs Tab ----
function ActivityLogsTab() {
  const [filterModule, setFilterModule] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  const modules = ['all', ...new Set(activity_logs.map(l => l.module))]
  const users = ['all', ...new Set(activity_logs.map(l => l.userId))]
  const actions = ['all', ...new Set(activity_logs.map(l => l.action))]

  const filtered = activity_logs.filter(log => {
    if (filterModule !== 'all' && log.module !== filterModule) return false
    if (filterUser !== 'all' && log.userId !== filterUser) return false
    if (filterAction !== 'all' && log.action !== filterAction) return false
    if (filterDate) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]
      if (logDate !== filterDate) return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={15} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Bộ lọc</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Module</label>
            <select
              className="select-field text-sm py-1.5"
              value={filterModule}
              onChange={e => setFilterModule(e.target.value)}
            >
              {modules.map(m => (
                <option key={m} value={m}>{m === 'all' ? 'Tất cả' : m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Người dùng</label>
            <select
              className="select-field text-sm py-1.5"
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
            >
              {users.map(u => {
                const name = activity_logs.find(l => l.userId === u)?.userName || u
                return (
                  <option key={u} value={u}>{u === 'all' ? 'Tất cả' : name}</option>
                )
              })}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Hành động</label>
            <select
              className="select-field text-sm py-1.5"
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
            >
              {actions.map(a => (
                <option key={a} value={a}>{a === 'all' ? 'Tất cả' : (ACTION_LABELS[a] || a)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Ngày</label>
            <input
              type="date"
              className="input-field text-sm py-1.5"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              className="btn-secondary text-sm py-1.5"
              onClick={() => {
                setFilterModule('all')
                setFilterUser('all')
                setFilterAction('all')
                setFilterDate('')
              }}
            >
              Xóa lọc
            </button>
            <button className="btn-secondary text-sm py-1.5 flex items-center gap-1">
              <Download size={13} />
              Xuất
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header w-8"></th>
              <th className="table-header">Thời gian</th>
              <th className="table-header">Người dùng</th>
              <th className="table-header">Hành động</th>
              <th className="table-header">Module</th>
              <th className="table-header">Mô tả</th>
              <th className="table-header">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-cell text-center text-slate-400 py-8">
                  Không có dữ liệu phù hợp
                </td>
              </tr>
            ) : (
              filtered.map((log) => {
                const { date, time } = formatTimestamp(log.timestamp)
                const isExpanded = expandedRow === log.id
                return (
                  <>
                    <tr
                      key={log.id}
                      className="table-row cursor-pointer hover:bg-slate-50"
                      onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                    >
                      <td className="table-cell text-center">
                        {isExpanded ? (
                          <ChevronDown size={14} className="inline text-slate-400" />
                        ) : (
                          <ChevronRight size={14} className="inline text-slate-400" />
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="text-xs text-slate-500">{date}</div>
                        <div className="text-sm font-medium">{time}</div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <img
                            src={log.userAvatar}
                            alt={log.userName}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="text-sm font-medium">{log.userName}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={clsx('text-xs', getActionBadgeClass(log.action))}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="table-cell text-sm text-slate-600">{log.module}</td>
                      <td className="table-cell text-sm text-slate-600 max-w-xs truncate">{log.description}</td>
                      <td className="table-cell text-xs text-slate-400 font-mono">{log.ipAddress}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${log.id}-detail`}>
                        <td colSpan={7} className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Người thực hiện</div>
                              <div className="flex items-center gap-2">
                                <img src={log.userAvatar} alt={log.userName} className="w-6 h-6 rounded-full" />
                                <span className="font-medium">{log.userName}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Mục tiêu</div>
                              <div className="font-medium">{log.targetName || '—'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">Loại mục tiêu</div>
                              <div className="font-medium capitalize">{log.target}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 mb-1">IP Address</div>
                              <div className="font-mono text-xs">{log.ipAddress}</div>
                            </div>
                            <div className="col-span-2 md:col-span-4">
                              <div className="text-xs text-slate-500 mb-1">Mô tả chi tiết</div>
                              <div className="text-slate-700">{log.description}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Settings Tab ----
function SettingsTab() {
  const [settings, setSettings] = useState({ ...system_settings })
  const [saved, setSaved] = useState(false)

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* General Settings */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Thông tin chung</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tên công ty</label>
            <input
              type="text"
              className="input-field"
              value={settings.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Hotline</label>
            <input
              type="text"
              className="input-field"
              value={settings.hotline}
              onChange={e => handleChange('hotline', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Địa chỉ</label>
            <input
              type="text"
              className="input-field"
              value={settings.companyAddress}
              onChange={e => handleChange('companyAddress', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={settings.email}
              onChange={e => handleChange('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Múi giờ</label>
            <select
              className="select-field"
              value={settings.timezone}
              onChange={e => handleChange('timezone', e.target.value)}
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lead Management */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Quản lý Lead</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Tự động chia Lead</div>
              <div className="text-xs text-slate-400">Tự động phân phối lead mới cho nhân viên</div>
            </div>
            <button
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                settings.autoAssignEnabled ? 'bg-primary-600' : 'bg-slate-300'
              )}
              onClick={() => handleToggle('autoAssignEnabled')}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  settings.autoAssignEnabled && 'translate-x-5'
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Round Robin</div>
              <div className="text-xs text-slate-400">Chia lead theo vòng tròn đều cho các nhân viên</div>
            </div>
            <button
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                settings.roundRobinEnabled ? 'bg-primary-600' : 'bg-slate-300'
              )}
              onClick={() => handleToggle('roundRobinEnabled')}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  settings.roundRobinEnabled && 'translate-x-5'
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Số lead tối đa / Tele</div>
              <div className="text-xs text-slate-400">Giới hạn số lead được gán cho mỗi nhân viên</div>
            </div>
            <input
              type="number"
              className="input-field w-24 text-center"
              value={settings.maxLeadPerTele}
              onChange={e => handleChange('maxLeadPerTele', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Idle Timeout (phút)</div>
              <div className="text-xs text-slate-400">Tự động đăng xuất sau thời gian không hoạt động</div>
            </div>
            <input
              type="number"
              className="input-field w-24 text-center"
              value={settings.idleTimeoutMinutes}
              onChange={e => handleChange('idleTimeoutMinutes', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Thông báo</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Email Alerts</div>
              <div className="text-xs text-slate-400">Gửi cảnh báo qua email cho admin</div>
            </div>
            <button
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                settings.emailAlertsEnabled ? 'bg-primary-600' : 'bg-slate-300'
              )}
              onClick={() => handleToggle('emailAlertsEnabled')}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  settings.emailAlertsEnabled && 'translate-x-5'
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">SMS Alerts</div>
              <div className="text-xs text-slate-400">Gửi cảnh báo qua SMS</div>
            </div>
            <button
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                settings.smsAlertsEnabled ? 'bg-primary-600' : 'bg-slate-300'
              )}
              onClick={() => handleToggle('smsAlertsEnabled')}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  settings.smsAlertsEnabled && 'translate-x-5'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database size={16} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Quản lý dữ liệu</h3>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Lưu trữ dữ liệu (ngày)</div>
              <div className="text-xs text-slate-400">Số ngày giữ dữ liệu hoạt động</div>
            </div>
            <input
              type="number"
              className="input-field w-24 text-center"
              value={settings.dataRetentionDays}
              onChange={e => handleChange('dataRetentionDays', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-700">Maintenance Mode</div>
              <div className="text-xs text-slate-400">Tắt hệ thống để bảo trì</div>
            </div>
            <button
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                settings.maintenanceMode ? 'bg-primary-600' : 'bg-slate-300'
              )}
              onClick={() => handleToggle('maintenanceMode')}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  settings.maintenanceMode && 'translate-x-5'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button className="btn-primary" onClick={handleSave}>
          Lưu cấu hình
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center gap-1">
            <CheckCircle size={14} />
            Đã lưu thành công
          </span>
        )}
      </div>
    </div>
  )
}

// ---- AI Agent Tab ----
function AIAgentTab() {
  const [agents, setAgents] = useState(ai_agents)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">AI Agents</h3>
          <p className="text-sm text-slate-500">Quản lý cấu hình trợ lý AI hỗ trợ Tele Sale</p>
        </div>
        <button className="btn-primary text-sm flex items-center gap-1">
          + Thêm Agent
        </button>
      </div>

      {agents.map((agent) => (
        <div key={agent.id} className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bot size={24} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{agent.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    agent.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    agent.status === 'inactive' ? 'bg-slate-100 text-slate-500' :
                    'bg-amber-100 text-amber-700'
                  )}>
                    {agent.status === 'active' ? 'Hoạt động' : agent.status === 'inactive' ? 'Tắt' : 'Đang huấn luyện'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{agent.model}</span>
                </div>
              </div>
            </div>
            <button className="btn-secondary text-sm">
              Cấu hình
            </button>
          </div>

          {/* Capabilities */}
          <div className="mb-4">
            <h5 className="text-xs font-medium text-slate-500 uppercase mb-2">Tính năng đã bật</h5>
            <div className="flex flex-wrap gap-2">
              {agent.enabledCapabilities.map((cap) => (
                <span key={cap} className="badge-blue text-xs">
                  {CAPABILITY_LABELS[cap] || cap}
                </span>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <h5 className="text-xs font-medium text-slate-500 uppercase mb-2">System Prompt</h5>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 italic">
              "{agent.prompt}"
            </div>
          </div>

          {/* Placeholder content for deeper config */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Model</label>
                <select className="select-field text-sm" defaultValue={agent.model}>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Temperature</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- Backup Tab ----
function BackupTab() {
  const [backing, setBacking] = useState(false)
  const [lastBackupMsg, setLastBackupMsg] = useState('')

  const handleBackup = () => {
    setBacking(true)
    setLastBackupMsg('')
    setTimeout(() => {
      setBacking(false)
      setLastBackupMsg('Backup thành công!')
      setTimeout(() => setLastBackupMsg(''), 3000)
    }, 2000)
  }

  const totalSize = backup_history.reduce((acc, b) => {
    const num = parseFloat(b.size)
    return acc + num
  }, 0)

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Backup Status Card */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Trạng thái Backup</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <CheckCircle size={20} className="text-emerald-600 mx-auto mb-1" />
            <div className="text-xs text-slate-500">Trạng thái</div>
            <div className="text-sm font-semibold text-emerald-700">Bảo mật</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <HardDrive size={20} className="text-slate-500 mx-auto mb-1" />
            <div className="text-xs text-slate-500">Backup gần nhất</div>
            <div className="text-sm font-semibold text-slate-700">2 ngày trước</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <Calendar size={20} className="text-slate-500 mx-auto mb-1" />
            <div className="text-xs text-slate-500">Backup tiếp theo</div>
            <div className="text-sm font-semibold text-slate-700">Hôm nay 02:00</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <Database size={20} className="text-slate-500 mx-auto mb-1" />
            <div className="text-xs text-slate-500">Tổng dung lượng</div>
            <div className="text-sm font-semibold text-slate-700">{totalSize.toFixed(1)} GB</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn-primary text-sm flex items-center gap-1"
            onClick={handleBackup}
            disabled={backing}
          >
            {backing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Đang backup...
              </>
            ) : (
              <>
                <HardDrive size={14} />
                Backup ngay
              </>
            )}
          </button>
          <button className="btn-secondary text-sm flex items-center gap-1">
            <Download size={14} />
            Tải về bản mới nhất
          </button>
          {lastBackupMsg && (
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <CheckCircle size={14} />
              {lastBackupMsg}
            </span>
          )}
        </div>
      </div>

      {/* Backup History */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Lịch sử Backup</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Tên</th>
              <th className="table-header">Loại</th>
              <th className="table-header">Dung lượng</th>
              <th className="table-header">Trạng thái</th>
              <th className="table-header">Ngày tạo</th>
              <th className="table-header">Người tạo</th>
            </tr>
          </thead>
          <tbody>
            {backup_history.map((bk) => (
              <tr key={bk.id} className="table-row">
                <td className="table-cell font-medium text-sm">{bk.name}</td>
                <td className="table-cell">
                  <span className={clsx(
                    'text-xs',
                    bk.type === 'full' ? 'badge-blue' : 'badge-gray'
                  )}>
                    {bk.type === 'full' ? 'Full' : 'Incremental'}
                  </span>
                </td>
                <td className="table-cell text-sm text-slate-600">{bk.size}</td>
                <td className="table-cell">
                  {bk.status === 'success' ? (
                    <span className="badge-green text-xs flex items-center gap-1 w-fit">
                      <CheckCircle size={10} />
                      Thành công
                    </span>
                  ) : bk.status === 'failed' ? (
                    <span className="badge-red text-xs flex items-center gap-1 w-fit">
                      <XCircle size={10} />
                      Thất bại
                    </span>
                  ) : (
                    <span className="badge-yellow text-xs flex items-center gap-1 w-fit">
                      <AlertCircle size={10} />
                      Đang xử lý
                    </span>
                  )}
                </td>
                <td className="table-cell text-sm text-slate-500">{formatDateTime(bk.createdAt)}</td>
                <td className="table-cell text-sm text-slate-500">{bk.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Main SystemModule ----
export default function SystemModule() {
  const [activeTab, setActiveTab] = useState('logs')

  const tabs = [
    { id: 'logs', label: 'Nhật ký hoạt động' },
    { id: 'settings', label: 'Cấu hình' },
    { id: 'ai', label: 'AI Agent' },
    { id: 'backup', label: 'Backup' },
  ]

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Stats */}
      <StatsRow />

      {/* Tab Toggle */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'logs' && <ActivityLogsTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'ai' && <AIAgentTab />}
        {activeTab === 'backup' && <BackupTab />}
      </div>
    </div>
  )
}
