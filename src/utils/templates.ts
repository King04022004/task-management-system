import { ProjectCategory, Task } from '../types'

const makeTask = (title: string): Omit<Task, 'id'> => ({
  title,
  status: 'todo',
  priority: 'medium',
  dueDate: null,
  subtasks: [],
  comments: [],
  createdAt: new Date().toISOString(),
})

const videoTasks = [
  '素材・音源の受け取り確認',
  '構成・ストーリーボード確認',
  '初回編集',
  'BGM・SE 挿入',
  'テロップ・字幕入れ',
  'カラーグレーディング',
  'クライアント確認 (初回)',
  '修正対応',
  'クライアント最終確認',
  '納品データ書き出し',
  '納品',
]

const homepageTasks = [
  'ヒアリング・要件整理',
  'ワイヤーフレーム作成',
  'デザインカンプ作成',
  'デザイン確認・承認',
  'フロントエンド実装',
  'CMS 設定・コンテンツ入稿',
  'SP 対応・レスポンシブ確認',
  'ブラウザ動作確認',
  'クライアント確認',
  '修正対応',
  'SEO 基本設定',
  '本番公開',
  '公開後確認',
]

const lpTasks = [
  'ヒアリング・ターゲット確認',
  'コピー・構成案作成',
  'デザインカンプ作成',
  'デザイン確認・承認',
  'HTML/CSS 実装',
  'フォーム設置・動作確認',
  'SP 対応・レスポンシブ確認',
  'クライアント確認',
  '修正対応',
  'アクセス解析設置 (GA等)',
  '本番公開',
]

const systemTasks = [
  'ヒアリング・要件定義',
  '技術選定・アーキテクチャ設計',
  'DB 設計',
  '基本設計書作成',
  'バックエンド実装',
  'フロントエンド実装',
  '単体テスト',
  '結合テスト',
  'クライアント UAT',
  '修正・バグ対応',
  'インフラ・デプロイ設定',
  '本番リリース',
  '運用引き継ぎ・ドキュメント整備',
]

const templateMap: Record<ProjectCategory, string[]> = {
  video: videoTasks,
  homepage: homepageTasks,
  lp: lpTasks,
  system: systemTasks,
}

export const generateTemplateTasks = (category: ProjectCategory): Task[] => {
  return templateMap[category].map((title, index) => ({
    id: `task-${Date.now()}-${index}`,
    ...makeTask(title),
  }))
}

export const categoryLabel: Record<ProjectCategory, string> = {
  video: '動画編集',
  homepage: 'ホームページ開発',
  lp: 'LP開発',
  system: 'システム開発',
}

export const categoryColor: Record<ProjectCategory, string> = {
  video: 'bg-purple-100 text-purple-800',
  homepage: 'bg-blue-100 text-blue-800',
  lp: 'bg-orange-100 text-orange-800',
  system: 'bg-green-100 text-green-800',
}

export const statusLabel: Record<string, string> = {
  active: '進行中',
  waiting: '確認待ち',
  revision: '修正対応中',
  completed: '完了',
  cancelled: 'キャンセル',
}

export const statusColor: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  revision: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-400',
}

export const taskStatusLabel: Record<string, string> = {
  todo: '未着手',
  in_progress: '作業中',
  waiting: '確認待ち',
  done: '完了',
}

export const taskStatusColor: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
}

export const priorityLabel: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const priorityColor: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-gray-400',
}

export const billingStatusLabel: Record<string, string> = {
  unpaid: '未請求',
  invoiced: '請求済み',
  paid: '入金済み',
  overdue: '支払遅延',
}

export const billingStatusColor: Record<string, string> = {
  unpaid: 'bg-gray-100 text-gray-600',
  invoiced: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}
