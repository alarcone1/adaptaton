import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2, Calendar } from 'lucide-react';
import type { Person, Event, Gender } from '../../../types/person';
import { EventMediaSelector } from './EventMediaSelector';

interface EditPersonModalProps {
    person: Person;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedPerson: Person) => void;
    onDelete?: (id: string) => void;
}

interface FormData {
    firstName: string;
    lastName: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
    bio: string;
    birthDate: string;
    birthLocation: string;
    birthMediaIds: string[];
    deathDate: string;
    deathLocation: string;
    deathMediaIds: string[];
    isLiving: boolean;
}

export const EditPersonModal = ({ person, isOpen, onClose, onSave, onDelete }: EditPersonModalProps) => {
    const { register, control, handleSubmit, reset, setValue, getValues, watch } = useForm<FormData>({
        defaultValues: {
            firstName: person?.firstName || '',
            lastName: person.lastName,
            gender: (person.gender === 'UNKNOWN' || !person.gender) ? 'MALE' : person.gender,
            bio: person.bio || '',
            birthDate: person.birth?.date?.display || '',
            birthLocation: person.birth?.location?.name || '',
            birthMediaIds: person.birth?.mediaIds || [],
            deathDate: person.death?.date?.display || '',
            deathLocation: person.death?.location?.name || '',
            deathMediaIds: person.death?.mediaIds || [],
            isLiving: person.isLiving,
        }
    });

    const isLiving = watch('isLiving');

    const extractYear = (dateString: string): number | undefined => {
        const match = dateString.match(/\b\d{4}\b/);
        return match ? parseInt(match[0]) : undefined;
    };

    const onSubmit = (data: FormData) => {
        const updatedPerson: Person = {
            ...person,
            firstName: data.firstName,
            lastName: data.lastName,
            gender: data.gender,
            bio: data.bio,
            isLiving: data.isLiving,
            birth: {
                ...person.birth,
                id: person.birth?.id || 'new_birth',
                type: 'BIRTH',
                date: {
                    ...person.birth?.date,
                    display: data.birthDate,
                    year: extractYear(data.birthDate)
                },
                location: { name: data.birthLocation },
                mediaIds: data.birthMediaIds
            },
            death: !data.isLiving ? {
                id: person.death?.id || 'new_death',
                type: 'DEATH',
                date: {
                    display: data.deathDate,
                    year: extractYear(data.deathDate)
                },
                location: { name: data.deathLocation },
                mediaIds: data.deathMediaIds
            } : undefined
        };

        console.log('Saving person:', updatedPerson);
        console.log('Extracted birth year:', extractYear(data.birthDate));

        onSave(updatedPerson);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">Editar Perfil</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                {...register('firstName', { required: true })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                            <input
                                {...register('lastName', { required: true })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${watch('gender') === 'MALE'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-600'
                                }`}>
                                <input
                                    type="radio"
                                    {...register('gender')}
                                    value="MALE"
                                    className="sr-only"
                                />
                                <span className="text-2xl mb-1">♂</span>
                                <span className="text-xs font-medium">Masculino</span>
                            </label>

                            <label className={`flex-1 relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${watch('gender') === 'FEMALE'
                                ? 'border-pink-500 bg-pink-50 text-pink-700'
                                : 'border-gray-200 hover:border-pink-200 hover:bg-gray-50 text-gray-600'
                                }`}>
                                <input
                                    type="radio"
                                    {...register('gender')}
                                    value="FEMALE"
                                    className="sr-only"
                                />
                                <span className="text-2xl mb-1">♀</span>
                                <span className="text-xs font-medium">Femenino</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                        <textarea
                            {...register('bio')}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Nacimiento</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Fecha (Texto)</label>
                                <input
                                    {...register('birthDate')}
                                    placeholder="Ej. 15 de Abril de 1920"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Lugar</label>
                                <input
                                    {...register('birthLocation')}
                                    placeholder="Ciudad, País"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-sm font-medium text-gray-900">Fallecimiento</h3>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" {...register('isLiving')} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-xs text-gray-600">¿Vive?</span>
                            </label>
                        </div>

                        {!isLiving && (
                            <div className="animate-fade-in space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Fecha (Texto)</label>
                                        <input
                                            {...register('deathDate')}
                                            placeholder="Ej. 10 de Noviembre de 1995"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Lugar</label>
                                        <input
                                            {...register('deathLocation')}
                                            placeholder="Ciudad, País"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between pt-4">
                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('¿Estás seguro de que quieres eliminar este perfil? Esta acción no se puede deshacer.')) {
                                        onDelete(person.id);
                                        onClose();
                                    }
                                }}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Eliminar Perfil
                            </button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
