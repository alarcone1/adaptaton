
import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Pencil, Plus } from 'lucide-react';

import type { Person } from '../../../types/person';

interface PersonNodeData extends Record<string, unknown> {
    label: string;
    person: Person;
    image?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
    birthYear?: string;
    deathYear?: string;
    onEdit?: (id: string) => void;
    onAddParent?: (id: string) => void;
    onAddChild?: (id: string) => void;
}

type PersonNodeType = Node<PersonNodeData>;

export const PersonNode = memo(({ id, data }: NodeProps<PersonNodeType>) => {
    return (
        <div className="group/node relative px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 hover:border-indigo-500 transition-colors min-w-[150px] text-center">
            <Handle type="target" position={Position.Top} className="w-16 !bg-gray-400" />

            {/* Edit Button - Visible on hover */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent node click (navigation)
                    data.onEdit?.(id);
                }}
                className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-500 opacity-0 group-hover/node:opacity-100 transition-all z-10 scale-90 hover:scale-100"
                title="Editar información"
            >
                <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Add Parent Button - Top Center */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    data.onAddParent?.(id);
                }}
                className="absolute -top-3 left-4 bg-white p-1 rounded-full shadow-md border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-500 opacity-0 group-hover/node:opacity-100 transition-all z-10 scale-90 hover:scale-100"
                title="Añadir Padre/Madre"
            >
                <Plus className="w-3 h-3" />
            </button>

            <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm mb-2 flex items-center justify-center bg-gray-100 ${data.gender === 'MALE' ? 'border-blue-200' :
                    data.gender === 'FEMALE' ? 'border-pink-200' : 'border-white'
                    }`}>
                    {data.image ? (
                        <img
                            src={data.image}
                            alt={data.label}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {data.gender === 'MALE' ? (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-300">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            ) : data.gender === 'FEMALE' ? (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-pink-300">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-300">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            )}
                        </div>
                    )}
                </div>
                <div className="font-bold text-sm text-gray-900 flex items-center gap-1">
                    {data.label}
                    {data.gender === 'MALE' && <span className="text-blue-500 text-[10px]">♂</span>}
                    {data.gender === 'FEMALE' && <span className="text-pink-500 text-[10px]">♀</span>}
                </div>
                <div className="text-xs text-gray-500">
                    {data.birthYear || '?'} - {data.deathYear || '?'}
                </div>
            </div>

            {/* Add Child Button - Bottom Center */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    data.onAddChild?.(id);
                }}
                className="absolute -bottom-3 left-4 bg-white p-1 rounded-full shadow-md border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-500 opacity-0 group-hover/node:opacity-100 transition-all z-10 scale-90 hover:scale-100"
                title="Añadir Hijo/a"
            >
                <Plus className="w-3 h-3" />
            </button>

            <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-400" />

            {/* Spouse Handles - Dynamic Color based on Gender */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className={`!w-3 !h-3 border-2 border-white ${data.gender === 'MALE' ? '!bg-blue-400' : data.gender === 'FEMALE' ? '!bg-pink-400' : '!bg-gray-400'}`}
                style={{ top: '50%' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className={`!w-3 !h-3 border-2 border-white ${data.gender === 'MALE' ? '!bg-blue-400' : data.gender === 'FEMALE' ? '!bg-pink-400' : '!bg-gray-400'}`}
                style={{ top: '50%' }}
            />
        </div >
    );
});
