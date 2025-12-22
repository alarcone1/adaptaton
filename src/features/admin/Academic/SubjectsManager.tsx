import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Book, Plus, Edit2, Trash2, X } from 'lucide-react'

export const SubjectsManager = () => {
    const [subjects, setSubjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingSubject, setEditingSubject] = useState<any>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        credits: 0
    })

    useEffect(() => {
        fetchSubjects()
    }, [])

    const fetchSubjects = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('subjects')
                .select('*')
                .order('name')

            if (error) throw error
            setSubjects(data || [])
        } catch (error) {
            console.error('Error fetching subjects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingSubject) {
                const { error } = await supabase
                    .from('subjects')
                    .update(formData)
                    .eq('id', editingSubject.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('subjects')
                    .insert([formData])
                if (error) throw error
            }

            setShowModal(false)
            setEditingSubject(null)
            setFormData({ name: '', description: '', credits: 0 })
            fetchSubjects()
        } catch (error) {
            console.error('Error saving subject:', error)
            alert('Error al guardar la materia')
        }
    }

    const handleEdit = (subject: any) => {
        setEditingSubject(subject)
        setFormData({
            name: subject.name,
            description: subject.description || '',
            credits: subject.credits
        })
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta materia? Esto podría afectar cursos existentes.')) return

        try {
            const { error } = await supabase
                .from('subjects')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchSubjects()
        } catch (error) {
            console.error('Error deleting subject:', error)
            alert('Error al eliminar. Verifique que no tenga cursos asociados.')
        }
    }

    const openModal = () => {
        setEditingSubject(null)
        setFormData({ name: '', description: '', credits: 0 })
        setShowModal(true)
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-800">Catálogo de Materias</h1>
                    <p className="text-gray-500">Define las áreas de conocimiento disponibles para la academia.</p>
                </div>
                <Button onClick={openModal}>
                    <Plus size={20} className="mr-2" /> Nueva Materia
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(subject => (
                        <Card key={subject.id} className="group hover:shadow-lg transition-all border-l-4 border-l-blue-500 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Book size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(subject)} className="p-2 hover:bg-gray-100 rounded-full text-blue-600">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(subject.id)} className="p-2 hover:bg-red-50 rounded-full text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-3">{subject.description || 'Sin descripción'}</p>

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                                <span className="text-gray-400">Créditos Académicos</span>
                                <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">{subject.credits} CR</span>
                            </div>
                        </Card>
                    ))}
                    {subjects.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Book size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No hay materias registradas.</p>
                            <Button variant="secondary" className="mt-4" onClick={openModal}>Crear la primera</Button>
                        </div>
                    )}
                </div>
            )}


            {/* Modal */}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-800">
                                {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Materia</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Ej. Matemáticas Básicas"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-24"
                                    placeholder="¿De qué trata esta materia?"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Créditos</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={formData.credits}
                                    onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingSubject ? 'Guardar Cambios' : 'Crear Materia'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}


