import { Task } from '../types'

const KEY = 'tasks_v2'

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Task[]) : []
  } catch {
    return []
  }
}

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(KEY, JSON.stringify(tasks))
}

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
