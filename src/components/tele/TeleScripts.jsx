import { useState } from 'react'
import { FileText, Copy, Check, Search } from 'lucide-react'
import { scriptTemplates } from '../../data/mockData'

const categoryIcons = {
  'Chào hỏi': '👋',
  'Tư vấn giá': '💰',
  'Hẹn lịch': '📅',
  'Xử lý từ chối': '❌',
  'Follow-up': '📞',
}

export default function TeleScripts() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [copiedId, setCopiedId] = useState(null)
  const [searchScript, setSearchScript] = useState('')

  const categories = ['all', ...new Set(scriptTemplates.map((s) => s.category))]

  const filtered = scriptTemplates.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false
    if (searchScript) {
      const q = searchScript.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    }
    return true
  })

  const handleCopy = (script, id) => {
    navigator.clipboard.writeText(script.content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Category sidebar */}
      <div className="lg:col-span-1 card p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Danh mục kịch bản</h3>
        <div className="space-y-1">
          {categories.map((cat) => {
            const count = cat === 'all' ? scriptTemplates.length : scriptTemplates.filter((s) => s.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>
                  {cat === 'all' ? '📋' : categoryIcons[cat] || '📄'} {cat === 'all' ? 'Tất cả' : cat}
                </span>
                <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Scripts list */}
      <div className="lg:col-span-3 card p-4">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={18} className="text-primary-500" />
          <h3 className="text-sm font-semibold text-slate-700">
            Kịch bản Tele
            <span className="ml-2 text-slate-400 font-normal">({filtered.length})</span>
          </h3>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kịch bản..."
              value={searchScript}
              onChange={(e) => setSearchScript(e.target.value)}
              className="input-field pl-8 py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Không tìm thấy kịch bản phù hợp</div>
          ) : (
            filtered.map((script) => (
              <div key={script.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{categoryIcons[script.category] || '📄'}</span>
                      <span className="badge bg-slate-100 text-slate-600 text-[11px]">{script.category}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">{script.name}</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 leading-relaxed">
                      {script.content}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(script, script.id)}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      copiedId === script.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {copiedId === script.id ? (
                      <><Check size={13} /> Đã copy</>
                    ) : (
                      <><Copy size={13} /> Copy</>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
