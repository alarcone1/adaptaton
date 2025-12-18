import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { LogoutButton } from '../../components/LogoutButton'

// Join Profiles to get name
type EvidenceWithUser = Database['public']['Tables']['evidences']['Row'] & {
    profiles: { full_name: string | null } | null
}

export const PartnerShowcase = () => {
    const [items, setItems] = useState<EvidenceWithUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchShowcase()
    }, [])

    const fetchShowcase = async () => {
        const { data } = await supabase
            .from('evidences')
            .select('*, profiles(full_name)')
            .eq('status', 'validated')
            .eq('is_highlighted', true)

        if (data) setItems(data as any)
        setLoading(false)
    }

    const requestContact = async (studentId: string) => {
        // Here we would create a Lead. 
        // Assuming partner is logged in.
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('leads').insert({
                partner_id: user.id, // User ID of the partner
                student_id: studentId,
                status: 'pending'
            })
            alert('Gracias por tu interés. La Universidad coordinará este encuentro.')
        }
    }

    return (
        <div className="p-6 bg-background min-h-screen">
            <header className="mb-8">
                <div className="flex justify-between items-center p-2 mb-4">
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded border border-purple-200">Rol: Aliado</span>
                    <LogoutButton />
                </div>
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary mb-2">Vitrina de Talento Adaptatón</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Descubre a los líderes juveniles que están transformando el territorio. Talento validado y certificado por la Universidad de Cartagena.
                    </p>
                </div>
            </header>

            {loading ? <p className="text-center">Cargando talento...</p> : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {items.map(item => (
                        <div key={item.id} className="break-inside-avoid bg-surface rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            {item.media_url && (
                                <img src={item.media_url} className="w-full object-cover" />
                            )}
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-text-main mb-1">{item.profiles?.full_name}</h3>
                                <p className="text-text-secondary text-sm mb-4 line-clamp-3">{item.description}</p>

                                <div className="flex justify-between items-center">
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                        {(item.impact_data as any)?.value} Impacto
                                    </span>
                                    <button
                                        onClick={() => requestContact(item.user_id)}
                                        className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-opacity-90"
                                    >
                                        Contactar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-center col-span-full text-gray-400">Pronto verás el talento destacado aquí.</p>
                    )}
                </div>
            )}
        </div>
    )
}
