import { useState } from 'react';
import type { Event, Media } from '../../../types/person';
import { MapPin, Calendar, Baby, Heart, Cross, Plane, Star, Image as ImageIcon, Edit2, Save, X, ImagePlus } from 'lucide-react';
import { Lightbox } from './Lightbox';
import { EventMediaSelector } from './EventMediaSelector';

interface TimelineProps {
    events: Event[];
    media: Media[];
    onUpdateEvent?: (updatedEvent: Event) => void;
    onUpload?: (file: File) => Promise<Media | undefined>;
}

export const Timeline = ({ events, media, onUpdateEvent, onUpload }: TimelineProps) => {
    const [lightboxMedia, setLightboxMedia] = useState<Media | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editDescription, setEditDescription] = useState('');
    const [editMediaIds, setEditMediaIds] = useState<string[]>([]);
    const [showPhotoSelector, setShowPhotoSelector] = useState(false);

    // ... (rest of code)



    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => {
        const yearA = a.date?.year || 0;
        const yearB = b.date?.year || 0;
        return yearA - yearB;
    });

    const getEventIcon = (type: Event['type']) => {
        switch (type) {
            case 'BIRTH': return <Baby className="w-5 h-5 text-white" />;
            case 'DEATH': return <Cross className="w-5 h-5 text-white" />;
            case 'MARRIAGE': return <Heart className="w-5 h-5 text-white" />;
            case 'IMMIGRATION': return <Plane className="w-5 h-5 text-white" />;
            default: return <Star className="w-5 h-5 text-white" />;
        }
    };

    const getEventColor = (type: Event['type']) => {
        return 'bg-indigo-500 border-indigo-100';
    };

    const getEventMedia = (mediaIds?: string[]) => {
        if (!mediaIds || mediaIds.length === 0) return [];
        return media.filter(m => mediaIds.includes(m.id));
    };

    const startEditing = (event: Event) => {
        setEditingEventId(event.id);
        setEditDescription(event.description || '');
        setEditMediaIds(event.mediaIds || []);
        setShowPhotoSelector(false);
    };

    const cancelEditing = () => {
        setEditingEventId(null);
        setEditDescription('');
        setEditMediaIds([]);
        setShowPhotoSelector(false);
    };

    const saveEvent = (originalEvent: Event) => {
        if (onUpdateEvent) {
            onUpdateEvent({
                ...originalEvent,
                description: editDescription,
                mediaIds: editMediaIds
            });
        }
        setEditingEventId(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-8 text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Historia de Vida
            </h2>

            <div className="relative border-l-2 border-indigo-200 ml-3.5 space-y-12 pb-4">
                {sortedEvents.map((event) => {
                    const isEditing = editingEventId === event.id;
                    const displayMedia = isEditing ? getEventMedia(editMediaIds) : getEventMedia(event.mediaIds);

                    return (
                        <div key={event.id} className="relative pl-8 sm:pl-10">
                            {/* Icon Marker */}
                            <div className={`absolute -left-[11px] top-0 h-6 w-6 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${getEventColor(event.type)}`}>
                                {getEventIcon(event.type)}
                            </div>

                            {/* Content Card */}
                            <div className={`flex flex-col gap-3 group p-4 rounded-xl transition-all ${isEditing ? 'bg-indigo-50/50 ring-2 ring-indigo-100' : 'hover:bg-gray-50'}`}>
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                    <div className="w-full">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700">
                                                    {event.type === 'BIRTH' ? 'Nacimiento' :
                                                        event.type === 'DEATH' ? 'Fallecimiento' :
                                                            event.type === 'MARRIAGE' ? 'Matrimonio' :
                                                                event.type === 'IMMIGRATION' ? 'Emigración' : event.type}
                                                </span>
                                                {event.date?.display && (
                                                    <span className="text-sm font-semibold text-gray-500">
                                                        {event.date.display}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Edit Actions */}
                                            {!isEditing && onUpdateEvent && (
                                                <button
                                                    onClick={() => startEditing(event)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Editar evento"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {isEditing ? (
                                            <div className="space-y-3 mt-2">
                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    className="w-full p-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-700 bg-white"
                                                    placeholder="Describe este momento..."
                                                    rows={3}
                                                    autoFocus
                                                />

                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => setShowPhotoSelector(!showPhotoSelector)}
                                                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${showPhotoSelector ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        <ImagePlus className="w-4 h-4" />
                                                        {showPhotoSelector ? 'Ocultar Fotos' : 'Vincular Fotos'}
                                                    </button>
                                                </div>

                                                {showPhotoSelector && (
                                                    <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm animate-fade-in">
                                                        <EventMediaSelector
                                                            availableMedia={media}
                                                            selectedMediaIds={editMediaIds}
                                                            onSelectionChange={setEditMediaIds}
                                                            onUpload={onUpload}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => saveEvent(event)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                    >
                                                        <Save className="w-3.5 h-3.5" />
                                                        Guardar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                {event.description || 'Evento sin descripción'}
                                            </h3>
                                        )}
                                    </div>
                                </div>

                                {/* Location */}
                                {!isEditing && event.location && (
                                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 w-fit px-2 py-1 rounded-md">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                        {event.location.name}
                                    </div>
                                )}

                                {/* Media Gallery */}
                                {displayMedia.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {displayMedia.map((m) => (
                                            <div
                                                key={m.id}
                                                onClick={() => !isEditing && setLightboxMedia(m)}
                                                className={`relative w-24 h-24 rounded-lg overflow-hidden shadow-sm border border-gray-100 ${!isEditing ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                                            >
                                                <img
                                                    src={m.url}
                                                    alt={m.title}
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                                {m.type === 'VIDEO' && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                                                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-black border-b-[4px] border-b-transparent ml-0.5" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Lightbox for Timeline Photos */}
            {lightboxMedia && (
                <Lightbox
                    isOpen={true}
                    onClose={() => setLightboxMedia(null)}
                    media={lightboxMedia}
                />
            )}
        </div>
    );
};
