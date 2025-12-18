import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type Opportunity = Database['public']['Tables']['opportunities']['Row']

export const StudentOpportunities = () => {
    const [opps, setOpps] = useState<Opportunity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch opportunities
        supabase.from('opportunities').select('*').then(({ data }) => {
            if (data) setOpps(data)
            setLoading(false)
        })
    }, [])

    const handleInterest = async (oppId: string) => {
        const opp = opps.find(o => o.id === oppId)

        // Validation
        if (!opp?.partner_id) {
            alert('Esta oportunidad no está vinculada a un aliado activo.')
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            // Check for existing lead to prevent duplicates (optional UX improvement)
            const { data: existing } = await supabase
                .from('leads')
                .select('id')
                .eq('partner_id', opp.partner_id)
                .eq('student_id', user.id)
                .maybeSingle()

            if (existing) {
                alert('Ya has enviado tu interés para este aliado.')
                return
            }

            const { error } = await supabase.from('leads').insert({
                partner_id: opp.partner_id, // Now valid thanks to migration
                student_id: user.id,
                status: 'pending'
            })

            if (error) throw error

            alert('¡Solicitud enviada! La Universidad conectará contigo pronto.')

        } catch (err: any) {
            console.error('Error creating lead:', err)
            alert('Hubo un error al procesar tu solicitud.')
        }
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-primary">Oportunidades</h1>
            {loading ? <p>Cargando...</p> : (
                <div className="grid gap-4">
                    {opps.map(opp => (
                        <div key={opp.id} className="bg-surface p-5 rounded-xl shadow-md flex flex-col gap-3">
                            <div className="flex justify-between">
                                <h3 className="font-bold text-lg text-text-main">{opp.title}</h3>
                                {opp.logo_url && <img src={opp.logo_url} className="w-10 h-10 rounded object-contain" alt="logo" />}
                            </div>
                            <p className="text-sm font-semibold text-secondary">{opp.partner_name}</p>
                            <p className="text-sm text-text-secondary">{opp.description}</p>
                            <button
                                onClick={() => handleInterest(opp.id)}
                                className="mt-2 w-full border border-secondary text-secondary font-bold py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors"
                            >
                                Me Interesa
                            </button>
                        </div>
                    ))}
                    {opps.length === 0 && <p className="text-text-secondary">No hay oportunidades disponibles por el momento.</p>}
                </div>
            )}
        </div>
    )
}
