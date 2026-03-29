/**
 * MultiChannelChatPage - Trang Hội Thoại Đa Kênh ADSUPX
 * Layout: 3 cột - Danh sách | Chi tiết chát & Script | Nạp Lead & Thông tin
 *
 * API-READY: Xóa toàn bộ hardcode. Gắn API endpoint vào các hàm bên dưới.
 */
import { useState, useEffect, useRef } from 'react';
import { Search, Send, Image, Phone, BookOpen, Paperclip, Trash2, Bold, Italic, Underline, List, Link, Copy, Inbox } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// ============================================================
// STATE - Tất cả khởi tạo rỗng
// ============================================================

export default function MultiChannelChatPage() {
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [activeScriptId, setActiveScriptId] = useState(null);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', service: '', note: '', facebookUrl: '' });
  const [messageInput, setMessageInput] = useState('');
  const [scriptSearch, setScriptSearch] = useState('');
  const [activeTab, setActiveTab] = useState('TẤT CẢ');

  // ============================================================
  // API CALLS - Gắn endpoint thực tế vào đây
  // ============================================================

  useEffect(() => {
    async function fetchChats() {
      try {
        // const res = await fetch('/api/chats');
        // const data = await res.json();
        // setChatList(data);
        // setActiveChatId(data[0]?.id || null);
      } catch (err) {
        toast.error('Không thể tải danh sách hội thoại');
      }
    }
    fetchChats();
  }, []);

  useEffect(() => {
    async function fetchScripts() {
      try {
        // const res = await fetch('/api/scripts');
        // const data = await res.json();
        // setScripts(data);
      } catch (err) {
        toast.error('Không thể tải kịch bản');
      }
    }
    fetchScripts();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    async function fetchMessages() {
      try {
        // const res = await fetch(`/api/chats/${activeChatId}/messages`);
        // const data = await res.json();
        // setMessages(data);
      } catch (err) {
        toast.error('Không thể tải tin nhắn');
      }
    }
    fetchMessages();
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeChatId) {
      const chat = chatList.find((c) => c.id === activeChatId);
      if (chat) {
        setLeadForm({
          name: chat.name || '',
          phone: chat.phone || '',
          service: chat.service || '',
          note: chat.note || '',
          facebookUrl: chat.facebookUrl || '',
        });
      }
    }
  }, [activeChatId, chatList]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSend = () => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'page',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
    // TODO: fetch('/api/chats/${activeChatId}/messages', { method: 'POST', body: JSON.stringify({ text: messageInput }) })
  };

  const handleCopyScript = () => {
    const script = scripts.find((s) => s.id === activeScriptId);
    if (script) {
      navigator.clipboard.writeText(script.items?.join('\n') || '');
      toast.success('Đã sao chép kịch bản!');
    }
  };

  // ============================================================
  // EMPTY STATE
  // ============================================================

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
  // RENDER
  // ============================================================

  return (
    <div className="font-sans h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
      <div className="grid h-full grid-cols-12 gap-4 p-4">

        {/* ===== CỘT 1: HỘI THOẠI ĐA KÊNH ===== */}
        <section className="col-span-3 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-tight">HỘI THOẠI ĐA KÊNH</h2>
            <button className="bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm">
              + Thêm Lead Mới
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 text-[11px] font-bold text-slate-500">
            {['TẤT CẢ', 'CỦA TÔI', 'CHƯA GÁN', 'QUAN TRỌNG'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-slate-700 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm hội thoại..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
            {chatList.length === 0 ? (
              <EmptyState title="Chưa có hội thoại nào" description="Danh sách hội thoại trống" />
            ) : (
              chatList.map((item) => (
                <ChatItem
                  key={item.id}
                  item={item}
                  isActive={item.id === activeChatId}
                  onClick={() => setActiveChatId(item.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* ===== CỘT 2: CHI TIẾT CHÁT & SCRIPT ===== */}
        <section className="col-span-6 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-tight">CHI TIẾT CHÁT & SCRIPT</h2>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Script Sidebar */}
            <div className="w-52 border-r border-gray-200 flex flex-col shrink-0">
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-2 text-slate-400" />
                  <input
                    value={scriptSearch}
                    onChange={(e) => setScriptSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
                    placeholder="Kịch bản"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
                {scripts.length === 0 ? (
                  <EmptyState title="Không có kịch bản" description="Danh sách kịch bản trống" />
                ) : (
                  scripts.map((script) => (
                    <ScriptGroup
                      key={script.id}
                      script={script}
                      activeScriptId={activeScriptId}
                      onSelect={() => setActiveScriptId(script.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Chat Editor */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Chi tiết chát</span>
                <div className="flex gap-3 text-slate-400 text-xs">
                  <Bold size={13} className="cursor-pointer hover:text-slate-600" />
                  <Italic size={13} className="cursor-pointer hover:text-slate-600" />
                  <Underline size={13} className="cursor-pointer hover:text-slate-600" />
                  <List size={13} className="cursor-pointer hover:text-slate-600" />
                  <Link size={13} className="cursor-pointer hover:text-slate-600" />
                  <Image size={13} className="cursor-pointer hover:text-slate-600" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
                {!activeChatId ? (
                  <EmptyState title="Chọn một hội thoại" description="Nhấn vào hội thoại bên trái để xem chi tiết" />
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div key={msg.id} className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg text-xs text-slate-700 shadow-sm max-w-[70%] mb-2">
                        <span className="font-semibold mr-1">User:</span> {msg.text}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                    {activeScriptId && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleCopyScript}
                          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          <Copy size={12} />
                          SAO CHÉP KỊCH BẢN
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-3 border-t border-gray-200 bg-slate-50">
                <div className="bg-white border border-gray-300 rounded-lg p-3">
                  <p className="text-[11px] text-slate-400 mb-2">Nhập tin nhắn hoặc chọn kịch bản...</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-slate-400">
                      <span className="font-serif text-sm font-bold cursor-pointer hover:text-slate-600">Aa</span>
                      <Image size={14} className="cursor-pointer hover:text-slate-600" />
                      <Paperclip size={14} className="cursor-pointer hover:text-slate-600" />
                      <Trash2 size={14} className="cursor-pointer hover:text-red-400" />
                    </div>
                    <button onClick={handleSend} className="text-blue-500 hover:text-blue-600 transition-colors">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CỘT 3: NẠP LEAD & THÔNG TIN ===== */}
        <section className="col-span-3 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-tight">NẠP LEAD & THÔNG TIN</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
            {activeChatId && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                  {chatList.find((c) => c.id === activeChatId)?.avatar || '?'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">
                    {chatList.find((c) => c.id === activeChatId)?.name || '—'}
                  </h3>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                value={leadForm.name}
                onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="[Tên KH]"
              />
              <input
                type="text"
                value={leadForm.phone}
                onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="[Số điện thoại]"
              />
              <input
                type="text"
                value={leadForm.service}
                onChange={(e) => setLeadForm((p) => ({ ...p, service: e.target.value }))}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="[Dịch vụ quan tâm]"
              />
              <textarea
                rows={3}
                value={leadForm.note}
                onChange={(e) => setLeadForm((p) => ({ ...p, note: e.target.value }))}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="[Ghi chú]"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-slate-400 italic">Status trang changed ...</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ChannelBadge({ channel }) {
  if (channel === 'fb') {
    return <i className="fa-brands fa-facebook absolute -bottom-1 -right-1 text-blue-600 text-xs bg-white rounded-full w-4 h-4 flex items-center justify-center" />;
  }
  return <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-100 text-blue-600 text-[8px] font-bold rounded-full flex items-center justify-center">ZL</div>;
}

function ChatItem({ item, isActive, onClick }) {
  return (
    <div onClick={onClick} className={`chat-card p-3 border-b border-gray-200 cursor-pointer transition-all ${isActive ? 'active' : 'hover:bg-slate-50'}`}>
      <div className="flex gap-3 mb-2">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            {item.avatar || item.name?.charAt(0) || '?'}
          </div>
          <ChannelBadge channel={item.channel} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <span className={`text-xs font-bold truncate ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{item.name}</span>
            <span className="text-[10px] text-gray-400 ml-1">{item.lastTime}</span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            {item.pageName && <span>{item.pageName}</span>}
            {item.unread > 0 && (
              <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold ml-auto">{item.unread}</span>
            )}
          </p>
          {item.snippet && <p className="text-[11px] text-slate-400 italic truncate mt-0.5">{item.snippet}</p>}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {!item.hasPhone && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">Chưa có SĐT</span>}
        {item.hasPhone && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"><Phone size={9} /> SĐT</span>}
        {item.isHot && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"><i className="fa-solid fa-fire text-[8px]" /> HOT</span>}
        {item.isWait && <span className="bg-yellow-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"><i className="fa-solid fa-circle-exclamation text-[8px]" /> WAIT</span>}
      </div>
    </div>
  );
}

function ScriptGroup({ script, activeScriptId, onSelect }) {
  return (
    <div>
      <div className="bg-slate-100 p-2 rounded text-[11px] font-bold text-slate-700">{script.label}</div>
      {(script.items || []).map((item, idx) => (
        <div
          key={idx}
          onClick={onSelect}
          className={`p-2 text-[11px] cursor-pointer transition-colors border-l-2 ${script.id === activeScriptId ? 'bg-blue-50 border-l-blue-500 text-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-transparent'}`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
