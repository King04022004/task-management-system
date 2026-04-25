interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({ message, onConfirm, onCancel }: ConfirmDialogProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition-colors">
          キャンセル
        </button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
          削除する
        </button>
      </div>
    </div>
  </div>
)
