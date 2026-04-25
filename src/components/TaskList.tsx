import { useState } from 'react'
import { Task, TaskCategory, TaskStatus } from '../types'
import { categoryLabel, statusLabel } from '../utils/constants'
import { TaskCard } from './TaskCard'
import { Search, Plus } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onSelectTask: (id: string) => void
  onCreateTask: (defaultCategory?: TaskCategory) => void
}

const ALL = 'all' as const
type Filter = TaskCategory | typeof ALL
type StatusFilter = TaskStatus | typeof ALL | 'active'

export const TaskList = ({ tasks, onSelectTask, onCreateTask }: TaskListProps) => {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<Filter>(ALL)
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('active')

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      t.title.toLowerCase().includes(q) ||
      t.client.toLowerCase().includes(q)
    const matchCat = filterCat === ALL || t.category === filterCat
    const matchStatus =
      filterStatus === ALL ? true :
      filterStatus === 'active' ? !['delivered', 'done'].includes(t.status) :
      t.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  // group by category for display
  const cats: TaskCategory[] = ['video', 'production', 'other']
  const grouped = filterCat === ALL
    ? cats.map(c => ({ cat: c, items: filtered.filter(t => t.category === c) })).filter(g => g.items.length > 0)
    : [{ cat: filterCat, items: filtered }]

  const activeCount = tasks.filter(t => !['delivered', 'done'].includes(t.status)).length

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="タスク名・依頼者で検索"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <button
          onClick={() => onCreateTask(filterCat === ALL ? undefined : filterCat)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> 追加
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat(ALL)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === ALL ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          すべて
        </button>
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(filterCat === c ? ALL : c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === c ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {categoryLabel[c]}
          </button>
        ))}
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {([
          ['active', `対応中 (${activeCount})`],
          ['todo', '未着手'],
          ['in_progress', '作業中'],
          ['waiting', '確認待ち'],
          ['revision', '修正中'],
          ['delivered', '納品済み'],
          ['done', '完了'],
          [ALL, 'すべて'],
        ] as [StatusFilter, string][]).map(([s, label]) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">{filtered.length} 件</p>

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 mb-4">タスクが見つかりません</p>
          <button
            onClick={() => onCreateTask()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition-colors"
          >
            <Plus size={16} /> タスクを追加する
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              {filterCat === ALL && (
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  {categoryLabel[cat]} ({items.length})
                </h2>
              )}
              <div className="space-y-2">
                {items.map(t => (
                  <TaskCard key={t.id} task={t} onClick={() => onSelectTask(t.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
