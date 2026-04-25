import { useState } from 'react'
import { Task, TaskStatus, Priority, ProductionType } from '../types'
import {
  categoryLabel, categoryColor, statusLabel, statusColor,
  priorityLabel, priorityColor, productionTypeLabel, productionProcesses,
} from '../utils/constants'
import { Badge } from './Badge'
import { ConfirmDialog } from './ConfirmDialog'
import { StoreType } from '../store/useStore'
import {
  ArrowLeft, Trash2, Plus, ExternalLink, CheckSquare, Square,
  Edit2, Check, X,
} from 'lucide-react'

interface TaskDetailProps {
  task: Task
  store: StoreType
  onBack: () => void
}

const daysUntil = (d: string | null) => {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
}

const formatDate = (d: string | null) => {
  if (!d) return null
  const dt = new Date(d)
  return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`
}

// inline editable field
const EditableText = ({
  value, onChange, placeholder, multiline, className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  className?: string
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const save = () => { setEditing(false); onChange(draft) }
  const cancel = () => { setEditing(false); setDraft(value) }

  if (!editing) {
    return (
      <span
        onClick={() => { setEditing(true); setDraft(value) }}
        className={`cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 ${value ? '' : 'text-gray-300'} ${className}`}
      >
        {value || placeholder}
        <Edit2 size={11} className="inline ml-1.5 text-gray-300" />
      </span>
    )
  }

  return multiline ? (
    <div className="flex flex-col gap-1">
      <textarea
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={4}
        className={`border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none w-full ${className}`}
      />
      <div className="flex gap-1">
        <button onClick={save} className="p-1 text-green-500 hover:text-green-700"><Check size={14} /></button>
        <button onClick={cancel} className="p-1 text-gray-400 hover:text-gray-600"><X size={14} /></button>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
        className={`border rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 flex-1 ${className}`}
      />
      <button onClick={save} className="p-1 text-green-500 hover:text-green-700"><Check size={14} /></button>
      <button onClick={cancel} className="p-1 text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
  )
}

export const TaskDetail = ({ task, store, onBack }: TaskDetailProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [newUrlLabel, setNewUrlLabel] = useState('')
  const [newUrlValue, setNewUrlValue] = useState('')

  const days = daysUntil(task.deadline)
  const isOverdue = days !== null && days < 0 && task.status !== 'delivered' && task.status !== 'done'
  const isUrgent = days !== null && days <= 2 && days >= 0 && task.status !== 'delivered' && task.status !== 'done'

  const handleDelete = () => { store.deleteTask(task.id); onBack() }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    store.addSubTask(task.id, newSubtask.trim())
    setNewSubtask('')
  }

  const addUrl = () => {
    if (!newUrlLabel.trim() || !newUrlValue.trim()) return
    store.addRelatedUrl(task.id, newUrlLabel.trim(), newUrlValue.trim())
    setNewUrlLabel('')
    setNewUrlValue('')
  }

  const doneCount = task.subtasks.filter(s => s.done).length

  return (
    <div className="space-y-5 pb-10">
      {/* Back + delete */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1" />
        <button onClick={() => setConfirmDelete(true)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Title */}
      <div>
        <div className="mb-1">
          <Badge label={categoryLabel[task.category]} colorClass={categoryColor[task.category]} />
        </div>
        <h1 className="text-xl font-bold text-gray-800 leading-snug">
          <EditableText
            value={task.title}
            onChange={v => store.updateTask(task.id, { title: v })}
            placeholder="タスク名"
            className="text-xl font-bold"
          />
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          依頼者: <EditableText
            value={task.client}
            onChange={v => store.updateTask(task.id, { client: v })}
            placeholder="依頼者を入力"
            className="text-sm text-gray-500"
          />
        </p>
      </div>

      {/* Status / Priority / Deadline row */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">ステータス</p>
            <select
              value={task.status}
              onChange={e => store.updateStatus(task.id, e.target.value as TaskStatus)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {(['todo', 'in_progress', 'waiting', 'revision', 'delivered', 'done'] as TaskStatus[]).map(s => (
                <option key={s} value={s}>{statusLabel[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">優先度</p>
            <select
              value={task.priority}
              onChange={e => store.updateTask(task.id, { priority: e.target.value as Priority })}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <option key={p} value={p}>{priorityLabel[p]}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">期限</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={task.deadline ?? ''}
              onChange={e => store.updateTask(task.id, { deadline: e.target.value || null })}
              className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            {task.deadline && (
              <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-500' : 'text-gray-400'}`}>
                {isOverdue ? `${Math.abs(days!)}日超過` : days === 0 ? '今日' : `残${days}日`}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge label={statusLabel[task.status]} colorClass={statusColor[task.status]} />
          <span className={`text-xs font-semibold ${priorityColor[task.priority]}`}>
            優先度: {priorityLabel[task.priority]}
          </span>
        </div>
      </div>

      {/* ---- 動画編集 固有フィールド ---- */}
      {task.category === 'video' && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">動画編集</h3>
          <div>
            <p className="text-xs text-gray-400 mb-1">素材URL</p>
            <EditableText
              value={task.videoFields.materialUrl}
              onChange={v => store.updateVideoFields(task.id, { materialUrl: v })}
              placeholder="素材ファイルのURL"
              className="text-sm text-blue-600"
            />
            {task.videoFields.materialUrl && (
              <a href={task.videoFields.materialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1">
                開く <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">納品URL</p>
            <EditableText
              value={task.videoFields.deliveryUrl}
              onChange={v => store.updateVideoFields(task.id, { deliveryUrl: v })}
              placeholder="納品先のURL"
              className="text-sm text-blue-600"
            />
            {task.videoFields.deliveryUrl && (
              <a href={task.videoFields.deliveryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1">
                開く <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">修正内容メモ</p>
            <EditableText
              value={task.videoFields.revisionNote}
              onChange={v => store.updateVideoFields(task.id, { revisionNote: v })}
              placeholder="修正依頼の内容を記録"
              multiline
              className="text-sm text-gray-700"
            />
          </div>
        </div>
      )}

      {/* ---- 制作業務 固有フィールド ---- */}
      {task.category === 'production' && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">制作業務</h3>
          <div>
            <p className="text-xs text-gray-400 mb-1">制作の種類</p>
            <select
              value={task.productionFields.productionType}
              onChange={e => store.updateProductionFields(task.id, { productionType: e.target.value as ProductionType })}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              {(['homepage', 'lp', 'system'] as ProductionType[]).map(t => (
                <option key={t} value={t}>{productionTypeLabel[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">現在の工程</p>
            <div className="flex flex-wrap gap-1.5">
              {productionProcesses[task.productionFields.productionType].map(p => (
                <button
                  key={p}
                  onClick={() => store.updateProductionFields(task.id, { currentProcess: p })}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    task.productionFields.currentProcess === p
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {/* Related URLs */}
          <div>
            <p className="text-xs text-gray-400 mb-2">関連URL</p>
            <ul className="space-y-1.5 mb-2">
              {task.productionFields.relatedUrls.map(u => (
                <li key={u.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium w-24 truncate shrink-0">{u.label}</span>
                  <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate flex items-center gap-1 flex-1">
                    {u.url} <ExternalLink size={11} />
                  </a>
                  <button onClick={() => store.deleteRelatedUrl(task.id, u.id)} className="text-gray-300 hover:text-red-400 shrink-0 transition-colors">
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUrlLabel}
                onChange={e => setNewUrlLabel(e.target.value)}
                placeholder="ラベル"
                className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 w-24"
              />
              <input
                type="url"
                value={newUrlValue}
                onChange={e => setNewUrlValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addUrl() }}
                placeholder="URL"
                className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 flex-1"
              />
              <button onClick={addUrl} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtasks */}
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
          <CheckSquare size={12} /> サブタスク
          {task.subtasks.length > 0 && (
            <span className="ml-1 text-gray-300">{doneCount}/{task.subtasks.length}</span>
          )}
        </h3>
        <ul className="space-y-1">
          {task.subtasks.map(sub => (
            <li key={sub.id} className="flex items-center gap-2">
              <button onClick={() => store.toggleSubTask(task.id, sub.id)} className="shrink-0">
                {sub.done
                  ? <CheckSquare size={16} className="text-gray-600" />
                  : <Square size={16} className="text-gray-300" />
                }
              </button>
              <span className={`text-sm flex-1 ${sub.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {sub.title}
              </span>
              <button onClick={() => store.deleteSubTask(task.id, sub.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newSubtask}
            onChange={e => setNewSubtask(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSubtask() }}
            placeholder="サブタスクを追加"
            className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <button onClick={addSubtask} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Memo */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">メモ</h3>
        <textarea
          value={task.memo}
          onChange={e => store.updateTask(task.id, { memo: e.target.value })}
          placeholder="自由にメモを書けます..."
          rows={5}
          className="w-full text-sm text-gray-700 focus:outline-none resize-none"
        />
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message={`「${task.title}」を削除しますか？`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
