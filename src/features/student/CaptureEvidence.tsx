import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addToQueue } from '../../services/offlineStorage'
import { useAuth } from '../../lib/AuthContext'
import { useOfflineSync } from '../../hooks/useOfflineSync'
import { supabase } from '../../lib/supabase'

export const CaptureEvidence = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { isOnline } = useOfflineSync()
    const [challengeId, setChallengeId] = useState('')
    const [challenges, setChallenges] = useState<{ id: string, title: string }[]>([])
    const [impactValue, setImpactValue] = useState('')
    const [description, setDescription] = useState('')
    const [statusMsg, setStatusMsg] = useState('')

    // Media
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const [fileToUpload, setFileToUpload] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        // Fetch challenges for select
        supabase.from('challenges').select('id, title').then(({ data }) => {
            if (data) setChallenges(data)
        })
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileToUpload(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !challengeId) return

        setIsSubmitting(true)

        // Get Location
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const evidenceData = {
                    challenge_id: challengeId,
                    user_id: user.id,
                    description,
                    impact_data: { value: parseInt(impactValue) },
                    gps_coords: { lat: pos.coords.latitude, long: pos.coords.longitude },
                    status: 'draft' as const,
                    localId: crypto.randomUUID(),
                    timestamp: Date.now()
                }

                try {
                    if (isOnline) {
                        setStatusMsg('Subiendo foto...')
                        let mediaUrl = null

                        if (fileToUpload) {
                            const fileExt = fileToUpload.name.split('.').pop()
                            const fileName = `${user.id}/${Date.now()}.${fileExt}`

                            const { error: uploadError } = await supabase.storage
                                .from('evidence-media')
                                .upload(fileName, fileToUpload)

                            if (uploadError) throw uploadError

                            const { data: { publicUrl } } = supabase.storage
                                .from('evidence-media')
                                .getPublicUrl(fileName)

                            mediaUrl = publicUrl
                        }

                        setStatusMsg('Guardando evidencia...')
                        const { error } = await supabase.from('evidences').insert({
                            ...evidenceData,
                            status: 'submitted',
                            media_url: mediaUrl,
                            // Type casting for strict DB types vs local convenience
                            description: evidenceData.description,
                            impact_data: evidenceData.impact_data as any,
                            gps_coords: evidenceData.gps_coords as any,
                        })

                        if (error) throw error

                        alert('¡Evidencia enviada con éxito!')
                        navigate('/student')

                    } else {
                        // Save to Queue
                        setStatusMsg('Guardando en dispositivo...')

                        await addToQueue({
                            ...evidenceData,
                            // @ts-ignore
                            gps_coords: evidenceData.gps_coords,
                            impact_data: evidenceData.impact_data as any,
                            status: 'draft',
                            mediaBlob: fileToUpload || undefined
                        })

                        alert('Guardado en dispositivo. Se subirá cuando tengas conexión.')
                        navigate('/student')
                    }
                } catch (error: any) {
                    console.error('Error submitting:', error)
                    alert('Error: ' + error.message)
                    setStatusMsg('')
                } finally {
                    setIsSubmitting(false)
                }
            },
            (err) => {
                setIsSubmitting(false)
                alert('Necesitamos tu ubicación para validar el impacto. ' + err.message)
            }
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-primary">Capturar Evidencia</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Reto</label>
                    <select
                        value={challengeId}
                        onChange={(e) => setChallengeId(e.target.value)}
                        className="w-full p-3 bg-surface border border-gray-200 rounded-xl"
                        required
                    >
                        <option value="">Selecciona un reto...</option>
                        {challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Foto del Impacto</label>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20"
                    />
                    {preview && (
                        <div className="mt-2 relative">
                            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Impacto (Cantidad)</label>
                    <input
                        type="number"
                        value={impactValue}
                        onChange={(e) => setImpactValue(e.target.value)}
                        placeholder="Ej: 10 (Kilos, Árboles, etc)"
                        className="w-full p-3 bg-surface border border-gray-200 rounded-xl text-lg font-bold text-primary"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Historia</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Cuéntanos cómo fue la experiencia..."
                        className="w-full p-3 bg-surface border border-gray-200 rounded-xl h-24"
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Procesando...' : (isOnline ? 'Enviar Evidencia' : 'Guardar (Offline)')}
                    </button>
                    {statusMsg && <p className="text-center text-sm text-primary mt-2">{statusMsg}</p>}
                </div>
            </form>
        </div>
    )
}
