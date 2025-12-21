import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { useOfflineSync } from './useOfflineSync'

export const useAutoSync = () => {
    const { session, role } = useAuth()
    const { isOnline } = useOfflineSync()
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncMessage, setSyncMessage] = useState('')

    useEffect(() => {
        if (session && isOnline && role === 'student') {
            runSilentSync()
        }
    }, [session, isOnline, role])

    const runSilentSync = async () => {
        if (isSyncing) return
        setIsSyncing(true)
        setSyncMessage('Sincronizando recursos...')

        try {
            // 1. Get my active enrollments
            const { data: enrollments, error: enrollError } = await supabase
                .from('course_enrollments')
                .select('course_id')
                .eq('student_id', session!.user.id)
                .eq('status', 'active')

            if (enrollError || !enrollments || enrollments.length === 0) {
                console.log('Sync: No active courses found.')
                return
            }

            const courseIds = enrollments.map(e => e.course_id)
            localStorage.setItem('offline_courses', JSON.stringify(courseIds))

            // 2. Get Activities for these courses
            const { data: activities, error: actError } = await supabase
                .from('course_activities')
                .select('*, resource:resource_library(*)')
                .in('course_id', courseIds)
                .order('sequence_order', { ascending: true })

            if (actError) throw actError

            // Store activities
            localStorage.setItem('offline_activities', JSON.stringify(activities || []))

            // 3. Extract and Store Resources (Metrics Schemas)
            // We store a map: resourceId -> ResourceObject (with metrics_schema)
            const resourcesMap: Record<string, any> = {}
            activities?.forEach((act: any) => {
                if (act.resource) {
                    resourcesMap[act.resource.id] = act.resource
                    // Also map by activityId for faster lookup in CaptureEvidence
                    // But CaptureEvidence usually knows activityId -> resourceId? 
                    // No, CaptureEvidence usually takes activityId. So we should store activity details.
                }
            })

            localStorage.setItem('offline_resources', JSON.stringify(resourcesMap))

            setSyncMessage('Listo para campo 🌳')

            // Hide message after 5 seconds
            setTimeout(() => {
                setSyncMessage('')
            }, 5000)

        } catch (error) {
            console.error('Silent Sync Error:', error)
            setSyncMessage('Error sincronizando')
        } finally {
            setIsSyncing(false)
        }
    }

    return { isSyncing, syncMessage }
}
