import type { Database } from '../lib/database.types'
import { get, set, del } from 'idb-keyval'

export type OfflineEvidence = Omit<Database['public']['Tables']['evidences']['Insert'], 'status'> & {
    localId: string
    // Store the file blob directly if available for offline mock
    mediaBlob?: Blob
    status: 'draft' // offline items are always draft until synced
    timestamp: number
}

const QUEUE_KEY = 'adaptaton_offline_queue'

export const getQueue = async (): Promise<OfflineEvidence[]> => {
    const queue = await get<OfflineEvidence[]>(QUEUE_KEY)
    return queue || []
}

export const addToQueue = async (evidence: OfflineEvidence) => {
    const queue = await getQueue()
    queue.push(evidence)
    await set(QUEUE_KEY, queue)
}

export const removeFromQueue = async (localId: string) => {
    const queue = await getQueue()
    const newQueue = queue.filter(item => item.localId !== localId)
    await set(QUEUE_KEY, newQueue)
}

export const clearQueue = async () => {
    await del(QUEUE_KEY)
}

