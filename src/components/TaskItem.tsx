import { useState } from 'react'
import { Task, TaskStatus, Priority } from '../types'
import {
  taskStatusLabel, priorityLabel, priorityColor,
} from '../utils/templates'
import { StoreType } from '../store/useStore'
import {
  ChevronDown, ChevronRight, Trash2, Plus, MessageSquare,
  CheckSquare, Square,
} from 'lucide-react'

interface TaskItemProps {
  projectId: string
  task: Task
  store: StoreType
}

export const TaskItem = ({ projectId, task, store }: TaskItemProps) => {
  const [expanded, setExpanded] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [editTitle, setEditTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(task.title)

  const handleTitleBlur = () => {
    setEditTitle(false)
    if (titleValue.trim() && titleValue !== task.title) {
      store.updateTask(projectId, task.id, { title: titleValue.trim() })
    }
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    store.addSubTask(projectId, task.id, newSubtask.trim())
    setNewSubtask('')
  }

  const addComment = () => {
    if (!newComment.trim()) return
    store.addComment(projectId, task.id, newComment.trim())
    setNewComment('')
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const doneSubtasks = task.subtasks.filter(s => s.done).length

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Title */}
          {editTitle ? (
            <input
              autoFocus
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleBlur() }}
              className="flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          ) : (
            <span
              onClick={() => setEditTitle(true)}
              className={`flex-1 text-sm cursor-pointer hover:text-blue-600 leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}
            >
              {task.title}
            </span>
          )}

          <button
            onClick={() => store.deleteTask(projectId, task.id)}
            className="p-1 text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 pl-6 flex-wrap">
          <select
            value={task.status}
            onChange={e => store.updateTaskStatus(projectId, task.id, e.target.value as TaskStatus)}
            className="text-xs border rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {(Object.keys(taskStatusLabel) as TaskStatus[]).map(s => (
              <option key={s} value={s}>{taskStatusLabel[s]}</option>
            ))}
          </select>

          <select
            value={task.priority}
            onChange={e => store.updateTask(projectId, task.id, { priority: e.target.value as Priority })}
            className={`text-xs font-bold border rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 ${priorityColor[task.priority]}`}
          >
            {(Object.keys(priorityLabel) as Priority[]).map(p => (
              <option key={p} value={p}>優先度: {priorityLabel[p]}</option>
            ))}
          </select>

          <input
            type="date"
            value={task.dueDate ?? ''}
            onChange={e => store.updateTask(projectId, task.id, { dueDate: e.target.value || null })}
            className="text-xs border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />

          {task.subtasks.length > 0 && (
            <span className="text-xs text-gray-400">{doneSubtasks}/{task.subtasks.length} 完了</span>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t bg-gray-50 p-3 space-y-4">
          {/* Subtasks */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <CheckSquare size={12} /> サブタスク
            </h4>
            <ul className="space-y-1">
              {task.subtasks.map(sub => (
                <li key={sub.id} className="flex items-center gap-2">
                  <button onClick={() => store.toggleSubTask(projectId, task.id, sub.id)} className="flex-shrink-0">
                    {sub.done
                      ? <CheckSquare size={16} className="text-blue-500" />
                      : <Square size={16} className="text-gray-300" />
                    }
                  </button>
                  <span className={`text-sm flex-1 ${sub.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {sub.title}
                  </span>
                  <button onClick={() => store.deleteSubTask(projectId, task.id, sub.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addSubtask() }}
                placeholder="サブタスクを追加"
                className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button onClick={addSubtask} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <MessageSquare size={12} /> コメント
            </h4>
            <ul className="space-y-2">
              {task.comments.map(c => (
                <li key={c.id} className="flex items-start gap-2 bg-white p-2 rounded border">
                  <p className="flex-1 text-sm text-gray-700 whitespace-pre-wrap">{c.text}</p>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">{formatTime(c.createdAt)}</span>
                    <button onClick={() => store.deleteComment(projectId, task.id, c.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addComment() }}
                placeholder="コメントを追加"
                className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button onClick={addComment} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
