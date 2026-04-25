import { Task } from '../types'
import {
  categoryLabel, categoryColor, statusLabel, statusColor,
  priorityLabel, priorityColor, productionTypeLabel,
} from '../utils/constants'
import { Badge } from './Badge'
import { ChevronRight, AlertTriangle } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

const daysUntil = (d: string | null) => {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const days = daysUntil(task.deadline)
  const isOverdue = days !== null && days < 0 && task.status !== 'delivered' && task.status !== 'done'
  const isUrgent = days !== null && days <= 2 && days >= 0 && task.status !== 'delivered' && task.status !== 'done'
  const isDone = task.status === 'delivered' || task.status === 'done'

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group ${
        isOverdue ? 'border-red-200 bg-red-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge label={categoryLabel[task.category]} colorClass={categoryColor[task.category]} />
            {task.category === 'production' && (
              <Badge
                label={productionTypeLabel[task.productionFields.productionType]}
                colorClass="bg-indigo-50 text-indigo-700"
              />
            )}
            <Badge label={statusLabel[task.status]} colorClass={statusColor[task.status]} />
          </div>

          {/* Title */}
          <p className={`font-semibold text-sm leading-snug ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {task.title}
          </p>

          {/* client */}
          {task.client && (
            <p className="text-xs text-gray-400 mt-0.5">{task.client}</p>
          )}

          {/* production process */}
          {task.category === 'production' && task.productionFields.currentProcess && (
            <p className="text-xs text-indigo-500 mt-1">工程: {task.productionFields.currentProcess}</p>
          )}

          {/* deadline + priority */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            {task.deadline && (
              <span className={`flex items-center gap-1 font-medium ${
                isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {(isOverdue || isUrgent) && <AlertTriangle size={11} />}
                {new Date(task.deadline).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                {!isDone && days !== null && (
                  isOverdue ? ` (${Math.abs(days)}日超過)` : days === 0 ? ' (今日)' : ` (残${days}日)`
                )}
              </span>
            )}
            <span className={`font-semibold ${priorityColor[task.priority]}`}>
              {priorityLabel[task.priority]}優先
            </span>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 shrink-0 mt-1 transition-colors" />
      </div>
    </div>
  )
}
