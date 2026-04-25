import { useState } from 'react'
import { Project, ProjectCategory, ProjectStatus } from '../types'
import {
  categoryLabel, categoryColor, statusLabel, statusColor, billingStatusLabel, billingStatusColor,
} from '../utils/templates'
import { Badge } from './Badge'
import { Search, Plus, ChevronRight } from 'lucide-react'

interface ProjectListProps {
  projects: Project[]
  onSelectProject: (id: string) => void
  onCreateProject: () => void
}

const ALL = 'all' as const

export const ProjectList = ({ projects, onSelectProject, onCreateProject }: ProjectListProps) => {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<ProjectCategory | typeof ALL>(ALL)
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | typeof ALL>(ALL)

  const filtered = projects.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === ALL || p.category === filterCategory
    const matchStatus = filterStatus === ALL || p.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  const daysUntil = (d: string | null) => {
    if (!d) return null
    return Math.ceil((new Date(d).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    const date = new Date(d)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="案件名・クライアント名で検索"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> 新規案件
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory(ALL)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === ALL ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          すべて
        </button>
        {(Object.keys(categoryLabel) as ProjectCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(filterCategory === cat ? ALL : cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === cat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {categoryLabel[cat]}
          </button>
        ))}
        <span className="w-px bg-gray-200 mx-1" />
        {(['active', 'waiting', 'revision', 'completed', 'cancelled'] as ProjectStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? ALL : s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-gray-400">{filtered.length} 件</p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 mb-4">案件が見つかりません</p>
          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> 最初の案件を作成する
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const done = p.tasks.filter(t => t.status === 'done').length
            const total = p.tasks.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const days = daysUntil(p.deadline)

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
                      <Badge label={categoryLabel[p.category]} colorClass={categoryColor[p.category]} />
                      <Badge label={statusLabel[p.status]} colorClass={statusColor[p.status]} />
                      <Badge
                        label={billingStatusLabel[p.billing.status]}
                        colorClass={billingStatusColor[p.billing.status]}
                      />
                    </div>
                    <p className="text-sm text-gray-500">{p.client || '—'}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
                      {p.deadline && (
                        <span className={days !== null && days <= 3 && p.status !== 'completed' ? 'text-red-500 font-semibold' : ''}>
                          納期: {formatDate(p.deadline)}
                          {days !== null && p.status !== 'completed' && p.status !== 'cancelled' &&
                            ` (残${days}日)`}
                        </span>
                      )}
                      {p.billing.amount !== null && (
                        <span>¥{p.billing.amount.toLocaleString()}</span>
                      )}
                      {total > 0 && (
                        <span>{done}/{total} タスク ({pct}%)</span>
                      )}
                    </div>
                    {total > 0 && (
                      <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-1 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
