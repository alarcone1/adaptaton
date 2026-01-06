import { useState, useRef } from 'react';
import { Check, Upload, Loader2 } from 'lucide-react';
import type { Media } from '../../../types/person';

interface EventMediaSelectorProps {
    availableMedia: Media[];
    selectedMediaIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onUpload?: (file: File) => Promise<Media | undefined>;
}

export const EventMediaSelector = ({ availableMedia, selectedMediaIds, onSelectionChange, onUpload }: EventMediaSelectorProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleSelection = (mediaId: string) => {
        if (selectedMediaIds.includes(mediaId)) {
            onSelectionChange(selectedMediaIds.filter(id => id !== mediaId));
        } else {
            onSelectionChange([...selectedMediaIds, mediaId]);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUpload) return;

        setIsUploading(true);
        try {
            const newMedia = await onUpload(file);
            if (newMedia) {
                // Auto-select the new image
                onSelectionChange([...selectedMediaIds, newMedia.id]);
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
            {/* Upload Button */}
            {onUpload && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-square rounded-md border-2 border-dashed border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors group"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-6 h-6 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-medium text-indigo-600 text-center px-1">Subir Nueva</span>
                        </>
                    )}
                </div>
            )}

            {availableMedia.map((media) => {
                const isSelected = selectedMediaIds.includes(media.id);
                return (
                    <div
                        key={media.id}
                        onClick={() => toggleSelection(media.id)}
                        className={`relative aspect-square rounded-md overflow-hidden cursor-pointer group border-2 transition-all ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-gray-300'
                            }`}
                    >
                        <img
                            src={media.thumbnailUrl || media.url}
                            alt={media.title}
                            className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                            referrerPolicy="no-referrer"
                        />

                        {isSelected && (
                            <div className="absolute top-1 right-1 bg-indigo-500 text-white rounded-full p-0.5 shadow-sm">
                                <Check className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
