import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { set, values } from 'idb-keyval'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Camera, MapPin, Loader2, Wifi, WifiOff, UploadCloud, ArrowLeft } from 'lucide-react'
import type { Database } from '../../lib/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']

export const CaptureEvidence = () => {
    const { session } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Query Params
    const courseId = searchParams.get('courseId')
    const activityId = searchParams.get('activityId')
    const isRetry = searchParams.get('retry') === 'true'

    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [targetActivity, setTargetActivity] = useState<any>(null)

    // Form State
    const [description, setDescription] = useState('')
    const [selectedChallenge, setSelectedChallenge] = useState<string>('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)

    // UI State
    const [loading, setLoading] = useState(false)
    const [statusMsg, setStatusMsg] = useState('')
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [pendingUploads, setPendingUploads] = useState(0)

    useEffect(() => {
        if (activityId) {
            fetchTargetActivity()
        } else {
            fetchChallenges()
        }

        // Online/Offline listeners
        window.addEventListener('online', () => setIsOnline(true))
        window.addEventListener('offline', () => setIsOnline(false))
        checkPendingUploads()

        return () => {
            window.removeEventListener('online', () => setIsOnline(true))
            window.removeEventListener('offline', () => setIsOnline(false))
        }
    }, [activityId])

    const fetchTargetActivity = async () => {
        if (!activityId) return

        // 1. Try Local Storage first (Offline/Sync data)
        const storedActivities = localStorage.getItem('offline_activities')
        if (storedActivities) {
            const parsed = JSON.parse(storedActivities)
            const found = parsed.find((a: any) => a.id === activityId)
            if (found) {
                setTargetActivity(found)
                console.log('Loaded activity from cache')
                return
            }
        }

        // 2. Fallback to API if online
        if (isOnline) {
            const { data } = await supabase
                .from('course_activities' as any)
                .select('*, resource:resource_library(*)')
                .eq('id', activityId)
                .single()
            if (data) setTargetActivity(data)
        }
    }

    const fetchChallenges = async () => {
        const { data } = await supabase.from('challenges').select('*')
        if (data) setChallenges(data)
    }

    const checkPendingUploads = async () => {
        const entries = await values()
        // Filter for evidence entries (simple check)
        const pending = entries.filter((e: any) => e.type === 'evidence_submission').length
        setPendingUploads(pending)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const getLocation = () => {
        setLoading(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    setLoading(false)
                },
                (error) => {
                    console.error(error)
                    alert('No pudimos obtener tu ubicación. Asegúrate de dar permisos.')
                    setLoading(false)
                }
            )
        } else {
            alert('Geolocalización no soportada en este navegador.')
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation Logic
        if (!description) {
            alert('Por favor agrega una descripción.')
            return
        }
        if (!activityId && !selectedChallenge) {
            alert('Por favor selecciona una misión.')
            return
        }

        setLoading(true)
        setStatusMsg('Procesando...')

        try {
            const evidenceData = {
                id: crypto.randomUUID(),
                user_id: session?.user.id,
                challenge_id: activityId ? null : selectedChallenge, // Null if it's a course activity
                course_activity_id: activityId || null, // New field!
                description,
                location,
                timestamp: new Date().toISOString(),
                status: 'submitted',
                type: 'evidence_submission', // Tag for IDB
                imageBlob: imageFile, // Store file for offline
                parent_evidence_id: undefined as string | undefined // Will be filled if retry
            }

            // Retry Logic: Find previous rejected evidence
            if (isRetry && activityId) {
                // Try to find it in IDB or query supabase if online? 
                // Simplest is to check offline cache or Supabase
                // But for now, let's just assume we might need to fetch it or finding it is complex without more context.
                // ACTUALLY, strict business rule: "Nuevo Intento" links to parent.
                // We will try to fetch the latest rejected evidence for this activity.
                if (isOnline) {
                    const { data: prev } = await supabase.from('evidences')
                        .select('id')
                        .eq('course_activity_id', activityId)
                        .eq('user_id', session!.user.id)
                        .eq('status', 'rejected')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()

                    if (prev) evidenceData.parent_evidence_id = prev.id
                }
            }

            if (isOnline) {
                // 1. Upload Image
                let mediaUrl = null
                if (imageFile) {
                    const fileName = `${session?.user.id}/${Date.now()}_${imageFile.name}`
                    const { error: uploadError } = await supabase.storage
                        .from('evidence-media')
                        .upload(fileName, imageFile)

                    if (uploadError) throw uploadError

                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage.from('evidence-media').getPublicUrl(fileName)
                    mediaUrl = publicUrl
                }

                // 2. Insert Record
                const { error: insertError } = await supabase.from('evidences').insert({
                    user_id: session!.user.id,
                    challenge_id: activityId ? null : selectedChallenge,
                    course_activity_id: activityId || null,
                    description,
                    media_url: mediaUrl,
                    location: location as any,
                    parent_evidence_id: evidenceData.parent_evidence_id || null, // Link if retry
                    impact_data: { value: 0, source: 'manual_verification' } // Default 0 until validated
                })

                if (insertError) throw insertError
                setStatusMsg('¡Evidencia enviada exitosamente!')

                // Redirect back
                setTimeout(() => {
                    if (courseId) navigate(`/student/course/${courseId}`)
                    else navigate('/student')
                }, 2000)

            } else {
                // SAVE OFFLINE
                await set(`evidence-${Date.now()}`, evidenceData)
                setStatusMsg('Guardado localmente. Se subirá cuando tengas internet.')
                checkPendingUploads()
                setTimeout(() => {
                    if (courseId) navigate(`/student/course/${courseId}`)
                    else navigate('/student')
                }, 2000)
            }

        } catch (error: any) {
            console.error(error)
            setStatusMsg('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 md:pb-6">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                <ArrowLeft size={18} /> Cancelar y Volver
            </button>

            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Camera size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Capturar Evidencia</h1>
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className={`flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-orange-500'}`}>
                            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {isOnline ? 'Online' : 'Modo Offline Activado'}
                        </span>
                        {pendingUploads > 0 && (
                            <span className="text-orange-500 flex items-center gap-1">
                                • <UploadCloud size={12} /> {pendingUploads} pendientes
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                {/* Image Preview / Camera Input */}
                <div className="bg-gray-100 border-b border-gray-200 min-h-[250px] relative flex flex-col items-center justify-center group">
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} alt="Preview" className="w-full h-[300px] object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold border border-white/50 hover:bg-white/30 transition-all">
                                    Cambiar Foto
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                        </>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-3 p-8 transition-transform hover:scale-105 active:scale-95">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                                <Camera size={32} className="text-primary" />
                            </div>
                            <span className="text-text-secondary font-medium">Tocar para tomar foto</span>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Location Badge */}
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-sm">
                        <MapPin size={16} className="shrink-0" />
                        {location ? (
                            <span>Ubicación detectada: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                        ) : (
                            <button
                                type="button"
                                onClick={getLocation}
                                className="text-blue-800 font-medium hover:underline"
                            >
                                Detectar ubicación GPS
                            </button>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* If Activity ID is present, we show the locked info, otherwise selector */}
                        {targetActivity ? (
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">Entregando para:</span>
                                <h3 className="font-bold text-lg text-gray-800">{targetActivity.resource?.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{targetActivity.custom_instructions || targetActivity.resource?.base_description}</p>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Selecciona el Reto</label>
                                <select
                                    value={selectedChallenge}
                                    onChange={(e) => setSelectedChallenge(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="">-- Seleccionar Misión --</option>
                                    {challenges.map(c => (
                                        <option key={c.id} value={c.id}>{c.title} ({c.points} pts)</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2">Descripción</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary outline-none transition-all h-24 resize-none"
                                placeholder="Describe qué lograste con esta evidencia..."
                            />
                        </div>
                    </div>

                    <Button
                        fullWidth
                        size="lg"
                        onClick={handleSubmit}
                        disabled={loading || !imageFile || (!activityId && !selectedChallenge)}
                        className={statusMsg.includes('Guardado localmente') ? '!bg-orange-500' : ''}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : statusMsg || 'Enviar Evidencia'}
                    </Button>
                    {statusMsg && <p className="text-center text-sm font-bold mt-3 text-primary animate-pulse">{statusMsg}</p>}
                </form>
            </Card>
        </div>
    )
}
