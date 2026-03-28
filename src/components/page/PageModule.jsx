import { useState } from 'react'
import {
  LayoutGrid,
  Users,
  MessageSquare,
  TrendingUp,
  Globe,
  Facebook,
  Instagram,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  X,
  Check,
} from 'lucide-react'
import clsx from 'clsx'
import { pages, channels, pageAccounts, pageGroups, pageUserAssignments, pageStats } from '../../data/mockData'

// Helper: get channel info by name
const getChannelInfo = (type) => {
  return channels.find((c) => c.name === type) || channels[0]
}

// Helper: get page type icon
const PageTypeIcon = ({ type }) => {
  const channel = getChannelInfo(type)
  const icons = {
    Facebook: Facebook,
    Instagram: Instagram,
    'Zalo OA': Globe,
    Website: Globe,
  }
  const Icon = icons[channel.name] || Globe
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: channel.bg }}
    >
      <Icon size={16} style={{ color: channel.color }} />
    </div>
  )
}

// Stats row component
function PageStatsRow() {
  const stats = [
    { label: 'Tổng Page', value: pageStats.totalPages, icon: LayoutGrid, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Tổng Nick', value: pageStats.totalNicks, icon: Users, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Hội thoại đang chạy', value: pageStats.activeConversations, icon: MessageSquare, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Lead hôm nay', value: pageStats.leadsToday, icon: TrendingUp, color: '#f59e0b', bg: '#fffbeb' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.bg }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
            </div>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}

// Single page card component
function PageCard({ page, nicks, onSelect, isSelected }) {
  const [expanded, setExpanded] = useState(false)
  const channel = getChannelInfo(page.type)
  const totalLeads = nicks.reduce((sum, n) => sum + n.leadCount, 0)
  const activeNicks = nicks.filter((n) => n.status === 'active').length
  const assignedUsers = pageUserAssignments.filter((a) => a.pageId === page.id)
  const avatars = ['https://i.pravatar.cc/150?img=33', 'https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=5']

  const handleCardClick = () => {
    setExpanded(!expanded)
    onSelect(page)
  }

  return (
    <div
      className={clsx(
        'card p-4 transition-all cursor-pointer',
        isSelected && 'ring-2 ring-primary-500'
      )}
    >
      <div onClick={handleCardClick}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <PageTypeIcon type={page.type} />
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">{page.name}</h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
                style={{ backgroundColor: channel.bg, color: channel.color }}
              >
                {page.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                page.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              {page.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            <button className="text-slate-400 hover:text-slate-600 p-0.5">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {activeNicks}/{nicks.length} nick
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            {totalLeads} lead
          </span>
        </div>

        {assignedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {avatars.slice(0, assignedUsers.length).map((av, i) => (
                <img
                  key={i}
                  src={av}
                  alt=""
                  className="w-6 h-6 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">{assignedUsers.length} người phụ trách</span>
          </div>
        )}
      </div>

      {/* Expanded nick list */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Danh sách nick</span>
            <span className="text-xs text-slate-400">{nicks.length} nick</span>
          </div>
          <div className="space-y-1">
            {nicks.map((nick) => (
              <div key={nick.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    nick.status === 'active' ? 'bg-green-500' : 'bg-slate-300'
                  )} />
                  <span className="font-medium text-slate-700">{nick.nickName}</span>
                  <span className="text-slate-400 capitalize">({nick.nickType})</span>
                </div>
                <span className="text-slate-400">{nick.leadCount} lead</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Nick management panel
function NickManagementPanel({ page, nicks, onClose }) {
  const [nickList, setNickList] = useState(nicks)
  const channel = getChannelInfo(page.type)

  const toggleNick = (nickId) => {
    setNickList((prev) =>
      prev.map((n) =>
        n.id === nickId ? { ...n, status: n.status === 'active' ? 'inactive' : 'active' } : n
      )
    )
  }

  const nickTypeLabels = {
    fanpage: 'Fanpage',
    ads: 'Quảng cáo',
    agent: 'Agent',
    instagram: 'Instagram',
  }

  const nickTypeColors = {
    fanpage: 'badge-blue',
    ads: 'badge-yellow',
    agent: 'badge-green',
    instagram: 'badge-red',
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <PageTypeIcon type={page.type} />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{page.name}</h3>
            <span className="text-xs text-slate-500">Quản lý nick</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              page.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            )}
          >
            {page.status === 'active' ? 'Active' : 'Inactive'}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {nickList.map((nick) => (
          <div
            key={nick.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleNick(nick.id)}
                className="text-slate-400 hover:text-slate-600"
              >
                {nick.status === 'active' ? (
                  <ToggleRight size={22} className="text-green-500" />
                ) : (
                  <ToggleLeft size={22} className="text-slate-300" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-700">{nick.nickName}</span>
                  <span className={clsx('text-xs px-1.5 py-0.5 rounded', nickTypeColors[nick.nickType] || 'badge-gray')}>
                    {nickTypeLabels[nick.nickType] || nick.nickType}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-400">{nick.leadCount} lead</span>
                  <div className="flex -space-x-1">
                    {nick.assignedUsers.slice(0, 2).map((uid, i) => (
                      <img
                        key={i}
                        src={`https://i.pravatar.cc/150?img=${30 + i}`}
                        alt=""
                        className="w-4 h-4 rounded-full border border-white"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <UserPlus size={12} />
                Gán
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Page group card
function PageGroupCard({ group }) {
  const groupPages = pages.filter((p) => group.pageIds.includes(p.id))
  const totalNicks = groupPages.reduce((sum, p) => {
    return sum + pageAccounts.filter((n) => n.pageId === p.id).length
  }, 0)
  const totalLeads = groupPages.reduce((sum, p) => {
    return sum + pageAccounts.filter((n) => n.pageId === p.id).reduce((s, n) => s + n.leadCount, 0)
  }, 0)

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: group.bg, color: group.color }}
        >
          {group.name.charAt(0)}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: group.bg, color: group.color }}
        >
          {groupPages.length} page
        </span>
      </div>
      <h4 className="font-semibold text-slate-800 mb-1">{group.name}</h4>
      <p className="text-xs text-slate-500 mb-3">{group.description}</p>
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <LayoutGrid size={12} />
          {totalNicks} nick
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp size={12} />
          {totalLeads} lead
        </span>
      </div>
      <div className="space-y-1">
        {groupPages.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50">
            <div className="flex items-center gap-2">
              <span className={clsx(
                'w-1.5 h-1.5 rounded-full',
                p.status === 'active' ? 'bg-green-500' : 'bg-slate-300'
              )} />
              <span className="text-slate-600">{p.name}</span>
            </div>
            <span
              className={clsx(
                'text-xs px-1.5 py-0.5 rounded',
                p.status === 'active' ? 'badge-green' : 'badge-gray'
              )}
            >
              {p.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Assign page to group modal
function AssignPageModal({ page, groups, onClose, onAssign }) {
  const [selectedGroups, setSelectedGroups] = useState(
    groups.filter((g) => g.pageIds.includes(page.id)).map((g) => g.id)
  )

  const toggleGroup = (grpId) => {
    setSelectedGroups((prev) =>
      prev.includes(grpId) ? prev.filter((id) => id !== grpId) : [...prev, grpId]
    )
  }

  const handleSave = () => {
    onAssign(page.id, selectedGroups)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Gán Page vào nhóm</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">{page.name}</p>
          <div className="space-y-2">
            {groups.map((grp) => (
              <label
                key={grp.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(grp.id)}
                  onChange={() => toggleGroup(grp.id)}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: grp.bg, color: grp.color }}
                >
                  {grp.name.charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700">{grp.name}</span>
                  <span className="text-xs text-slate-400 ml-2">({grp.pageIds.length} page)</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100">
          <button onClick={onClose} className="btn-secondary text-sm">Huy</button>
          <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-1">
            <Check size={14} />
            Luu
          </button>
        </div>
      </div>
    </div>
  )
}

// Main PageModule
export default function PageModule() {
  const [view, setView] = useState('pages') // 'pages' | 'groups'
  const [selectedPage, setSelectedPage] = useState(null)
  const [assignModalPage, setAssignModalPage] = useState(null)
  const [groupAssignments, setGroupAssignments] = useState(
    pageGroups.map((g) => ({ ...g }))
  )

  const viewTabs = [
    { id: 'pages', label: 'Danh sách Page' },
    { id: 'groups', label: 'Nhóm Page' },
  ]

  const handleSelectPage = (page) => {
    if (selectedPage?.id === page.id) {
      setSelectedPage(null)
    } else {
      setSelectedPage(page)
    }
  }

  const handleAssignGroups = (pageId, newGroupIds) => {
    setGroupAssignments((prev) =>
      prev.map((g) => ({
        ...g,
        pageIds: newGroupIds.includes(g.id)
          ? [...new Set([...g.pageIds, pageId])]
          : g.pageIds.filter((id) => id !== pageId),
      }))
    )
  }

  // Build enriched pages with nicks
  const enrichedPages = pages.map((p) => ({
    ...p,
    nicks: pageAccounts.filter((n) => n.pageId === p.id),
    assignedUsers: pageUserAssignments.filter((a) => a.pageId === p.id),
  }))

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Stats Row */}
      <PageStatsRow />

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-fit">
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setView(tab.id)
              setSelectedPage(null)
            }}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              view === tab.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'pages' && (
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            {/* Page Cards — left/center */}
            <div className={clsx('lg:col-span-3', selectedPage && 'hidden lg:block')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {enrichedPages.map((page) => (
                  <PageCard
                    key={page.id}
                    page={page}
                    nicks={page.nicks}
                    onSelect={handleSelectPage}
                    isSelected={selectedPage?.id === page.id}
                  />
                ))}
              </div>
            </div>

            {/* Nick Management Panel — right side */}
            <div className={clsx('lg:col-span-2', !selectedPage && 'hidden')}>
              {selectedPage && (
                <NickManagementPanel
                  page={selectedPage}
                  nicks={selectedPage.nicks}
                  onClose={() => setSelectedPage(null)}
                />
              )}
            </div>

            {/* Empty state when no page selected on desktop */}
            {!selectedPage && (
              <div className="hidden lg:flex lg:col-span-2 items-start">
                <div className="card w-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LayoutGrid size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Chon page de quan ly nick</p>
                    <p className="text-xs text-slate-400 mt-1">Click vao page ben trai</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'groups' && (
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Nhom Page ({groupAssignments.length})
            </h3>
            <button className="btn-primary text-sm">+ Them nhom</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupAssignments.map((group) => (
              <PageGroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* Assign Page Modal */}
      {assignModalPage && (
        <AssignPageModal
          page={assignModalPage}
          groups={groupAssignments}
          onClose={() => setAssignModalPage(null)}
          onAssign={handleAssignGroups}
        />
      )}
    </div>
  )
}
