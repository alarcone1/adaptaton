import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { Clock, CheckCircle, XCircle, Heart } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { PageHeader } from '../../components/ui/PageHeader'

type LeadWithStudent = Database['public']['Tables']['leads']['Row'] & {
    student: Database['public']['Tables']['profiles']['Row'] | null
    evidence: {
        media_url: string | null,
        description: string | null
    } | null
}

export const MyLeads = () => {
    const { session } = useAuth()
    const [leads, setLeads] = useState<LeadWithStudent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user?.id) {
            fetchLeads()
        }
    }, [session?.user?.id])

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select(`
                    *,
                    student:student_id (full_name, avatar_url, email),
                    evidence:evidence_id (media_url, description)
                `)
                .eq('partner_id', session!.user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setLeads(data as any)
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusParams = (status: string) => {
        switch (status) {
            case 'pending': return { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Pendiente' }
            case 'contacted': return { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Contactado' }
            case 'closed': return { icon: XCircle, color: 'text-gray-600 bg-gray-50', label: 'Cerrado' }
            default: return { icon: Clock, color: 'text-gray-600 bg-gray-50', label: status }
        }
    }

    return (
        <div>
            <PageHeader
                title="Mis Intereses"
                subtitle="Seguimiento a los talentos con los que has conectado."
                icon={Heart}
            />

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
                </div>
            ) : leads.length > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Estudiante</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Contexto (Evidencia)</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Estado Solicitud</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leads.map((lead) => {
                                    const { icon: StatusIcon, color, label } = getStatusParams(lead.status || 'pending')
                                    return (
                                        <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                        {lead.student?.avatar_url ? (
                                                            <img src={lead.student.avatar_url} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-xs font-bold text-gray-500">
                                                                {lead.student?.full_name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{lead.student?.full_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.evidence ? (
                                                    <div className="flex items-center gap-3">
                                                        {lead.evidence.media_url && (
                                                            <img src={lead.evidence.media_url} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                        )}
                                                        <p className="max-w-[150px] truncate text-gray-500 italic">"{lead.evidence.description}"</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Sin contexto específico</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-xs font-medium ${color}`}>
                                                    <StatusIcon size={14} />
                                                    {label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {new Date(lead.created_at || '').toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <HeartOff size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Aún no has marcado interés en ningún talento.</p>
                    <Link to="/partner/showcase" className="mt-4 inline-block text-primary font-medium hover:underline">Ir a la Vitrina</Link>
                </div>
            )}
        </div>
    )
}

function HeartOff({ size, className }: { size: number, className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="2" y1="2" x2="22" y2="22"></line>
            <path d="M16.5 16.5 12 21l-7-7c-1.5-1.45-3-3.2-3-5.5a5.5 5.5 0 0 1 2.14-4.35"></path>
            <path d="M8.7 4.7c.98-.73 2.24-1.2 3.3-1.2C15 3.5 18 6.5 18 9c0 .77-.13 1.5-.35 2.22"></path>
        </svg>
    )
}
