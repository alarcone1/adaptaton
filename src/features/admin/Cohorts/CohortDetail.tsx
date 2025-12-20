import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { Layout } from '../../../components/ui/Layout'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Users, UserPlus, LogOut, ArrowLeft } from 'lucide-react'

export const CohortDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cohort, setCohort] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [availableStudents, setAvailableStudents] = useState<any[]>([])
    const [showEnrollModal, setShowEnrollModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) fetchCohortData()
    }, [id])

    const fetchCohortData = async () => {
        if (!id) return;
        setLoading(true)
        // Fetch Cohort Details
        const { data: cohortData } = await supabase
            .from('cohorts')
            .select(`
                *,
                instructors:cohort_instructors(
                    user:profiles(full_name)
                )
            `)
            .eq('id', id)
            .single()

        if (cohortData) {
            setCohort({
                ...cohortData,
                instructor_name: cohortData.instructors?.[0]?.user?.full_name || 'Sin asignar'
            })
        }

        // Fetch Enrolled Students
        const { data: enrolled } = await supabase
            .from('profiles')
            .select('*')
            .eq('cohort_id', id)
            .order('full_name')

        setStudents(enrolled || [])
        setLoading(false)
    }

    const fetchAvailableStudents = async () => {
        // Fetch students without a cohort
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
        await supabase.from('profiles').update({ cohort_id: id }).eq('id', studentId)
        fetchCohortData()
        fetchAvailableStudents() // Refresh modal list
    }

    const unenrollStudent = async (studentId: string) => {
        if (!confirm('¿Desvincular a este estudiante del grupo?')) return
        await supabase.from('profiles').update({ cohort_id: null }).eq('id', studentId)
        fetchCohortData()
    }

    if (loading) return <Layout><div>Cargando...</div></Layout>
    if (!cohort) return <Layout><div>Cohorte no encontrada</div></Layout>

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/cohorts')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">{cohort.name}</h1>
                        <p className="text-gray-500">Docente: {cohort.instructor_name}</p>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={fetchAvailableStudents}>
                            <UserPlus size={18} className="mr-2" /> Matricular Estudiante
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="col-span-2 p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Users size={20} /> Lista de Estudiantes ({students.length})
                        </h3>

                        {students.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                                No hay estudiantes matriculados aún.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {students.map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {student.full_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{student.full_name}</p>
                                                <p className="text-xs text-gray-500">{student.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => unenrollStudent(student.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Desvincular"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-6 h-fit bg-purple-50 border-purple-100">
                        <h3 className="font-bold text-purple-900 mb-2">Detalles del Grupo</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tipo:</span>
                                <span className="font-medium capitalize">{cohort.type === 'minor' ? 'Escolar (Menores)' : 'Profesional (Adultos)'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Inicio:</span>
                                <span className="font-medium">{cohort.start_date || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Fin:</span>
                                <span className="font-medium">{cohort.end_date || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Estado:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cohort.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {cohort.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Enrollment Modal */}
                {showEnrollModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Matricular Estudiantes</h2>
                                <button onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                                {availableStudents.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Todos los estudiantes ya tienen grupo asignado.</p>
                                ) : (
                                    availableStudents.map(student => (
                                        <div key={student.id} className="flex justify-between items-center p-3 border rounded-lg hover:border-blue-300 transition-colors">
                                            <div>
                                                <p className="font-medium">{student.full_name}</p>
                                                <p className="text-xs text-gray-500">{student.email}</p>
                                            </div>
                                            <Button size="sm" variant="secondary" onClick={() => enrollStudent(student.id)}>
                                                Matricular
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}
