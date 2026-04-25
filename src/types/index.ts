export type TaskCategory = 'video' | 'production' | 'other'

export type ProductionType = 'homepage' | 'lp' | 'system'

export type TaskStatus =
  | 'todo'          // 未着手
  | 'in_progress'   // 作業中
  | 'waiting'       // 確認待ち
  | 'revision'      // 修正中
  | 'delivered'     // 納品済み
  | 'done'          // 完了

export type Priority = 'high' | 'medium' | 'low'

export interface SubTask {
  id: string
  title: string
  done: boolean
}

export interface RelatedUrl {
  id: string
  label: string
  url: string
}

// 動画編集タスク固有フィールド
export interface VideoFields {
  materialUrl: string
  deliveryUrl: string
  revisionNote: string
}

// 制作業務タスク固有フィールド
export interface ProductionFields {
  productionType: ProductionType
  currentProcess: string
  relatedUrls: RelatedUrl[]
}

export interface Task {
  id: string
  category: TaskCategory

  // 共通フィールド
  title: string
  client: string
  deadline: string | null
  status: TaskStatus
  priority: Priority
  memo: string
  subtasks: SubTask[]

  // カテゴリ固有
  videoFields: VideoFields
  productionFields: ProductionFields

  createdAt: string
  updatedAt: string
}
