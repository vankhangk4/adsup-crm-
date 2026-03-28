import { useState } from 'react'
import {
  FileText, Search, Plus, X, ChevronDown, ChevronUp,
  Copy, Check, Clock, User, MessageSquare, CheckCircle,
  XCircle, AlertCircle, Edit2, Trash2, Filter
} from 'lucide-react'
import {
  scriptTemplates, scriptCategories, scriptVersions,
  scriptTargets, scriptUsageLogs, services, pages, teleGroups
} from '../../data/mockData'
import clsx from 'clsx'

// ---- Helpers ----
const statusConfig = {
  approved: { label: 'Đã duyệt', class: 'badge-green' },
  pending: { label: 'Chờ duyệt', class: 'badge-yellow' },
  draft: { label: 'Bản nháp', class: 'badge-gray' },
}

const typeConfig = {
  tele: { label: 'Tele', class: 'badge-blue' },
  page: { label: 'Page', class: 'badge-purple' },
  both: { label: 'Tele & Page', class: 'badge-green' },
}

const typeBadgePurple = 'bg-purple-100 text-purple-700 text-[11px] px-2 py-0.5 rounded-full font-medium'

function getServiceName(id) {
  const s = services.find((sv) => sv.id === id)
  return s ? s.name : id
}

function getPageName(id) {
  const p = pages.find((pg) => pg.id === id)
  return p ? p.name : id
}

function getTeleGroupName(id) {
  const tg = teleGroups.find((t) => t.id === id)
  return tg ? tg.name : id
}

function getUsageCount(scriptId) {
  return scriptUsageLogs.filter((l) => l.scriptId === scriptId).length
}

function getVersionCount(scriptId) {
  const versions = scriptVersions[scriptId]
  return versions ? versions.length : 1
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function timeAgo(dateStr) {
  const now = new Date('2026-03-28T12:00:00Z')
  const then = new Date(dateStr)
  const diffMs = now - then
  const diffH = Math.floor(diffMs / 3600000)
  if (diffH < 1) return 'Vừa xong'
  if (diffH < 24) return `${diffH}h trước`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `${diffD} ngày trước`
  return formatDate(dateStr)
}

// ---- Script Card ----
function ScriptCard({ script, expanded, onToggle, onEdit }) {
  const [copied, setCopied] = useState(false)
  const versions = scriptVersions[script.id] || [{ version: 1, content: script.content, createdAt: '2026-01-01T00:00:00Z', author: 'Admin' }]
  const target = scriptTargets[script.id] || { pages: [], teleGroups: [] }
  const usageCount = getUsageCount(script.id)
  const typeCfg = typeConfig[script.type] || typeConfig.tele
  const statusCfg = statusConfig[script.status] || statusConfig.draft

  const handleCopy = () => {
    navigator.clipboard.writeText(script.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Card header */}
      <div
        className="flex items-start justify-between gap-3 p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="badge">{script.category}</span>
            <span className={typeCfg.class}>{typeCfg.label}</span>
            <span className={statusCfg.class}>{statusCfg.label}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">{script.name}</h4>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />v{getVersionCount(script.id)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={12} />{usageCount} lần dùng
            </span>
            {target.pages && target.pages.length > 0 && (
              <span className="text-slate-400">| {target.pages.length} page</span>
            )}
            {target.teleGroups && target.teleGroups.length > 0 && (
              <span className="text-slate-400">| {target.teleGroups.length} nhóm</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(script) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Sửa"
          >
            <Edit2 size={14} />
          </button>
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {/* Script content */}
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Nội dung hiện tại</h5>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 leading-relaxed">
              {script.content}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">
                {script.serviceIds.length} dịch vụ: {script.serviceIds.slice(0, 3).map(getServiceName).join(', ')}
                {script.serviceIds.length > 3 ? ` +${script.serviceIds.length - 3}` : ''}
              </span>
              <button
                onClick={handleCopy}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {copied ? <><Check size={12} /> Đã copy</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Service tags */}
          {script.serviceIds.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Dịch vụ áp dụng</h5>
              <div className="flex flex-wrap gap-1.5">
                {script.serviceIds.map((sid) => (
                  <span key={sid} className="badge-gray text-[11px]">{getServiceName(sid)}</span>
                ))}
              </div>
            </div>
          )}

          {/* Version history */}
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Lịch sử phiên bản</h5>
            <div className="space-y-2">
              {[...versions].reverse().map((v) => (
                <div key={v.version} className={clsx(
                  'flex items-start gap-3 p-2.5 rounded-lg border',
                  v.version === versions.length ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'
                )}>
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={clsx(
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                      v.version === versions.length ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                    )}>
                      {v.version}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-slate-700">{v.author}</span>
                      <span className="text-xs text-slate-400">{timeAgo(v.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{v.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Script Editor Modal ----
function ScriptEditorModal({ script, categories, allServices, allPages, allTeleGroups, onSave, onClose }) {
  const [form, setForm] = useState({
    name: script?.name || '',
    category: script?.category || categories[0]?.name || 'Chào hỏi',
    type: script?.type || 'tele',
    content: script?.content || '',
    serviceIds: script?.serviceIds || [],
    status: script?.status || 'draft',
  })

  const handleServiceToggle = (svId) => {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(svId)
        ? prev.serviceIds.filter((id) => id !== svId)
        : [...prev.serviceIds, svId],
    }))
  }

  const handleSave = () => {
    onSave({ ...form, id: script?.id || `scr_${Date.now()}` })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-800">
            {script?.id ? 'Sửa kịch bản' : 'Tạo kịch bản mới'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên kịch bản</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field w-full"
              placeholder="Nhập tên kịch bản..."
            />
          </div>

          {/* Category & Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="select-field w-full"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="select-field w-full"
              >
                <option value="tele">Tele Sale</option>
                <option value="page">Page</option>
                <option value="both">Cả hai</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="select-field w-full"
            >
              <option value="draft">Bản nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung kịch bản</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="input-field w-full min-h-[120px] resize-y"
              placeholder="Nhập nội dung kịch bản... Sử dụng [Placeholder] cho các trường cần điền khi sử dụng."
            />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dịch vụ áp dụng</label>
            <div className="flex flex-wrap gap-2">
              {allServices.map((sv) => (
                <button
                  key={sv.id}
                  onClick={() => handleServiceToggle(sv.id)}
                  className={clsx(
                    'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                    form.serviceIds.includes(sv.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {sv.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button onClick={handleSave} className="btn-primary">Lưu kịch bản</button>
        </div>
      </div>
    </div>
  )
}

// ---- Main Module ----
export default function ScriptModule() {
  const [activeTab, setActiveTab] = useState('scripts')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterService, setFilterService] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [editScript, setEditScript] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [scripts, setScripts] = useState(scriptTemplates)
  const [reviewComment, setReviewComment] = useState({})

  // Stats
  const totalScripts = scripts.length
  const activeScripts = scripts.filter((s) => s.status === 'approved').length
  const pendingScripts = scripts.filter((s) => s.status === 'pending').length
  const totalUsage = scriptUsageLogs.length

  // Filters
  const filteredScripts = scripts.filter((s) => {
    if (filterCategory !== 'all' && s.category !== filterCategory) return false
    if (filterType !== 'all' && s.type !== filterType) return false
    if (filterService !== 'all' && !s.serviceIds.includes(filterService)) return false
    if (search) {
      const q = search.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    }
    return true
  })

  const pendingScriptsList = scripts.filter((s) => s.status === 'pending')

  const handleEdit = (script) => {
    setEditScript(script)
    setShowEditor(true)
  }

  const handleNewScript = () => {
    setEditScript(null)
    setShowEditor(true)
  }

  const handleSave = (scriptData) => {
    if (editScript) {
      setScripts((prev) => prev.map((s) => s.id === scriptData.id ? { ...s, ...scriptData } : s))
    } else {
      setScripts((prev) => [...prev, { ...scriptData, id: `scr_${Date.now()}` }])
    }
    setShowEditor(false)
    setEditScript(null)
  }

  const handleApprove = (scriptId) => {
    setScripts((prev) => prev.map((s) => s.id === scriptId ? { ...s, status: 'approved' } : s))
  }

  const handleReject = (scriptId) => {
    setScripts((prev) => prev.map((s) => s.id === scriptId ? { ...s, status: 'draft' } : s))
  }

  const tabs = [
    { id: 'scripts', label: 'Kịch bản', count: scripts.length },
    { id: 'categories', label: 'Danh mục', count: scriptCategories.length },
    { id: 'approval', label: 'Phê duyệt', count: pendingScripts.length },
  ]

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText size={18} className="text-blue-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{totalScripts}</div>
              <div className="text-xs text-slate-500">Tổng kịch bản</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{activeScripts}</div>
              <div className="text-xs text-slate-500">Đã phê duyệt</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <MessageSquare size={18} className="text-amber-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{totalUsage}</div>
              <div className="text-xs text-slate-500">Lượt sử dụng</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock size={18} className="text-orange-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{pendingScripts}</div>
              <div className="text-xs text-slate-500">Chờ phê duyệt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-1">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                activeTab === tab.id
                  ? 'bg-white shadow-sm text-slate-800'
                  : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={clsx(
                  'text-[11px] px-1.5 py-0.5 rounded-full',
                  activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'scripts' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm kịch bản..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-8 py-2 text-sm w-full"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="select-field text-sm py-2"
              >
                <option value="all">Tất cả danh mục</option>
                {scriptCategories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="select-field text-sm py-2"
              >
                <option value="all">Tất cả loại</option>
                <option value="tele">Tele</option>
                <option value="page">Page</option>
                <option value="both">Cả hai</option>
              </select>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="select-field text-sm py-2"
              >
                <option value="all">Tất cả dịch vụ</option>
                {services.map((sv) => (
                  <option key={sv.id} value={sv.id}>{sv.name}</option>
                ))}
              </select>
              <button onClick={handleNewScript} className="btn-primary text-sm py-2 flex items-center gap-1.5">
                <Plus size={14} /> Tạo mới
              </button>
            </div>
          </div>

          {/* Script list */}
          <div className="space-y-3">
            {filteredScripts.length === 0 ? (
              <div className="card p-12 text-center">
                <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Không tìm thấy kịch bản phù hợp</p>
              </div>
            ) : (
              filteredScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  expanded={expandedId === script.id}
                  onToggle={() => setExpandedId(expandedId === script.id ? null : script.id)}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scriptCategories.map((cat) => {
            const catScripts = scripts.filter((s) => s.category === cat.name)
            return (
              <div key={cat.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{cat.name}</h4>
                    <span className="text-xs text-slate-500">{catScripts.length} kịch bản</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-3">{cat.description}</p>
                <div className="space-y-1.5">
                  {catScripts.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700 truncate flex-1">{s.name}</span>
                      <span className={clsx(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-2 flex-shrink-0',
                        s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {statusConfig[s.status]?.label}
                      </span>
                    </div>
                  ))}
                  {catScripts.length > 3 && (
                    <button
                      onClick={() => { setFilterCategory(cat.name); setActiveTab('scripts') }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Xem thêm {catScripts.length - 3} kịch bản
                    </button>
                  )}
                  {catScripts.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Chưa có kịch bản</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'approval' && (
        <div className="space-y-4">
          {pendingScriptsList.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 font-medium">Tất cả kịch bản đã được xử lý</p>
              <p className="text-xs text-slate-400 mt-1">Không có kịch bản nào đang chờ phê duyệt</p>
            </div>
          ) : (
            pendingScriptsList.map((script) => (
              <div key={script.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge">{script.category}</span>
                      <span className={typeConfig[script.type]?.class || 'badge-blue'}>{typeConfig[script.type]?.label}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">{script.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(script.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle size={14} /> Duyệt
                    </button>
                    <button
                      onClick={() => handleReject(script.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <XCircle size={14} /> Từ chối
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 mb-3">
                  {script.content}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {script.serviceIds.length} dịch vụ: {script.serviceIds.slice(0, 3).map(getServiceName).join(', ')}
                    {script.serviceIds.length > 3 ? ` +${script.serviceIds.length - 3}` : ''}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <textarea
                    placeholder="Nhập ý kiến phê duyệt..."
                    value={reviewComment[script.id] || ''}
                    onChange={(e) => setReviewComment((p) => ({ ...p, [script.id]: e.target.value }))}
                    className="input-field flex-1 text-sm min-h-[60px] resize-none"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Editor modal */}
      {showEditor && (
        <ScriptEditorModal
          script={editScript}
          categories={scriptCategories}
          allServices={services}
          allPages={pages}
          allTeleGroups={teleGroups}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditScript(null) }}
        />
      )}
    </div>
  )
}
