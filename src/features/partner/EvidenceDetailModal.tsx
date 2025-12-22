import { useState } from 'react'
import { X, CheckCircle, Send, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'

import { useAuth } from '../../lib/AuthContext'
import { useToast } from '../../lib/ToastContext'

type Props = {
    evidence: any
    onClose: () => void
}

export const EvidenceDetailModal = ({ evidence, onClose }: Props) => {
    const { session } = useAuth()
    const { addToast } = useToast()
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')

    const handleCreateLead = async () => {
        if (!session?.user?.id) return
        setStatus('submitting')

        try {
            const { error } = await supabase.from('leads').insert({
                partner_id: session.user.id,
                student_id: evidence.user_id,
                evidence_id: evidence.id,
                status: 'pending'
            })

            if (error) throw error

            setStatus('success')
            addToast('Solicitud enviada. La universidad te contactará pronto.', 'success')

            // Auto close after success?
            // setTimeout(onClose, 2000) 
        } catch (error: any) {
            console.error('Lead error:', error)
            addToast('Error al procesar solicitud. Intenta nuevamente.', 'error')
            setStatus('idle')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">

                {/* Left: Media */}
                <div className="w-full md:w-3/5 bg-gray-900 flex items-center justify-center relative min-h-[300px]">
                    {evidence.media_url ? (
                        <img
                            src={evidence.media_url}
                            alt="Evidencia Full"
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <p className="text-gray-500">Sin multimedia</p>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 md:hidden bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-2/5 p-8 flex flex-col bg-white overflow-y-auto relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hidden md:block"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                                {evidence.profiles?.avatar_url && <img src={evidence.profiles.avatar_url} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{evidence.profiles?.full_name}</h3>
                                <p className="text-sm text-gray-500">Estudiante Adaptatón</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">El Reto</h4>
                                <h2 className="text-xl font-bold text-secondary">{evidence.resource_title}</h2>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Su Historia</h4>
                                <p className="text-gray-700 italic">"{evidence.description}"</p>
                            </div>

                            {/* Validated Seal */}
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg text-sm w-fit">
                                <CheckCircle size={16} />
                                <span className="font-medium">Validado por Docente (Calidad Garantizada)</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        {status === 'success' ? (
                            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100 text-green-800">
                                <div className="flex justify-center mb-2"><UserCheck size={32} /></div>
                                <p className="font-bold">¡Solicitud Enviada!</p>
                                <p className="text-sm mt-1">Nuestro equipo coordinará el contacto.</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs text-center text-gray-400 mb-3">
                                    Por motivos de privacidad, no mostramos datos de contacto directos sin autorización.
                                </p>
                                <button
                                    onClick={handleCreateLead}
                                    disabled={status === 'submitting'}
                                    className="w-full py-4 bg-secondary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-secondary/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status === 'submitting' ? (
                                        'Procesando...'
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Me interesa este perfil
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
