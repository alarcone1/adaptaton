import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/ui/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Calendar, CheckCircle, Users, ArrowLeft, Plus, Trash2, ExternalLink, GraduationCap, Edit2, ClipboardList } from 'lucide-react'

// Sub-components
const PlanningTab = ({ courseId, cohortId }: { courseId: string, cohortId?: string }) => {
    const [activities, setActivities] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [resources, setResources] = useState<any[]>([])
    const [selectedResource, setSelectedResource] = useState<string>('')
    const [customInstructions, setCustomInstructions] = useState('')
    const [dueDate, setDueDate] = useState('')
    // Editing State
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    useEffect(() => {
        if (courseId) {
            fetchActivities()
            fetchResources()
        }
    }, [courseId])

    const fetchActivities = async () => {
        const { data } = await supabase
            .from('course_activities' as any)
            .select(`
                *,
                resource:resource_library(*)
            `)
            .eq('course_id', courseId)
            .order('created_at', { ascending: false })
        setActivities(data || [])
    }

    const fetchResources = async () => {
        const { data } = await supabase.from('resource_library').select('*')
        setResources(data || [])
    }

    const handleOpenAdd = () => {
        setIsEditing(false)
        setEditingId(null)
        setSelectedResource('')
        setCustomInstructions('')
        setDueDate('')
        setShowAddModal(true)
    }

    const handleOpenEdit = (activity: any) => {
        setIsEditing(true)
        setEditingId(activity.id)
        setSelectedResource(activity.resource_id)
        setCustomInstructions(activity.custom_instructions || '')
        setDueDate(activity.due_date ? activity.due_date.split('T')[0] : '')
        setShowAddModal(true)
    }

    const handleSaveActivity = async () => {
        if (!selectedResource) return

        if (isEditing && editingId) {
            await supabase.from('course_activities' as any).update({
                resource_id: selectedResource,
                custom_instructions: customInstructions,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
            }).eq('id', editingId)
        } else {
            await supabase.from('course_activities' as any).insert({
                course_id: courseId,
                resource_id: selectedResource,
                custom_instructions: customInstructions,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                cohort_id: cohortId
            })
        }

        setShowAddModal(false)
        fetchActivities()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta actividad planeada?')) return
        await supabase.from('course_activities' as any).delete().eq('id', id)
        fetchActivities()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-700">Plan de Trabajo (Syllabus)</h3>
                <Button onClick={handleOpenAdd}>
                    <Plus size={18} className="mr-2" /> Agregar Actividad
                </Button>
            </div>

            <div className="space-y-4">
                {activities.map(activity => (
                    <Card key={activity.id} className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div>
                            <h4 className="font-bold text-primary text-lg">{activity.resource?.title}</h4>
                            <p className="text-gray-500 text-sm mb-2">{activity.custom_instructions || activity.resource?.base_description}</p>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : 'Sin fecha límite'}
                                </span>
                                {activity.resource?.resource_url && (
                                    <a href={activity.resource.resource_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                                        <ExternalLink size={14} /> Ver Recurso
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleOpenEdit(activity)}
                                className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(activity.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </Card>
                ))}
                {activities.length === 0 && (
                    <p className="text-center text-gray-400 py-10">No hay actividades planeadas para este curso.</p>
                )}
            </div>

            {/* Modal for Add/Edit using same logic */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <h3 className="font-bold text-xl mb-4">{isEditing ? 'Editar Actividad' : 'Programar Nueva Actividad'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Recurso del Banco</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    onChange={e => setSelectedResource(e.target.value)}
                                    value={selectedResource}
                                >
                                    <option value="">Selecciona un recurso...</option>
                                    {resources.map(r => (
                                        <option key={r.id} value={r.id}>{r.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Instrucciones Específicas (Opcional)</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg h-24"
                                    placeholder="Instrucciones para este grupo..."
                                    value={customInstructions}
                                    onChange={e => setCustomInstructions(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Fecha Límite</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 justify-end mt-4">
                                <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                                <Button onClick={handleSaveActivity} disabled={!selectedResource}>{isEditing ? 'Actualizar' : 'Guardar'}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const ValidationTab = ({ courseId }: { courseId: string }) => {
    const [evidences, setEvidences] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvidence, setSelectedEvidence] = useState<any>(null)
    const [impactValue, setImpactValue] = useState<number>(0)
    const [feedback, setFeedback] = useState('')

    useEffect(() => {
        if (courseId) fetchPending()
    }, [courseId])

    const fetchPending = async () => {
        // 1. Get student IDs enrolled in this course
        const { data: enrollments } = await supabase
            .from('course_enrollments')
            .select('student_id')
            .eq('course_id', courseId)
            .eq('status', 'active')

        if (!enrollments || enrollments.length === 0) {
            setEvidences([])
            setLoading(false)
            return
        }

        const studentIds = enrollments.map(e => e.student_id)

        // 2. Fetch submitted evidences from these students
        const { data } = await supabase
            .from('evidences')
            .select(`
                *,
                user:profiles!inner(full_name, avatar_url),
                challenge:challenges(title)
            `)
            .in('user_id', studentIds)
            .eq('status', 'submitted')
            .order('created_at', { ascending: true })

        setEvidences(data || [])
        setLoading(false)
        if (data && data.length > 0) selectEvidence(data[0])
        else setSelectedEvidence(null)
    }

    const selectEvidence = (evidence: any) => {
        setSelectedEvidence(evidence)
        setImpactValue(evidence.impact_data?.value || 0)
        setFeedback(evidence.feedback || '')
    }

    const handleValidate = async () => {
        if (!selectedEvidence) return
        const updatedImpact = { ...selectedEvidence.impact_data, value: Number(impactValue) }
        await supabase.from('evidences').update({
            status: 'validated',
            impact_data: updatedImpact,
            feedback: feedback
        }).eq('id', selectedEvidence.id)
        fetchPending()
    }

    const handleReject = async () => {
        if (!selectedEvidence) return
        await supabase.from('evidences').update({
            status: 'rejected',
            feedback: feedback
        }).eq('id', selectedEvidence.id)
        fetchPending()
    }

    if (loading) return <div>Cargando...</div>
    if (evidences.length === 0) return (
        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-200" />
            <p>¡Todo al día! No hay evidencias pendientes de validar.</p>
        </div>
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* List */}
            <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-2 border-r border-gray-100">
                {evidences.map(ev => (
                    <div
                        key={ev.id}
                        onClick={() => selectEvidence(ev)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${selectedEvidence?.id === ev.id ? 'bg-primary text-white shadow-lg' : 'bg-white hover:bg-gray-50 border border-gray-100'}`}
                    >
                        <h4 className={`font-bold ${selectedEvidence?.id === ev.id ? 'text-white' : 'text-gray-800'}`}>{ev.user.full_name}</h4>
                        <p className={`text-xs ${selectedEvidence?.id === ev.id ? 'text-purple-200' : 'text-gray-500'}`}>{ev.challenge?.title || 'Reto'}</p>
                        <p className="text-xs mt-2 opacity-80">{new Date(ev.created_at).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>

            {/* Detail / Action Panel */}
            {selectedEvidence && (
                <div className="lg:col-span-2 flex flex-col h-full">
                    <Card className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex items-start gap-4">
                            <img src={selectedEvidence.user.avatar_url || `https://ui-avatars.com/api/?name=${selectedEvidence.user.full_name}`} className="w-12 h-12 rounded-full" />
                            <div>
                                <h3 className="text-xl font-bold">{selectedEvidence.user.full_name}</h3>
                                <p className="text-gray-500">Misión: {selectedEvidence.challenge?.title}</p>
                            </div>
                        </div>

                        {/* Evidence Media */}
                        <div className="bg-black/5 rounded-xl aspect-video flex items-center justify-center overflow-hidden">
                            {selectedEvidence.media_url ? (
                                <img src={selectedEvidence.media_url} className="w-full h-full object-contain" />
                            ) : (
                                <p className="text-gray-400">Sin evidencia visual</p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-gray-600 italic">"{selectedEvidence.description}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                            {/* Data Correction */}
                            <div>
                                <h4 className="font-bold text-sm text-gray-500 uppercase mb-2">Impacto (Calificación)</h4>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={impactValue}
                                        onChange={e => setImpactValue(Number(e.target.value))}
                                        className="p-3 border rounded-xl w-full font-bold text-lg text-primary bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* Feedback Input */}
                            <div>
                                <h4 className="font-bold text-sm text-gray-500 uppercase mb-2">Retroalimentación</h4>
                                <textarea
                                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    rows={3}
                                    placeholder="Escribe comentarios para el estudiante..."
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <Button variant="secondary" onClick={handleReject} className="hover:bg-red-50 hover:text-red-600 border-red-200">
                            Rechazar y Enviar Feedback
                        </Button>
                        <Button onClick={handleValidate} className="bg-green-600 hover:bg-green-700">
                            Aprobar y Validar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

const GradebookTab = ({ courseId }: { courseId: string }) => {
    const [data, setData] = useState<{ students: any[], activities: any[], matrix: any }>({ students: [], activities: [], matrix: {} })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadGradebook()
    }, [courseId])

    const loadGradebook = async () => {
        setLoading(true)
        // 1. Fetch Students
        const { data: studentsData } = await supabase
            .from('course_enrollments')
            .select('student:profiles(id, full_name, avatar_url)')
            .eq('course_id', courseId)
            .eq('status', 'active')

        // 2. Fetch Proposed Activities
        const { data: activitiesData } = await supabase
            .from('course_activities' as any)
            .select('id, resource:resource_library(title)')
            .eq('course_id', courseId)
            .order('created_at', { ascending: true })

        // 3. Fetch All Evidences for this course
        const studentIds = studentsData?.map((s: any) => s.student.id) || []

        let evidencesData: any[] = []
        if (studentIds.length > 0) {
            const { data: evs } = await supabase
                .from('evidences')
                .select('user_id, course_activity_id, status, impact_data')
                .in('user_id', studentIds)

            evidencesData = evs || []
        }

        // Build Matrix: Map[studentId][activityId] = Evidence
        const matrix: any = {}
        evidencesData.forEach(ev => {
            if (!matrix[ev.user_id]) matrix[ev.user_id] = {}
            if (ev.course_activity_id) {
                matrix[ev.user_id][ev.course_activity_id] = ev
            }
        })

        setData({
            students: studentsData?.map((s: any) => s.student) || [],
            activities: activitiesData || [],
            matrix
        })
        setLoading(false)
    }

    if (loading) return <div className="py-10 text-center text-gray-400">Generando matriz de calificaciones...</div>

    return (
        <Card className="p-0 overflow-x-auto">
            <table className="w-full min-w-[800px]">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 text-left font-bold text-gray-600 sticky left-0 bg-white shadow-sm z-10 w-64">Estudiante</th>
                        {data.activities.map((act: any) => (
                            <th key={act.id} className="p-4 text-left text-xs font-bold text-gray-500 uppercase w-48 min-w-[150px]">
                                <span className="line-clamp-2" title={act.resource?.title}>{act.resource?.title}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.students.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50">
                            <td className="p-4 flex items-center gap-3 sticky left-0 bg-white z-10">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                    {student.full_name?.[0]}
                                </div>
                                <span className="font-medium text-sm text-gray-700 truncate max-w-[150px]">{student.full_name}</span>
                            </td>
                            {data.activities.map((act: any) => {
                                const evidence = data.matrix[student.id]?.[act.id]
                                return (
                                    <td key={act.id} className="p-4">
                                        {evidence ? (
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit uppercase ${evidence.status === 'validated' ? 'bg-green-100 text-green-700' :
                                                    evidence.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {evidence.status === 'submitted' ? 'Rev. Pendiente' :
                                                        evidence.status === 'validated' ? 'Aprobado' :
                                                            evidence.status === 'rejected' ? 'Rechazado' : evidence.status}
                                                </span>
                                                {evidence.status === 'validated' && (
                                                    <span className="text-xs font-bold text-gray-500">
                                                        {evidence.impact_data?.value || 0} pts
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 text-xs">-</span>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    )
}

const AttendanceTab = ({ courseId }: { courseId: string }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [students, setStudents] = useState<any[]>([])
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadDailyAttendance()
    }, [courseId, date])

    const loadDailyAttendance = async () => {
        // 1. Load enrolled students
        const { data: studentsData } = await supabase
            .from('course_enrollments')
            .select('student:profiles(id, full_name)')
            .eq('course_id', courseId)
            .eq('status', 'active')

        // 2. Load existing attendance for this date
        const { data: attendanceData } = await supabase
            .from('course_attendance' as any)
            .select('*')
            .eq('course_id', courseId)
            .eq('date', date)

        const initialMap: Record<string, any> = {}
        // Default to 'present' if no record, else use record
        studentsData?.forEach((s: any) => {
            const record = attendanceData?.find((a: any) => a.student_id === s.student.id)
            initialMap[s.student.id] = record ? record.status : 'present'
        })

        setStudents(studentsData?.map((s: any) => s.student) || [])
        setAttendance(initialMap)
    }

    const handleSave = async () => {
        setSaving(true)
        const updates = students.map(s => ({
            course_id: courseId,
            student_id: s.id,
            date: date,
            status: attendance[s.id]
        }))

        // Upsert logic handled by the UNIQUE constraint likely needing ON CONFLICT
        // Supabase .upsert() handles this if primary keys match, but here we have composite unique key suitable for upsert
        const { error } = await supabase.from('course_attendance' as any).upsert(updates, { onConflict: 'course_id, student_id, date' })

        if (error) alert('Error guardando asistencia')
        else alert('Asistencia guardada correctamente')
        setSaving(false)
    }

    const updateStatus = (studentId: string, status: any) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }))
    }

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-lg text-gray-700">Control de Asistencia</h3>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="p-2 border rounded-lg font-bold text-gray-600"
                    />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Todo'}
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left font-bold text-gray-600">Estudiante</th>
                            <th className="p-4 text-center font-bold text-gray-600">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50/50">
                                <td className="p-4 font-medium text-gray-800">{student.full_name}</td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-2">
                                        {[
                                            { val: 'present', label: 'Presente', color: 'bg-green-100 text-green-700 ring-green-500' },
                                            { val: 'late', label: 'Tarde', color: 'bg-yellow-100 text-yellow-700 ring-yellow-500' },
                                            { val: 'absent', label: 'Ausente', color: 'bg-red-100 text-red-700 ring-red-500' },
                                            { val: 'excused', label: 'Excusa', color: 'bg-blue-100 text-blue-700 ring-blue-500' }
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => updateStatus(student.id, opt.val)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${attendance[student.id] === opt.val
                                                    ? `${opt.color} ring-2 ring-offset-1`
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={2} className="p-8 text-center text-gray-400">No hay estudiantes para mostrar.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

const StudentsTab = ({ courseId }: { courseId: string }) => {
    const [students, setStudents] = useState<any[]>([])
    const [filteredStudents, setFilteredStudents] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (courseId) fetchStudents()
    }, [courseId])

    useEffect(() => {
        const lowerSearch = search.toLowerCase()
        const filtered = students.filter(s =>
            s.student.full_name?.toLowerCase().includes(lowerSearch) ||
            s.student.email?.toLowerCase().includes(lowerSearch)
        )
        setFilteredStudents(filtered)
    }, [search, students])

    const fetchStudents = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('course_enrollments')
            .select(`
                id,
                status,
                student:profiles (
                    id,
                    full_name,
                    email,
                    avatar_url
                )
            `)
            .eq('course_id', courseId)
            .eq('status', 'active')
            .order('created_at', { ascending: true })

        setStudents(data || [])
        setLoading(false)
    }

    const handleRemoveStudent = async (enrollmentId: string, studentName: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar a ${studentName} del curso?`)) return

        const { error } = await supabase
            .from('course_enrollments')
            .update({ status: 'dropped' })
            .eq('id', enrollmentId)

        if (error) {
            alert('Error al eliminar estudiante')
        } else {
            fetchStudents()
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando lista de estudiantes...</div>

    return (
        <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h3 className="font-bold text-lg text-gray-700">Estudiantes Inscritos</h3>
                    <p className="text-gray-500 text-sm">Gestiona el acceso de los estudiantes a este curso.</p>
                </div>
                <div className="w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Buscar estudiante..."
                        className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gray-50/50 text-left text-xs text-gray-400 uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-4">Estudiante</th>
                            <th className="p-4 hidden md:table-cell">Email</th>
                            <th className="p-4 text-center">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredStudents.map((item: any) => (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                                            {item.student.avatar_url ? (
                                                <img src={item.student.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                item.student.full_name?.[0]
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{item.student.full_name}</div>
                                            <div className="text-xs text-gray-400 md:hidden">{item.student.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 hidden md:table-cell text-gray-500 text-sm">{item.student.email}</td>
                                <td className="p-4 text-center">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                                        {item.status === 'active' ? 'Activo' : item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleRemoveStudent(item.id, item.student.full_name)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Eliminar del curso"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-300 gap-3">
                                        <Users size={48} className="stroke-1" />
                                        <p className="font-medium">No se encontraron estudiantes.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-xs text-gray-400 text-center">
                Total: {filteredStudents.length} estudiante{filteredStudents.length !== 1 && 's'}
            </div>
        </Card>
    )
}


export const TeacherCourseManager = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [course, setCourse] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'planning' | 'inbox' | 'gradebook' | 'attendance' | 'students'>('planning')

    useEffect(() => {
        if (id) fetchCourse()
    }, [id])

    const fetchCourse = async () => {
        if (!id) return
        const { data } = await supabase
            .from('courses')
            .select(`
                *,
                subject:subjects (
                    name,
                    description
                ),
                cohort:cohorts (
                    name
                )
            `)
            .eq('id', id)
            .single()
        setCourse(data)
    }

    if (!course) return <Layout><div>Cargando...</div></Layout>

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 md:p-8 text-left pb-20">
                <button onClick={() => navigate('/teacher')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                    <ArrowLeft size={18} /> Volver a Mis Cursos
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase">{course.cohort?.name}</span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-800">{course.subject?.name}</h1>
                        <p className="text-gray-500">{course.subject?.description}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100/50 p-1 rounded-xl mb-8 w-fit overflow-x-auto">
                    {[
                        { id: 'planning', label: 'Planificación', icon: Calendar },
                        { id: 'inbox', label: 'Sala de Validación', icon: CheckCircle },
                        { id: 'gradebook', label: 'Calificaciones', icon: GraduationCap },
                        { id: 'attendance', label: 'Asistencia', icon: ClipboardList },
                        { id: 'students', label: 'Estudiantes', icon: Users }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'planning' && <PlanningTab courseId={id!} cohortId={course.cohort_id} />}
                    {activeTab === 'inbox' && <ValidationTab courseId={id!} />}
                    {activeTab === 'gradebook' && <GradebookTab courseId={id!} />}
                    {activeTab === 'attendance' && <AttendanceTab courseId={id!} />}
                    {activeTab === 'students' && <StudentsTab courseId={id!} />}
                </div>
            </div>
        </Layout>
    )
}
