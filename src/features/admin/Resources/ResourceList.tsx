

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ConfirmModal } from '../../../components/ConfirmModal'


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

        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen space-y-6">
            <PageHeader
                title="Biblioteca de Recursos"
                subtitle="Gestiona los retos y herramientas educativas."
                icon={FileText}
            >
                <Button onClick={() => navigate('/admin/resources/new')}>
                    <Plus size={18} className="mr-2" /> Nuevo Recurso
                </Button>
            </PageHeader>

            {/* Standardized Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-gray-300"
                    placeholder="Buscar recursos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(resource => (
                        <Card key={resource.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-[#E8BD47] hover:border-[#E8BD47] group cursor-pointer relative" onClick={() => navigate(`/admin/resources/${resource.id}`)}>
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/resources/${resource.id}`) }}
                                    className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteId(resource.id) }}
                                    className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="p-3 w-fit rounded-xl transition-all duration-300 bg-[#E8BD47]/10 text-[#E8BD47] group-hover:bg-[#E8BD47] group-hover:text-white mb-4">
                                    <FileText size={24} />
                                </div>
                                <h3 className="font-bold text-lg text-[#1B1B3F] mb-1 line-clamp-1">{resource.title}</h3>

                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-bold text-[#E8BD47] bg-[#E8BD47]/10 px-2.5 py-0.5 rounded-full">
                                        {resource.metrics_schema?.length || 0} Métricas
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-2">
                                {resource.base_description || 'Sin descripción disponible.'}
                            </p>
                        </Card>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No se encontraron recursos.</p>
                            <Button variant="secondary" className="mt-4" onClick={() => navigate('/admin/resources/new')}>Crear el primero</Button>
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
    )

}
