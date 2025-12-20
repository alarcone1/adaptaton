import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Plus, Trash2, Save, FileText, Layout, GripVertical, ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'

type MetricType = 'number' | 'text' | 'photo' | 'gps'

interface MetricField {
    id: string
    label: string
    type: MetricType
    required: boolean
}

export const ResourceBuilder = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [resourceUrl, setResourceUrl] = useState('')
    const [metrics, setMetrics] = useState<MetricField[]>([])
    const [msg, setMsg] = useState('')

    useEffect(() => {
        if (id) {
            fetchResource(id)
        }
    }, [id])

    const fetchResource = async (resourceId: string) => {
        setLoading(true)
        const { data, error } = await supabase.from('resource_library').select('*').eq('id', resourceId).single()
        if (data) {
            setTitle(data.title)
            setDescription(data.base_description || '')
            setResourceUrl(data.resource_url || '')
            if (data.metrics_schema && Array.isArray(data.metrics_schema)) {
                setMetrics(data.metrics_schema as MetricField[])
            }
        }
        setLoading(false)
    }

    const addMetric = () => {
        setMetrics([...metrics, { id: crypto.randomUUID(), label: '', type: 'number', required: true }])
    }

    const removeMetric = (index: number) => {
        const newMetrics = [...metrics]
        newMetrics.splice(index, 1)
        setMetrics(newMetrics)
    }

    const updateMetric = (index: number, field: keyof MetricField, value: any) => {
        const newMetrics = [...metrics]
        newMetrics[index] = { ...newMetrics[index], [field]: value }
        setMetrics(newMetrics)
    }

    const handleSave = async () => {
        if (!title) return alert('El título es obligatorio')
        setLoading(true)
        const payload = {
            title,
            base_description: description,
            resource_url: resourceUrl,
            metrics_schema: metrics as any // Casting for JSONB compatibility
        }

        let error
        if (id) {
            const { error: err } = await supabase.from('resource_library').update(payload).eq('id', id)
            error = err
        } else {
            const { error: err } = await supabase.from('resource_library').insert(payload)
            error = err
        }

        setLoading(false)
        if (error) {
            setMsg('Error: ' + error.message)
        } else {
            setMsg('Recurso guardado exitosamente')
            setTimeout(() => navigate('/admin/resources'), 1500)
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
            <button onClick={() => navigate('/admin/resources')} className="flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition-colors">
                <ArrowLeft size={18} /> Volver a Recursos
            </button>

            <PageHeader
                title={id ? 'Editar Recurso' : 'Nuevo Recurso'}
                subtitle="Diseña la estructura del reto y los datos a recolectar."
                role="Architect"
                roleColor="purple"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 sticky top-6">
                        <h3 className="font-bold text-lg mb-4 text-primary">Información Básica</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Título del Recurso</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej: Reciclaje Móvil"
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Descripción / Instrucciones</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Instrucciones para el estudiante..."
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">URL del Recurso (PDF/Video)</label>
                                <input
                                    value={resourceUrl}
                                    onChange={e => setResourceUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Metrics Constructor */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                                    <Layout size={20} /> Constructor de Métricas
                                </h3>
                                <p className="text-sm text-text-secondary">Define qué datos debe capturar el estudiante.</p>
                            </div>
                            <Button size="sm" onClick={addMetric} variant="outline" className="border-dashed border-primary text-primary hover:bg-primary/5">
                                <Plus size={16} /> Agregar Campo
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {metrics.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                                    <FileText size={40} className="mx-auto mb-2 opacity-30" />
                                    <p>No hay métricas definidas.</p>
                                    <p className="text-sm">Agrega campos para recolectar datos.</p>
                                </div>
                            )}

                            {metrics.map((metric, index) => (
                                <div key={metric.id} className="group flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/30 transition-all animate-in slide-in-from-bottom-2">
                                    <div className="mt-3 text-gray-300 cursor-move">
                                        <GripVertical size={20} />
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-text-secondary uppercase">Etiqueta del Campo</label>
                                            <input
                                                value={metric.label}
                                                onChange={e => updateMetric(index, 'label', e.target.value)}
                                                placeholder="Ej: Cantidad de Kilos"
                                                className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-text-secondary uppercase">Tipo de Dato</label>
                                            <select
                                                value={metric.type}
                                                onChange={e => updateMetric(index, 'type', e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                                            >
                                                <option value="number">Número (123)</option>
                                                <option value="text">Texto (Abierto)</option>
                                                <option value="photo">Foto Evidencia</option>
                                                <option value="gps">Ubicación GPS</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 pt-1">
                                        <label className="flex items-center gap-2 text-xs cursor-pointer select-none px-2 py-1 rounded hover:bg-gray-200/50">
                                            <input
                                                type="checkbox"
                                                checked={metric.required}
                                                onChange={e => updateMetric(index, 'required', e.target.checked)}
                                                className="rounded text-primary focus:ring-primary"
                                            />
                                            Required
                                        </label>
                                        <button
                                            onClick={() => removeMetric(index)}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={loading} size="lg" className="shadow-lg shadow-primary/20">
                            {loading ? 'Guardando...' : <><Save size={18} /> Guardar Recurso</>}
                        </Button>
                    </div>
                    {msg && (
                        <div className={`p-4 rounded-xl text-center font-bold ${msg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {msg}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
