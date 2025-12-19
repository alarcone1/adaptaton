import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import type { Database } from '../../lib/database.types'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

import { MapPin, ArrowRight } from 'lucide-react'

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
        <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-primary">Hola, Estudiante</h1>
                <p className="text-text-secondary">Tu impacto transforma el territorio.</p>
            </div>

            {/* Progress Section - LUXURY Card */}
            <Card luxury className="bg-gradient-to-r from-primary to-primary-light text-white relative overflow-hidden !border-accent-gold">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>

                <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold">Tu Progreso</h2>
                        <p className="text-white/80 text-sm">Validación Académica</p>
                    </div>
                    <span className="text-5xl font-black text-accent-gold drop-shadow-sm">{progress}%</span>
                </div>

                <div className="w-full bg-black/20 rounded-full h-4 backdrop-blur-sm relative z-10 border border-white/10">
                    <div
                        className="bg-accent-gold h-4 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(235,192,76,0.6)] relative overflow-hidden"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
                <p className="text-right text-xs mt-2 text-white/70">{pointsEarned} puntos generados</p>
            </Card>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-secondary/10 rounded-full text-secondary"><MapPin size={20} /></div>
                    <h2 className="text-xl font-bold text-primary">Retos Disponibles</h2>
                </div>

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white/50 animate-pulse rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {challenges.map(challenge => (
                            <Card key={challenge.id} className="flex flex-col h-full hover:border-secondary/50">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-text-main text-lg leading-tight">{challenge.title}</h3>
                                    <Badge variant="orange">+{challenge.points} pts</Badge>
                                </div>

                                <p className="text-sm text-text-secondary mb-4 flex-grow leading-relaxed">{challenge.description}</p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50">
                                    <Button size="sm" fullWidth variant="primary" onClick={() => window.location.href = '/student/capture'}>
                                        Aceptar Reto <ArrowRight size={16} />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
