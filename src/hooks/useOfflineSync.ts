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

        const queue = getQueue()
        if (queue.length === 0) {
            setIsSyncing(false)
            return
        }

        console.log(`Syncing ${queue.length} items...`)

        for (const item of queue) {
            try {
                // 1. Upload Media if needed (Base64 -> File conversion logic needed here if stored as string)
                // For 'media_url', if it's a blob/base64, we need to upload to storage first.
                // Assuming item.media_url is a placeholder or Base64.

                let finalMediaUrl = item.media_url

                // TODO: Handle Image Upload from Offline Data

                // 2. Insert Evidence
                const { error } = await supabase.from('evidences').insert({
                    challenge_id: item.challenge_id,
                    user_id: item.user_id,
                    description: item.description,
                    impact_data: item.impact_data,
                    gps_coords: item.gps_coords,
                    media_url: finalMediaUrl,
                    status: 'submitted' // Auto-submit when synced? Or draft?
                })

                if (!error) {
                    removeFromQueue(item.localId)
                } else {
                    console.error('Sync failed for item', item.localId, error)
                }
            } catch (e) {
                console.error('Sync Exception', e)
            }
        }

        setIsSyncing(false)
    }

    return { isOnline, isSyncing, syncQueue }
}
