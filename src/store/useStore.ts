import { useState, useCallback } from 'react'
import {
  Project, Task, SubTask, RelatedUrl, BillingInfo, DeliveryInfo,
  ProjectCategory, ProjectStatus, TaskStatus, Priority,
} from '../types'
import { loadProjects, saveProjects, generateId } from '../utils/storage'
import { generateTemplateTasks } from '../utils/templates'

const persist = (projects: Project[]) => {
  saveProjects(projects)
  return projects
}

export const useStore = () => {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects())

  // --- Project CRUD ---
  const createProject = useCallback((
    name: string,
    client: string,
    category: ProjectCategory,
    deadline: string | null,
    useTemplate: boolean,
  ): string => {
    const id = generateId()
    const now = new Date().toISOString()
    const newProject: Project = {
      id,
      name,
      client,
      category,
      status: 'active',
      deadline,
      tasks: useTemplate ? generateTemplateTasks(category) : [],
      urls: [],
      memo: '',
      billing: { amount: null, status: 'unpaid', invoiceDate: null, paidDate: null, note: '' },
      delivery: { deliveredAt: null, note: '' },
      createdAt: now,
      updatedAt: now,
    }
    setProjects(prev => persist([newProject, ...prev]))
    return id
  }, [])

  const updateProject = useCallback((id: string, patch: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
    )))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => persist(prev.filter(p => p.id !== id)))
  }, [])

  const updateProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    updateProject(id, { status })
  }, [updateProject])

  // --- Task CRUD ---
  const addTask = useCallback((projectId: string, title: string, priority: Priority = 'medium') => {
    const task: Task = {
      id: generateId(),
      title,
      status: 'todo',
      priority,
      dueDate: null,
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString(),
    }
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? { ...p, tasks: [...p.tasks, task], updatedAt: new Date().toISOString() }
        : p
    )))
    return task.id
  }, [])

  const updateTask = useCallback((projectId: string, taskId: string, patch: Partial<Task>) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...patch } : t),
            updatedAt: new Date().toISOString(),
          }
        : p
    )))
  }, [])

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId), updatedAt: new Date().toISOString() }
        : p
    )))
  }, [])

  const updateTaskStatus = useCallback((projectId: string, taskId: string, status: TaskStatus) => {
    updateTask(projectId, taskId, { status })
  }, [updateTask])

  // --- SubTask ---
  const addSubTask = useCallback((projectId: string, taskId: string, title: string) => {
    const sub: SubTask = { id: generateId(), title, done: false }
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map(t =>
              t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub] } : t
            ),
            updatedAt: new Date().toISOString(),
          }
        : p
    )))
  }, [])

  const toggleSubTask = useCallback((projectId: string, taskId: string, subId: string) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map(t =>
              t.id === taskId
                ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) }
                : t
            ),
            updatedAt: new Date().toISOString(),
          }
        : p
    )))
  }, [])

  const deleteSubTask = useCallback((projectId: string, taskId: string, subId: string) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map(t =>
              t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subId) } : t
            ),
            updatedAt: new Date().toISOString(),
          }
        : p
    )))
  }, [])

  // --- Comment ---
  const addComment = useCallback((projectId: string, taskId: string, text: string) => {
    const comment = { id: generateId(), text, createdAt: new Date().toISOString() }
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map(t =>
              t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
            ),
            updatedAt: new Date().toISOString(),
          }
        : p
    )))
  }, [])

  const deleteComment = useCallback((projectId: string, taskId: string, commentId: string) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map(t =>
              t.id === taskId ? { ...t, comments: t.comments.filter(c => c.id !== commentId) } : t
            ),
            updatedAt: new Date().toISOString(),
          }
        : p
    )))
  }, [])

  // --- Related URLs ---
  const addUrl = useCallback((projectId: string, label: string, url: string) => {
    const entry: RelatedUrl = { id: generateId(), label, url }
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? { ...p, urls: [...p.urls, entry], updatedAt: new Date().toISOString() }
        : p
    )))
  }, [])

  const deleteUrl = useCallback((projectId: string, urlId: string) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? { ...p, urls: p.urls.filter(u => u.id !== urlId), updatedAt: new Date().toISOString() }
        : p
    )))
  }, [])

  // --- Billing ---
  const updateBilling = useCallback((projectId: string, billing: Partial<BillingInfo>) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? { ...p, billing: { ...p.billing, ...billing }, updatedAt: new Date().toISOString() }
        : p
    )))
  }, [])

  // --- Delivery ---
  const updateDelivery = useCallback((projectId: string, delivery: Partial<DeliveryInfo>) => {
    setProjects(prev => persist(prev.map(p =>
      p.id === projectId
        ? { ...p, delivery: { ...p.delivery, ...delivery }, updatedAt: new Date().toISOString() }
        : p
    )))
  }, [])

  // --- Memo ---
  const updateMemo = useCallback((projectId: string, memo: string) => {
    updateProject(projectId, { memo })
  }, [updateProject])

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    addComment,
    deleteComment,
    addUrl,
    deleteUrl,
    updateBilling,
    updateDelivery,
    updateMemo,
  }
}

export type StoreType = ReturnType<typeof useStore>
