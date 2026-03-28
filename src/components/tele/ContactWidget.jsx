import { useState, useRef, useEffect } from 'react'
import { X, MessageCircle, Send } from 'lucide-react'

// ---- Floating Contact Popup ----
function ContactPopup({ onClose }) {
  const [activeTab, setActiveTab] = useState('zalo')
  const [messages, setMessages] = useState([
    { id: 1, from: 'customer', text: 'Chào bạn, tôi muốn tư vấn về dịch vụ mí mắt', time: '14:32' },
    { id: 2, from: 'user', text: 'Xin chào! Cảm ơn bạn đã liên hệ. Mình tên Lan, tư vấn viên của UPC Clinic. Bạn quan tâm dịch vụ mí mắt ạ?', time: '14:32' },
    { id: 3, from: 'customer', text: 'Dạ, cho mình hỏi giá làm mí là bao nhiêu vậy?', time: '14:33' },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const popupRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        const fab = document.getElementById('contact-fab')
        if (fab && !fab.contains(e.target)) onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: 'user', text: input, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
    ])
    setInput('')
  }

  const tabBar = (
    <div className="flex border-b border-slate-200">
      <button
        onClick={() => setActiveTab('zalo')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
          activeTab === 'zalo'
            ? 'border-[#0068FF] text-[#0068FF]'
            : 'border-transparent text-slate-400 hover:text-slate-600'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 60 60" fill="none">
          <rect width="60" height="60" rx="12" fill="#0068FF"/>
          <path d="M30 8C17.85 8 8 15.6 8 25.2C8 31.5 12.15 37.2 18 40.2V46L23.4 42.9C26.25 44.1 29.55 44.7 30 44.7C42.15 44.7 52 37.1 52 27.5C52 18 42.15 8 30 8Z" fill="white"/>
          <path d="M18 29C19.65 29 21 27.65 21 26C21 24.35 19.65 23 18 23C16.35 23 15 24.35 15 26C15 27.65 16.35 29 18 29Z" fill="#0068FF"/>
          <path d="M30 29C31.65 29 33 27.65 33 26C33 24.35 31.65 23 30 23C28.35 23 27 24.35 27 26C27 27.65 28.35 29 30 29Z" fill="#0068FF"/>
          <path d="M42 29C43.65 29 45 27.65 45 26C45 24.35 43.65 23 42 23C40.35 23 39 24.35 39 26C39 27.65 40.35 29 42 29Z" fill="#0068FF"/>
        </svg>
        Zalo
      </button>
      <button
        onClick={() => setActiveTab('messenger')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 ${
          activeTab === 'messenger'
            ? 'border-[#0084FF] text-[#0084FF]'
            : 'border-transparent text-slate-400 hover:text-slate-600'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 60 60" fill="none">
          <path d="M30 60C46.5685 60 60 48.2843 60 34C60 19.7157 46.5685 8 30 8C13.4315 8 0 19.7157 0 34C0 42.72 4.56 50.52 11.4 55.56L9 64L19.2 58.08C22.8 58.8 26.4 59.28 30 59.28C30 59.52 30 59.76 30 60Z" fill="#0084FF"/>
          <path d="M23.4 39L17.4 30L38.4 23.4L22.8 35.4L28.2 40.2L23.4 39Z" fill="white"/>
          <path d="M42 23.4L22.8 39L26.4 35.4L40.8 22.2L42 23.4Z" fill="#E5F0FF"/>
          <path d="M28.2 40.2L23.4 39L22.8 39L17.4 30L19.2 30.6L24.6 38.4L28.2 40.2Z" fill="#FFD9B3"/>
        </svg>
        Messenger
      </button>
    </div>
  )

  const quickReplies = [
    'Xin chào, cho mình hỏi giá dịch vụ',
    'Mình muốn đặt lịch khám',
    'Dịch vụ này có khuyến mãi gì không?',
    'Cảm ơn, mình sẽ liên hệ lại sau',
  ]

  return (
    <div
      ref={popupRef}
      className="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
      style={{ transformOrigin: 'bottom right' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0068FF] to-[#0084FF] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-white" />
          <span className="text-white font-semibold text-sm">Liên hệ tư vấn</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X size={14} className="text-white" />
        </button>
      </div>

      {/* Tabs */}
      {tabBar}

      {/* Chat area */}
      <div className="h-64 overflow-y-auto p-3 space-y-2 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                msg.from === 'user'
                  ? 'bg-[#0068FF] text-white rounded-br-sm'
                  : 'bg-white text-slate-700 rounded-bl-sm border border-slate-200 shadow-sm'
              }`}
            >
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            onClick={() => setInput(reply)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 text-sm bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            className="w-9 h-9 flex items-center justify-center bg-[#0068FF] rounded-full hover:opacity-90 transition-opacity"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <a
            href="https://zalo.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0068FF] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 60 60" fill="none">
              <rect width="60" height="60" rx="12" fill="#0068FF"/>
              <path d="M30 8C17.85 8 8 15.6 8 25.2C8 31.5 12.15 37.2 18 40.2V46L23.4 42.9C26.25 44.1 29.55 44.7 30 44.7C42.15 44.7 52 37.1 52 27.5C52 18 42.15 8 30 8Z" fill="white"/>
            </svg>
            Mở Zalo
          </a>
          <span className="text-slate-200">|</span>
          <a
            href="https://m.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0084FF] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 60 60" fill="none">
              <path d="M30 60C46.5685 60 60 48.2843 60 34C60 19.7157 46.5685 8 30 8C13.4315 8 0 19.7157 0 34C0 42.72 4.56 50.52 11.4 55.56L9 64L19.2 58.08C22.8 58.8 26.4 59.28 30 59.28C30 59.52 30 59.76 30 60Z" fill="#0084FF"/>
            </svg>
            Mở Messenger
          </a>
        </div>
      </div>
    </div>
  )
}

// ---- Floating Contact Widget (FAB) ----
export default function ContactWidget() {
  const [showContact, setShowContact] = useState(false)

  return (
    <div className="absolute bottom-0 right-0 z-30 flex flex-col items-end">
      {showContact && <ContactPopup onClose={() => setShowContact(false)} />}

      <button
        id="contact-fab"
        onClick={() => setShowContact(!showContact)}
        className="flex flex-col items-center gap-2 md:gap-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/60 p-2.5 md:p-3 hover:shadow-xl transition-shadow"
      >
        {/* Zalo */}
        <a
          href="https://zalo.me"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Liên hệ Zalo"
          className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#0068FF] flex items-center justify-center hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 60 60" fill="none" className="md:w-7 md:h-7">
            <rect width="60" height="60" rx="12" fill="#0068FF"/>
            <path d="M30 8C17.85 8 8 15.6 8 25.2C8 31.5 12.15 37.2 18 40.2V46L23.4 42.9C26.25 44.1 29.55 44.7 30 44.7C42.15 44.7 52 37.1 52 27.5C52 18 42.15 8 30 8Z" fill="white"/>
            <path d="M18 29C19.65 29 21 27.65 21 26C21 24.35 19.65 23 18 23C16.35 23 15 24.35 15 26C15 27.65 16.35 29 18 29Z" fill="#0068FF"/>
            <path d="M30 29C31.65 29 33 27.65 33 26C33 24.35 31.65 23 30 23C28.35 23 27 24.35 27 26C27 27.65 28.35 29 30 29Z" fill="#0068FF"/>
            <path d="M42 29C43.65 29 45 27.65 45 26C45 24.35 43.65 23 42 23C40.35 23 39 24.35 39 26C39 27.65 40.35 29 42 29Z" fill="#0068FF"/>
          </svg>
        </a>

        {/* Facebook Messenger */}
        <a
          href="https://m.me"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Liên hệ Messenger"
          className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#0084FF] flex items-center justify-center hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 60 60" fill="none" className="md:w-7 md:h-7">
            <path d="M30 60C46.5685 60 60 48.2843 60 34C60 19.7157 46.5685 8 30 8C13.4315 8 0 19.7157 0 34C0 42.72 4.56 50.52 11.4 55.56L9 64L19.2 58.08C22.8 58.8 26.4 59.28 30 59.28C30 59.52 30 59.76 30 60Z" fill="#0084FF"/>
            <path d="M23.4 39L17.4 30L38.4 23.4L22.8 35.4L28.2 40.2L23.4 39Z" fill="white"/>
            <path d="M42 23.4L22.8 39L26.4 35.4L40.8 22.2L42 23.4Z" fill="#E5F0FF"/>
            <path d="M28.2 40.2L23.4 39L22.8 39L17.4 30L19.2 30.6L24.6 38.4L28.2 40.2Z" fill="#FFD9B3"/>
          </svg>
        </a>

        <div className="hidden md:block text-[9px] text-slate-500 font-medium text-center leading-tight">
          Zalo &<br/>Messenger
        </div>
      </button>
    </div>
  )
}
