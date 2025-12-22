import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getQueue, removeFromQueue, updateQueueItem } from '../services/offlineStorage'
import { useToast } from '../lib/ToastContext'

export const useOfflineSync = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        const handleStatusChange = () => {
            setIsOnline(navigator.onLine)
        }

        window.addEventListener('online', handleStatusChange)
        window.addEventListener('offline', handleStatusChange)

        return () => {
            window.removeEventListener('online', handleStatusChange)
            window.removeEventListener('offline', handleStatusChange)
        }
    }, [])

    const { addToast } = useToast()
    const MAX_RETRIES = 3

    // Auto-sync when online
    useEffect(() => {
        if (isOnline) {
            syncQueue()
        }
    }, [isOnline])

    const syncQueue = async () => {
        if (isSyncing) return

        const queue = await getQueue()
        if (queue.length === 0) return

        setIsSyncing(true)
        addToast(`Sincronizando ${queue.length} evidencias pendientes...`, 'info')

        let successCount = 0
        let errorCount = 0

        try {
            for (const item of queue) {
                // Skip if max retries exceeded
                if ((item.retryCount || 0) >= MAX_RETRIES) {
                    console.warn(`Item ${item.localId} exceeded max retries. Skipping.`)
                    continue
                }

                try {
                    let finalMediaUrl = item.media_url

                    // 1. Upload Media if blob exists and no URL yet
                    if (item.mediaBlob && !finalMediaUrl) {
                        const fileExt = item.mediaBlob.type.split('/')[1] || 'jpg'
                        const fileName = `${item.user_id}/${item.timestamp}.${fileExt}`

                        // Check if file exists? Skip for now to save requests, overwrite is fine or check error
                        const { error: uploadError } = await supabase.storage
                            .from('evidence-media')
                            .upload(fileName, item.mediaBlob, { upsert: true })

                        if (uploadError) {
                            throw new Error(`Upload failed: ${uploadError.message}`)
                        }

                        const { data: { publicUrl } } = supabase.storage
                            .from('evidence-media')
                            .getPublicUrl(fileName)

                        finalMediaUrl = publicUrl

                        // Update local item with URL immediately so we don't re-upload if insert fails
                        item.media_url = finalMediaUrl
                        // We need to update the item in queue here to persist the URL
                        // However, we are in a loop. We will update it if insert fails below.
                    }

                    // 2. Insert Evidence
                    const { error } = await supabase.from('evidences').insert({
                        challenge_id: item.challenge_id || null,
                        course_activity_id: item.course_activity_id || null,
                        parent_evidence_id: item.parent_evidence_id || null,
                        attempt_number: item.attempt_number || 1,
                        user_id: item.user_id,
                        description: item.description,
                        impact_data: item.impact_data,
                        gps_coords: item.gps_coords,
                        media_url: finalMediaUrl,
                        status: 'submitted'
                    })

                    if (error) throw new Error(`Insert failed: ${error.message}`)

                    // Success
                    await removeFromQueue(item.localId)
                    successCount++

                } catch (e: any) {
                    console.error('Sync Exception for item', item.localId, e)
                    errorCount++

                    // Update retry count
                    const newRetryCount = (item.retryCount || 0) + 1
                    await updateQueueItem({
                        ...item,
                        retryCount: newRetryCount,
                        lastError: e.message
                    })
                }
            }

            if (successCount > 0) {
                addToast(`Sincronización completada: ${successCount} evidencias subidas.`, 'success')
            }
            if (errorCount > 0) {
                addToast(`Hubo errores en ${errorCount} evidencias. Se reintentarán luego.`, 'error')
            }

        } catch (e) {
            console.error('Queue access error', e)
        } finally {
            setIsSyncing(false)
        }
    }

    return { isOnline, isSyncing, syncQueue }
}
