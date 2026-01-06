import { useState } from 'react';
import { User, Image as ImageIcon, Upload, Wand2, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { Lightbox } from './Lightbox';
import type { Media } from '../../../types/person';

interface GalleryProps {
    media: Media[];
    onSetProfilePhoto?: (url: string) => void;
    onSetCoverPhoto?: (url: string) => void;
    driveFolderId?: string;
    onUpload?: (file: File) => Promise<void>;
    onUpload?: (file: File) => Promise<void>;
    onAnalyze?: (media: Media) => Promise<void>;
    onDelete?: (media: Media) => Promise<void>;
    onUpdateMedia?: (media: Media) => Promise<void>;
}

export const Gallery = ({ media, onSetProfilePhoto, onSetCoverPhoto, driveFolderId, onUpload, onAnalyze, onDelete, onUpdateMedia }: GalleryProps) => {
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !driveFolderId || !onUpload) return;

        try {
            await onUpload(file);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Error al subir la imagen');
        } finally {
            // Reset input
            event.target.value = '';
        }
    };

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const handleNext = () => {
        if (lightboxIndex !== null && lightboxIndex < media.length - 1) {
            setLightboxIndex(lightboxIndex + 1);
        }
    };

    const handlePrev = () => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in">
            {/* Header with Upload Button */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Galería de Fotos</h3>
                {driveFolderId && onUpload && (
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="gallery-upload"
                        />
                        <label
                            htmlFor="gallery-upload"
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm text-sm font-medium"
                        >
                            <Upload className="w-4 h-4" />
                            Subir Foto
                        </label>
                    </div>
                )}
            </div>

            {media.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No hay imágenes en la galería.</p>
                    <p className="text-sm text-gray-400 mt-2">Sube una foto para empezar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {media.map((item, index) => (
                        <div
                            key={item.id}
                            className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer"
                            onClick={() => setLightboxIndex(index)}
                        >
                            <img
                                src={item.url}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                            {/* Action Buttons Overlay */}
                            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-[-10px] group-hover:translate-y-0 duration-300">
                                {onAnalyze && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAnalyze(item); }}
                                        className="p-2 bg-white/90 rounded-full text-gray-700 hover:text-purple-600 hover:bg-white shadow-sm transition-all"
                                        title="Analizar con IA"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                )}
                                {onSetProfilePhoto && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSetProfilePhoto(item.url); }}
                                        className="p-2 bg-white/90 rounded-full text-gray-700 hover:text-indigo-600 hover:bg-white shadow-sm transition-all"
                                        title="Usar como foto de perfil"
                                    >
                                        <User className="w-4 h-4" />
                                    </button>
                                )}
                                {onSetCoverPhoto && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSetCoverPhoto(item.url); }}
                                        className="p-2 bg-white/90 rounded-full text-gray-700 hover:text-indigo-600 hover:bg-white shadow-sm transition-all"
                                        title="Usar como portada"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                        className="p-2 bg-white/90 rounded-full text-gray-700 hover:text-red-600 hover:bg-white shadow-sm transition-all"
                                        title="Eliminar foto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {item.title && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-medium truncate">{item.title}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    isOpen={true}
                    onClose={() => setLightboxIndex(null)}
                    media={media[lightboxIndex]}
                    onUpdateMedia={onUpdateMedia}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    hasNext={lightboxIndex < media.length - 1}
                    hasPrev={lightboxIndex > 0}
                />
            )}
        </div>
    );
};
