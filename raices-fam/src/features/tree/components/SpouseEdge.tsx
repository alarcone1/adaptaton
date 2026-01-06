
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getStraightPath, useReactFlow } from '@xyflow/react';
import { Heart, HeartCrack } from 'lucide-react';

export const SpouseEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: _sourcePosition,
    targetPosition: _targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) => {
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    const isFormer = data?.status === 'FORMER';
    const edgeColor = isFormer ? '#9ca3af' : '#ec4899'; // Grey vs Pink
    const Icon = isFormer ? HeartCrack : Heart;

    const { setEdges } = useReactFlow();

    const onEdgeClick = (evt: React.MouseEvent, id: string) => {
        evt.stopPropagation();
        // Toggle status on click (for quick testing/editing)
        // In a real app, this might open a modal or menu
        setEdges((edges) =>
            edges.map((edge) => {
                if (edge.id === id) {
                    const newStatus = edge.data?.status === 'CURRENT' ? 'FORMER' : 'CURRENT';
                    return {
                        ...edge,
                        data: { ...edge.data, status: newStatus },
                        style: {
                            ...edge.style,
                            stroke: newStatus === 'FORMER' ? '#9ca3af' : '#ec4899',
                            strokeDasharray: '5,5'
                        }
                    };
                }
                return edge;
            })
        );

        // Note: We also need to update the underlying data model (Person relationships)
        // This click handler only updates the visual edge state for now.
        // To persist, we would need to call updateRelationship from here or pass a handler.
        if (data?.onToggleStatus) {
            (data.onToggleStatus as (id: string) => void)(id);
        }
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: edgeColor }} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <button
                        className={`p-1 rounded-full shadow-sm border ${isFormer ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-pink-50 border-pink-200 text-pink-500'} hover:scale-110 transition-transform`}
                        onClick={(event) => onEdgeClick(event, id)}
                        title={isFormer ? "Relación terminada (Click para cambiar)" : "Pareja actual (Click para cambiar)"}
                    >
                        <Icon className="w-3 h-3 fill-current" />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};
