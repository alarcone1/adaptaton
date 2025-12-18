import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']

export const StudentHome = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchChallenges()
    }, [])

    const fetchChallenges = async () => {
        const { data } = await supabase.from('challenges').select('*')
        if (data) setChallenges(data)
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-primary">Mi Ruta de Impacto</h1>
                <p className="text-text-secondary text-sm">Progreso: 35% (Simulado)</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-secondary h-2.5 rounded-full" style={{ width: '35%' }}></div>
                </div>
            </header>

            <section>
                <h2 className="text-lg font-semibold text-text-main mb-4">Retos Disponibles</h2>
                {loading ? (
                    <p>Cargando retos...</p>
                ) : (
                    <div className="grid gap-4">
                        {challenges.map(challenge => (
                            <div key={challenge.id} className="bg-surface p-4 rounded-xl shadow-md border border-gray-100 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-primary">{challenge.title}</h3>
                                    <span className="bg-accent-gold/20 text-accent-orange text-xs px-2 py-1 rounded-full font-bold">
                                        +{challenge.points} pts
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary">{challenge.description}</p>
                                {challenge.resource_url && (
                                    <button
                                        onClick={() => alert('Descargando PDF... (Simulado)')}
                                        className="self-start text-secondary text-sm font-medium underline mt-2"
                                    >
                                        Descargar Guía (Offline)
                                    </button>
                                )}
                            </div>
                        ))}
                        {challenges.length === 0 && <p className="text-text-secondary">No hay retos disponibles.</p>}
                    </div>
                )}
            </section>
        </div>
    )
}
