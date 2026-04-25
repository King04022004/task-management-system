import { useState } from 'react'
import { ProjectCategory } from '../types'
import { categoryLabel } from '../utils/templates'
import { Modal } from './Modal'

interface ProjectCreateModalProps {
  onClose: () => void
  onCreate: (name: string, client: string, category: ProjectCategory, deadline: string | null, useTemplate: boolean) => void
}

export const ProjectCreateModal = ({ onClose, onCreate }: ProjectCreateModalProps) => {
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [category, setCategory] = useState<ProjectCategory>('video')
  const [deadline, setDeadline] = useState('')
  const [useTemplate, setUseTemplate] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim(), client.trim(), category, deadline || null, useTemplate)
    onClose()
  }

  return (
    <Modal title="新規案件を作成" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">案件名 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例: ◯◯社 会社紹介動画"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">クライアント名</label>
          <input
            type="text"
            value={client}
            onChange={e => setClient(e.target.value)}
            placeholder="例: 株式会社◯◯"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(categoryLabel) as ProjectCategory[]).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {categoryLabel[cat]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">納期</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={useTemplate}
            onChange={e => setUseTemplate(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-600"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">テンプレートタスクを自動生成する</p>
            <p className="text-xs text-gray-400">カテゴリに応じた標準タスクを自動で追加します</p>
          </div>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            作成する
          </button>
        </div>
      </form>
    </Modal>
  )
}
