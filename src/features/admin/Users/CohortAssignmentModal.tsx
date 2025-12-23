import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Modal, ModalFooter } from '../../../components/ui/Modal'

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Gestionar Acceso a Cohortes"
            description={`${userName} (${userRole})`}
            mode="edit"
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-400">Cargando cohortes...</div>
                ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto px-1">
                        {cohorts.map(cohort => (
                            <label key={cohort.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-[#4B3179]"
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

                <ModalFooter
                    onCancel={onClose}
                    onSave={handleSave}
                    saveType="button"
                    saveLabel={saving ? 'Guardando...' : 'Guardar Cambios'}
                    isSaveDisabled={saving || loading}
                />
            </div>
        </Modal>
    )
}
