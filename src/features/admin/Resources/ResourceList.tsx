import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ConfirmModal } from '../../../components/ConfirmModal'

import { Layout } from '../../../components/ui/Layout'

export const ResourceList = () => {
    const navigate = useNavigate()
    const [resources, setResources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => { fetchResources() }, [])

    const fetchResources = async () => {
        setLoading(true)
        const { data } = await supabase.from('resource_library').select('*').order('created_at', { ascending: false })
        if (data) setResources(data)
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        await supabase.from('resource_library').delete().eq('id', deleteId)
        setDeleteId(null)
        fetchResources()
    }

    const filtered = resources.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <Layout>
            <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">


                <PageHeader
                    title="Biblioteca de Recursos"
                    subtitle="Gestiona los retos y herramientas educativas."
                    role="Architect"
                    roleColor="purple"
                />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Buscar recursos..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => navigate('/admin/resources/new')}>
                        <Plus size={18} /> Nuevo Recurso
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Cargando biblioteca...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(resource => (
                            <Card key={resource.id} className="group hover:border-primary/30 transition-all cursor-pointer p-6" onClick={() => navigate(`/admin/resources/${resource.id}`)}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/resources/${resource.id}`) }}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteId(resource.id) }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-primary mb-2 line-clamp-1">{resource.title}</h3>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-4 h-10">
                                    {resource.base_description || 'Sin descripción...'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-text-secondary bg-gray-50 p-2 rounded-lg">
                                    <span className="font-bold">Métricas:</span>
                                    {resource.metrics_schema?.length || 0} campos definidos
                                </div>
                            </Card>
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-gray-400">No se encontraron recursos.</p>
                            </div>
                        )}
                    </div>
                )}

                <ConfirmModal
                    isOpen={!!deleteId}
                    title="Eliminar Recurso"
                    message="Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este recurso?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />
            </div>
        </Layout>
    )
}
