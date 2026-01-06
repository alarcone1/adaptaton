import type { Person } from '../../../types/person';

interface BasicInfoProps {
    person: Person;
}

export const BasicInfo = ({ person }: BasicInfoProps) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Biografía</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                {person.bio || 'No hay biografía disponible.'}
            </p>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">Detalles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Nacimiento</span>
                    <span className="font-medium text-gray-900">{person.birth?.date?.display}</span>
                    <span className="block text-sm text-gray-600">{person.birth?.location?.name}</span>
                </div>
                {person.death && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <span className="block text-xs text-gray-500 uppercase tracking-wide">Fallecimiento</span>
                        <span className="font-medium text-gray-900">{person.death.date?.display}</span>
                        <span className="block text-sm text-gray-600">{person.death.location?.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
