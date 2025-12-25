import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { Search, MapPin, Award, LayoutGrid } from 'lucide-react'
import { EvidenceDetailModal } from './EvidenceDetailModal'
import { PageHeader } from '../../components/ui/PageHeader'

type EvidenceWithProfile = Database['public']['Tables']['evidences']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null
    resource_library: { title: string } | null
}

export const PartnerShowcase = () => {
    const [evidences, setEvidences] = useState<EvidenceWithProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvidence, setSelectedEvidence] = useState<EvidenceWithProfile | null>(null)
    const [filterText, setFilterText] = useState('')

    useEffect(() => {
        fetchShowcase()
    }, [])

    const fetchShowcase = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('evidences')
                .select(`
                    *,
                    profiles:user_id (full_name, avatar_url, bio, cohort_id),
                    course_activities (
                        resource_library ( title )
                    )
                `)
                .eq('status', 'validated')
                .eq('is_highlighted', true)
                .order('created_at', { ascending: false })

            if (error) throw error

            const formattedData = data.map((item: any) => ({
                ...item,
                resource_title: item.course_activities?.resource_library?.title || 'Reto General'
            }))

            setEvidences(formattedData)
        } catch (error) {
            console.error('Error fetching showcase:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredEvidences = evidences.filter(ev => {
        const text = filterText.toLowerCase()
        const title = (ev as any).resource_title?.toLowerCase() || ''
        const studentName = ev.profiles?.full_name?.toLowerCase() || ''
        return title.includes(text) || studentName.includes(text)
    })

    return (
        <div>
            <PageHeader
                title="La Vitrina de Talento"
                subtitle="Descubre a los jóvenes que están transformando su comunidad."
                icon={LayoutGrid}
            />

            {/* Filters */}
            <div className="flex gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por reto o nombre..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4B3179]/20 focus:border-[#4B3179] outline-none transition-all"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvidences.map((evidence) => (
                        <div
                            key={evidence.id}
                            onClick={() => setSelectedEvidence(evidence)}
                            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#4B3179] transition-all cursor-pointer relative"
                        >
                            {/* Card Image */}
                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                {evidence.media_url ? (
                                    <img
                                        src={evidence.media_url}
                                        alt="Evidencia"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Sin imagen
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <span className="text-white font-medium text-sm">Ver Detalle Completo</span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="bg-[#4B3179]/10 text-[#4B3179] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                        {(evidence as any).resource_title}
                                    </span>
                                    <div className="flex -space-x-1">
                                        <div className="w-6 h-6 rounded-full bg-yellow-100 border border-white flex items-center justify-center text-yellow-600" title="Destacado">
                                            <Award size={12} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                        {evidence.profiles?.avatar_url ? (
                                            <img src={evidence.profiles.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs">{evidence.profiles?.full_name?.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900 truncate">{evidence.profiles?.full_name}</p>
                                        <div className="flex items-center text-gray-500 text-xs">
                                            <MapPin size={10} className="mr-1" />
                                            Cartagena, Colombia
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredEvidences.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p>No se encontraron talentos con estos criterios.</p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedEvidence && (
                <EvidenceDetailModal
                    evidence={selectedEvidence}
                    onClose={() => setSelectedEvidence(null)}
                />
            )}
        </div>
    )
}
