import { useMemo } from 'react'
import { Task } from '../types'
import {
  categoryLabel, categoryColor, statusLabel, statusColor,
  priorityColor, priorityLabel, activeStatuses,
} from '../utils/constants'
import { Badge } from './Badge'
import { TaskCard } from './TaskCard'
import { AlertTriangle, Clock, CheckCircle2, RefreshCw, Eye, Inbox } from 'lucide-react'

interface DashboardProps {
  tasks: Task[]
  onSelectTask: (id: string) => void
}

const daysUntil = (d: string | null) => {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
}

interface StatProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  onClick?: () => void
}

const Stat = ({ icon, label, value, color, onClick }: StatProps) => (
  <div
    onClick={onClick}
    className={`rounded-xl p-4 flex items-center gap-3 ${color} ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
  >
    <div className="shrink-0">{icon}</div>
    <div>
      <p className="text-xs font-medium opacity-60">{label}</p>
      <p className="text-2xl font-bold leading-none mt-0.5">{value}</p>
    </div>
  </div>
)

export const Dashboard = ({ tasks, onSelectTask }: DashboardProps) => {
  const stats = useMemo(() => {
    const active = tasks.filter(t => activeStatuses.includes(t.status)).length
    const waiting = tasks.filter(t => t.status === 'waiting').length
    const revision = tasks.filter(t => t.status === 'revision').length
    const overdue = tasks.filter(t => {
      if (!activeStatuses.includes(t.status)) return false
      const d = daysUntil(t.deadline)
      return d !== null && d < 0
    }).length
    const urgent = tasks.filter(t => {
      if (!activeStatuses.includes(t.status)) return false
      const d = daysUntil(t.deadline)
      return d !== null && d >= 0 && d <= 2
    }).length
    return { active, waiting, revision, overdue, urgent }
  }, [tasks])

  // 期限超過
  const overdueTasks = useMemo(() =>
    tasks
      .filter(t => {
        if (!activeStatuses.includes(t.status)) return false
        const d = daysUntil(t.deadline)
        return d !== null && d < 0
      })
      .sort((a, b) => (daysUntil(a.deadline) ?? 0) - (daysUntil(b.deadline) ?? 0))
  , [tasks])

  // 今日・3日以内
  const urgentTasks = useMemo(() =>
    tasks
      .filter(t => {
        if (!activeStatuses.includes(t.status)) return false
        const d = daysUntil(t.deadline)
        return d !== null && d >= 0 && d <= 3
      })
      .sort((a, b) => (daysUntil(a.deadline) ?? 0) - (daysUntil(b.deadline) ?? 0))
  , [tasks])

  // 確認待ち
  const waitingTasks = useMemo(() =>
    tasks.filter(t => t.status === 'waiting')
  , [tasks])

  // 修正中
  const revisionTasks = useMemo(() =>
    tasks.filter(t => t.status === 'revision')
  , [tasks])

  // 作業中（期限なし or 余裕あり）
  const inProgressTasks = useMemo(() =>
    tasks.filter(t => {
      if (t.status !== 'in_progress') return false
      const d = daysUntil(t.deadline)
      return d === null || d > 3
    })
  , [tasks])

  // 未着手
  const todoTasks = useMemo(() =>
    tasks.filter(t => t.status === 'todo')
  , [tasks])

  const Section = ({ title, icon, items, empty }: {
    title: string; icon: React.ReactNode; items: Task[]; empty: string
  }) => (
    <section>
      <h2 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {icon} {title} {items.length > 0 && <span className="text-gray-400">({items.length})</span>}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-300 py-3">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map(t => (
            <TaskCard key={t.id} task={t} onClick={() => onSelectTask(t.id)} />
          ))}
        </div>
      )}
    </section>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Stat icon={<Inbox size={22} className="text-blue-500" />} label="対応中" value={stats.active} color="bg-blue-50 text-blue-900" />
        <Stat icon={<AlertTriangle size={22} className="text-red-500" />} label="期限超過" value={stats.overdue} color="bg-red-50 text-red-900" />
        <Stat icon={<Clock size={22} className="text-orange-500" />} label="3日以内" value={stats.urgent} color="bg-orange-50 text-orange-900" />
        <Stat icon={<Eye size={22} className="text-yellow-600" />} label="確認待ち" value={stats.waiting} color="bg-yellow-50 text-yellow-900" />
        <Stat icon={<RefreshCw size={22} className="text-rose-500" />} label="修正中" value={stats.revision} color="bg-rose-50 text-rose-900" />
        <Stat icon={<CheckCircle2 size={22} className="text-gray-400" />} label="完了済み" value={tasks.filter(t => t.status === 'done' || t.status === 'delivered').length} color="bg-gray-100 text-gray-700" />
      </div>

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <Section
          title="期限超過"
          icon={<AlertTriangle size={13} className="text-red-500" />}
          items={overdueTasks}
          empty=""
        />
      )}

      {/* Urgent */}
      <Section
        title="今日・3日以内が期限"
        icon={<Clock size={13} className="text-orange-500" />}
        items={urgentTasks}
        empty="急ぎのタスクはありません"
      />

      {/* Waiting */}
      <Section
        title="確認待ち"
        icon={<Eye size={13} className="text-yellow-600" />}
        items={waitingTasks}
        empty="確認待ちのタスクはありません"
      />

      {/* Revision */}
      {revisionTasks.length > 0 && (
        <Section
          title="修正中"
          icon={<RefreshCw size={13} className="text-rose-500" />}
          items={revisionTasks}
          empty=""
        />
      )}

      {/* In Progress */}
      <Section
        title="作業中"
        icon={<Inbox size={13} className="text-blue-500" />}
        items={inProgressTasks}
        empty="作業中のタスクはありません"
      />

      {/* Todo */}
      {todoTasks.length > 0 && (
        <Section
          title="未着手"
          icon={<CheckCircle2 size={13} className="text-gray-400" />}
          items={todoTasks}
          empty=""
        />
      )}
    </div>
  )
}
