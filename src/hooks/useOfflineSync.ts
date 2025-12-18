import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getQueue, removeFromQueue } from '../services/offlineStorage'

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

    // Auto-sync when online
    useEffect(() => {
        if (isOnline) {
            syncQueue()
        }
    }, [isOnline])

    const syncQueue = async () => {
        if (isSyncing) return
        setIsSyncing(true)

        try {
            const queue = await getQueue()
            if (queue.length === 0) {
                setIsSyncing(false)
                return
            }

            console.log(`Syncing ${queue.length} items...`)

            for (const item of queue) {
                try {
                    let finalMediaUrl = item.media_url

                    // 1. Upload Media if blob exists
                    if (item.mediaBlob) {
                        const fileExt = item.mediaBlob.type.split('/')[1] || 'jpg'
                        const fileName = `${item.user_id}/${item.timestamp}.${fileExt}`

                        const { error: uploadError } = await supabase.storage
                            .from('evidence-media')
                            .upload(fileName, item.mediaBlob)

                        if (uploadError) {
                            console.error('Upload failed for item', item.localId, uploadError)
                            continue // Skip this item, try next, leave in queue
                        }

                        const { data: { publicUrl } } = supabase.storage
                            .from('evidence-media')
                            .getPublicUrl(fileName)

                        finalMediaUrl = publicUrl
                    }

                    // 2. Insert Evidence
                    const { error } = await supabase.from('evidences').insert({
                        challenge_id: item.challenge_id,
                        user_id: item.user_id,
                        description: item.description,
                        impact_data: item.impact_data,
                        gps_coords: item.gps_coords,
                        media_url: finalMediaUrl,
                        status: 'submitted'
                    })

                    if (!error) {
                        await removeFromQueue(item.localId)
                    } else {
                        console.error('Sync insert failed for item', item.localId, error)
                    }
                } catch (e) {
                    console.error('Sync Exception for item', item.localId, e)
                }
            }
        } catch (e) {
            console.error('Queue access error', e)
        } finally {
            setIsSyncing(false)
        }
    }

    return { isOnline, isSyncing, syncQueue }
}
