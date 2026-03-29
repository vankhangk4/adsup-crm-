/**
 * ChatModule - Trang Hội thoại đa kênh (Module Chat)
 * Bố cục: 3 cột
 *  - Cột 1: Danh sách hội thoại + tabs
 *  - Cột 2: Khung chat + Kịch bản chat
 *  - Cột 3: Nạp Lead + Thông tin khách hàng
 */
import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Phone,
  MessageSquare,
  Send,
  Image,
  Paperclip,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  MoreHorizontal,
  Star,
  Clock,
  User,
  PhoneIncoming,
  AlertCircle,
  Zap,
  UserPlus,
  StickyNote,
  CheckCircle,
  X,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import * as conversationService from '../../services/conversationService';
import * as scriptService from '../../services/scriptService';
import { useToast } from '../../contexts/ToastContext';


// ===== SUB-COMPONENTS =====

function SourceBadge({ source, sourceIcon }) {
  const configs = {
    facebook: { bg: 'bg-blue-500', label: 'FB', textCol: 'text-white' },
    zalo: { bg: 'bg-blue-400', label: 'ZALO', textCol: 'text-white' },
    hotline: { bg: 'bg-purple-500', label: 'HL', textCol: 'text-white' },
    website: { bg: 'bg-green-500', label: 'WEB', textCol: 'text-white' },
  };
  const cfg = configs[source] || configs.website;
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 ${cfg.bg} ${cfg.textCol} text-[9px] font-bold rounded`}>
      {cfg.label}
    </span>
  );
}

function BadgePill({ type }) {
  if (type === 'HOT') {
    return <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-red-500 text-white rounded-sm">HOT</span>;
  }
  if (type === 'WAIT') {
    return <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-sm">WAIT</span>;
  }
  if (type === 'no-phone') {
    return <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-sm">No SĐT</span>;
  }
  return null;
}

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-3 py-3 cursor-pointer transition-all duration-150 border-b border-gray-50 ${
        isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{conv.avatar}</span>
        </div>
        {conv.unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {conv.unread}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <SourceBadge source={conv.source} sourceIcon={conv.sourceIcon} />
            <span className={`text-sm font-semibold truncate ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>
              {conv.name}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{conv.time}</span>
        </div>

        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{conv.snippet}</p>

        <div className="flex items-center gap-1.5 mt-1.5">
          {conv.badges.map((b) => (
            <BadgePill key={b} type={b} />
          ))}
          {conv.phone && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
              <Phone size={9} />
              {conv.phone}
            </span>
          )}
          {conv.badges.includes('no-phone') && (
            <button className="ml-auto p-1 rounded bg-green-500 hover:bg-green-600 text-white transition-colors" title="Gọi">
              <PhoneIncoming size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationList({ conversations, activeId, onSelect, activeTab, setActiveTab }) {
  const filtered = conversations.filter((c) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'mine') return c.assigned;
    if (activeTab === 'unassigned') return !c.assigned;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'mine', label: 'Của tôi' },
            { key: 'unassigned', label: 'Chưa gán' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv) => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            isActive={activeId === conv.id}
            onClick={() => onSelect(conv.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ScriptPanel({ scripts, activeScriptId, setActiveScriptId }) {
  const activeScript = scripts.find((s) => s.id === activeScriptId) || scripts[0];

  return (
    <div className="border-b border-gray-200 h-52 flex flex-col">
      {/* Script header */}
      <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100 flex items-center gap-2">
        <Zap size={12} className="text-purple-500" />
        <h4 className="text-xs font-semibold text-gray-700 flex-1">Kịch bản chat</h4>
        <select
          value={activeScript?.id}
          onChange={(e) => setActiveScriptId(Number(e.target.value))}
          className="text-[11px] border border-gray-200 rounded px-2 py-1 bg-white text-gray-600 focus:outline-none focus:border-purple-300 cursor-pointer"
        >
          {scripts.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {/* Toolbar */}
      <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-0.5 bg-gray-50">
        {[Bold, Italic, Underline].map((Icon, i) => (
          <button
            key={i}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            title={['Bold', 'Italic', 'Underline'][i]}
          >
            <Icon size={12} />
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors" title="Màu chữ">
          <span className="text-[10px] font-bold">A</span>
        </button>
        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors" title="Chèn hình">
          <Image size={12} />
        </button>
        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors" title="Chèn link">
          <Paperclip size={12} />
        </button>
      </div>

      {/* Script content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
          {activeScript?.content}
        </pre>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <p className={`text-[10px] mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'} text-right`}>
          {message.time}
        </p>
      </div>
    </div>
  );
}

function ChatArea({ messages, onSend, inputValue, setInputValue, conv }) {
  const [pendingInput, setPendingInput] = useState(inputValue);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setPendingInput(inputValue);
  }, [inputValue]);

  const handleSend = () => {
    if (!pendingInput.trim()) return;
    onSend(pendingInput);
    setPendingInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat header */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">{conv?.avatar}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{conv?.name || 'Chọn hội thoại'}</p>
            {conv?.phone && (
              <p className="text-[10px] text-gray-400">{conv.phone}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Phone size={14} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Star size={14} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-white">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Gửi ảnh">
              <Image size={15} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Đính kèm">
              <Paperclip size={15} />
            </button>
          </div>
          <textarea
            value={pendingInput}
            onChange={(e) => setPendingInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors max-h-28 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!pendingInput.trim()}
            className="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick, variant = 'default' }) {
  const colorMap = {
    green: 'bg-green-500 hover:bg-green-600 text-white',
    orange: 'bg-orange-500 hover:bg-orange-600 text-white',
    purple: 'bg-purple-500 hover:bg-purple-600 text-white',
    blue: 'bg-blue-500 hover:bg-blue-600 text-white',
    gray: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${colorMap[color]} ${
        variant === 'primary' ? 'shadow-md shadow-blue-200' : ''
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

// ===== MAIN COMPONENT =====

export default function ChatModule() {
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [messages, setMessages] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [activeScriptId, setActiveScriptId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Lead form
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    service: '',
    note: '',
  });

  // Fetch conversations and scripts
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [convRes, scriptRes] = await Promise.all([
          conversationService.listConversations({ page_size: 100 }),
          scriptService.listScripts({ page_size: 50 }),
        ]);
        const convData = convRes?.data?.items || convRes?.data || convRes || [];
        const scriptData = scriptRes?.data?.items || scriptRes?.data || scriptRes || [];

        const normalizedConvs = convData.map((c) => ({
          id: c.id,
          name: c.customer_name || c.external_id || `Conv #${c.id}`,
          avatar: (c.customer_name || 'C').substring(0, 3).toUpperCase(),
          source: c.channel || 'website',
          sourceIcon: (c.channel || 'WEB').toUpperCase().substring(0, 4),
          snippet: c.last_message || c.note || '',
          time: c.updated_at ? new Date(c.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
          unread: c.unread_count || 0,
          badges: (c.is_hot ? ['HOT'] : []).concat(c.is_waiting_tele ? ['WAIT'] : []).concat(!c.phone ? ['no-phone'] : []),
          assigned: !!c.assigned_user_id,
          phone: c.phone || null,
        }));

        const normalizedScripts = scriptData.map((s) => ({
          id: s.id,
          title: s.name || s.title || `Script #${s.id}`,
          content: s.content || s.script_text || '',
        }));

        if (!isMounted) return;
        setConversations(normalizedConvs);
        setScripts(normalizedScripts);
        if (normalizedConvs.length > 0) {
          setActiveConvId(normalizedConvs[0].id);
          setActiveScriptId(normalizedScripts[0]?.id || null);
        }
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setIsLoading(false);
        console.error('Failed to fetch chat data:', err);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    let isMounted = true;
    async function fetchMessages() {
      try {
        const res = await conversationService.listMessages(activeConvId);
        const msgsData = res?.data?.items || res?.data || res || [];
        const normalized = msgsData.map((m) => ({
          id: m.id,
          sender: m.sender_type === 'customer' ? 'user' : 'page',
          text: m.message_text || m.content || '',
          time: m.created_at ? new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
        }));
        if (!isMounted) return;
        setMessages(normalized.length > 0 ? normalized : []);
      } catch (err) {
        if (!isMounted) return;
        setMessages([]);
      }
    }
    fetchMessages();
    return () => { isMounted = false; };
  }, [activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  const handleSelectConv = (id) => {
    setActiveConvId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setLeadForm((prev) => ({
        ...prev,
        name: conv.name,
        phone: conv.phone || '',
      }));
    }
    setMessages([]);
  };

  const handleSend = async (text) => {
    if (!activeConvId || !text.trim()) return;
    const tempMsg = {
      id: Date.now(),
      sender: 'page',
      text: text.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputValue('');
    try {
      await conversationService.sendMessage(activeConvId, text.trim());
    } catch (err) {
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const services = ['Internet FPT', 'Truyền hình FPT', 'Camera AI', 'FPT Play Box', 'Gói Combo'];

  return (
    <div className="flex gap-0 h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* ===== COLUMN 1: Danh sách hội thoại ===== */}
      <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-800">Hội thoại</h3>
              <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded-full">
                {conversations.filter((c) => c.unread > 0).length} mới
              </span>
            </div>
            <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
        </div>

        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={handleSelectConv}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* ===== COLUMN 2: Khung chat & Kịch bản ===== */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <ScriptPanel
          scripts={scripts}
          activeScriptId={activeScriptId}
          setActiveScriptId={setActiveScriptId}
        />
        <ChatArea
          messages={messages}
          onSend={handleSend}
          inputValue={inputValue}
          setInputValue={setInputValue}
          conv={activeConv}
        />
      </div>

      {/* ===== COLUMN 3: Nạp Lead & Thông tin ===== */}
      <div className="w-80 flex-shrink-0 border-l border-gray-200 flex flex-col bg-gray-50/50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <UserPlus size={14} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">Nạp Lead</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Tên khách hàng</label>
              <input
                type="text"
                value={leadForm.name}
                onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                className="input-field mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                SĐT
                {!leadForm.phone && (
                  <span className="ml-1 text-red-400">*</span>
                )}
              </label>
              <input
                type="text"
                value={leadForm.phone}
                onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Chưa có SĐT"
                className="input-field mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Dịch vụ quan tâm</label>
              <select
                value={leadForm.service}
                onChange={(e) => setLeadForm((p) => ({ ...p, service: e.target.value }))}
                className="input-field mt-1 text-sm cursor-pointer"
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Ghi chú</label>
              <textarea
                value={leadForm.note}
                onChange={(e) => setLeadForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="Nhập ghi chú..."
                rows={3}
                className="input-field mt-1 text-sm resize-none"
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Thao tác nhanh</h4>
            <ActionButton
              icon={Phone}
              label="Thu thập SĐT"
              color="green"
              onClick={() => {}}
            />
            <ActionButton
              icon={Zap}
              label="Đánh dấu HOT"
              color="orange"
              onClick={() => {}}
            />
            <ActionButton
              icon={Clock}
              label="Chuyển hàng chờ Tele"
              color="purple"
              onClick={() => {}}
            />
            <ActionButton
              icon={StickyNote}
              label="Thêm ghi chú"
              color="gray"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <ActionButton
            icon={CheckCircle}
            label="Nạp Lead Chính Thức"
            color="blue"
            variant="primary"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
