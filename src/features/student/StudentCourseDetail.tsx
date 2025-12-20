import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ArrowLeft, BookOpen, Clock, Calendar, CheckCircle, ExternalLink, MessageCircle } from 'lucide-react'

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

    const getActivityStatus = (activityId: string) => {
        const evidence = evidences.find(e => e.course_activity_id === activityId)
        if (!evidence) return { status: 'pending', label: 'Pendiente', color: 'gray' }
        if (evidence.status === 'submitted') return { status: 'submitted', label: 'Enviado', color: 'yellow' }
        if (evidence.status === 'validated') return { status: 'validated', label: 'Aprobado', color: 'green', score: evidence.impact_data?.value }
        if (evidence.status === 'rejected') return { status: 'rejected', label: 'Rechazado', color: 'red' }
        return { status: 'unknown', label: 'Desconocido', color: 'gray' }
    }

    const getEvidence = (activityId: string) => {
        return evidences.find(e => e.course_activity_id === activityId)
    }

    const handleDeliver = (activityId: string) => {
        navigate(`/student/capture?courseId=${id}&activityId=${activityId}`)
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
                        <Badge variant="green" className="mb-2 bg-accent-gold text-primary border-none">{course.cohort?.name}</Badge>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            {course.subject?.credits} Créditos
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black mb-2">{course.subject?.name}</h1>
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
                    activities.map((activity, index) => {
                        const { status, label, color, score } = getActivityStatus(activity.id)
                        const evidence = getEvidence(activity.id)

                        return (
                            <Card key={activity.id} className={`relative overflow-hidden transition-all ${status === 'validated' ? 'border-green-200 bg-green-50/30' : ''}`}>
                                {status === 'validated' && <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full z-0"></div>}

                                <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6">
                                    {/* Number / Status Icon */}
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${status === 'validated' ? 'bg-green-500 text-white' :
                                            status === 'submitted' ? 'bg-yellow-400 text-white' :
                                                'bg-gray-200 text-gray-500'
                                            }`}>
                                            {status === 'validated' ? <CheckCircle size={16} /> : index + 1}
                                        </div>
                                        {index < activities.length - 1 && <div className="w-0.5 h-full bg-gray-100 -mb-8"></div>}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-gray-800">{activity.resource?.title}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${color === 'green' ? 'bg-green-100 text-green-700 border-green-200' :
                                                color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                    color === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                {label}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4">{activity.custom_instructions || activity.resource?.base_description}</p>

                                        {/* Metadata */}
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium mb-4">
                                            {activity.due_date && (
                                                <span className="flex items-center gap-1 text-orange-400">
                                                    <Calendar size={12} /> Límite: {new Date(activity.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                            {activity.resource?.resource_url && (
                                                <a href={activity.resource.resource_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                                                    <ExternalLink size={12} /> Ver Recurso
                                                </a>
                                            )}
                                        </div>

                                        {/* Actions / Feedback */}
                                        {status === 'pending' && (
                                            <Button size="sm" onClick={() => handleDeliver(activity.id)}>
                                                Subir Evidencia
                                            </Button>
                                        )}

                                        {status === 'rejected' && (
                                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-3">
                                                <p className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1">
                                                    <MessageCircle size={12} /> Feedback del Profesor:
                                                </p>
                                                <p className="text-sm text-red-600 italic">"{evidence?.feedback}"</p>
                                                <Button size="sm" variant="outline" className="mt-2 text-red-600 border-red-200 hover:bg-white" onClick={() => handleDeliver(activity.id)}>
                                                    Intentar de nuevo
                                                </Button>
                                            </div>
                                        )}

                                        {status === 'validated' && (
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-bold text-green-800 mb-1">Impacto / Calificación</p>
                                                    <span className="text-2xl font-black text-green-600">{score ? score : '10'} <span className="text-xs font-medium text-green-700">pts</span></span>
                                                </div>
                                                {evidence?.feedback && (
                                                    <div className="text-right max-w-[200px]">
                                                        <p className="text-xs font-bold text-green-800 mb-1">Comentario</p>
                                                        <p className="text-xs text-green-700 italic">"{evidence.feedback}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {status === 'submitted' && (
                                            <p className="text-xs text-yellow-600 font-medium py-2">
                                                Tu evidencia está siendo revisada por el profesor.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
