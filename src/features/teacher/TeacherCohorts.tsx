import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/ui/Layout'
import { Card } from '../../components/ui/Card'
import { Users, BookOpen, AlertCircle } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'

export const TeacherCohorts = () => {
    const navigate = useNavigate()
    const [cohorts, setCohorts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCohorts()
    }, [])

    const fetchCohorts = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch assigned cohorts
        const { data } = await supabase
            .from('cohort_instructors')
            .select(`
                cohort:cohorts (
                    id,
                    name,
                    created_at
                )
            `)
            .eq('user_id', user.id)

        if (data) {
            // Enhancing with stats (counts)
            const cohortsWithStats = await Promise.all(data.map(async (item: any) => {
                const cohort = item.cohort

                // Count students
                const { count: studentCount } = await supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .eq('cohort_id', cohort.id)
                    .eq('role', 'student')

                // Count pending evidences
                // Find students in this cohort first
                const { data: students } = await supabase.from('profiles').select('id').eq('cohort_id', cohort.id)
                let pendingCount = 0

                if (students && students.length > 0) {
                    const studentIds = students.map(s => s.id)
                    const { count } = await supabase
                        .from('evidences')
                        .select('id', { count: 'exact', head: true })
                        .in('user_id', studentIds)
                        .eq('status', 'submitted')
                    pendingCount = count || 0
                }

                return {
                    ...cohort,
                    studentCount: studentCount || 0,
                    pendingEvidenceCount: pendingCount
                }
            }))

            setCohorts(cohortsWithStats)
        }
        setLoading(false)
    }

    if (loading) return <Layout><div>Cargando...</div></Layout>

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                <PageHeader
                    title="Mis Cohortes"
                    subtitle="Gestión académica y validación de evidencias."
                    role="Docente"
                    roleColor="blue" // Turquoise equivalent
                />

                {cohorts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No tienes grupos asignados</h3>
                        <p className="text-gray-400">Contacta al administrador para que te asigne una cohorte.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cohorts.map(cohort => (
                            <div
                                key={cohort.id}
                                onClick={() => navigate(`/teacher/cohort/${cohort.id}`)}
                                className="group cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <Card className="h-full border-t-4 border-t-primary p-6 hover:shadow-xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-primary font-bold text-xl">
                                            {cohort.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        {cohort.pendingEvidenceCount > 0 && (
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                                <AlertCircle size={12} />
                                                {cohort.pendingEvidenceCount} Pendientes
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                                        {cohort.name}
                                    </h3>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Users size={16} />
                                            {cohort.studentCount} Estudiantes
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}
