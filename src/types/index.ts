export type ProjectCategory = 'video' | 'homepage' | 'lp' | 'system'

export type ProjectStatus =
  | 'active'       // 進行中
  | 'waiting'      // 確認待ち・素材待ち
  | 'revision'     // 修正対応中
  | 'completed'    // 完了
  | 'cancelled'    // キャンセル

export type TaskStatus =
  | 'todo'         // 未着手
  | 'in_progress'  // 作業中
  | 'waiting'      // 確認待ち
  | 'done'         // 完了

export type Priority = 'high' | 'medium' | 'low'

export type BillingStatus =
  | 'unpaid'       // 未請求
  | 'invoiced'     // 請求済み
  | 'paid'         // 入金済み
  | 'overdue'      // 支払遅延

export interface SubTask {
  id: string
  title: string
  done: boolean
}

export interface Comment {
  id: string
  text: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  subtasks: SubTask[]
  comments: Comment[]
  createdAt: string
}

export interface RelatedUrl {
  id: string
  label: string
  url: string
}

export interface BillingInfo {
  amount: number | null
  status: BillingStatus
  invoiceDate: string | null
  paidDate: string | null
  note: string
}

export interface DeliveryInfo {
  deliveredAt: string | null
  note: string
}

export interface Project {
  id: string
  name: string
  client: string
  category: ProjectCategory
  status: ProjectStatus
  deadline: string | null
  tasks: Task[]
  urls: RelatedUrl[]
  memo: string
  billing: BillingInfo
  delivery: DeliveryInfo
  createdAt: string
  updatedAt: string
}
