import { useState, useMemo, useRef, useEffect } from 'react'
import clsx from 'clsx'
import {
  Search,
  Filter,
  Phone,
  Flame,
  Clock,
  Tag,
  Send,
  X,
  ChevronDown,
  MessageSquare,
  User,
  CheckCircle,
  PhoneIncoming,
  UserPlus,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react'
import { conversations, conversationTags, pages } from '../../data/mockData'

const STATUS_CONFIG = {
  open: { label: 'Mở', color: '#10b981', bg: '#ecfdf5' },
  pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fffbeb' },
  closed: { label: 'Đã đóng', color: '#6b7280', bg: '#f3f4f6' },
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin}p trước`
  if (diffHour < 24) return `${diffHour}h trước`
  if (diffDay < 7) return `${diffDay}d trước`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function formatMessageTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const isToday = new Date().toDateString() === d.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// ---- Conversation List Item ----
function ConversationItem({ conv, isSelected, onClick }) {
  const statusCfg = STATUS_CONFIG[conv.conversationStatus] || STATUS_CONFIG.open

  return (
    <div
      onClick={onClick}
      className={clsx(
        'px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50',
        isSelected && 'bg-primary-50 border-l-2 border-l-primary-500'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={conv.customerAvatar}
            alt={conv.customerName}
            className="w-10 h-10 rounded-full object-cover"
          />
          {conv.conversationStatus === 'open' && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="font-semibold text-slate-800 text-sm truncate">{conv.customerName}</p>
            <span className="text-[11px] text-slate-400 flex-shrink-0">{formatTime(conv.lastMessageTime)}</span>
          </div>

          <p className="text-xs text-slate-500 truncate mb-1.5">{conv.lastMessage}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status badge */}
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
            >
              {statusCfg.label}
            </span>

            {/* Page source */}
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {conv.pageName}
            </span>

            {/* Hot badge */}
            {conv.isHot && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">
                <Flame size={10} />
                Hot
              </span>
            )}

            {/* Phone collected */}
            {conv.phoneCollected && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                <Phone size={10} />
                SĐT
              </span>
            )}

            {/* Waiting tele */}
            {conv.waitingForTele && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                <Clock size={10} />
                Chờ Tele
              </span>
            )}
          </div>

          {/* Tags */}
          {conv.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {conv.tags.map((tagId) => {
                const tag = conversationTags.find((t) => t.id === tagId)
                if (!tag) return null
                return (
                  <span
                    key={tagId}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ color: tag.color, backgroundColor: tag.color + '18' }}
                  >
                    {tag.name}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Message Bubble ----
function MessageBubble({ message }) {
  const isCustomer = message.senderType === 'customer'

  return (
    <div className={clsx('flex gap-2 mb-3', isCustomer ? '' : 'flex-row-reverse')}>
      <img
        src={message.senderAvatar}
        alt={message.senderName}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1"
      />
      <div className={clsx('max-w-[70%] flex flex-col', isCustomer ? '' : 'items-end')}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-slate-600">{message.senderName}</span>
          <span className="text-[10px] text-slate-400">{formatMessageTime(message.sentAt)}</span>
        </div>
        <div
          className={clsx(
            'px-3 py-2 rounded-2xl text-sm leading-relaxed',
            isCustomer
              ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
              : 'bg-primary-600 text-white rounded-tr-sm'
          )}
          style={isCustomer ? {} : {}}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}

// ---- Tag Panel ----
function TagPanel({ conv, onClose, onToggleTag }) {
  return (
    <div className="border-t border-slate-200 bg-white">
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Tag size={14} />
          Gắn thẻ
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <div className="p-3 flex flex-wrap gap-2">
        {conversationTags.map((tag) => {
          const isSelected = conv.tags.includes(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => onToggleTag(conv.id, tag.id)}
              className={clsx(
                'text-xs font-medium px-2.5 py-1 rounded-full border transition-all',
                isSelected
                  ? 'border-current'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              )}
              style={isSelected ? { color: tag.color, backgroundColor: tag.color + '18' } : {}}
            >
              {tag.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---- Action Bar ----
function ActionBar({ conv, onAction }) {
  return (
    <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onAction('tag')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
          conv.tags.length > 0
            ? 'border-primary-300 bg-primary-50 text-primary-700'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        )}
      >
        <Tag size={13} />
        Gắn thẻ
        {conv.tags.length > 0 && (
          <span className="w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {conv.tags.length}
          </span>
        )}
      </button>

      <button
        onClick={() => onAction('hot')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
          conv.isHot
            ? 'border-orange-300 bg-orange-50 text-orange-600'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        )}
      >
        <Flame size={13} />
        {conv.isHot ? 'Hot' : 'Đánh dấu Hot'}
      </button>

      <button
        onClick={() => onAction('phone')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
          conv.phoneCollected
            ? 'border-blue-300 bg-blue-50 text-blue-600'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        )}
      >
        <Phone size={13} />
        {conv.phoneCollected ? 'Đã thu SĐT' : 'Thu SĐT'}
      </button>

      <button
        onClick={() => onAction('lead')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-200 text-green-600 hover:bg-green-50 transition-all"
      >
        <UserPlus size={13} />
        Tạo Lead
      </button>

      <button
        onClick={() => onAction('transfer')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-200 text-purple-600 hover:bg-purple-50 transition-all"
      >
        <ArrowRight size={13} />
        Chuyển Tele
      </button>
    </div>
  )
}

// ---- Empty State ----
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">Chọn hội thoại để xem</p>
        <p className="text-sm text-slate-400 mt-1">Click vào hội thoại trong danh sách bên trái</p>
      </div>
    </div>
  )
}

// ---- Conversation Detail ----
function ConversationDetail({ conv, onToggleTag, onAction }) {
  const [showTagPanel, setShowTagPanel] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [localConv, setLocalConv] = useState(conv)
  const [localMessages, setLocalMessages] = useState(conv.messages)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    setLocalConv(conv)
    setLocalMessages(conv.messages)
    setShowTagPanel(false)
    setNewMessage('')
  }, [conv.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const handleSend = () => {
    if (!newMessage.trim()) return
    const msg = {
      id: `msg_${Date.now()}`,
      conversationId: localConv.id,
      senderType: 'page',
      senderId: 'usr_pg_001',
      senderName: 'Lê Thu Hà',
      senderAvatar: 'https://i.pravatar.cc/150?img=31',
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
      messageType: 'text',
    }
    setLocalMessages((prev) => [...prev, msg])
    setNewMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleToggleTag = (convId, tagId) => {
    setLocalConv((prev) => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId]
      return { ...prev, tags: newTags }
    })
    onToggleTag(convId, tagId)
  }

  const handleAction = (action) => {
    if (action === 'tag') {
      setShowTagPanel((v) => !v)
      return
    }
    if (action === 'hot') {
      setLocalConv((prev) => ({ ...prev, isHot: !prev.isHot }))
    }
    if (action === 'phone') {
      setLocalConv((prev) => ({ ...prev, phoneCollected: !prev.phoneCollected }))
    }
    onAction(action)
  }

  const statusCfg = STATUS_CONFIG[localConv.conversationStatus] || STATUS_CONFIG.open

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <img
            src={localConv.customerAvatar}
            alt={localConv.customerName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800">{localConv.customerName}</p>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
              >
                {statusCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{localConv.pageName}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">{localConv.assignedPageUserName}</span>
            </div>
          </div>

          {/* Quick badges */}
          <div className="flex items-center gap-1.5">
            {localConv.isHot && (
              <span className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                <Flame size={12} />
                Hot
              </span>
            )}
            {localConv.phoneCollected && (
              <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <Phone size={12} />
                SĐT
              </span>
            )}
            {localConv.waitingForTele && (
              <span className="flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                <Clock size={12} />
                Chờ Tele
              </span>
            )}
          </div>
        </div>

        {/* Tags row */}
        {localConv.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {localConv.tags.map((tagId) => {
              const tag = conversationTags.find((t) => t.id === tagId)
              if (!tag) return null
              return (
                <span
                  key={tagId}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: tag.color, backgroundColor: tag.color + '18' }}
                >
                  {tag.name}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Action bar */}
      <ActionBar conv={localConv} onAction={handleAction} />

      {/* Tag panel */}
      {showTagPanel && (
        <TagPanel
          conv={localConv}
          onClose={() => setShowTagPanel(false)}
          onToggleTag={handleToggleTag}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50">
        {localMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={clsx(
              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              newMessage.trim()
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Stats Bar ----
function StatsBar({ data }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="card p-3 text-center">
        <p className="text-xl font-bold text-slate-800">{data.total}</p>
        <p className="text-xs text-slate-500">Tổng hội thoại</p>
      </div>
      <div className="card p-3 text-center">
        <p className="text-xl font-bold text-green-600">{data.open}</p>
        <p className="text-xs text-slate-500">Đang mở</p>
      </div>
      <div className="card p-3 text-center">
        <p className="text-xl font-bold text-orange-500">{data.hot}</p>
        <p className="text-xs text-slate-500">Hot</p>
      </div>
      <div className="card p-3 text-center">
        <p className="text-xl font-bold text-purple-600">{data.pendingTele}</p>
        <p className="text-xs text-slate-500">Chờ Tele</p>
      </div>
    </div>
  )
}

// ---- Main Module ----
export default function ConversationModule() {
  const [selectedConvId, setSelectedConvId] = useState(null)
  const [filterPage, setFilterPage] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSpecial, setFilterSpecial] = useState('all')
  const [search, setSearch] = useState('')
  const [localConversations, setLocalConversations] = useState(conversations)

  const selectedConv = useMemo(
    () => localConversations.find((c) => c.id === selectedConvId) || null,
    [selectedConvId, localConversations]
  )

  const filtered = useMemo(() => {
    let data = [...localConversations]

    if (filterPage !== 'all') {
      data = data.filter((c) => c.pageId === filterPage)
    }

    if (filterStatus === 'open') {
      data = data.filter((c) => c.conversationStatus === 'open')
    } else if (filterStatus === 'pending') {
      data = data.filter((c) => c.conversationStatus === 'pending')
    } else if (filterStatus === 'closed') {
      data = data.filter((c) => c.conversationStatus === 'closed')
    }

    if (filterSpecial === 'hot') {
      data = data.filter((c) => c.isHot)
    } else if (filterSpecial === 'waitingTele') {
      data = data.filter((c) => c.waitingForTele)
    }

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      )
    }

    data.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))

    return data
  }, [localConversations, filterPage, filterStatus, filterSpecial, search])

  const stats = useMemo(() => {
    return {
      total: localConversations.length,
      open: localConversations.filter((c) => c.conversationStatus === 'open').length,
      hot: localConversations.filter((c) => c.isHot).length,
      pendingTele: localConversations.filter((c) => c.waitingForTele).length,
    }
  }, [localConversations])

  const handleToggleTag = (convId, tagId) => {
    setLocalConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const newTags = c.tags.includes(tagId)
          ? c.tags.filter((t) => t !== tagId)
          : [...c.tags, tagId]
        return { ...c, tags: newTags }
      })
    )
  }

  const handleAction = (action) => {
    if (!selectedConvId) return
    if (action === 'hot') {
      setLocalConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId ? { ...c, isHot: !c.isHot } : c
        )
      )
    }
    if (action === 'phone') {
      setLocalConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId ? { ...c, phoneCollected: !c.phoneCollected } : c
        )
      )
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Stats */}
      <StatsBar data={stats} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên, tin nhắn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterPage}
            onChange={(e) => setFilterPage(e.target.value)}
            className="select-field text-sm"
          >
            <option value="all">Tất cả Page</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-field text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="open">Mở</option>
            <option value="pending">Chờ xử lý</option>
            <option value="closed">Đã đóng</option>
          </select>
          <select
            value={filterSpecial}
            onChange={(e) => setFilterSpecial(e.target.value)}
            className="select-field text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="hot">Hot</option>
            <option value="waitingTele">Chờ Tele</option>
          </select>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        {/* Conversation List */}
        <div
          className={clsx(
            'lg:col-span-2 card overflow-hidden flex flex-col',
            selectedConvId && 'hidden lg:flex'
          )}
          style={{ maxHeight: 'calc(100vh - 260px)' }}
        >
          <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Hội thoại ({filtered.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
                Không có hội thoại nào
              </div>
            ) : (
              filtered.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isSelected={conv.id === selectedConvId}
                  onClick={() => setSelectedConvId(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Conversation Detail */}
        <div
          className={clsx(
            'lg:col-span-3 card overflow-hidden flex flex-col',
            !selectedConvId && 'hidden lg:flex'
          )}
          style={{ maxHeight: 'calc(100vh - 260px)' }}
        >
          {selectedConv ? (
            <ConversationDetail
              key={selectedConv.id}
              conv={selectedConv}
              onToggleTag={handleToggleTag}
              onAction={handleAction}
            />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Empty detail state on desktop */}
        {!selectedConvId && (
          <div className="hidden lg:flex lg:col-span-3 items-start">
            <div className="card w-full flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">Chọn hội thoại để xem chi tiết</p>
                <p className="text-sm text-slate-400 mt-1">Click vào hội thoại trong danh sách</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
