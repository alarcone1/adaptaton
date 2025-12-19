import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { Layout } from '../../components/ui/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { CheckCircle, XCircle, Clock, FileText, Filter } from 'lucide-react'

type Evidence = Database['public']['Tables']['evidences']['Row'] & {
    profiles: { full_name: string | null } | null
    challenges: { title: string | null } | null
}

export const TeacherDashboard = () => {
    const [evidences, setEvidences] = useState<Evidence[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
    const [filterText, setFilterText] = useState('')

    useEffect(() => {
        fetchEvidences()
    }, [])

    const fetchEvidences = async () => {
        const { data } = await supabase
            .from('evidences')
            .select('*, profiles(full_name), challenges(title)')
            .order('timestamp', { ascending: false })

        if (data) setEvidences(data as any)
        setLoading(false)
    }

    const validateEvidence = async (id: string, isValid: boolean) => {
        const { error } = await supabase
            .from('evidences')
            .update({ status: isValid ? 'validated' : 'rejected' })
            .eq('id', id)

        if (!error) {
            fetchEvidences()
        } else {
            alert('Error actualizando estado')
        }
    }

    const toggleHighlight = async (id: string, current: boolean) => {
        const { error } = await supabase
            .from('evidences')
            .update({ is_highlighted: !current })
            .eq('id', id)

        if (!error) fetchEvidences()
    }

    // Filter Logic
    const pendingEvidences = evidences.filter(e => e.status === 'submitted')
    const historyEvidences = evidences.filter(e => e.status === 'validated' || e.status === 'rejected')

    const filteredEvidences = (activeTab === 'pending' ? pendingEvidences : historyEvidences).filter(e =>
        e.profiles?.full_name?.toLowerCase().includes(filterText.toLowerCase()) ||
        e.challenges?.title?.toLowerCase().includes(filterText.toLowerCase())
    )

    const pendingCount = pendingEvidences.length

    return (
        <Layout>
            <div className="p-4 md:p-8 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-6">
                    <PageHeader title="Sala de Validación" subtitle="Revisa y valida el impacto de los estudiantes." role="Profesor" roleColor="purple" />

                    {/* Controls & Tabs */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 p-2 rounded-2xl border border-white/50 backdrop-blur-sm">
                        <div className="flex bg-white/50 rounded-xl p-1 shadow-inner w-full md:w-auto">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 flex-1 md:flex-none justify-center ${activeTab === 'pending' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-primary'}`}
                            >
                                Pendientes
                                {pendingCount > 0 && <span className="bg-accent-orange text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex-1 md:flex-none justify-center ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-primary'}`}
                            >
                                Historial
                            </button>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Filtrar por nombre..."
                                value={filterText}
                                onChange={e => setFilterText(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/60 border-none focus:ring-2 focus:ring-primary/50 text-sm outline-none"
                            />
                        </div>
                    </div>

                    {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/40 animate-pulse rounded-xl" />)}</div> : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredEvidences.map(evidence => (
                                <Card key={evidence.id} className="flex flex-col h-full border-t-4 border-t-primary/20">
                                    {/* Header: User & Challenge */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-lg text-primary">{evidence.profiles?.full_name || 'Estudiante'}</h3>
                                            <Badge variant={evidence.status === 'validated' ? 'green' : evidence.status === 'rejected' ? 'orange' : 'purple'}>
                                                {evidence.status === 'validated' ? 'Aprobado' : evidence.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-bold text-secondary uppercase tracking-wide truncate">{evidence.challenges?.title}</p>
                                        <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                                            <Clock size={12} />
                                            {new Date((evidence as any).timestamp).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Media */}
                                    <div className="bg-gray-100 rounded-lg mb-4 overflow-hidden relative group h-48">
                                        {evidence.media_url ? (
                                            <img
                                                src={evidence.media_url}
                                                alt="Evidencia"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                                                onClick={() => window.open(evidence.media_url!, '_blank')}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <span className="text-xs">Sin imagen</span>
                                            </div>
                                        )}
                                        {/* Overlay Check */}
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            {evidence.is_highlighted && <span className="bg-accent-gold text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">Destacado</span>}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <p className="text-sm text-text-main italic mb-3 line-clamp-3">"{evidence.description}"</p>
                                        <div className="bg-gray-50 p-2 rounded text-xs font-mono text-text-secondary">
                                            Impacto Calculado: <span className="font-bold text-primary">{(evidence.impact_data as any).value || 0} pts</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 border-t border-gray-100 flex gap-2 justify-end mt-4">
                                        {activeTab === 'pending' ? (
                                            <>
                                                <Button size="sm" variant="danger" onClick={() => validateEvidence(evidence.id, false)} className="!rounded-lg px-2">
                                                    <XCircle size={20} />
                                                </Button>
                                                <Button size="sm" variant="primary" onClick={() => validateEvidence(evidence.id, true)} className="bg-green-600 hover:bg-green-700 !rounded-lg flex-1">
                                                    <CheckCircle size={18} /> Aprobar
                                                </Button>
                                            </>
                                        ) : (
                                            // History Actions (Highlight)
                                            evidence.status === 'validated' && (
                                                <button
                                                    onClick={() => toggleHighlight(evidence.id, evidence.is_highlighted || false)}
                                                    className={`text-xs font-bold px-4 py-2 rounded-full border transition-all w-full ${evidence.is_highlighted
                                                        ? 'bg-accent-gold text-white border-accent-gold shadow-md'
                                                        : 'text-text-secondary border-gray-200 hover:border-accent-gold hover:text-accent-gold'
                                                        }`}
                                                >
                                                    {evidence.is_highlighted ? '★ Publicado en Vitrina' : '☆ Destacar en Vitrina'}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {filteredEvidences.length === 0 && (
                                <div className="col-span-full py-12 text-center text-text-secondary opacity-60">
                                    <FileText size={48} className="mx-auto mb-2 text-gray-300" />
                                    <p>No se encontraron evidencias.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
