import { Project } from '../types'

const STORAGE_KEY = 'projects_v1'

export const loadProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
