
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import type { ImageAnalysisResult } from "@/services/geminiService";
import { Loader2, MapPin, Calendar, Users, Tag, Sparkles } from "lucide-react";

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    isAnalyzing: boolean;
    result: ImageAnalysisResult | null;
}

export const AnalysisModal = ({ isOpen, onClose, imageUrl, isAnalyzing, result }: AnalysisModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                        Análisis Inteligente de Foto
                    </DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Image Column */}
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[200px]">
                        <img
                            src={imageUrl}
                            alt="Analyzing"
                            className="w-full h-auto object-contain max-h-[400px]"
                        />
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                                <p className="text-sm font-medium text-indigo-800 animate-pulse">
                                    Gemini está analizando tu foto...
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Descifrando historia, contexto y detalles</p>
                            </div>
                        )}
                    </div>

                    {/* Results Column */}
                    <div className="space-y-6">
                        {result ? (
                            <>
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <h3 className="text-sm font-semibold text-indigo-900 mb-2">Descripción</h3>
                                    <p className="text-sm text-indigo-800 leading-relaxed italic">
                                        "{result.description}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Año Estimado</p>
                                            <p className="text-sm font-bold text-gray-900">{result.estimatedYear || "Desconocido"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Personas</p>
                                            <p className="text-sm font-bold text-gray-900">{result.peopleCount ?? "?"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm col-span-2">
                                        <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Ubicación Probable</p>
                                            <p className="text-sm font-bold text-gray-900">{result.location || "No detectada"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Etiquetas Detectadas
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            !isAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                    <Sparkles className="w-12 h-12 mb-2 opacity-20" />
                                    <p>El análisis aparecerá aquí</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
