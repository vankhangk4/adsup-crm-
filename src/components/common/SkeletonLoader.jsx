/**
 * SkeletonLoader - Component hiển thị trạng thái loading
 * Sử dụng animate-pulse của Tailwind
 */
export function SkeletonRow({ cols = 7, height = 'h-10' }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`${height} bg-gray-100 rounded-lg animate-pulse`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard({ height = 'h-36' }) {
  return (
    <div className={`${height} bg-gray-100 rounded-xl animate-pulse`} />
  );
}

export function TableSkeleton({ rows = 8, cols = 7 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr className="text-xs text-gray-400 uppercase tracking-wide">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="text-left px-4 py-3 font-semibold">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, height = 'h-48' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className={`${height} bg-gray-50 rounded-xl animate-pulse`} />
            <div className={`${height} bg-gray-50 rounded-xl animate-pulse`} />
            <div className={`${height} bg-gray-50 rounded-xl animate-pulse`} />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
