import { TaskCategory, ProductionType, TaskStatus, Priority } from '../types'

export const categoryLabel: Record<TaskCategory, string> = {
  video: '動画編集',
  production: '制作業務',
  other: 'その他',
}

export const categoryColor: Record<TaskCategory, string> = {
  video: 'bg-purple-100 text-purple-800',
  production: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-700',
}

export const productionTypeLabel: Record<ProductionType, string> = {
  homepage: 'ホームページ制作',
  lp: 'LP制作',
  system: 'システム開発',
}

export const statusLabel: Record<TaskStatus, string> = {
  todo: '未着手',
  in_progress: '作業中',
  waiting: '確認待ち',
  revision: '修正中',
  delivered: '納品済み',
  done: '完了',
}

export const statusColor: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  revision: 'bg-red-100 text-red-700',
  delivered: 'bg-green-100 text-green-700',
  done: 'bg-gray-200 text-gray-500',
}

export const priorityLabel: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const priorityColor: Record<Priority, string> = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-gray-400',
}

export const priorityBg: Record<Priority, string> = {
  high: 'bg-red-50 border-red-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-white border-gray-200',
}

// 制作業務の工程リスト
export const productionProcesses: Record<ProductionType, string[]> = {
  homepage: ['ヒアリング', 'ワイヤーフレーム', 'デザイン', 'コーディング', 'クライアント確認', '修正対応', '公開'],
  lp: ['ヒアリング', 'コピー/構成', 'デザイン', 'コーディング', 'クライアント確認', '修正対応', '公開'],
  system: ['要件定義', '設計', '実装', 'テスト', 'クライアント確認', '修正対応', 'リリース'],
}

export const activeStatuses: TaskStatus[] = ['todo', 'in_progress', 'waiting', 'revision']
