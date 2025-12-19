import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Layout } from '../../components/ui/Layout'
import { Search, Mail, Sparkles } from 'lucide-react'

type Evidence = Database['public']['Tables']['evidences']['Row'] & {
    profiles: { full_name: string | null } | null
    challenges: { title: string | null } | null
}

export const PartnerShowcase = () => {
    const [evidences, setEvidences] = useState<Evidence[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchShowcase()
    }, [])

    const fetchShowcase = async () => {
        const { data } = await supabase
            .from('evidences')
            .select('*, profiles(full_name), challenges(title)')
            .eq('status', 'validated')
            .order('is_highlighted', { ascending: false })

        if (data) setEvidences(data as any)
        setLoading(false)
    }

    const filtered = evidences.filter(e =>
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.challenges?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleContact = (studentName: string) => {
        alert(`Iniciando contacto con el talento: ${studentName}.`)
    }

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
                <PageHeader title="Talento de Impacto" subtitle="Explora los proyectos destacados de nuestros estudiantes." role="Aliado" roleColor="gold" />

                {/* Search Bar */}
                <div className="relative max-w-xl mx-auto mb-10">
                    <div className="absolute inset-x-0 -bottom-4 h-4 bg-black/10 blur-xl rounded-[50%]"></div>
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/50" size={24} />
                    <input
                        type="text"
                        placeholder="Buscar por proyecto, estudiante o tema..."
                        className="w-full pl-16 pr-6 py-5 rounded-full border-none shadow-2xl shadow-primary/10 bg-white/90 backdrop-blur-xl focus:ring-4 focus:ring-secondary/20 text-lg transition-all outline-none placeholder:text-gray-400 font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? <p className="text-center text-secondary animate-pulse mt-12">Cargando galería...</p> : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map(evidence => (
                            <Card
                                key={evidence.id}
                                luxury={evidence.is_highlighted || false}
                                className={`group flex flex-col h-full hover:-translate-y-2 transition-transform duration-500`}
                            >
                                {/* Image with overlay */}
                                <div className="relative overflow-hidden rounded-xl mb-5 h-64 shadow-inner">
                                    {evidence.media_url ? (
                                        <img
                                            src={evidence.media_url}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            alt="Evidence"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-300">Sin Imagen</div>
                                    )}

                                    {/* Gradient Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <p className="text-white font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                            {evidence.challenges?.title}
                                        </p>
                                    </div>

                                    {evidence.is_highlighted && (
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-accent-gold text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                            <Sparkles size={12} fill="#EBC04C" /> Destacado
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-bold text-secondary uppercase tracking-widest">{evidence.profiles?.full_name || 'Estudiante'}</p>
                                    </div>

                                    <h3 className="font-bold text-lg text-primary mb-3 leading-tight line-clamp-2">{evidence.challenges?.title}</h3>
                                    <p className="text-text-secondary text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">"{evidence.description}"</p>

                                    <div className="mt-auto pt-4 border-t border-gray-100/50 flex items-center justify-between">
                                        <div className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full font-bold">
                                            Impacto: {(evidence.impact_data as any)?.value}
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleContact(evidence.profiles?.full_name || '')} className="!rounded-lg !py-1 !px-3 !text-xs">
                                            <Mail size={14} className="mr-1" /> Contactar
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}
