import { useState } from 'react'
import { useStore } from './store/useStore'
import { Dashboard } from './components/Dashboard'
import { TaskList } from './components/TaskList'
import { TaskDetail } from './components/TaskDetail'
import { TaskCreateModal } from './components/TaskCreateModal'
import { TaskCategory, Priority } from './types'
import { LayoutDashboard, ListTodo, Plus } from 'lucide-react'
import { activeStatuses } from './utils/constants'

type View = 'dashboard' | 'tasks' | 'detail'

export default function App() {
  const store = useStore()
  const [view, setView] = useState<View>('dashboard')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createCategory, setCreateCategory] = useState<TaskCategory | undefined>()

  const selectedTask = selectedTaskId
    ? store.tasks.find(t => t.id === selectedTaskId) ?? null
    : null

  const openCreate = (defaultCategory?: TaskCategory) => {
    setCreateCategory(defaultCategory)
    setShowCreate(true)
  }

  const handleCreate = (
    category: TaskCategory,
    title: string,
    client: string,
    deadline: string | null,
    priority: Priority,
  ) => {
    const id = store.createTask(category, title, client, deadline, priority)
    setSelectedTaskId(id)
    setView('detail')
  }

  const handleSelectTask = (id: string) => {
    setSelectedTaskId(id)
    setView('detail')
  }

  const activeCount = store.tasks.filter(t => activeStatuses.includes(t.status)).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-gray-800">
            <span className="text-gray-500 font-normal text-sm">仕事</span> タスク管理
          </h1>
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
          >
            <Plus size={15} /> 追加
          </button>
        </div>
      </header>

      {/* Bottom nav — visible only on non-detail views */}
      {view !== 'detail' && (
        <nav className="bg-white border-b">
          <div className="max-w-2xl mx-auto px-4 flex">
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === 'dashboard'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <LayoutDashboard size={15} /> ダッシュボード
            </button>
            <button
              onClick={() => setView('tasks')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === 'tasks'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <ListTodo size={15} /> タスク一覧
              {activeCount > 0 && (
                <span className="ml-0.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {view === 'dashboard' && (
          <Dashboard tasks={store.tasks} onSelectTask={handleSelectTask} />
        )}
        {view === 'tasks' && (
          <TaskList
            tasks={store.tasks}
            onSelectTask={handleSelectTask}
            onCreateTask={openCreate}
          />
        )}
        {view === 'detail' && selectedTask && (
          <TaskDetail
            key={selectedTask.id}
            task={selectedTask}
            store={store}
            onBack={() => setView('tasks')}
          />
        )}
        {view === 'detail' && !selectedTask && (
          <div className="text-center py-16 text-gray-400">
            <p>タスクが見つかりません</p>
            <button onClick={() => setView('tasks')} className="mt-4 text-gray-600 hover:underline text-sm">
              一覧に戻る
            </button>
          </div>
        )}
      </main>

      {showCreate && (
        <TaskCreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          defaultCategory={createCategory}
        />
      )}
    </div>
  )
}
