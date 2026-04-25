import { useState, useCallback } from 'react'
import {
  Task, TaskCategory, TaskStatus, Priority,
  SubTask, RelatedUrl, VideoFields, ProductionFields, ProductionType,
} from '../types'
import { loadTasks, saveTasks, generateId } from '../utils/storage'

const persist = (tasks: Task[]) => { saveTasks(tasks); return tasks }

const defaultVideoFields = (): VideoFields => ({
  materialUrl: '',
  deliveryUrl: '',
  revisionNote: '',
})

const defaultProductionFields = (): ProductionFields => ({
  productionType: 'homepage',
  currentProcess: '',
  relatedUrls: [],
})

const makeTask = (
  category: TaskCategory,
  title: string,
  client: string,
  deadline: string | null,
  priority: Priority,
): Task => {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    category,
    title,
    client,
    deadline,
    status: 'todo',
    priority,
    memo: '',
    subtasks: [],
    videoFields: defaultVideoFields(),
    productionFields: defaultProductionFields(),
    createdAt: now,
    updatedAt: now,
  }
}

export const useStore = () => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())

  // --- Task CRUD ---
  const createTask = useCallback((
    category: TaskCategory,
    title: string,
    client: string,
    deadline: string | null,
    priority: Priority,
  ): string => {
    const task = makeTask(category, title, client, deadline, priority)
    setTasks(prev => persist([task, ...prev]))
    return task.id
  }, [])

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks(prev => persist(prev.map(t =>
      t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
    )))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => persist(prev.filter(t => t.id !== id)))
  }, [])

  const updateStatus = useCallback((id: string, status: TaskStatus) => {
    updateTask(id, { status })
  }, [updateTask])

  // --- VideoFields ---
  const updateVideoFields = useCallback((id: string, fields: Partial<VideoFields>) => {
    setTasks(prev => persist(prev.map(t =>
      t.id === id
        ? { ...t, videoFields: { ...t.videoFields, ...fields }, updatedAt: new Date().toISOString() }
        : t
    )))
  }, [])

  // --- ProductionFields ---
  const updateProductionFields = useCallback((id: string, fields: Partial<ProductionFields>) => {
    setTasks(prev => persist(prev.map(t =>
      t.id === id
        ? { ...t, productionFields: { ...t.productionFields, ...fields }, updatedAt: new Date().toISOString() }
        : t
    )))
  }, [])

  const addRelatedUrl = useCallback((taskId: string, label: string, url: string) => {
    const entry: RelatedUrl = { id: generateId(), label, url }
    setTasks(prev => persist(prev.map(t =>
      t.id === taskId
        ? {
            ...t,
            productionFields: {
              ...t.productionFields,
              relatedUrls: [...t.productionFields.relatedUrls, entry],
            },
            updatedAt: new Date().toISOString(),
          }
        : t
    )))
  }, [])

  const deleteRelatedUrl = useCallback((taskId: string, urlId: string) => {
    setTasks(prev => persist(prev.map(t =>
      t.id === taskId
        ? {
            ...t,
            productionFields: {
              ...t.productionFields,
              relatedUrls: t.productionFields.relatedUrls.filter(u => u.id !== urlId),
            },
            updatedAt: new Date().toISOString(),
          }
        : t
    )))
  }, [])

  // --- SubTasks ---
  const addSubTask = useCallback((taskId: string, title: string) => {
    const sub: SubTask = { id: generateId(), title, done: false }
    setTasks(prev => persist(prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: [...t.subtasks, sub], updatedAt: new Date().toISOString() }
        : t
    )))
  }, [])

  const toggleSubTask = useCallback((taskId: string, subId: string) => {
    setTasks(prev => persist(prev.map(t =>
      t.id === taskId
        ? {
            ...t,
            subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s),
            updatedAt: new Date().toISOString(),
          }
        : t
    )))
  }, [])

  const deleteSubTask = useCallback((taskId: string, subId: string) => {
    setTasks(prev => persist(prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subId), updatedAt: new Date().toISOString() }
        : t
    )))
  }, [])

  // --- Production type convenience ---
  const setProductionType = useCallback((taskId: string, productionType: ProductionType) => {
    updateProductionFields(taskId, { productionType })
  }, [updateProductionFields])

  return {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    updateVideoFields,
    updateProductionFields,
    addRelatedUrl,
    deleteRelatedUrl,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    setProductionType,
  }
}

export type StoreType = ReturnType<typeof useStore>
