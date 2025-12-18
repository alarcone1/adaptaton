import type { Database } from '../lib/database.types'

export type OfflineEvidence = Database['public']['Tables']['evidences']['Insert'] & {
    localId: string
    localMediaFile?: string // Base64 string for photo if needed, or Blob stored in IndexedDB. For MVP, localStorage Base64 limit is tight.
    // Better use IndexedDB for images? 
    // For MVP rapid dev: allow small images or specific IDB library 'idb-keyval'.
    // Let's assume for now we store metadata in LS and maybe image in IDB or just Base64 if small.
    // We will simple store 'file' as null in queue and handle file separately? 
    // Let's use specific helper for images.
    timestamp: number
}

const QUEUE_KEY = 'adaptaton_offline_queue'

export const getQueue = (): OfflineEvidence[] => {
    const str = localStorage.getItem(QUEUE_KEY)
    return str ? JSON.parse(str) : []
}

export const addToQueue = (evidence: OfflineEvidence) => {
    const queue = getQueue()
    queue.push(evidence)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export const removeFromQueue = (localId: string) => {
    const queue = getQueue()
    const newQueue = queue.filter(item => item.localId !== localId)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue))
}

export const clearQueue = () => {
    localStorage.removeItem(QUEUE_KEY)
}
