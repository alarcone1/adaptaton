import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { BookOpen, ArrowRight, User } from 'lucide-react'

export const StudentHome = () => {
    const { session } = useAuth()
    const navigate = useNavigate()
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [pointsEarned, setPointsEarned] = useState(0)

    useEffect(() => {
        if (session?.user) fetchData()
    }, [session])

    const fetchData = async () => {
        try {
            setLoading(true)
            const userId = session?.user?.id
            if (!userId) return

            // 1. Fetch Enrolled Courses
            const { data: enrollments } = await supabase
                .from('course_enrollments')
                .select(`
                    id,
                    status,
                    course:courses (
                        id,
                        subject:subjects (
                            name,
                            description,
                            credits
                        ),
                        teacher:profiles (
                            full_name
                        ),
                        cohort:cohorts (
                            name
                        )
                    )
                `)
                .eq('student_id', userId)
                .eq('status', 'active')

            setCourses(enrollments || [])

            // 2. Fetch Stats (Simplified for now - kept existing logic structure)
            const { data: evidences } = await supabase
                .from('evidences')
                .select('challenge_id')
                .eq('user_id', userId)
                .eq('status', 'validated')

            // Dummy points logic for now as we transition models
            // Ideally we'd sum points from activities in courses
            const earned = (evidences?.length || 0) * 100
            setPointsEarned(earned)
            setProgress(Math.min(100, (earned / 1000) * 100)) // Abritrary goal 1000 pts

        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-primary">Hola, Estudiante</h1>
                <p className="text-text-secondary">Tu formación académica activa.</p>
            </div>

            {/* Progress Section - LUXURY Card */}
            <Card luxury className="bg-gradient-to-r from-primary to-primary-light text-white relative overflow-hidden !border-accent-gold p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>

                <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold">Tu Progreso</h2>
                        <p className="text-white/80 text-sm">Créditos y Validación</p>
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
                <p className="text-right text-xs mt-2 text-white/70">{pointsEarned} puntos de impacto</p>
            </Card>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600"><BookOpen size={20} /></div>
                    <h2 className="text-xl font-bold text-primary">Mis Cursos</h2>
                </div>

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2].map(i => <div key={i} className="h-40 bg-white/50 animate-pulse rounded-xl"></div>)}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No estás inscrito en cursos</h3>
                        <p className="text-gray-400">Tus materias asignadas aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {courses.map((enrollment: any) => (
                            <Card key={enrollment.id} className="flex flex-col h-full hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase mb-2 w-fit">
                                        {enrollment.course?.cohort?.name || 'Sin Cohorte'}
                                    </div>
                                    <Badge variant="green" className="uppercase text-[10px] tracking-wider">Activo</Badge>
                                </div>

                                <h3 className="font-bold text-text-main text-lg leading-tight mb-1">{enrollment.course?.subject?.name || 'Materia Desconocida'}</h3>
                                <p className="text-sm text-text-secondary mb-4 flex-grow line-clamp-2">
                                    {enrollment.course?.subject?.description || 'Sin descripción disponible.'}
                                </p>

                                <div className="mt-auto space-y-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                        <User size={14} />
                                        <span>Prof. {enrollment.course?.teacher?.full_name || 'No asignado'}</span>
                                    </div>

                                    <Button size="sm" fullWidth variant="primary" onClick={() => navigate(`/student/course/${enrollment.course?.id}`)}>
                                        Ver Actividades <ArrowRight size={16} />
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
