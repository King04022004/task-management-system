import { useState } from 'react'
import { TaskCategory, Priority } from '../types'
import { categoryLabel } from '../utils/constants'
import { Modal } from './Modal'

interface TaskCreateModalProps {
  onClose: () => void
  onCreate: (category: TaskCategory, title: string, client: string, deadline: string | null, priority: Priority) => void
  defaultCategory?: TaskCategory
}

export const TaskCreateModal = ({ onClose, onCreate, defaultCategory = 'video' }: TaskCreateModalProps) => {
  const [category, setCategory] = useState<TaskCategory>(defaultCategory)
  const [title, setTitle] = useState('')
  const [client, setClient] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const titlePlaceholder: Record<TaskCategory, string> = {
    video: '例: 〇〇さんのチャンネル動画 #12',
    production: '例: 〇〇会社 コーポレートサイト',
    other: '例: 請求書の送付確認',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate(category, title.trim(), client.trim(), deadline || null, priority)
    onClose()
  }

  return (
    <Modal title="新しいタスクを追加" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">カテゴリ</label>
          <div className="grid grid-cols-3 gap-2">
            {(['video', 'production', 'other'] as TaskCategory[]).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {categoryLabel[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            タスク名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={titlePlaceholder[category]}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
            autoFocus
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">依頼者</label>
          <input
            type="text"
            value={client}
            onChange={e => setClient(e.target.value)}
            placeholder="例: 田中さん / 〇〇株式会社"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">期限</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">優先度</label>
          <div className="flex gap-2">
            {([['high', '🔴 高'], ['medium', '🟡 中'], ['low', '⚪ 低']] as [Priority, string][]).map(([p, label]) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  priority === p
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition-colors">
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            追加する
          </button>
        </div>
      </form>
    </Modal>
  )
}
