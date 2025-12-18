import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import type { Database } from '../../lib/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']

export const StudentHome = () => {
    const { session } = useAuth()
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [pointsEarned, setPointsEarned] = useState(0)

    useEffect(() => {
        if (session?.user) fetchData()
    }, [session])

    const fetchData = async () => {
        try {
            // 1. Get Challenges
            const { data: challengesData } = await supabase.from('challenges').select('*')
            if (!challengesData) return

            setChallenges(challengesData)
            const totalAvailablePoints = challengesData.reduce((acc, curr) => acc + (curr.points || 0), 0)

            // 2. Get User's Validated Evidences
            const { data: evidences } = await supabase
                .from('evidences')
                .select('challenge_id')
                .eq('user_id', session!.user.id)
                .eq('status', 'validated')

            // 3. Calculate Points
            let earned = 0
            const completedChallengeIds = new Set(evidences?.map(e => e.challenge_id))

            challengesData.forEach(c => {
                if (completedChallengeIds.has(c.id)) {
                    earned += (c.points || 0)
                }
            })

            setPointsEarned(earned)
            if (totalAvailablePoints > 0) {
                setProgress(Math.round((earned / totalAvailablePoints) * 100))
            } else {
                setProgress(0)
            }

        } catch (error) {
            console.error('Error fetching progress:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <header>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Mi Ruta de Impacto</h1>
                        <p className="text-text-secondary text-sm">Has generado {pointsEarned} puntos de impacto</p>
                    </div>
                    <span className="text-2xl font-bold text-secondary">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-secondary h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
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
