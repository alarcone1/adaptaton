import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { Check, Edit2, Star, X } from 'lucide-react'
import { LogoutButton } from '../../components/LogoutButton'

type Evidence = Database['public']['Tables']['evidences']['Row']

export const TeacherDashboard = () => {
    const [evidences, setEvidences] = useState<Evidence[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')

    useEffect(() => {
        fetchEvidences()
    }, [])

    const fetchEvidences = async () => {
        const { data } = await supabase
            .from('evidences')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setEvidences(data)
        setLoading(false)
    }

    const pendingCount = evidences.filter(e => e.status === 'submitted').length
    const historyCount = evidences.filter(e => e.status === 'validated' || e.status === 'rejected').length

    const filteredEvidences = evidences.filter(e => {
        if (activeTab === 'pending') return e.status === 'submitted'
        return e.status === 'validated' || e.status === 'rejected'
    })

    const handleValidate = async (id: string) => {
        await supabase.from('evidences').update({ status: 'validated' }).eq('id', id)
        fetchEvidences()
    }

    const handleReject = async (id: string) => {
        await supabase.from('evidences').update({ status: 'rejected' }).eq('id', id)
        fetchEvidences()
    }

    const handleHighlight = async (id: string, current: boolean) => {
        await supabase.from('evidences').update({ is_highlighted: !current }).eq('id', id)
        fetchEvidences()
    }

    const startEdit = (ev: Evidence) => {
        setEditingId(ev.id)
        setEditValue((ev.impact_data as any)?.value || '')
    }

    const saveEdit = async (id: string) => {
        await supabase.from('evidences').update({
            impact_data: { value: parseInt(editValue) }
        }).eq('id', id)
        setEditingId(null)
        fetchEvidences()
    }

    return (
        <div className="p-4 md:p-8 bg-background min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-primary">Sala de Validación</h1>
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded border border-purple-200">Rol: Profesor</span>
                </div>
                <LogoutButton />
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-4 font-medium transition-colors border-b-2 ${activeTab === 'pending'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Pendientes
                    <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{pendingCount}</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 px-4 font-medium transition-colors border-b-2 ${activeTab === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Historial
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{historyCount}</span>
                </button>
            </div>

            {loading ? <p>Cargando...</p> : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvidences.map(ev => (
                        <div key={ev.id} className="bg-surface rounded-xl shadow-md p-4 flex flex-col gap-3 relative border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                            {/* Badge */}
                            <div className="absolute top-4 right-4 text-xs font-bold uppercase px-2 py-1 rounded bg-gray-100 text-gray-500">
                                {ev.status}
                            </div>

                            {ev.media_url && <img src={ev.media_url} className="w-full h-48 object-cover rounded-lg bg-gray-200" />}

                            <p className="text-text-main mt-2">{ev.description}</p>

                            {/* Impact Data */}
                            <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
                                {editingId === ev.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            className="w-20 p-1 border rounded"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                        />
                                        <button onClick={() => saveEdit(ev.id)} className="text-green-600"><Check /></button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-bold text-primary">Impacto: {(ev.impact_data as any)?.value}</span>
                                        <button onClick={() => startEdit(ev)} className="text-gray-400 hover:text-primary"><Edit2 size={16} /></button>
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    {ev.status === 'submitted' && (
                                        <>
                                            <button onClick={() => handleValidate(ev.id)} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200" title="Validar">
                                                <Check size={20} />
                                            </button>
                                            <button onClick={() => handleReject(ev.id)} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200" title="Rechazar">
                                                <X size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {ev.status === 'validated' && (
                                    <button
                                        onClick={() => handleHighlight(ev.id, ev.is_highlighted || false)}
                                        className={`p-2 rounded-full transition-colors ${ev.is_highlighted ? 'bg-accent-gold text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                                        title="Destacar para Gremios"
                                    >
                                        <Star size={20} fill={ev.is_highlighted ? 'currentColor' : 'none'} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
