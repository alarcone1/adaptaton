import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { Modal, ModalFooter } from '../../components/ui/Modal'

import { Briefcase, Building2, MapPin, Calendar, ArrowUpRight, Rocket } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

export const StudentOpportunities = () => {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOpp, setSelectedOpp] = useState<any>(null)

    // Mock Data (Replace with DB fetch if needed later)
    const opportunities = [
        {
            id: 1,
            title: "Pasantía en Desarrollo Sostenible",
            partner: "Fundación Canal del Dique",
            location: "Cartagena, Bolívar",
            type: "Práctica",
            date: "Inicio: Feb 2025",
            tags: ["Medio Ambiente", "Social"]
        },
        {
            id: 2,
            title: "Voluntariado: Alfabetización Digital",
            partner: "Alcaldía de Turbaco",
            location: "Turbaco, Bolívar",
            type: "Voluntariado",
            date: "Inmediato",
            tags: ["Educación", "Tecnología"]
        },
        {
            id: 3,
            title: "Auxiliar de Investigación",
            partner: "Grupo de Investigación UdeC",
            location: "Remoto / Híbrido",
            type: "Investigación",
            date: "Marzo 2025",
            tags: ["Academia", "Ciencia de Datos"]
        }
    ]

    const handleApply = async (_oppId: number, partnerName: string) => {
        if (!user) return

        // Simulate creating a lead
        try {
            // Check if user is partner to simulate (or just use admin/student logic)
            // Ideally we insert into a 'leads' table

            // For now just UX feedback
            alert(`¡Solicitud enviada a ${partnerName}! Te contactarán pronto.`)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <PageHeader
                title="Oportunidades"
                subtitle="Conecta con el ecosistema productivo."
                icon={Rocket}
            />

            {/* Search and Filter (Visual only for now) */}
            <div className="flex gap-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Buscar pasantías, becas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Briefcase size={18} />
                    </div>
                </div>
                <Button variant="outline" className="hidden md:flex">Filtrar</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {opportunities.map(opp => (
                    <Card
                        key={opp.id}
                        onClick={() => setSelectedOpp(opp)}
                        className="flex flex-col group relative overflow-hidden transition-all duration-300 border-t-4 border-t-[#4B3179] hover:border-[#4B3179] hover:shadow-xl hover:scale-[1.02] cursor-pointer p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-purple-50 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <Building2 size={24} />
                            </div>
                            <Badge variant="purple">{opp.type}</Badge>
                        </div>

                        <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-primary transition-colors">{opp.title}</h3>
                        <p className="text-sm text-text-secondary font-medium mb-4">{opp.partner}</p>

                        <div className="space-y-2 mb-6 flex-grow">
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <MapPin size={14} /> {opp.location}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <Calendar size={14} /> {opp.date}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {opp.tags.map(tag => (
                                <span key={tag} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md font-medium text-gray-600">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Visual indicator that it's clickable */}
                        <div className="mt-auto text-xs font-bold text-[#4B3179] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver Detalles <ArrowUpRight size={14} />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal for Details */}
            <Modal
                isOpen={!!selectedOpp}
                onClose={() => setSelectedOpp(null)}
                title={selectedOpp?.title || ''}
                description={selectedOpp?.partner || ''}
            >
                <div>
                    <div className="flex gap-4 mb-6">
                        <div className="p-4 bg-purple-50 rounded-2xl text-primary">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <Badge variant="purple" className="mb-2 inline-block">
                                {selectedOpp?.type}
                            </Badge>
                            <h4 className="font-bold text-gray-800">Detalles de la Oportunidad</h4>
                            <p className="text-sm text-gray-500">{selectedOpp?.location}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                        <h5 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Información</h5>
                        <p className="text-gray-700 leading-relaxed">
                            Esta es una gran oportunidad para desarrollar tus habilidades en {selectedOpp?.tags.join(', ')}.
                            La organización {selectedOpp?.partner} busca estudiantes comprometidos.
                        </p>
                    </div>

                    <ModalFooter
                        onCancel={() => setSelectedOpp(null)}
                        saveLabel="Aplicar Ahora"
                        onSave={() => {
                            handleApply(selectedOpp.id, selectedOpp.partner)
                            setSelectedOpp(null)
                        }}
                    />
                </div>
            </Modal>
        </div>
    )
}
