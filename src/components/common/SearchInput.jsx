/**
 * SearchInput - Thanh tìm kiếm với icon, clear button và debounce support
 * Phong cách: viền mỏng, bo tròn nhẹ, placeholder màu xám
 */
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchInput({
  placeholder = 'Tìm kiếm...',
  value = '',
  onChange,
  onSearch,
  debounceMs = 300,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  showClear = true,
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (!debounceMs) return;
    const timer = setTimeout(() => {
      onChange?.(localValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout;
      onChange?.(localValue);
      onSearch?.(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
    onSearch?.('');
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm',
  };

  const iconSizes = { sm: 14, md: 16, lg: 18 };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={iconSizes[size]}
        className="absolute left-3 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          w-full bg-white border border-gray-200 rounded-lg
          text-gray-800 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${sizeClasses[size]}
          ${showClear && localValue ? 'pr-8' : 'pr-3'}
        `}
      />
      {showClear && localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 text-gray-400 hover:text-gray-600 transition-colors rounded"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
