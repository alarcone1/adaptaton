import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Plus, Users, Calendar, Edit2, Trash2 } from 'lucide-react'
import { ConfirmModal } from '../../../components/ConfirmModal'

export const CohortsManager = () => {
    const navigate = useNavigate()
    const [cohorts, setCohorts] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ name: '', type: 'minor', start_date: '', end_date: '', instructor_id: '' })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showDelete, setShowDelete] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
        fetchTeachers()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('cohorts')
            .select(`
                *,
                students:profiles!profiles_cohort_id_fkey(count),
                instructors:cohort_instructors(
                    user:profiles(full_name, id)
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Fetch error:', error);
            (window as any).debugError = error;
        }

        if (data) {
            // Transform data to flatten structure if needed
            const formatted = data.map(c => ({
                ...c,
                student_count: c.students?.[0]?.count || 0,
                instructor: c.instructors?.[0]?.user || null // Taking the first instructor for display
            }))
            setCohorts(formatted)
        }
        setLoading(false)
    }

    const fetchTeachers = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'teacher')
        if (data) setTeachers(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let cohortId = editingId

            if (editingId) {
                await supabase.from('cohorts').update({
                    name: formData.name,
                    type: formData.type as "minor" | "adult",
                    start_date: formData.start_date || null,
                    end_date: formData.end_date || null
                } as any).eq('id', editingId)
            } else {
                const { data, error } = await supabase.from('cohorts').insert({
                    name: formData.name,
                    type: formData.type as "minor" | "adult",
                    start_date: formData.start_date || null,
                    end_date: formData.end_date || null
                } as any).select().single()

                if (error) throw error
                cohortId = data.id
            }

            // Handle Instructor Assignment (Simple overwrite for MVP: Delete all and add new)
            if (formData.instructor_id && cohortId) {
                // Remove existing
                if (editingId) {
                    await supabase.from('cohort_instructors').delete().eq('cohort_id', cohortId)
                }
                // Add new
                await supabase.from('cohort_instructors').insert({
                    cohort_id: cohortId,
                    user_id: formData.instructor_id
                })
            }

            setShowForm(false)
            setEditingId(null)
            fetchData()
        } catch (error) {
            console.error('Error saving cohort:', error)
        }
    }

    const startEdit = (cohort: any) => {
        setFormData({
            name: cohort.name,
            type: cohort.type,
            start_date: cohort.start_date || '',
            end_date: cohort.end_date || '',
            instructor_id: cohort.instructor?.id || ''
        })
        setEditingId(cohort.id)
        setShowForm(true)
    }

    const confirmDeleteCohort = async () => {
        if (!deleteId) return
        await supabase.from('cohorts').delete().eq('id', deleteId)
        setShowDelete(false)
        fetchData()
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen space-y-6">
            <PageHeader
                title="Gestión de Cohortes"
                subtitle="Administra grupos académicos y asignaciones."
                role="Admin"
                roleColor="red"
            >
                <Button onClick={() => {
                    setEditingId(null)
                    setFormData({ name: '', type: 'minor', start_date: '', end_date: '', instructor_id: '' })
                    setShowForm(true)
                }}>
                    <Plus size={18} className="mr-2" /> Nueva Cohorte
                </Button>
            </PageHeader>

            {loading ? <div className="text-center py-10">Cargando...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cohorts.map(cohort => (
                        <Card key={cohort.id} className="p-6 hover:shadow-lg transition-all group relative">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); startEdit(cohort) }} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteId(cohort.id); setShowDelete(true) }} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div onClick={() => navigate(`/admin/cohorts/${cohort.id}`)} className="cursor-pointer">
                                <div className="mb-4">
                                    <Badge variant={cohort.type === 'minor' ? 'green' : 'purple'} className="mb-2">
                                        {cohort.type === 'minor' ? 'Menores' : 'Adultos'}
                                    </Badge>
                                    <h3 className="text-xl font-bold text-gray-800">{cohort.name}</h3>
                                    {cohort.instructor && (
                                        <p className="text-sm text-gray-500 mt-1">Docente: <span className="font-medium text-gray-700">{cohort.instructor.full_name}</span></p>
                                    )}
                                </div>

                                <div className="flex gap-4 text-sm text-gray-500 border-t pt-4">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={16} />
                                        <span>{cohort.student_count} Estudiantes</span>
                                    </div>
                                    {cohort.start_date && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={16} />
                                            <span>{cohort.start_date}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Cohorte' : 'Nueva Cohorte'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
                                <input
                                    type="text" required
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Grupo A - Mañana"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Público</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="minor">Menores (Escolar)</option>
                                    <option value="adult">Adultos (Profesional)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Docente Encargado</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.instructor_id}
                                    onChange={e => setFormData({ ...formData, instructor_id: e.target.value })}
                                >
                                    <option value="">Seleccionar Docente...</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)} type="button">Cancelar</Button>
                                <Button className="flex-1" type="submit">Guardar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showDelete}
                onCancel={() => setShowDelete(false)}
                onConfirm={confirmDeleteCohort}
                title="Eliminar Cohorte"
                message="¿Estás seguro? Esto eliminará el grupo y desvinculará a los estudiantes."
            />
        </div>
    )
}
