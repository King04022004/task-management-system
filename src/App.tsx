import { useState } from 'react'
import { useStore } from './store/useStore'
import { Dashboard } from './components/Dashboard'
import { ProjectList } from './components/ProjectList'
import { ProjectDetail } from './components/ProjectDetail'
import { ProjectCreateModal } from './components/ProjectCreateModal'
import { ProjectCategory } from './types'
import { LayoutDashboard, FolderKanban, Plus } from 'lucide-react'

type View = 'dashboard' | 'projects' | 'detail'

export default function App() {
  const store = useStore()
  const [view, setView] = useState<View>('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const selectedProject = selectedProjectId
    ? store.projects.find(p => p.id === selectedProjectId) ?? null
    : null

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id)
    setView('detail')
  }

  const handleCreateProject = (
    name: string,
    client: string,
    category: ProjectCategory,
    deadline: string | null,
    useTemplate: boolean,
  ) => {
    const id = store.createProject(name, client, category, deadline, useTemplate)
    setSelectedProjectId(id)
    setView('detail')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-gray-800 flex items-center gap-2 text-base">
            <span className="text-blue-600">制作案件</span>管理システム
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> 新規案件
          </button>
        </div>
      </header>

      {/* Nav */}
      {view !== 'detail' && (
        <nav className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 flex gap-0">
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard size={16} /> ダッシュボード
            </button>
            <button
              onClick={() => setView('projects')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === 'projects'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FolderKanban size={16} /> 案件一覧
              <span className="ml-1 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                {store.projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length}
              </span>
            </button>
          </div>
        </nav>
      )}

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {view === 'dashboard' && (
          <Dashboard
            projects={store.projects}
            onSelectProject={handleSelectProject}
          />
        )}
        {view === 'projects' && (
          <ProjectList
            projects={store.projects}
            onSelectProject={handleSelectProject}
            onCreateProject={() => setShowCreateModal(true)}
          />
        )}
        {view === 'detail' && selectedProject && (
          <ProjectDetail
            key={selectedProject.id}
            project={selectedProject}
            store={store}
            onBack={() => setView('projects')}
          />
        )}
        {view === 'detail' && !selectedProject && (
          <div className="text-center py-16 text-gray-400">
            <p>案件が見つかりません</p>
            <button onClick={() => setView('projects')} className="mt-4 text-blue-600 hover:underline text-sm">
              一覧に戻る
            </button>
          </div>
        )}
      </main>

      {showCreateModal && (
        <ProjectCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  )
}
