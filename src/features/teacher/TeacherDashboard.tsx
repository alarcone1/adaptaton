import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/ui/Layout'
import { Card } from '../../components/ui/Card'
import { Users, BookOpen, ArrowRight } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'

export const TeacherDashboard = () => {
    const navigate = useNavigate()
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch assigned courses with subject and cohort details
        const { data } = await supabase
            .from('courses')
            .select(`
                id,
                start_date,
                end_date,
                subject:subjects (
                    name,
                    description,
                    credits
                ),
                cohort:cohorts (
                    name
                )
            `)
            .eq('teacher_id', user.id)

        if (data) {
            // Enhanced stats per course could be added here (e.g. enrollment count)
            const coursesWithStats = await Promise.all(data.map(async (course: any) => {
                // Count enrolled students
                const { count } = await supabase
                    .from('course_enrollments')
                    .select('id', { count: 'exact', head: true })
                    .eq('course_id', course.id)
                    .eq('status', 'active')

                return {
                    ...course,
                    studentCount: count || 0
                }
            }))
            setCourses(coursesWithStats)
        }
        setLoading(false)
    }

    if (loading) return <Layout><div>Cargando...</div></Layout>

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                <PageHeader
                    title="Mis Cursos"
                    subtitle="Gestión académica y validación de evidencias por materia."
                    role="Docente"
                    roleColor="blue"
                />

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No tienes cursos asignados</h3>
                        <p className="text-gray-400">Contacta al administrador para que te asigne una materia.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/teacher/course/${course.id}`)}
                                className="group cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <Card className="h-full border-t-4 border-t-primary p-6 hover:shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <BookOpen size={64} />
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                            {course.subject.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                                            {course.cohort.name}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">
                                        {course.subject.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
                                        {course.subject.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Users size={16} />
                                            <span className="font-bold">{course.studentCount}</span> Estudiantes
                                        </div>
                                        <ArrowRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
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
