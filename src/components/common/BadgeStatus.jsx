/**
 * BadgeStatus - Component hiển thị trạng thái với màu sắc phù hợp
 * Dựa trên phân tích ảnh CRM: các trạng thái Lead (Mới, Đang xử lý, Thành công, Từ chối...)
 */
const STATUS_CONFIG = {
  // Lead Status
  'Mới': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  'Đang xử lý': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  'Thành công': { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  'Từ chối': { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  'Chưa liên hệ': { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
  'Đã liên hệ': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },

  // Priority
  'Cao': { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  'Trung bình': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  'Thấp': { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },

  // User status
  'Hoạt động': { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  'Không hoạt động': { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  'Đang nhắn tin': { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', pulse: true },

  // Generic
  'success': { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  'warning': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  'danger': { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  'info': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  'default': { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
};

export default function BadgeStatus({ status, showDot = true, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['default'];

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {status}
    </span>
  );
}
