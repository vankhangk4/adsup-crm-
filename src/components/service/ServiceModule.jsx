import { useState } from 'react'
import clsx from 'clsx'
import {
  Briefcase,
  LayoutGrid,
  Shield,
  Plus,
  Edit2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Users,
  TrendingUp,
  Activity,
  Tag,
} from 'lucide-react'
import {
  services as initialServices,
  serviceGroups,
  pages,
  teleGroups,
  servicePagePermissions,
  serviceTelePermissions,
  teleLeads,
} from '../../data/mockData'

const COLOR_SWATCHES = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#f97316', '#84cc16',
  '#ef4444', '#a855f7', '#14b8a6', '#6366f1',
]

function formatCurrency(value) {
  if (!value) return '0'
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

function StatsRow({ services, leads }) {
  const activeServices = services.filter((s) => s.status === 'active').length
  const totalLeads = leads.length
  const totalRevenue = leads.reduce((sum, l) => sum + (l.revenue || 0), 0)

  const stats = [
    {
      label: 'Tổng dịch vụ',
      value: services.length,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Dịch vụ đang hoạt động',
      value: activeServices,
      icon: Activity,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Tổng lead',
      value: totalLeads,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Doanh thu',
      value: `${formatCurrency(totalRevenue)}`,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', stat.color)}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ServiceCard({ service, leads, teleLeads, pagePerms, telePerms, onEdit, onToggle }) {
  const [expanded, setExpanded] = useState(false)

  const serviceLeads = leads.filter((l) => l.serviceId === service.id)
  const serviceTeleLeads = teleLeads.filter((l) => l.serviceId === service.id)
  const revenue = serviceTeleLeads.reduce((sum, l) => sum + (l.revenue || 0), 0)

  const assignedPages = pagePerms[service.id] || []
  const assignedTeleGroups = telePerms[service.id] || []
  const scriptCount = 0

  const isActive = service.status === 'active'

  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: service.color }}
            />
            <h3 className="font-semibold text-slate-800">{service.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={isActive ? 'badge-green' : 'badge-gray'}>
              {isActive ? 'Hoạt động' : 'Tắt'}
            </span>
            <span className="badge-gray">{service.group}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {serviceLeads.length} lead
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={14} />
            {formatCurrency(revenue)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(service.id)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-md border transition-colors',
              isActive
                ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
            )}
          >
            {isActive ? 'Tắt dịch vụ' : 'Bật dịch vụ'}
          </button>
          <button
            onClick={() => onEdit(service)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
          >
            <Edit2 size={12} />
            Sửa
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1 ml-auto"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Chi tiết
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Page được phân công</p>
            <div className="flex flex-wrap gap-1">
              {assignedPages.length > 0 ? (
                assignedPages.map((pgId) => {
                  const page = pages.find((p) => p.id === pgId)
                  return page ? (
                    <span key={pgId} className="badge-blue text-xs">{page.name}</span>
                  ) : null
                })
              ) : (
                <span className="text-xs text-slate-400 italic">Chưa phân công</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Nhóm Tele được phân công</p>
            <div className="flex flex-wrap gap-1">
              {assignedTeleGroups.length > 0 ? (
                assignedTeleGroups.map((tgId) => {
                  const tg = teleGroups.find((t) => t.id === tgId)
                  return tg ? (
                    <span key={tgId} className="badge-purple text-xs">{tg.name}</span>
                  ) : null
                })
              ) : (
                <span className="text-xs text-slate-400 italic">Chưa phân công</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Kịch bản liên quan</p>
            <span className="text-xs text-slate-400 italic">
              {scriptCount > 0 ? `${scriptCount} kịch bản` : 'Chưa có kịch bản'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function GroupCard({ group, services }) {
  const groupServices = services.filter((s) => s.group === group.name)
  const totalLeads = 0
  const totalRevenue = 0

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: group.color }}
        >
          {group.name[0]}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{group.name}</h3>
          <p className="text-sm text-slate-500">{groupServices.length} dịch vụ</p>
        </div>
      </div>

      <div className="space-y-2">
        {groupServices.map((svc) => (
          <div key={svc.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: svc.color }}
              />
              <span className="text-sm text-slate-700">{svc.name}</span>
            </div>
            <span className={svc.status === 'active' ? 'badge-green text-xs' : 'badge-gray text-xs'}>
              {svc.status === 'active' ? 'Active' : 'Off'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PermissionMatrix({ services, pages, teleGroups, pagePerms, telePerms }) {
  const [view, setView] = useState('page')

  return (
    <div>
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-fit mb-4">
        <button
          onClick={() => setView('page')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            view === 'page'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <LayoutGrid size={15} />
          Phân quyền Page
        </button>
        <button
          onClick={() => setView('tele')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            view === 'tele'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Shield size={15} />
          Phân quyền Tele
        </button>
      </div>

      <div className="card overflow-x-auto">
        {view === 'page' ? (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="table-header text-left w-48">Page / Dịch vụ</th>
                {services.map((svc) => (
                  <th key={svc.id} className="table-header text-center w-28">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: svc.color }} />
                      <span className="text-xs font-medium">{svc.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 text-sm">{page.name}</span>
                    </div>
                  </td>
                  {services.map((svc) => {
                    const hasPerm = (pagePerms[svc.id] || []).includes(page.id)
                    return (
                      <td key={svc.id} className="table-cell text-center">
                        <div className="flex justify-center">
                          {hasPerm ? (
                            <div className="w-5 h-5 rounded bg-green-100 text-green-600 flex items-center justify-center">
                              <Check size={13} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded bg-slate-100 text-slate-300 flex items-center justify-center">
                              <X size={13} />
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="table-header text-left w-48">Nhóm Tele / Dịch vụ</th>
                {services.map((svc) => (
                  <th key={svc.id} className="table-header text-center w-28">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: svc.color }} />
                      <span className="text-xs font-medium">{svc.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teleGroups.map((tg) => (
                <tr key={tg.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 text-sm">{tg.name}</span>
                    </div>
                  </td>
                  {services.map((svc) => {
                    const hasPerm = (telePerms[svc.id] || []).includes(tg.id)
                    return (
                      <td key={svc.id} className="table-cell text-center">
                        <div className="flex justify-center">
                          {hasPerm ? (
                            <div className="w-5 h-5 rounded bg-green-100 text-green-600 flex items-center justify-center">
                              <Check size={13} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded bg-slate-100 text-slate-300 flex items-center justify-center">
                              <X size={13} />
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ServiceModal({ service, groups, pages, teleGroups, onSave, onClose }) {
  const isEdit = !!service
  const [form, setForm] = useState({
    name: service?.name || '',
    group: service?.group || groups[0]?.name || 'Face',
    color: service?.color || COLOR_SWATCHES[0],
    status: service?.status || 'active',
  })

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({
      ...form,
      id: service?.id || `sv_${Date.now()}`,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên dịch vụ</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field w-full"
              placeholder="VD: Căng Da"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nhóm dịch vụ</label>
            <select
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value })}
              className="select-field w-full"
            >
              {groups.map((g) => (
                <option key={g.name} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={clsx(
                    'w-8 h-8 rounded-lg transition-all flex items-center justify-center',
                    form.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                >
                  {form.color === color && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái</label>
            <div className="flex gap-2">
              {['active', 'inactive'].map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  className={clsx(
                    'flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all',
                    form.status === s
                      ? s === 'active'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                      : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                  )}
                >
                  {s === 'active' ? 'Hoạt động' : 'Tắt'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="btn-secondary text-sm">
            Hủy
          </button>
          <button onClick={handleSave} className="btn-primary text-sm">
            {isEdit ? 'Lưu thay đổi' : 'Tạo dịch vụ'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ServiceModule() {
  const [services, setServices] = useState(initialServices)
  const [pagePerms, setPagePerms] = useState(servicePagePermissions)
  const [telePerms, setTelePerms] = useState(serviceTelePermissions)
  const [activeTab, setActiveTab] = useState('services')
  const [editingService, setEditingService] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const leads = []

  const tabs = [
    { id: 'services', label: 'Dịch vụ', icon: Briefcase },
    { id: 'groups', label: 'Nhóm dịch vụ', icon: Tag },
    { id: 'permissions', label: 'Phân quyền dịch vụ', icon: Shield },
  ]

  const handleToggle = (id) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
      )
    )
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingService(null)
    setShowModal(true)
  }

  const handleSave = (data) => {
    if (editingService) {
      setServices((prev) => prev.map((s) => (s.id === data.id ? { ...s, ...data } : s)))
    } else {
      setServices((prev) => [...prev, data])
    }
    setShowModal(false)
    setEditingService(null)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <StatsRow services={services} leads={teleLeads} />

      <div className="flex items-center justify-between">
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

        {activeTab === 'services' && (
          <button onClick={handleCreate} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={15} />
            Thêm dịch vụ
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                leads={leads}
                teleLeads={teleLeads}
                pagePerms={pagePerms}
                telePerms={telePerms}
                onEdit={handleEdit}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serviceGroups.map((grp) => (
              <GroupCard key={grp.id} group={grp} services={services} />
            ))}
          </div>
        )}

        {activeTab === 'permissions' && (
          <PermissionMatrix
            services={services}
            pages={pages}
            teleGroups={teleGroups}
            pagePerms={pagePerms}
            telePerms={telePerms}
          />
        )}
      </div>

      {showModal && (
        <ServiceModal
          service={editingService}
          groups={serviceGroups}
          pages={pages}
          teleGroups={teleGroups}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingService(null)
          }}
        />
      )}
    </div>
  )
}
