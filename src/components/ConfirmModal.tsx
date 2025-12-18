import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
}

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false }: ConfirmModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 transform transition-all animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 text-red-600">
                        <div className="bg-red-100 p-2 rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-text-main">{title}</h3>
                    </div>
                    <button onClick={onCancel} className="text-text-secondary hover:text-text-main transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-text-secondary mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-gray-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? 'Procesando...' : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
