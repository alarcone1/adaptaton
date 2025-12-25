import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Book, Plus, Edit2, Trash2, X, BookOpen } from 'lucide-react'
import { Modal, ModalFooter } from '../../../components/ui/Modal'

import { PageHeader } from '../../../components/ui/PageHeader'

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
            <PageHeader
                title="Catálogo de Materias"
                subtitle="Define las áreas de conocimiento disponibles para la academia."
                icon={BookOpen}
            >
                <Button onClick={openModal}>
                    <Plus size={20} className="mr-2" /> Nueva Materia
                </Button>
            </PageHeader>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map(subject => (
                        <Card key={subject.id} className="group hover:shadow-lg transition-all border-l-4 border-l-[#1B1B3F] hover:border-[#1B1B3F] p-6 cursor-pointer" onClick={() => handleEdit(subject)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl transition-all duration-300 bg-[#1B1B3F]/10 text-[#1B1B3F] group-hover:bg-[#1B1B3F] group-hover:text-white">
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

                            <h3 className="text-lg font-bold text-[#1B1B3F] mb-2">{subject.name}</h3>
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

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSubject ? 'Editar Materia' : 'Nueva Materia'}
                description={editingSubject ? 'Actualiza la información de la asignatura.' : 'Registra una nueva materia en el catálogo.'}
                mode={editingSubject ? 'edit' : 'create'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#1B1B3F] uppercase mb-1.5 tracking-wide">Nombre de la Materia</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Ej. Matemáticas Básicas"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#1B1B3F] uppercase mb-1.5 tracking-wide">Descripción</label>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24"
                            placeholder="¿De qué trata esta materia?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#1B1B3F] uppercase mb-1.5 tracking-wide">Créditos</label>
                        <input
                            type="number"
                            required
                            min="0"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.credits}
                            onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                        />
                    </div>

                    <ModalFooter
                        onCancel={() => setShowModal(false)}
                        saveLabel="Guardar Materia"
                        isSaveDisabled={!formData.name || formData.credits <= 0}
                    />
                </form>
            </Modal>
        </div>
    )
}


