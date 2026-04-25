import { useMemo } from 'react'
import { Project, Task } from '../types'
import {
  categoryLabel, categoryColor, statusLabel, statusColor,
  taskStatusLabel, taskStatusColor,
} from '../utils/templates'
import { Badge } from './Badge'
import {
  AlertCircle, Clock, CheckCircle2, TrendingUp,
  AlertTriangle, RefreshCw, Banknote,
} from 'lucide-react'

interface DashboardProps {
  projects: Project[]
  onSelectProject: (id: string) => void
}

const formatDate = (d: string | null) => {
  if (!d) return null
  const date = new Date(d)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const daysUntil = (deadline: string | null): number | null => {
  if (!deadline) return null
  const diff = new Date(deadline).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / 86_400_000)
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
  color: string
}

const StatCard = ({ icon, label, value, sub, color }: StatCardProps) => (
  <div className={`rounded-xl p-4 flex items-center gap-4 ${color}`}>
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold leading-none mt-0.5">{value}</p>
      {sub && <p className="text-xs mt-0.5 opacity-70">{sub}</p>}
    </div>
  </div>
)

interface UpcomingTask {
  project: Project
  task: Task
  days: number | null
}

export const Dashboard = ({ projects, onSelectProject }: DashboardProps) => {
  const stats = useMemo(() => {
    const active = projects.filter(p => p.status === 'active').length
    const waiting = projects.filter(p => p.status === 'waiting').length
    const revision = projects.filter(p => p.status === 'revision').length

    const urgent = projects.filter(p => {
      if (p.status === 'completed' || p.status === 'cancelled') return false
      const d = daysUntil(p.deadline)
      return d !== null && d <= 3
    }).length

    const unpaidTotal = projects
      .filter(p => p.billing.status === 'invoiced' || p.billing.status === 'unpaid')
      .reduce((sum, p) => sum + (p.billing.amount ?? 0), 0)

    const paidTotal = projects
      .filter(p => p.billing.status === 'paid')
      .reduce((sum, p) => sum + (p.billing.amount ?? 0), 0)

    return { active, waiting, revision, urgent, unpaidTotal, paidTotal }
  }, [projects])

  const todayTasks = useMemo(() => {
    const result: UpcomingTask[] = []
    for (const p of projects) {
      if (p.status === 'completed' || p.status === 'cancelled') continue
      for (const t of p.tasks) {
        if (t.status === 'done') continue
        if (!t.dueDate) continue
        const d = daysUntil(t.dueDate)
        if (d !== null && d <= 0) result.push({ project: p, task: t, days: d })
      }
    }
    return result.sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
  }, [projects])

  const upcomingDeadlines = useMemo(() => {
    return projects
      .filter(p => p.status !== 'completed' && p.status !== 'cancelled' && p.deadline)
      .map(p => ({ project: p, days: daysUntil(p.deadline) }))
      .filter(({ days }) => days !== null && days <= 14)
      .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
  }, [projects])

  const inProgressProjects = useMemo(() => {
    return projects.filter(p => p.status === 'active' || p.status === 'revision')
  }, [projects])

  const waitingProjects = useMemo(() => {
    return projects.filter(p => p.status === 'waiting')
  }, [projects])

  const formatMoney = (n: number) =>
    n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' })

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingUp size={24} className="text-blue-600" />}
          label="進行中"
          value={stats.active}
          color="bg-blue-50 text-blue-900"
        />
        <StatCard
          icon={<Clock size={24} className="text-yellow-600" />}
          label="確認待ち"
          value={stats.waiting}
          color="bg-yellow-50 text-yellow-900"
        />
        <StatCard
          icon={<RefreshCw size={24} className="text-red-500" />}
          label="修正対応中"
          value={stats.revision}
          color="bg-red-50 text-red-900"
        />
        <StatCard
          icon={<AlertTriangle size={24} className="text-orange-600" />}
          label="納期3日以内"
          value={stats.urgent}
          color="bg-orange-50 text-orange-900"
        />
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          icon={<Banknote size={24} className="text-green-600" />}
          label="入金済み"
          value={formatMoney(stats.paidTotal)}
          color="bg-green-50 text-green-900"
        />
        <StatCard
          icon={<Banknote size={24} className="text-gray-500" />}
          label="未請求 / 請求済み"
          value={formatMoney(stats.unpaidTotal)}
          color="bg-gray-100 text-gray-800"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <AlertCircle size={14} /> 今日やること / 期限切れ
          </h2>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">期限が本日以前のタスクはありません</p>
          ) : (
            <ul className="space-y-2">
              {todayTasks.map(({ project, task, days }) => (
                <li
                  key={task.id}
                  onClick={() => onSelectProject(project.id)}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{project.name}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <Badge
                      label={taskStatusLabel[task.status]}
                      colorClass={taskStatusColor[task.status]}
                    />
                    <span className={`text-xs font-medium ${days !== null && days < 0 ? 'text-red-600' : 'text-orange-500'}`}>
                      {days === 0 ? '今日' : days !== null && days < 0 ? `${Math.abs(days)}日超過` : `残${days}日`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming Deadlines */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Clock size={14} /> 納期が近い案件（14日以内）
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">14日以内の納期案件はありません</p>
          ) : (
            <ul className="space-y-2">
              {upcomingDeadlines.map(({ project, days }) => (
                <li
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <Badge label={categoryLabel[project.category]} colorClass={categoryColor[project.category]} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <p className="text-xs text-gray-400">{project.client}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge label={statusLabel[project.status]} colorClass={statusColor[project.status]} />
                    <span className={`text-xs font-medium ${days !== null && days <= 3 ? 'text-red-600' : 'text-gray-500'}`}>
                      {formatDate(project.deadline)} {days === 0 ? '(今日)' : days !== null && days < 0 ? `(${Math.abs(days)}日超過)` : `(残${days}日)`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* In Progress */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <CheckCircle2 size={14} /> 作業中の案件
        </h2>
        {inProgressProjects.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">進行中の案件はありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {inProgressProjects.map(p => {
              const done = p.tasks.filter(t => t.status === 'done').length
              const total = p.tasks.length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm leading-snug flex-1">{p.name}</p>
                    <Badge label={statusLabel[p.status]} colorClass={statusColor[p.status]} />
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{p.client}</p>
                  <Badge label={categoryLabel[p.category]} colorClass={categoryColor[p.category]} />
                  {total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>進捗</span>
                        <span>{done}/{total} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {p.deadline && (
                    <p className={`text-xs mt-2 ${daysUntil(p.deadline) !== null && daysUntil(p.deadline)! <= 3 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                      納期: {formatDate(p.deadline)}
                      {daysUntil(p.deadline) !== null && ` (残${daysUntil(p.deadline)}日)`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Waiting */}
      {waitingProjects.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Clock size={14} /> 確認待ち・素材待ちの案件
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {waitingProjects.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{p.name}</p>
                  <Badge label={categoryLabel[p.category]} colorClass={categoryColor[p.category]} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{p.client}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
