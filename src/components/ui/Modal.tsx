import { X, Edit2, Plus, Info, Save } from 'lucide-react'
import { Button } from './Button'
import { ReactNode, useEffect } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
    mode?: 'edit' | 'create' | 'view'
}

export const Modal = ({ isOpen, onClose, title, description, children, mode = 'view' }: ModalProps) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isOpen) return null

    const getIcon = () => {
        switch (mode) {
            case 'create': return <Plus className="text-[#4B3179]" size={24} />
            case 'edit': return <Edit2 className="text-[#4B3179]" size={24} />
            default: return <Info className="text-[#4B3179]" size={24} />
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            {getIcon()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#4B3179]">{title}</h2>
                            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

interface ModalFooterProps {
    onCancel: () => void
    onSave?: () => void
    saveLabel?: string
    isSaveDisabled?: boolean
    saveDisabledTooltip?: string
    saveType?: 'button' | 'submit' | 'reset'
}

export const ModalFooter = ({
    onCancel,
    onSave,
    saveLabel = 'Guardar',
    isSaveDisabled = false,
    saveDisabledTooltip = 'Completa todos los campos obligatorios',
    saveType = 'submit'
}: ModalFooterProps) => {
    return (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button
                variant="outline"
                onClick={onCancel}
                type="button"
                className="!rounded-full"
            >
                Cancelar
            </Button>

            <div className="relative group">
                <div className="relative">
                    <Button
                        variant="primary"
                        type={saveType}
                        onClick={isSaveDisabled ? undefined : onSave}
                        disabled={isSaveDisabled}
                        className={`
                            !rounded-full flex items-center gap-2 px-6 transition-all duration-300
                            ${isSaveDisabled
                                ? '!opacity-100 relative overflow-hidden after:absolute after:inset-0 after:bg-white/50 after:content-[""] !cursor-not-allowed text-white/50'
                                : ''
                            }
                        `}
                        // Force gradient even when disabled, overlapping any default disabled background
                        style={{
                            background: isSaveDisabled
                                ? 'linear-gradient(to right, #42A799, #4B3179)'
                                : ''
                        }}
                    >
                        <Save size={18} />
                        <span className="relative z-10">{saveLabel}</span>
                    </Button>
                </div>

                {/* Tooltip for Disabled State - Color #66AD9D */}
                {isSaveDisabled && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-white border border-[#66AD9D]/30 text-[#66AD9D] font-bold text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Completar los campos
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
                    </div>
                )}
            </div>
        </div>
    )
}
