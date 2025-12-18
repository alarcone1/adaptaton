import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in React Leaflet
// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Type intersection to include joined Challenge data
type EvidenceWithChallenge = Database['public']['Tables']['evidences']['Row'] & {
    challenges: { title: string } | null
}

export const ImpactMap = () => {
    const [points, setPoints] = useState<EvidenceWithChallenge[]>([])

    useEffect(() => {
        // Fetch only validated evidences with location data
        supabase
            .from('evidences')
            .select(`*, challenges(title)`)
            .eq('status', 'validated')
            .not('gps_coords', 'is', null)
            .then(({ data }) => {
                if (data) setPoints(data as EvidenceWithChallenge[])
            })
    }, [])

    return (
        <div className="h-[calc(100vh-64px)] w-full">
            <div className="absolute top-20 left-4 z-[1000] bg-white p-4 rounded shadow-lg max-w-xs">
                <h2 className="font-bold text-lg text-primary">Mapa de Impacto</h2>
                <p className="text-sm">Explora las evidencias validadas de nuestros estudiantes.</p>
            </div>

            <MapContainer center={[10.391, -75.479]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {points.map(pt => {
                    const coords = pt.gps_coords as { lat: number; lng: number } | null
                    if (!coords || !coords.lat || !coords.lng) return null

                    return (
                        <Marker key={pt.id} position={[coords.lat, coords.lng]}>
                            <Popup>
                                <strong className="text-primary">{pt.challenges?.title || 'Desafío'}</strong>
                                <br />
                                {pt.description}
                                {pt.media_url && <img src={pt.media_url} alt="evidencia" className="mt-2 text-xs w-full object-cover rounded" />}
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    )
}
