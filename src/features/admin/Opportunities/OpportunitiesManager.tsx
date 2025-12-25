import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Plus, Edit2, Trash2, Globe, Users, Power, Briefcase, GraduationCap, DollarSign, Star, Activity } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'


import { ConfirmModal } from '../../../components/ConfirmModal'
import { Badge } from '../../../components/ui/Badge'
import { Modal, ModalFooter } from '../../../components/ui/Modal'


const getOpportunityIcon = (type: string) => {
    switch (type) {
        case 'job': return <Briefcase size={24} />
        case 'internship': return <GraduationCap size={24} />
        case 'scholarship': return <DollarSign size={24} />
        default: return <Star size={24} />
    }
}



export const OpportunitiesManager = () => {
    const [opportunities, setOpportunities] = useState<any[]>([])
    // Removed unused loading state
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState<any>({ title: '', description: '', partner_name: '', target_cohort_type: 'all', is_active: true })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => { fetchOpportunities() }, [])

    const fetchOpportunities = async () => {
        const { data } = await supabase.from('opportunities' as any).select('*').order('created_at', { ascending: false })
        if (data) setOpportunities(data)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { ...formData, target_cohort_type: formData.target_cohort_type === 'all' ? null : formData.target_cohort_type }

        if (editingId) {
            await supabase.from('opportunities' as any).update(payload).eq('id', editingId)
        } else {
            await supabase.from('opportunities' as any).insert(payload)
        }

        setShowForm(false)
        setEditingId(null)
        setFormData({ title: '', description: '', partner_name: '', target_cohort_type: 'all', is_active: true })
        fetchOpportunities()
    }

    const handleEdit = (opp: any) => {
        setFormData({
            title: opp.title,
            description: opp.description,
            partner_name: opp.partner_name,
            target_cohort_type: opp.target_cohort_type || 'all',
            is_active: opp.is_active ?? true
        })
        setEditingId(opp.id)
        setShowForm(true)
    }

    const toggleActive = async (opp: any) => {
        const newState = !opp.is_active
        // Optimistic UI
        setOpportunities(prev => prev.map(p => p.id === opp.id ? { ...p, is_active: newState } : p))
        await supabase.from('opportunities' as any).update({ is_active: newState }).eq('id', opp.id)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        await supabase.from('opportunities' as any).delete().eq('id', deleteId)
        setDeleteId(null)
        fetchOpportunities()
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">


            <PageHeader
                title="Gestor de Oportunidades"
                subtitle="El Concierge: Gestiona ofertas y ayudas para los estudiantes."
                icon={Activity}
            >
                <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', description: '', partner_name: '', target_cohort_type: 'all', is_active: true }) }}>
                    <Plus size={18} /> Nueva Oportunidad
                </Button>
            </PageHeader>

            {showForm && (
                <Modal
                    isOpen={showForm}
                    onClose={() => setShowForm(false)}
                    title={editingId ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
                    description={editingId ? 'Modifica los detalles de la oferta.' : 'Publica una nueva beca, trabajo o pasantía.'}
                    mode={editingId ? 'edit' : 'create'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#1B1B3F] uppercase mb-1.5 tracking-wide">Título</label>
                            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ej: Beca de Inglés" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#1B1B3F] uppercase mb-1.5 tracking-wide">Partner / Aliado</label>
                            <input required value={formData.partner_name} onChange={e => setFormData({ ...formData, partner_name: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ej: Fundación X" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#1B1B3F] uppercase mb-1.5 tracking-wide">Descripción</label>
                            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl h-24 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Detalles de la oportunidad..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#1B1B3F] uppercase mb-1.5 tracking-wide">Audiencia Objetivo</label>
                                <select value={formData.target_cohort_type} onChange={e => setFormData({ ...formData, target_cohort_type: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="all">Todos</option>
                                    <option value="minor">Solo Menores (Escolares)</option>
                                    <option value="adult">Solo Adultos</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#1B1B3F] uppercase mb-1.5 tracking-wide">Tipo de Oportunidad</label>
                                <select value={formData.type || 'scholarship'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="scholarship">Beca</option>
                                    <option value="job">Empleo</option>
                                    <option value="internship">Pasantía</option>
                                    <option value="event">Evento</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 accent-primary rounded cursor-pointer" id="visible" />
                            <label htmlFor="visible" className="text-sm text-gray-700 cursor-pointer font-medium select-none">Visible para estudiantes</label>
                        </div>

                        <div className="flex justify-end gap-2 mt-6 border-t pt-4 border-gray-100">
                            <ModalFooter
                                onCancel={() => setShowForm(false)}
                                saveLabel="Guardar Oportunidad"
                                isSaveDisabled={!formData.title || !formData.partner_name || !formData.description}
                            />
                        </div>
                    </form>
                </Modal>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map(opp => (
                    <Card key={opp.id} className={`group relative transition-all p-6 border-l-4 border-l-[#E49744] hover:border-[#E49744] hover:shadow-lg cursor-pointer ${!opp.is_active ? 'opacity-70 bg-gray-50' : ''}`} onClick={() => handleEdit(opp)}>
                        <div className="absolute top-4 right-4 flex gap-1">
                            <button onClick={() => toggleActive(opp)} className={`p-1.5 rounded-full ${opp.is_active ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-200'}`} title="Toggle Visibility">
                                <Power size={16} />
                            </button>
                            <button onClick={() => handleEdit(opp)} className="p-1.5 text-blue-500 bg-blue-50 rounded-full hover:bg-blue-100">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => setDeleteId(opp.id)} className="p-1.5 text-red-500 bg-red-50 rounded-full hover:bg-red-100">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="mb-4 pt-8">
                            <div className="mb-4 inline-block p-3 rounded-xl transition-all duration-300 bg-[#E49744]/10 text-[#E49744] group-hover:bg-[#E49744] group-hover:text-white">
                                {getOpportunityIcon(opp.type)}
                            </div>
                            <Badge variant="gold" className="mb-2 block w-fit">{opp.partner_name}</Badge>
                            <h3 className="font-bold text-lg text-[#1B1B3F] leading-tight">{opp.title}</h3>
                        </div>

                        <p className="text-sm text-text-secondary mb-4 line-clamp-3 h-16">{opp.description}</p>

                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 border-t pt-3">
                            <span className="flex items-center gap-1">
                                <Globe size={14} /> {opp.is_active ? 'Publicado' : 'Oculto'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users size={14} /> {opp.target_cohort_type ? (opp.target_cohort_type === 'minor' ? 'Escolares' : 'Adultos') : 'Todos'}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Eliminar Oportunidad"
                message="¿Seguro que deseas eliminar esta oferta?"
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    )
}
