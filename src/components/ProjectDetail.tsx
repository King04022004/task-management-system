import { useState } from 'react'
import { Project, ProjectStatus, BillingStatus } from '../types'
import {
  categoryLabel, categoryColor, statusLabel,
  billingStatusLabel, billingStatusColor, taskStatusLabel,
} from '../utils/templates'
import { Badge } from './Badge'
import { TaskItem } from './TaskItem'
import { ConfirmDialog } from './ConfirmDialog'
import { StoreType } from '../store/useStore'
import {
  ArrowLeft, Plus, Trash2, ExternalLink, Edit2, Check, X,
  ClipboardList, Link, StickyNote, Banknote, Package,
} from 'lucide-react'

interface ProjectDetailProps {
  project: Project
  store: StoreType
  onBack: () => void
}

type Tab = 'tasks' | 'urls' | 'memo' | 'billing' | 'delivery'

export const ProjectDetail = ({ project, store, onBack }: ProjectDetailProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newUrlLabel, setNewUrlLabel] = useState('')
  const [newUrlValue, setNewUrlValue] = useState('')
  const [editName, setEditName] = useState(false)
  const [nameValue, setNameValue] = useState(project.name)
  const [editClient, setEditClient] = useState(false)
  const [clientValue, setClientValue] = useState(project.client)

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    store.addTask(project.id, newTaskTitle.trim())
    setNewTaskTitle('')
  }

  const addUrl = () => {
    if (!newUrlLabel.trim() || !newUrlValue.trim()) return
    store.addUrl(project.id, newUrlLabel.trim(), newUrlValue.trim())
    setNewUrlLabel('')
    setNewUrlValue('')
  }

  const handleDeleteProject = () => {
    store.deleteProject(project.id)
    onBack()
  }

  const saveName = () => {
    setEditName(false)
    if (nameValue.trim()) store.updateProject(project.id, { name: nameValue.trim() })
    else setNameValue(project.name)
  }

  const saveClient = () => {
    setEditClient(false)
    store.updateProject(project.id, { client: clientValue.trim() })
  }

  const done = project.tasks.filter(t => t.status === 'done').length
  const total = project.tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tasks', label: 'タスク', icon: <ClipboardList size={14} /> },
    { id: 'urls', label: '関連URL', icon: <Link size={14} /> },
    { id: 'memo', label: 'メモ', icon: <StickyNote size={14} /> },
    { id: 'billing', label: '請求', icon: <Banknote size={14} /> },
    { id: 'delivery', label: '納品', icon: <Package size={14} /> },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          {editName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName() }}
                className="text-xl font-bold border-b-2 border-blue-400 focus:outline-none bg-transparent flex-1"
              />
              <button onClick={saveName} className="p-1 text-green-500 hover:text-green-700"><Check size={18} /></button>
              <button onClick={() => { setEditName(false); setNameValue(project.name) }} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
          ) : (
            <h1
              onClick={() => setEditName(true)}
              className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 truncate group"
            >
              {project.name}
              <Edit2 size={14} className="inline ml-2 text-gray-300 group-hover:text-blue-400 transition-colors" />
            </h1>
          )}
          {editClient ? (
            <div className="flex items-center gap-1 mt-0.5">
              <input
                autoFocus
                value={clientValue}
                onChange={e => setClientValue(e.target.value)}
                onBlur={saveClient}
                onKeyDown={e => { if (e.key === 'Enter') saveClient() }}
                className="text-sm border-b border-gray-300 focus:outline-none bg-transparent text-gray-500"
              />
            </div>
          ) : (
            <p onClick={() => setEditClient(true)} className="text-sm text-gray-500 cursor-pointer hover:text-blue-500 mt-0.5">
              {project.client || 'クライアント名を入力'} <Edit2 size={12} className="inline" />
            </p>
          )}
        </div>
        <button onClick={() => setConfirmDelete(true)} className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Meta */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge label={categoryLabel[project.category]} colorClass={categoryColor[project.category]} />
          <select
            value={project.status}
            onChange={e => store.updateProjectStatus(project.id, e.target.value as ProjectStatus)}
            className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {(['active', 'waiting', 'revision', 'completed', 'cancelled'] as ProjectStatus[]).map(s => (
              <option key={s} value={s}>{statusLabel[s]}</option>
            ))}
          </select>
          <Badge label={billingStatusLabel[project.billing.status]} colorClass={billingStatusColor[project.billing.status]} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">納期</span>
            <input
              type="date"
              value={project.deadline ?? ''}
              onChange={e => store.updateProject(project.id, { deadline: e.target.value || null })}
              className="border rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
        {total > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>進捗</span>
              <span>{done}/{total} ({pct}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTask() }}
              placeholder="新しいタスクを追加"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={addTask}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> 追加
            </button>
          </div>

          {/* Task filter by status */}
          {project.tasks.length > 0 && (() => {
            const groups = [
              { key: 'in_progress', tasks: project.tasks.filter(t => t.status === 'in_progress') },
              { key: 'todo', tasks: project.tasks.filter(t => t.status === 'todo') },
              { key: 'waiting', tasks: project.tasks.filter(t => t.status === 'waiting') },
              { key: 'done', tasks: project.tasks.filter(t => t.status === 'done') },
            ].filter(g => g.tasks.length > 0)

            return groups.map(g => (
              <div key={g.key}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">
                  {taskStatusLabel[g.key]} ({g.tasks.length})
                </h3>
                <div className="space-y-2">
                  {g.tasks.map(task => (
                    <TaskItem key={task.id} projectId={project.id} task={task} store={store} />
                  ))}
                </div>
              </div>
            ))
          })()}

          {project.tasks.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">タスクがありません</p>
          )}
        </div>
      )}

      {activeTab === 'urls' && (
        <div className="space-y-3">
          <div className="bg-white border rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newUrlLabel}
                onChange={e => setNewUrlLabel(e.target.value)}
                placeholder="ラベル (例: デザインデータ)"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 sm:col-span-1"
              />
              <input
                type="url"
                value={newUrlValue}
                onChange={e => setNewUrlValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addUrl() }}
                placeholder="URL"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 sm:col-span-1"
              />
              <button
                onClick={addUrl}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} /> 追加
              </button>
            </div>
          </div>
          {project.urls.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">関連URLが登録されていません</p>
          ) : (
            <ul className="space-y-2">
              {project.urls.map(u => (
                <li key={u.id} className="flex items-center gap-3 bg-white border rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-gray-700 w-32 flex-shrink-0 truncate">{u.label}</span>
                  <a
                    href={u.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-blue-600 hover:underline truncate flex items-center gap-1"
                  >
                    {u.url} <ExternalLink size={12} />
                  </a>
                  <button onClick={() => store.deleteUrl(project.id, u.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'memo' && (
        <div className="bg-white border rounded-xl p-4">
          <textarea
            value={project.memo}
            onChange={e => store.updateMemo(project.id, e.target.value)}
            placeholder="案件に関するメモを自由に記入できます..."
            rows={12}
            className="w-full text-sm text-gray-700 focus:outline-none resize-none"
          />
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">金額 (円)</label>
              <input
                type="number"
                value={project.billing.amount ?? ''}
                onChange={e => store.updateBilling(project.id, { amount: e.target.value ? Number(e.target.value) : null })}
                placeholder="例: 150000"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">請求ステータス</label>
              <select
                value={project.billing.status}
                onChange={e => store.updateBilling(project.id, { status: e.target.value as BillingStatus })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {(['unpaid', 'invoiced', 'paid', 'overdue'] as BillingStatus[]).map(s => (
                  <option key={s} value={s}>{billingStatusLabel[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">請求日</label>
              <input
                type="date"
                value={project.billing.invoiceDate ?? ''}
                onChange={e => store.updateBilling(project.id, { invoiceDate: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">入金日</label>
              <input
                type="date"
                value={project.billing.paidDate ?? ''}
                onChange={e => store.updateBilling(project.id, { paidDate: e.target.value || null })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">備考</label>
            <textarea
              value={project.billing.note}
              onChange={e => store.updateBilling(project.id, { note: e.target.value })}
              placeholder="請求に関するメモ"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
          {project.billing.amount !== null && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="text-gray-500">請求額</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ¥{project.billing.amount.toLocaleString()}
              </p>
              <Badge
                label={billingStatusLabel[project.billing.status]}
                colorClass={billingStatusColor[project.billing.status]}
                className="mt-2"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">納品日</label>
            <input
              type="date"
              value={project.delivery.deliveredAt ?? ''}
              onChange={e => store.updateDelivery(project.id, { deliveredAt: e.target.value || null })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">納品メモ</label>
            <textarea
              value={project.delivery.note}
              onChange={e => store.updateDelivery(project.id, { note: e.target.value })}
              placeholder="納品方法・納品物の詳細など"
              rows={6}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`「${project.name}」を削除しますか？この操作は取り消せません。`}
          onConfirm={handleDeleteProject}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
