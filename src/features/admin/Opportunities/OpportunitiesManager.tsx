import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Plus, Edit2, Trash2, Globe, Users, Power } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ConfirmModal } from '../../../components/ConfirmModal'
import { Badge } from '../../../components/ui/Badge'

import { Layout } from '../../../components/ui/Layout'

export const OpportunitiesManager = () => {
    const [opportunities, setOpportunities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState<any>({ title: '', description: '', partner_name: '', target_cohort_type: 'all', is_active: true })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => { fetchOpportunities() }, [])

    const fetchOpportunities = async () => {
        setLoading(true)
        const { data } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false })
        if (data) setOpportunities(data)
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { ...formData, target_cohort_type: formData.target_cohort_type === 'all' ? null : formData.target_cohort_type }

        if (editingId) {
            await supabase.from('opportunities').update(payload).eq('id', editingId)
        } else {
            await supabase.from('opportunities').insert(payload)
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
        await supabase.from('opportunities').update({ is_active: newState }).eq('id', opp.id)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        await supabase.from('opportunities').delete().eq('id', deleteId)
        setDeleteId(null)
        fetchOpportunities()
    }

    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">


                <PageHeader
                    title="Gestor de Oportunidades"
                    subtitle="El Concierge: Gestiona ofertas y ayudas para los estudiantes."
                    role="Concierge"
                    roleColor="gold"
                />

                <div className="flex justify-end mb-8">
                    <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', description: '', partner_name: '', target_cohort_type: 'all', is_active: true }) }}>
                        <Plus size={18} /> Nueva Oportunidad
                    </Button>
                </div>

                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-lg p-6 animate-in zoom-in-95">
                            <h3 className="font-bold text-xl mb-4 text-primary">{editingId ? 'Editar Oportunidad' : 'Nueva Oportunidad'}</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Título</label>
                                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="Ej: Beca de Inglés" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Partner / Aliado</label>
                                    <input required value={formData.partner_name} onChange={e => setFormData({ ...formData, partner_name: e.target.value })} className="w-full p-3 border rounded-xl" placeholder="Ej: Fundación X" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Descripción</label>
                                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 border rounded-xl h-24" placeholder="Detalles..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Audiencia Objetivo</label>
                                        <select value={formData.target_cohort_type} onChange={e => setFormData({ ...formData, target_cohort_type: e.target.value })} className="w-full p-3 border rounded-xl bg-white">
                                            <option value="all">Todos</option>
                                            <option value="minor">Solo Menores (Escolares)</option>
                                            <option value="adult">Solo Adultos</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Estado</label>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 accent-primary" />
                                            <span className="text-sm">Visible para estudiantes</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                                    <Button type="submit">Guardar</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map(opp => (
                        <Card key={opp.id} className={`group relative transition-all p-6 ${!opp.is_active ? 'opacity-70 bg-gray-50' : 'hover:border-primary/30'}`}>
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

                            <div className="mb-4">
                                <Badge variant="gold" className="mb-2">{opp.partner_name}</Badge>
                                <h3 className="font-bold text-lg text-primary leading-tight">{opp.title}</h3>
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
        </Layout>
    )
}
