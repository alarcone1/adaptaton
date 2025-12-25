import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { Heart, MessageCircle, Newspaper } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'

// Extended type to include profile relation if possible, or fetch separately
type EvidenceWithProfile = Database['public']['Tables']['evidences']['Row'] & {
    profiles: { full_name: string | null, avatar_url: string | null } | null
}

export const StudentFeed = () => {
    const [feed, setFeed] = useState<EvidenceWithProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFeed()
    }, [])

    const fetchFeed = async () => {
        // RLS ensures we only see our cohort's evidence
        const { data, error } = await supabase
            .from('evidences')
            .select('*, profiles(full_name, avatar_url)')
            .order('created_at', { ascending: false })

        if (error) console.error(error)
        if (data) setFeed(data as any) // Type assertion due to join
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Radar Social"
                icon={Newspaper}
            />
            {loading ? <p>Cargando...</p> : (
                <div className="space-y-6">
                    {feed.map((evidence) => (
                        <div key={evidence.id} className="bg-surface rounded-xl shadow-md overflow-hidden">
                            {/* Header */}
                            <div className="p-4 flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {evidence.profiles?.avatar_url ? (
                                        <img src={evidence.profiles.avatar_url} alt="Avatar" />
                                    ) : (
                                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {evidence.profiles?.full_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-text-main">{evidence.profiles?.full_name}</p>
                                    <p className="text-xs text-text-secondary">{new Date(evidence.created_at!).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Image */}
                            {evidence.media_url ? (
                                <img src={evidence.media_url} alt="Evidencia" className="w-full h-64 object-cover" />
                            ) : (
                                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                                    Sin foto
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex space-x-4 mb-3">
                                    <button className="flex items-center space-x-1 text-secondary font-bold">
                                        <Heart size={20} />
                                        <span>Apoyar</span>
                                    </button>
                                    <button className="flex items-center space-x-1 text-text-secondary">
                                        <MessageCircle size={20} />
                                        <span>Comentar</span>
                                    </button>
                                </div>
                                <p className="text-text-main">{evidence.description}</p>

                                {/* Impact Tag */}
                                {(evidence.impact_data as any)?.value && (
                                    <div className="mt-2 inline-block bg-accent-gold/20 text-accent-orange px-3 py-1 rounded-full text-xs font-bold">
                                        Impacto: {(evidence.impact_data as any).value} Unidades
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {feed.length === 0 && (
                        <p className="text-center text-text-secondary">Aún no hay evidencias en tu cohorte through RLS.</p>
                    )}
                </div>
            )}
        </div>
    )
}
