/**
 * ToastContext.jsx + ToastContainer - Hệ thống thông báo Toast
 * - Quản lý queue toast messages
 * - Hiệu ứng slide-in từ phải + fade out
 * - Auto-dismiss sau 3s
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

// ===== TOAST ICONS =====

function ToastIcon({ type }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 size={18} className="text-green-500" />;
    case 'error':
      return <XCircle size={18} className="text-red-500" />;
    case 'warning':
      return <AlertCircle size={18} className="text-amber-500" />;
    case 'info':
    default:
      return <Info size={18} className="text-blue-500" />;
  }
}

const TOAST_STYLES = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
};

const TOAST_ICON_WRAP = {
  success: 'bg-green-100',
  error: 'bg-red-100',
  warning: 'bg-amber-100',
  info: 'bg-blue-100',
};

// ===== TOAST CONTAINER =====

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto
            flex items-center gap-3 px-4 py-3
            rounded-xl border shadow-lg
            bg-white ${TOAST_STYLES[t.type]}
            min-w-72 max-w-96
            animate-slide-in-right
          `}
        >
          {/* Icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TOAST_ICON_WRAP[t.type]}`}>
            <ToastIcon type={t.type} />
          </div>

          {/* Message */}
          <p className="flex-1 text-sm font-medium text-gray-700">{t.message}</p>

          {/* Close */}
          <button
            onClick={() => onRemove(t.id)}
            className="p-1 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-all duration-200 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
