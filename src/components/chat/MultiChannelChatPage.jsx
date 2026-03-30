import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Send, Image, Paperclip, Trash2, Bold,
  Italic, Underline, List, Link, Copy, Inbox, Phone,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import * as conversationService from '../../services/conversationService';
import * as scriptService from '../../services/scriptService';

// ============================================================
// CHANNEL DEFINITIONS — dùng chung cho filter + badge
// ============================================================

const CHANNELS = [
  { code: 'all',      label: 'Tất cả',  icon: 'fa-solid fa-layer-group',  color: 'gray',   bg: 'bg-gray-100',   activeBg: 'bg-gray-800',   activeText: 'text-white' },
  { code: 'facebook', label: 'Facebook', icon: 'fa-brands fa-facebook-f',  color: 'blue',   bg: 'bg-blue-50',     activeBg: 'bg-blue-600',   activeText: 'text-white' },
  { code: 'zalo',    label: 'Zalo',    icon: 'fa-solid fa-bolt',          color: 'blue',   bg: 'bg-blue-100',    activeBg: 'bg-blue-500',   activeText: 'text-white' },
  { code: 'instagram',label: 'Instagram',icon: 'fa-brands fa-instagram',  color: 'pink',   bg: 'bg-pink-50',     activeBg: 'bg-pink-500',   activeText: 'text-white' },
  { code: 'oa',      label: 'OA',      icon: 'fa-solid fa-bullhorn',      color: 'green',  bg: 'bg-green-50',    activeBg: 'bg-green-600',  activeText: 'text-white' },
  { code: 'website', label: 'Web',     icon: 'fa-solid fa-globe',         color: 'green',  bg: 'bg-green-50',    activeBg: 'bg-green-600',  activeText: 'text-white' },
];

function getChannelConfig(code) {
  return CHANNELS.find((c) => c.code === code) || CHANNELS[5]; // default website
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ChannelIcon({ code, size = 'md' }) {
  const cfg = getChannelConfig(code);
  const sizeClass = size === 'sm' ? 'text-[10px]' : 'text-[11px]';
  const iconColor = code === 'facebook' ? 'text-blue-600'
    : code === 'zalo' ? 'text-blue-500'
    : code === 'instagram' ? 'text-pink-500'
    : code === 'oa' ? 'text-green-600'
    : 'text-green-600';

  return (
    <i className={`${cfg.icon} ${sizeClass} ${iconColor}`} />
  );
}

function ChannelFilterBar({ selectedChannel, onSelect, unreadByChannel }) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-white">
      {CHANNELS.map((ch) => {
        const unread = unreadByChannel?.[ch.code] || 0;
        const isActive = selectedChannel === ch.code;
        return (
          <button
            key={ch.code}
            onClick={() => onSelect(ch.code)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              isActive
                ? `${ch.activeBg} ${ch.activeText} shadow-sm`
                : `${ch.bg} text-slate-600 hover:${ch.bg} border border-gray-200`
            }`}
          >
            <i className={`${ch.icon} ${isActive ? ch.activeText : ch.color === 'gray' ? 'text-slate-500' : ''}`}
              style={{ color: isActive ? undefined : ch.color === 'blue' ? '#3b82f6' : ch.color === 'pink' ? '#ec4899' : ch.color === 'green' ? '#16a34a' : undefined }}
            />
            <span className={isActive ? '' : 'text-slate-600'}>{ch.label}</span>
            {unread > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full text-[9px] font-bold text-white shadow-sm ${
                isActive ? 'bg-red-400' : 'bg-red-500'
              }`}>
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ChatItem({ item, isActive, onClick }) {
  const isUnread = item.unread > 0;
  const ch = getChannelConfig(item.channel_code);

  return (
    <div
      onClick={onClick}
      className={`p-3 border-b border-gray-100 cursor-pointer transition-all ${
        isActive
          ? 'bg-blue-50 border-l-2 border-l-blue-500'
          : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar + channel badge */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
            {item.avatar || item.name?.charAt(0) || '?'}
          </div>
          {/* Channel badge overlay */}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
            <ChannelIcon code={item.channel_code} size="sm" />
          </div>
          {/* Unread dot */}
          {isUnread && (
            <span className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-xs truncate ${isActive ? 'text-blue-700 font-bold' : isUnread ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
              {item.name}
            </span>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{item.lastTime}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.snippet}</span>
            {isUnread && (
              <span className="ml-auto flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                {item.unread > 9 ? '9+' : item.unread}
              </span>
            )}
          </div>

          {/* Tags row */}
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {item.isHot && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-red-500 rounded-sm border border-red-100">
                <i className="fa-solid fa-fire text-[7px]" /> HOT
              </span>
            )}
            {item.isWait && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-500 rounded-sm border border-amber-100">
                <i className="fa-solid fa-clock text-[7px]" /> WAIT
              </span>
            )}
            {!item.hasPhone && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-sm">
                <Phone size={7} /> Chưa có SĐT
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'} mb-2`}>
      <div
        className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-white border border-gray-200 text-slate-800 rounded-bl-md'
            : 'bg-blue-500 text-white rounded-br-md'
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <p className={`text-[10px] mt-1 ${isUser ? 'text-slate-400' : 'text-blue-200'} text-right`}>
          {msg.time}
        </p>
      </div>
    </div>
  );
}

function ScriptGroup({ script, activeScriptId, onSelect }) {
  return (
    <div>
      <div className="bg-slate-100 p-2 rounded text-[11px] font-bold text-slate-700">
        {script.label}
      </div>
      {(script.items || []).map((item, idx) => (
        <div
          key={idx}
          onClick={onSelect}
          className={`p-2 text-[11px] cursor-pointer transition-colors border-l-2 ${
            script.id === activeScriptId
              ? 'bg-blue-50 border-l-blue-500 text-blue-600'
              : 'text-slate-600 hover:bg-slate-50 border-l-transparent'
          }`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Inbox size={28} className="text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
      <p className="text-xs text-slate-400 text-center">{description}</p>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MultiChannelChatPage() {
  const toast = useToast();
  const messagesEndRef = useRef(null);

  // ── State ────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [activeScriptId, setActiveScriptId] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [messageInput, setMessageInput] = useState('');
  const [scriptSearch, setScriptSearch] = useState('');
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', service: '', note: '' });
  const [isLoading, setIsLoading] = useState(true);

  // ── Derived state ─────────────────────────────────────────
  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  // Filter conversations by selected channel
  const filteredConvs = selectedChannel === 'all'
    ? conversations
    : conversations.filter((c) => c.channel_code === selectedChannel);

  // Compute unread count per channel
  const unreadByChannel = CHANNELS.reduce((acc, ch) => {
    if (ch.code === 'all') {
      acc[ch.code] = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
    } else {
      acc[ch.code] = conversations
        .filter((c) => c.channel_code === ch.code)
        .reduce((sum, c) => sum + (c.unread || 0), 0);
    }
    return acc;
  }, {});

  // ── Load conversations ─────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function fetchConversations() {
      try {
        const res = await conversationService.listConversations({ page_size: 100 });
        const data = res?.data?.items || res?.data || res || [];
        const normalized = data.map((c) => ({
          id: c.id,
          name: c.customer_name || c.external_customer_id || `Conv #${c.id}`,
          avatar: (c.customer_name || 'C').substring(0, 3).toUpperCase(),
          channel_code: c.channel_code || 'website',
          snippet: c.last_message || '',
          lastTime: c.last_message_time
            ? new Date(c.last_message_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : '',
          unread: c.unread_count || 0,
          hasPhone: !!c.collected_phone || !!c.phone,
          phone: c.collected_phone || c.phone || null,
          isHot: !!c.is_hot,
          isWait: !!c.waiting_for_tele,
          assignedUserId: c.assigned_page_user_id,
          internalNote: c.internal_note || '',
          createdAt: c.created_at,
        }));
        if (!isMounted) return;
        setConversations(normalized);
        if (normalized.length > 0 && !activeConvId) {
          setActiveConvId(normalized[0].id);
        }
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        toast.error('Không thể tải danh sách hội thoại');
        setIsLoading(false);
      }
    }
    fetchConversations();
    return () => { isMounted = false; };
  }, []);

  // ── Load messages ─────────────────────────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    let isMounted = true;
    async function fetchMessages() {
      try {
        const res = await conversationService.listMessages(activeConvId);
        const data = res?.data?.items || res?.data || res || [];
        const normalized = data.map((m) => ({
          id: m.id,
          sender: m.sender_type === 'customer' ? 'user' : 'page',
          text: m.message_text || '',
          time: m.sent_at
            ? new Date(m.sent_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : '',
        }));
        if (!isMounted) return;
        setMessages(normalized);
      } catch (err) {
        if (!isMounted) return;
        toast.error('Không thể tải tin nhắn');
      }
    }
    fetchMessages();
    return () => { isMounted = false; };
  }, [activeConvId]);

  // ── Auto-scroll ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Sync lead form ────────────────────────────────────────
  useEffect(() => {
    if (activeConvId) {
      const conv = conversations.find((c) => c.id === activeConvId);
      if (conv) {
        setLeadForm({
          name: conv.name || '',
          phone: conv.phone || '',
          service: '',
          note: conv.internalNote || '',
        });
      }
    }
  }, [activeConvId, conversations]);

  // ── WebSocket ─────────────────────────────────────────────
  const handleIncomingMessage = useCallback((payload) => {
    if (payload.type !== 'new_message') return;

    const msg = payload.data;
    const incomingConvId = msg.conversation_id;
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (incomingConvId === activeConvId) {
      // Tin nhắn thuộc hội thoại đang mở → đẩy vào chat
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          sender: msg.sender_type === 'customer' ? 'user' : 'page',
          text: msg.message_text || '',
          time: msg.sent_at
            ? new Date(msg.sent_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : now,
        },
      ]);
    }

    // Luôn cập nhật danh sách hội thoại
    setConversations((prevList) => {
      const idx = prevList.findIndex((c) => c.id === incomingConvId);

      if (idx === -1) {
        // Hội thoại mới — thêm vào đầu
        const newConv = {
          id: incomingConvId,
          name: msg.customer_name || `Conv #${incomingConvId}`,
          avatar: (msg.customer_name || 'C').substring(0, 3).toUpperCase(),
          channel_code: msg.channel_code || 'facebook',
          snippet: msg.message_text || '',
          lastTime: now,
          unread: 1,
          hasPhone: false,
          phone: null,
          isHot: false,
          isWait: false,
          assignedUserId: null,
          internalNote: '',
          createdAt: new Date().toISOString(),
        };
        return [newConv, ...prevList];
      }

      // Cập nhật hội thoại đã tồn tại
      const updated = prevList.map((c) => {
        if (c.id !== incomingConvId) return c;
        const isCurrentlyActive = incomingConvId === activeConvId;
        return {
          ...c,
          snippet: msg.message_text || c.snippet,
          lastTime: now,
          // Chỉ tăng unread nếu KHÔNG đang mở hội thoại này
          unread: isCurrentlyActive ? 0 : (c.unread || 0) + 1,
        };
      });

      // Đẩy hội thoại có tin mới lên đầu
      const target = updated.find((c) => c.id === incomingConvId);
      const rest = updated.filter((c) => c.id !== incomingConvId);
      return target ? [target, ...rest] : updated;
    });
  }, [activeConvId]);

  const { isConnected } = useWebSocket(null, handleIncomingMessage);

  // ── Handlers ──────────────────────────────────────────────
  const handleSelectConv = (id) => {
    setActiveConvId(id);
    // Reset unread khi mở
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !activeConvId) return;
    const newMsg = {
      id: Date.now(),
      sender: 'page',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    const text = messageInput.trim();
    setMessageInput('');
    try {
      await conversationService.sendMessage(activeConvId, text);
    } catch (err) {
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const handleCopyScript = () => {
    const script = scripts.find((s) => s.id === activeScriptId);
    if (script) {
      navigator.clipboard.writeText(script.items?.join('\n') || '');
      toast.success('Đã sao chép kịch bản!');
    }
  };

  // ── Render ────────────────────────────────────────────────
  const activeCh = getChannelConfig(activeConv?.channel_code || 'website');

  return (
    <div className="font-sans h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      <div className="grid h-full grid-cols-12 gap-0">

        {/* ===== CỘT 1: DANH SÁCH HỘI THOẠI ===== */}
        <section className="col-span-3 flex flex-col bg-white border-r border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Hội thoại</h2>
              {unreadByChannel['all'] > 0 && (
                <span className="text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full border border-red-100">
                  {unreadByChannel['all']} mới
                </span>
              )}
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-400'}`}
                 title={isConnected ? 'Live' : 'Disconnected'} />
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm hội thoại..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Channel Filter Bar — Pancake style */}
          <ChannelFilterBar
            selectedChannel={selectedChannel}
            onSelect={setSelectedChannel}
            unreadByChannel={unreadByChannel}
          />

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <EmptyState title="Không có hội thoại" description={
                selectedChannel === 'all'
                  ? 'Chưa có hội thoại nào'
                  : `Không có hội thoại ${getChannelConfig(selectedChannel).label}`
              } />
            ) : (
              filteredConvs.map((conv) => (
                <ChatItem
                  key={conv.id}
                  item={conv}
                  isActive={conv.id === activeConvId}
                  onClick={() => handleSelectConv(conv.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* ===== CỘT 2: CHI TIẾT CHÁT & SCRIPT ===== */}
        <section className="col-span-6 flex flex-col bg-white min-w-0">
          <div className="flex flex-1 overflow-hidden">
            {/* Script sidebar */}
            <div className="w-52 border-r border-gray-200 flex flex-col shrink-0">
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search size={11} className="absolute left-2 top-2 text-slate-400" />
                  <input
                    value={scriptSearch}
                    onChange={(e) => setScriptSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                    placeholder="Tìm kịch bản..."
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200">
                {scripts.length === 0 ? (
                  <EmptyState title="Không có kịch bản" description="Danh sách trống" />
                ) : (
                  scripts.map((s) => (
                    <ScriptGroup
                      key={s.id}
                      script={s}
                      activeScriptId={activeScriptId}
                      onSelect={() => setActiveScriptId(s.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                {activeConv ? (
                  <>
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-[10px] font-bold">
                        {activeConv.avatar}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                        <ChannelIcon code={activeConv.channel_code} size="sm" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{activeConv.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {getChannelConfig(activeConv.channel_code).label}
                      </p>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-slate-400">Chọn hội thoại để bắt đầu</span>
                )}
                <div className="ml-auto flex items-center gap-1 text-slate-400">
                  <Bold size={13} className="cursor-pointer hover:text-slate-600" />
                  <Italic size={13} className="cursor-pointer hover:text-slate-600" />
                  <Underline size={13} className="cursor-pointer hover:text-slate-600" />
                  <List size={13} className="cursor-pointer hover:text-slate-600" />
                  <Link size={13} className="cursor-pointer hover:text-slate-600" />
                  <Image size={13} className="cursor-pointer hover:text-slate-600" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-gray-200">
                {!activeConvId ? (
                  <EmptyState title="Chọn một hội thoại" description="Nhấn vào hội thoại bên trái để xem chi tiết" />
                ) : (
                  <>
                    {messages.map((msg) => (
                      <ChatBubble key={msg.id} msg={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                    {activeScriptId && (
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleCopyScript}
                          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-[11px] font-bold text-slate-600 hover:bg-white transition-colors shadow-sm"
                        >
                          <Copy size={12} />
                          SAO CHÉP KỊCH BẢN
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    rows={2}
                    className="w-full text-sm resize-none focus:outline-none border-none bg-transparent placeholder-slate-400"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-2 text-slate-400">
                      <span className="font-serif text-base cursor-pointer hover:text-slate-600">Aa</span>
                      <Image size={14} className="cursor-pointer hover:text-slate-600" />
                      <Paperclip size={14} className="cursor-pointer hover:text-slate-600" />
                      <Trash2 size={14} className="cursor-pointer hover:text-red-400" />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!messageInput.trim()}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Send size={13} />
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CỘT 3: THÔNG TIN KHÁCH HÀNG ===== */}
        <section className="col-span-3 flex flex-col bg-white border-l border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-bold text-slate-800">Thông tin khách hàng</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200">
            {/* Customer card */}
            {activeConv && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-sm font-bold">
                    {activeConv.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                    <ChannelIcon code={activeConv.channel_code} size="sm" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{activeConv.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {getChannelConfig(activeConv.channel_code).label}
                    {activeConv.phone && ` · ${activeConv.phone}`}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Tên khách hàng</label>
                <input
                  type="text"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none mt-1 transition-all"
                  placeholder="Chưa có thông tin"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Số điện thoại</label>
                <input
                  type="text"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none mt-1 transition-all"
                  placeholder="Chưa có SĐT"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Dịch vụ quan tâm</label>
                <select
                  value={leadForm.service}
                  onChange={(e) => setLeadForm((p) => ({ ...p, service: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none mt-1 cursor-pointer"
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  <option value="Internet FPT">Internet FPT</option>
                  <option value="Truyền hình FPT">Truyền hình FPT</option>
                  <option value="Camera AI">Camera AI</option>
                  <option value="FPT Play Box">FPT Play Box</option>
                  <option value="Gói Combo">Gói Combo</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Ghi chú</label>
                <textarea
                  rows={3}
                  value={leadForm.note}
                  onChange={(e) => setLeadForm((p) => ({ ...p, note: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none mt-1 resize-none"
                  placeholder="Ghi chú nội bộ..."
                />
              </div>
            </div>

            {/* Quick actions */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Thao tác nhanh</p>
              {[
                { icon: Phone, label: 'Thu thập SĐT', color: 'bg-green-500 hover:bg-green-600', text: 'text-white' },
                { icon: () => <i className="fa-solid fa-fire text-xs" />, label: 'Đánh dấu HOT', color: 'bg-orange-500 hover:bg-orange-600', text: 'text-white' },
                { icon: () => <i className="fa-solid fa-clock text-xs" />, label: 'Chuyển hàng chờ Tele', color: 'bg-purple-500 hover:bg-purple-600', text: 'text-white' },
              ].map(({ icon: Icon, label, color, text }, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${color} ${text} shadow-sm`}
                >
                  {typeof Icon === 'function' ? <Icon /> : <Icon size={14} />}
                  {label}
                </button>
              ))}
            </div>

            {/* WS status */}
            <div className="flex items-center gap-2 pt-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-[10px] text-slate-400">
                {isConnected ? 'Real-time connected' : 'Reconnecting...'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
