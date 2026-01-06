import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Edit2, Calendar } from 'lucide-react';
import type { Media } from '../../../types/person';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    media: Media;
    onUpdateMedia?: (updatedMedia: Media) => Promise<void>;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export const Lightbox = ({ isOpen, onClose, media, onUpdateMedia, onNext, onPrev, hasNext, hasPrev }: LightboxProps) => {
    const [description, setDescription] = useState(media.description || '');
    const [dateDisplay, setDateDisplay] = useState(media.date?.display || '');
    const [title, setTitle] = useState(media.title || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Reset state when media changes
    useEffect(() => {
        setDescription(media.description || '');
        setDateDisplay(media.date?.display || '');
        setTitle(media.title || '');
        setIsEditing(false);
    }, [media]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && onNext) onNext();
            if (e.key === 'ArrowLeft' && onPrev) onPrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onNext, onPrev]);

    if (!isOpen) return null;

    const handleSaveDescription = async () => {
        if (!onUpdateMedia) return;
        setIsSaving(true);
        try {
            await onUpdateMedia({
                ...media,
                title,
                description,
                date: dateDisplay ? { display: dateDisplay } : undefined
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save description:', error);
            alert('Error al guardar la descripción');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Navigation Buttons */}
            {hasPrev && (
                <button
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>
            )}
            {hasNext && (
                <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                >
                    <ChevronRight className="w-10 h-10" />
                </button>
            )}

            <div className="flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-8 justify-center items-center">
                {/* Image & Info Container */}
                <div className="flex flex-col items-center max-h-full w-full overflow-y-auto no-scrollbar">
                    <img
                        src={media.url}
                        alt={media.title || 'Gallery Image'}
                        className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-sm mb-4"
                        referrerPolicy="no-referrer"
                    />

                    {/* Info & Description Section */}
                    <div className="mt-4 max-w-3xl mx-auto w-full text-center">
                        <div className="relative group">
                            {isEditing ? (
                                <div className="flex flex-col items-center gap-3 animate-fade-in">
                                    <div className="w-full flex flex-col gap-3">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Título de la imagen"
                                            className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-lg text-center"
                                        />
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Escribe una descripción para esta foto..."
                                            className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none min-h-[80px]"
                                            autoFocus
                                        />
                                        <input
                                            type="text"
                                            value={dateDisplay}
                                            onChange={(e) => setDateDisplay(e.target.value)}
                                            placeholder="Fecha aproximada (ej. 1980)"
                                            className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            disabled={isSaving}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSaveDescription}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => onUpdateMedia && setIsEditing(true)}
                                    className={`p-4 rounded-lg transition-colors cursor-pointer ${description || title ? 'hover:bg-white/5' : 'bg-white/5 hover:bg-white/10 border border-dashed border-white/20'}`}
                                >
                                    {(description || title) ? (
                                        <div className="text-center">
                                            {title && (
                                                <h3 className="text-white text-xl font-medium mb-2">{title}</h3>
                                            )}
                                            {description && (
                                                <p className="text-gray-300 text-lg leading-relaxed mb-2">{description}</p>
                                            )}
                                            {media.date?.display && (
                                                <p className="text-indigo-300 text-sm font-medium flex items-center justify-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {media.date.display}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400 py-2">
                                            <Edit2 className="w-5 h-5 opacity-50" />
                                            <span>Haz clic para editar título, descripción y fecha...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
