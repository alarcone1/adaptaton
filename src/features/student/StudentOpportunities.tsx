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
        console.log('Interest in opp:', oppId)
        // Check if lead exists? Or just insert.
        // Assuming user is logged in (guaranteed by Layout)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // We temporarily create a dummy lead or just log it, as schema mismatch discussed.
        // Schema: leads(partner_id, student_id). We lack partner_id in opportunity.
        // We will just alert for now.

        // Mock DB call to satisfy linter or logic flow if needed, but for now just Alert.
        // To use 'supabase' and avoid unused var warning if we don't call it:
        // await supabase.from('leads').select('*').limit(1) 

        alert('Gracias por tu interés. La Universidad coordinará este encuentro.')
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
