import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { X } from 'lucide-react'

interface CohortAssignmentModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    userName: string
    userRole: string
}

export const CohortAssignmentModal = ({ isOpen, onClose, userId, userName, userRole }: CohortAssignmentModalProps) => {
    const [cohorts, setCohorts] = useState<any[]>([])
    const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isOpen && userId) {
            fetchData()
        }
    }, [isOpen, userId])

    const fetchData = async () => {
        setLoading(true)
        try {
            // 1. Fetch all cohorts
            const { data: allCohorts } = await supabase.from('cohorts').select('id, name, type').order('created_at', { ascending: false })

            // 2. Fetch current assignments for this user
            const { data: assignments } = await supabase
                .from('cohort_instructors')
                .select('cohort_id')
                .eq('user_id', userId)

            if (allCohorts) setCohorts(allCohorts)
            if (assignments) setSelectedCohortIds(assignments.map(a => a.cohort_id))
        } catch (error) {
            console.error('Error fetching assignments:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleCohort = (cohortId: string) => {
        setSelectedCohortIds(prev =>
            prev.includes(cohortId)
                ? prev.filter(id => id !== cohortId)
                : [...prev, cohortId]
        )
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // 1. Delete all existing assignments for this user
            await supabase.from('cohort_instructors').delete().eq('user_id', userId)

            // 2. Insert new assignments
            if (selectedCohortIds.length > 0) {
                const inserts = selectedCohortIds.map(cohortId => ({
                    user_id: userId,
                    cohort_id: cohortId
                }))
                const { error } = await supabase.from('cohort_instructors').insert(inserts)
                if (error) throw error
            }
            onClose()
        } catch (error) {
            alert('Error guardando asignaciones')
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Gestionar Acceso a Cohortes</h2>
                        <p className="text-sm text-gray-500">{userName} ({userRole})</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Cargando cohortes...</div>
                    ) : (
                        <div className="space-y-2">
                            {cohorts.map(cohort => (
                                <label key={cohort.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedCohortIds.includes(cohort.id)}
                                        onChange={() => toggleCohort(cohort.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">{cohort.name}</div>
                                        <div className="text-xs text-gray-500 uppercase">{cohort.type}</div>
                                    </div>
                                </label>
                            ))}
                            {cohorts.length === 0 && <p className="text-center text-gray-400">No hay cohortes disponibles.</p>}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
