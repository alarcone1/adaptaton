import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { ArrowLeft, BookOpen, Clock } from 'lucide-react'
import { ActivityTimeline } from './components/ActivityTimeline'

export const StudentCourseDetail = () => {
    const { id } = useParams<{ id: string }>() // Course ID
    const navigate = useNavigate()
    const { session } = useAuth()

    const [course, setCourse] = useState<any>(null)
    const [activities, setActivities] = useState<any[]>([])
    const [evidences, setEvidences] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id && session?.user) {
            fetchCourseDetails()
        }
    }, [id, session])

    const fetchCourseDetails = async () => {
        if (!id) return
        setLoading(true)
        // 1. Fetch Course Info
        const { data: courseData } = await supabase
            .from('courses')
            .select(`
                *,
                subject:subjects (name, description, credits),
                teacher:profiles (full_name, avatar_url),
                cohort:cohorts (name)
            `)
            .eq('id', id)
            .single()

        setCourse(courseData)

        // 2. Fetch Syllabus (Activities)
        const { data: activitiesData } = await supabase
            .from('course_activities' as any)
            .select(`
                *,
                resource:resource_library(*)
            `)
            .eq('course_id', id)
            .order('created_at', { ascending: true })

        setActivities(activitiesData || [])

        // 3. Fetch My Evidences
        const { data: myEvidences } = await supabase
            .from('evidences')
            .select('*')
            .eq('user_id', session!.user.id)
            .not('course_activity_id', 'is', null) // Only course related

        setEvidences(myEvidences || [])
        setLoading(false)
    }

    const getActivityStatus = (activityId: string): any => {
        const evidence = evidences.find(e => e.course_activity_id === activityId)
        if (!evidence) return { status: 'pending', label: 'Pendiente', color: 'gray' }
        if (evidence.status === 'submitted') return { status: 'submitted', label: 'Enviado', color: 'yellow' }
        if (evidence.status === 'validated') return { status: 'validated', label: 'Aprobado', color: 'green', score: evidence.impact_data?.value }
        if (evidence.status === 'rejected') return { status: 'rejected', label: 'Rechazado', color: 'red', feedback: evidence.feedback }
        return { status: 'unknown', label: 'Desconocido', color: 'gray' }
    }



    if (loading) return <div className="p-8 text-center">Cargando curso...</div>
    if (!course) return <div className="p-8 text-center">Curso no encontrado</div>

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-24">
            <button onClick={() => navigate('/student')} className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                <ArrowLeft size={18} /> Volver a Mis Cursos
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-primary-light text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <span className="mb-2 px-3 py-1 rounded bg-white text-[#4B3179] text-xs font-bold shadow-sm">{course.cohort?.name}</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            {course.subject?.credits} Créditos
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <BookOpen className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black">{course.subject?.name}</h1>
                    </div>
                    <p className="opacity-90 max-w-xl">{course.subject?.description}</p>

                    <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                            {course.teacher?.full_name?.[0]}
                        </div>
                        <span className="font-medium text-sm">Prof. {course.teacher?.full_name}</span>
                    </div>
                </div>
                {/* Decorative */}
                <BookOpen size={200} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
            </div>

            {/* Syllabus Timeline */}
            <div className="space-y-4">
                <h3 className="font-bold text-xl text-gray-700 flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    Plan de Trabajo
                </h3>

                {activities.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-400">
                        El profesor aún no ha cargado actividades.
                    </div>
                ) : (
                    <ActivityTimeline
                        courseId={id!}
                        activities={activities}
                        getStatus={getActivityStatus}
                        isActivityValidated={(actId) => {
                            const ev = evidences.find(e => e.course_activity_id === actId)
                            return ev?.status === 'validated'
                        }}
                    />
                )}
            </div>
        </div>
    )
}
