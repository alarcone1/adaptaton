import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { Layout } from '../../../components/ui/Layout'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Users, UserPlus, LogOut, ArrowLeft, BookOpen, Plus, Calendar, X } from 'lucide-react'

export const CohortDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cohort, setCohort] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Students State
    const [students, setStudents] = useState<any[]>([])
    const [availableStudents, setAvailableStudents] = useState<any[]>([])
    const [showEnrollModal, setShowEnrollModal] = useState(false)

    // Courses State
    const [courses, setCourses] = useState<any[]>([])
    const [showCourseModal, setShowCourseModal] = useState(false)
    const [subjects, setSubjects] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])

    // Course Form
    const [newCourse, setNewCourse] = useState({
        subject_id: '',
        teacher_id: '',
        start_date: '',
        end_date: ''
    })

    useEffect(() => {
        if (id) fetchCohortData()
    }, [id])

    const fetchCohortData = async () => {
        if (!id) return;
        setLoading(true)
        // Fetch Cohort Details
        const { data: cohortData } = await supabase
            .from('cohorts')
            .select('*')
            .eq('id', id)
            .single()

        setCohort(cohortData)

        // Fetch Enrolled Students
        const { data: enrolled } = await supabase
            .from('profiles')
            .select('*')
            .eq('cohort_id', id)
            .order('full_name')

        setStudents(enrolled || [])

        // Fetch Courses
        const { data: coursesData } = await supabase
            .from('courses')
            .select(`
                *,
                subject:subjects(name, credits),
                teacher:profiles(full_name)
            `)
            .eq('cohort_id', id)
            .order('created_at', { ascending: false })

        setCourses(coursesData || [])

        setLoading(false)
    }

    /* --- Student Enrollment Logic --- */
    const fetchAvailableStudents = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .is('cohort_id', null)
            .order('full_name')
        setAvailableStudents(data || [])
        setShowEnrollModal(true)
    }

    const enrollStudent = async (studentId: string) => {
        if (!id) return;

        // 1. Assign Cohort
        await supabase.from('profiles').update({ cohort_id: id }).eq('id', studentId)

        // 2. Auto-enroll in active courses (Optional, but good UX)
        // For now, we only link cohort. Teacher creates enrollments or we stick to cohort-based logic?
        // Current model: Student must be in course_enrollments to see course.
        // Let's AUTO-ENROLL in all existing courses for this cohort
        if (courses.length > 0) {
            const enrollments = courses.map(c => ({
                course_id: c.id,
                student_id: studentId,
                status: 'active'
            }))
            await supabase.from('course_enrollments').insert(enrollments)
        }

        fetchCohortData()
        fetchAvailableStudents()
    }

    const unenrollStudent = async (studentId: string) => {
        if (!confirm('¿Desvincular a este estudiante del grupo?')) return
        await supabase.from('profiles').update({ cohort_id: null }).eq('id', studentId)
        // Ideally should also set course_enrollments to 'dropped'
        fetchCohortData()
    }

    /* --- Course Management Logic --- */
    const openCourseModal = async () => {
        // Fetch catalogs
        const { data: subjectsData } = await supabase.from('subjects').select('*').order('name')
        const { data: teachersData } = await supabase.from('profiles').select('*').in('role', ['teacher', 'admin']).order('full_name') // Allow admins too?

        setSubjects(subjectsData || [])
        setTeachers(teachersData || [])
        setShowCourseModal(true)
    }

    const handleCreateCourse = async () => {
        if (!newCourse.subject_id || !newCourse.teacher_id) return

        // Create Course
        const { data: courseData, error } = await supabase
            .from('courses')
            .insert({
                cohort_id: id,
                subject_id: newCourse.subject_id,
                teacher_id: newCourse.teacher_id,
                start_date: newCourse.start_date || null,
                end_date: newCourse.end_date || null
            })
            .select()
            .single()

        if (error) {
            alert('Error creando curso: ' + error.message)
            return
        }

        // Auto-enroll existing students
        if (students.length > 0 && courseData) {
            const enrollments = students.map(s => ({
                course_id: courseData.id,
                student_id: s.id,
                status: 'active'
            }))
            await supabase.from('course_enrollments').insert(enrollments)
        }

        setShowCourseModal(false)
        setNewCourse({ subject_id: '', teacher_id: '', start_date: '', end_date: '' })
        fetchCohortData()
    }

    if (loading) return <Layout><div>Cargando...</div></Layout>
    if (!cohort) return <Layout><div>Cohorte no encontrada</div></Layout>

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/cohorts')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800">{cohort.name}</h1>
                        <p className="text-gray-500">Gestión Académica de Grupo</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFTSIDE: Courses (Main Focus) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><BookOpen size={20} /></span>
                                Cursos Asignados
                            </h2>
                            <Button onClick={openCourseModal}>
                                <Plus size={18} className="mr-2" /> Agregar Curso
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {courses.map(course => (
                                <Card key={course.id} className="p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{course.subject?.name}</h3>
                                            <p className="text-gray-500 text-sm">Prof. {course.teacher?.full_name}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                                                {course.subject?.credits} Créditos
                                            </span>
                                            {course.start_date && (
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Calendar size={12} /> {new Date(course.start_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {courses.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-4">No hay cursos asignados a esta cohorte.</p>
                                    <Button variant="secondary" onClick={openCourseModal}>Asignar Primer Curso</Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHTSIDE: Students List */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="bg-green-100 p-2 rounded-lg text-green-600"><Users size={20} /></span>
                                Estudiantes
                            </h2>
                            <div className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-full">{students.length}</div>
                        </div>

                        <Card className="p-0 overflow-hidden max-h-[600px] overflow-y-auto">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center sticky top-0">
                                <span className="text-xs font-bold text-gray-500 uppercase">Lista de Clase</span>
                                <button onClick={fetchAvailableStudents} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                                    <UserPlus size={14} /> Matricular
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {students.map(student => (
                                    <div key={student.id} className="p-4 flex justify-between items-center hover:bg-gray-50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {student.full_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{student.full_name}</p>
                                                <p className="text-xs text-gray-400">{student.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => unenrollStudent(student.id)}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Desvincular"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                ))}
                                {students.length === 0 && (
                                    <p className="p-8 text-center text-gray-400 text-sm">Sin estudiantes.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* MODALS */}
                {/* 1. Enroll Student Modal */}
                {showEnrollModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="font-bold">Matricular Estudiante</h3>
                                <button onClick={() => setShowEnrollModal(false)}><X size={20} /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2">
                                {availableStudents.map(student => (
                                    <div key={student.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                                        <span>{student.full_name}</span>
                                        <Button size="sm" onClick={() => enrollStudent(student.id)}>
                                            <UserPlus size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {availableStudents.length === 0 && filters > 0 && (
                                    <p className="text-center p-4 text-gray-500">No hay estudiantes disponibles.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Add Course Modal */}
                {showCourseModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                            <h3 className="text-xl font-bold mb-6">Asignar Nuevo Curso</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Materia</label>
                                    <select
                                        className="w-full p-2 border rounded-lg"
                                        value={newCourse.subject_id}
                                        onChange={e => setNewCourse({ ...newCourse, subject_id: e.target.value })}
                                    >
                                        <option value="">Selecciona materia...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.credits} CR)</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Docente Responsable</label>
                                    <select
                                        className="w-full p-2 border rounded-lg"
                                        value={newCourse.teacher_id}
                                        onChange={e => setNewCourse({ ...newCourse, teacher_id: e.target.value })}
                                    >
                                        <option value="">Selecciona docente...</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Inicio (Opcional)</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg"
                                            value={newCourse.start_date}
                                            onChange={e => setNewCourse({ ...newCourse, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Fin (Opcional)</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg"
                                            value={newCourse.end_date}
                                            onChange={e => setNewCourse({ ...newCourse, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="secondary" onClick={() => setShowCourseModal(false)}>Cancelar</Button>
                                    <Button onClick={handleCreateCourse} disabled={!newCourse.subject_id || !newCourse.teacher_id}>
                                        Crear Curso
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}



