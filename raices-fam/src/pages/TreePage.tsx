import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ReactFlow, Background, useNodesState, useEdgesState, type Node, Panel, useReactFlow, ReactFlowProvider, type Edge, type Connection, reconnectEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Maximize, Lock, Unlock } from 'lucide-react';
import { PersonNode } from '../features/tree/components/PersonNode';
import { SpouseEdge } from '../features/tree/components/SpouseEdge';
import { MOCK_PERSON, updatePerson, createPerson, getAllPeople, deletePerson, getPersonById } from '../services/mockData';
import { EditPersonModal } from '../features/profile/components/EditPersonModal';
import { Navbar } from '../components/ui/Navbar';
import { BottomNav } from '../components/ui/BottomNav';
import type { Person } from '../types/person';

const ControlButton = ({ onClick, icon, label, active = false }: { onClick: () => void, icon: React.ReactNode, label: string, active?: boolean }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-all duration-200 group relative
            ${active ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-600 hover:text-indigo-600'}
        `}
        title={label}
    >
        {icon}
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {label}
        </span>
    </button>
);

const TreeContent = () => {
    const navigate = useNavigate();
    const reactFlowInstance = useReactFlow();
    const [isLocked, setIsLocked] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const handleEdit = useCallback((id: string) => {
        // Find the person data from the nodes
        const node = reactFlowInstance.getNode(id);
        if (node && node.data.person) {
            setEditingPerson(node.data.person as Person);
        }
    }, [reactFlowInstance]);

    const handleAddParent = useCallback(async (childId: string) => {
        const newParentId = `person_${Date.now()}`;
        const newParent: Person = {
            id: newParentId,
            firstName: 'Nuevo',
            lastName: 'Padre/Madre',
            gender: 'UNKNOWN',
            isLiving: true,
            relationships: [{ id: `rel_${Date.now()}`, personId: childId, type: 'CHILD' }],
            media: [],
            createdBy: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Persist immediately
        await createPerson(newParent);

        // Calculate position (above the child)
        const childNode = reactFlowInstance.getNode(childId);
        const position = childNode ? { x: childNode.position.x, y: childNode.position.y - 200 } : { x: 0, y: -200 };

        const newNode: Node = {
            id: newParentId,
            type: 'person',
            position,
            data: {
                label: `${newParent.firstName} ${newParent.lastName}`,
                person: newParent,
                image: newParent.profilePhotoUrl,
                birthYear: newParent.birth?.date?.year?.toString(),
                deathYear: newParent.death?.date?.year?.toString() || (newParent.isLiving ? 'Presente' : undefined),
                onEdit: handleEdit,
                onAddParent: handleAddParent,
                onAddChild: handleAddChild,
            },
        };

        const newEdge = {
            id: `e-${newParentId}-${childId}`,
            source: newParentId,
            target: childId,
            type: 'smoothstep',
            animated: true,
            reconnectable: true,
            style: { stroke: '#9ca3af', strokeWidth: 2 },
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));

        // Immediately edit the new person
        setEditingPerson(newParent);
    }, [handleEdit, reactFlowInstance, setNodes, setEdges]);

    const handleAddChild = useCallback(async (parentId: string) => {
        const newChildId = `person_${Date.now()}`;
        const newChild: Person = {
            id: newChildId,
            firstName: 'Nuevo',
            lastName: 'Hijo/a',
            gender: 'UNKNOWN',
            isLiving: true,
            relationships: [{ id: `rel_${Date.now()}`, personId: parentId, type: 'FATHER' }], // Default to father for now
            media: [],
            createdBy: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Persist immediately
        await createPerson(newChild);

        // Calculate position (below the parent)
        const parentNode = reactFlowInstance.getNode(parentId);
        const position = parentNode ? { x: parentNode.position.x, y: parentNode.position.y + 200 } : { x: 0, y: 200 };

        const newNode: Node = {
            id: newChildId,
            type: 'person',
            position,
            data: {
                label: `${newChild.firstName} ${newChild.lastName}`,
                person: newChild,
                image: newChild.profilePhotoUrl,
                birthYear: newChild.birth?.date?.year?.toString(),
                deathYear: newChild.death?.date?.year?.toString() || (newChild.isLiving ? 'Presente' : undefined),
                onEdit: handleEdit,
                onAddParent: handleAddParent,
                onAddChild: handleAddChild,
            },
        };

        const newEdge = {
            id: `e-${parentId}-${newChildId}`,
            source: parentId,
            target: newChildId,
            type: 'smoothstep',
            animated: true,
            reconnectable: true,
            style: { stroke: '#9ca3af', strokeWidth: 2 },
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));

        // Immediately edit the new person
        setEditingPerson(newChild);
    }, [handleEdit, reactFlowInstance, setNodes, setEdges]);

    // Helper to save node positions
    const saveNodePositions = useCallback((nodesToSave: Node[]) => {
        const positions = nodesToSave.reduce((acc, node) => {
            acc[node.id] = node.position;
            return acc;
        }, {} as Record<string, { x: number, y: number }>);
        localStorage.setItem('raices_node_positions', JSON.stringify(positions));
    }, []);

    // Wrap onNodesChange to save positions
    const handleNodesChange = useCallback((changes: any) => {
        onNodesChange(changes);
    }, [onNodesChange]);

    // Effect to save positions when nodes change (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (nodes.length > 0) {
                saveNodePositions(nodes);
            }
        }, 1000); // Save 1 second after last change
        return () => clearTimeout(timeoutId);
    }, [nodes, saveNodePositions]);

    // Helper to update bidirectional relationships
    const updateRelationship = async (personId: string, relatedId: string, type: 'ADD' | 'REMOVE' | 'UPDATE', relationType: 'PARENT' | 'CHILD' | 'SPOUSE', status: 'CURRENT' | 'FORMER' = 'CURRENT') => {
        const person = await getPersonById(personId);
        if (!person) return;

        let relationships = person.relationships || [];

        if (type === 'REMOVE') {
            relationships = relationships.filter(r => r.personId !== relatedId);
        } else if (type === 'UPDATE') {
            relationships = relationships.map(r => {
                if (r.personId === relatedId && r.type === relationType) {
                    return { ...r, status };
                }
                return r;
            });
        } else {
            // ADD
            // Check if already exists
            if (!relationships.find(r => r.personId === relatedId)) {
                let newType: 'FATHER' | 'MOTHER' | 'CHILD' | 'SPOUSE' = 'CHILD';

                if (relationType === 'SPOUSE') {
                    newType = 'SPOUSE';
                } else if (relationType === 'PARENT') {
                    // Ideally check gender, defaulting to FATHER for now if unknown
                    newType = 'FATHER';
                }

                relationships.push({
                    id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    personId: relatedId,
                    type: newType,
                    status
                });
            }
        }

        await updatePerson({ ...person, relationships });
    };

    const handleToggleRelationshipStatus = useCallback(async (edgeId: string) => {
        // edgeId format: e-spouse-ID1-ID2
        const parts = edgeId.split('-');
        if (parts.length < 4) return;

        const id1 = parts[2];
        const id2 = parts[3];

        // We need to know the current status to toggle it.
        // We can get it from the edge state or just fetch the person.
        const person1 = await getPersonById(id1);
        const rel = person1?.relationships.find(r => r.personId === id2 && r.type === 'SPOUSE');

        if (rel) {
            const newStatus = rel.status === 'CURRENT' ? 'FORMER' : 'CURRENT';

            // Update both sides
            await updateRelationship(id1, id2, 'UPDATE', 'SPOUSE', newStatus);
            await updateRelationship(id2, id1, 'UPDATE', 'SPOUSE', newStatus);

            // Update Edge State locally to reflect change immediately
            setEdges((eds) => eds.map(e => {
                if (e.id === edgeId) {
                    return {
                        ...e,
                        data: { ...e.data, status: newStatus },
                        style: {
                            ...e.style,
                            stroke: newStatus === 'FORMER' ? '#9ca3af' : '#ec4899'
                        }
                    };
                }
                return e;
            }));
        }
    }, [setEdges]);

    const onReconnect = useCallback(async (oldEdge: Edge, newConnection: Connection) => {
        // Optimistic UI update
        setEdges((els) => reconnectEdge(oldEdge, newConnection, els));

        const oldSourceId = oldEdge.source;
        const oldTargetId = oldEdge.target;
        const newSourceId = newConnection.source;
        const newTargetId = newConnection.target;

        if (!newSourceId || !newTargetId) return;

        // Determine what changed
        if (oldSourceId !== newSourceId) {
            // Parent changed (Child moved to new Parent)
            // 1. Remove from Old Parent (CHILD relation)
            await updateRelationship(oldSourceId, oldTargetId, 'REMOVE', 'CHILD');
            // 2. Remove from Child (PARENT relation to Old Parent)
            await updateRelationship(oldTargetId, oldSourceId, 'REMOVE', 'PARENT');

            // 3. Add to New Parent (CHILD relation)
            await updateRelationship(newSourceId, oldTargetId, 'ADD', 'CHILD');
            // 4. Add to Child (PARENT relation to New Parent)
            await updateRelationship(oldTargetId, newSourceId, 'ADD', 'PARENT');

        } else if (oldTargetId !== newTargetId) {
            // Child changed (Parent moved to new Child)
            // 1. Remove from Parent (CHILD relation to Old Child)
            await updateRelationship(oldSourceId, oldTargetId, 'REMOVE', 'CHILD');
            // 2. Remove from Old Child (PARENT relation)
            await updateRelationship(oldTargetId, oldSourceId, 'REMOVE', 'PARENT');

            // 3. Add to Parent (CHILD relation to New Child)
            await updateRelationship(oldSourceId, newTargetId, 'ADD', 'CHILD');
            // 4. Add to New Child (PARENT relation)
            await updateRelationship(newTargetId, oldSourceId, 'ADD', 'PARENT');
        }
    }, [setEdges]);

    const connectionStartRef = useRef<{ nodeId: string; handleType: string } | null>(null);

    const onConnectStart = useCallback((_: any, params: { nodeId: string | null; handleType: string | null }) => {
        if (params.nodeId && params.handleType) {
            connectionStartRef.current = { nodeId: params.nodeId, handleType: params.handleType };
        }
    }, []);

    const onConnectEnd = useCallback(async (event: any) => {
        const targetIsPane = event.target.classList.contains('react-flow__pane');

        if (targetIsPane && connectionStartRef.current) {
            const { nodeId, handleType } = connectionStartRef.current;
            const sourceNode = reactFlowInstance.getNode(nodeId);

            // Only allow creating spouse from Left/Right handles
            if (!sourceNode || (handleType !== 'source' && handleType !== 'target')) return;
            // We need to check the specific handle ID if possible, but for now let's assume side handles are used for spouses
            // Actually, we can't easily distinguish handle ID here without more state, 
            // but we can infer from the context or just allow it.
            // Let's rely on the fact that Top/Bottom are usually for Parent/Child and might not trigger this if we restrict logic.

            // For now, let's assume any drag to pane from a person node implies "Create Spouse" 
            // IF it originated from the side handles. 
            // Since we can't easily get handleId in onConnectEnd without custom state, 
            // we will proceed and check gender to ensure we create the opposite.

            const sourceGender = sourceNode.data.gender;
            const newGender = sourceGender === 'MALE' ? 'FEMALE' : 'MALE';

            // Create new Spouse
            const newSpouseId = `person_${Date.now()}`;
            const newSpouse: Person = {
                id: newSpouseId,
                firstName: 'Nueva',
                lastName: 'Pareja',
                gender: newGender,
                isLiving: true,
                relationships: [{ id: `rel_${Date.now()}`, personId: nodeId, type: 'SPOUSE' }],
                media: [],
                createdBy: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await createPerson(newSpouse);

            // Update source person to include spouse relationship
            await updateRelationship(nodeId, newSpouseId, 'ADD', 'SPOUSE');

            // Position: Right of source
            const position = { x: sourceNode.position.x + 250, y: sourceNode.position.y };

            const newNode: Node = {
                id: newSpouseId,
                type: 'person',
                position,
                data: {
                    label: `${newSpouse.firstName} ${newSpouse.lastName}`,
                    person: newSpouse,
                    image: newSpouse.profilePhotoUrl,
                    gender: newSpouse.gender,
                    birthYear: '?',
                    deathYear: 'Presente',
                    onEdit: handleEdit,
                    onAddParent: handleAddParent,
                    onAddChild: handleAddChild,
                },
            };

            const newEdge = {
                id: `e-spouse-${nodeId}-${newSpouseId}`,
                source: nodeId,
                target: newSpouseId,
                sourceHandle: 'right',
                targetHandle: 'left',
                type: 'spouse',
                animated: false,
                reconnectable: true,
                style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' },
                data: {
                    status: 'CURRENT',
                    onToggleStatus: handleToggleRelationshipStatus
                }
            };

            setNodes((nds) => nds.concat(newNode));
            setEdges((eds) => eds.concat(newEdge));
            setEditingPerson(newSpouse);
        }

        connectionStartRef.current = null;
    }, [reactFlowInstance, handleEdit, handleAddParent, handleAddChild, setNodes, setEdges]);

    const onConnect = useCallback(async (params: Connection) => {
        const sourceId = params.source;
        const targetId = params.target;

        if (!sourceId || !targetId || sourceId === targetId) return;

        const sourceNode = reactFlowInstance.getNode(sourceId);
        const targetNode = reactFlowInstance.getNode(targetId);

        // Update Data Model

        // Check if connecting spouse handles (Left/Right)
        if (params.sourceHandle === 'right' || params.sourceHandle === 'left' || params.targetHandle === 'right' || params.targetHandle === 'left') {
            // VALIDATION: Check Genders
            if (sourceNode?.data.gender === targetNode?.data.gender) {
                // Same gender -> Do nothing (as requested)
                return;
            }

            await updateRelationship(sourceId, targetId, 'ADD', 'SPOUSE');
            await updateRelationship(targetId, sourceId, 'ADD', 'SPOUSE');

            // Optimistic Edge Addition for Spouse
            setEdges((eds) => eds.concat({
                id: `e-spouse-${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                sourceHandle: params.sourceHandle,
                targetHandle: params.targetHandle,
                type: 'spouse',
                animated: false,
                reconnectable: true,
                style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' },
                data: {
                    status: 'CURRENT',
                    onToggleStatus: handleToggleRelationshipStatus
                }
            }));
            return;
        }

        // We assume drawing a line from A to B means A is the Parent of B
        // (Since handles are Bottom(Source) -> Top(Target))

        // 1. Add CHILD relation to Parent (Source)
        await updateRelationship(sourceId, targetId, 'ADD', 'CHILD');

        // 2. Add PARENT relation to Child (Target)
        await updateRelationship(targetId, sourceId, 'ADD', 'PARENT');

        // Optimistic Edge for Parent-Child
        setEdges((eds) => {
            const exists = eds.some(e => (e.source === sourceId && e.target === targetId));
            if (exists) return eds;
            return eds.concat({
                id: `e-${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                type: 'smoothstep',
                animated: true,
                reconnectable: true,
                style: { stroke: '#9ca3af', strokeWidth: 2 },
            });
        });

    }, [setEdges, reactFlowInstance]);

    // ... (handleAddParent/Child need to be updated to be bidirectional too, but let's fix loadData first)

    // ... (useEffect for loadData)
    useEffect(() => {
        const loadData = async () => {
            if (nodes.length === 0) {
                const people = await getAllPeople();

                // Load saved positions
                const savedPositionsStr = localStorage.getItem('raices_node_positions');
                const savedPositions = savedPositionsStr ? JSON.parse(savedPositionsStr) : {};

                // If no people, use MOCK_PERSON as seed
                if (people.length === 0) {
                    people.push(MOCK_PERSON);
                }

                const newNodes: Node[] = people.map((p, index) => {
                    const position = savedPositions[p.id] || { x: 0, y: index * 250 };
                    return {
                        id: p.id,
                        type: 'person',
                        position,
                        data: {
                            label: `${p.firstName} ${p.lastName}`,
                            person: p,
                            image: p.profilePhotoUrl,
                            gender: p.gender,
                            birthYear: p.birth?.date?.year?.toString(),
                            deathYear: p.death?.date?.year?.toString() || (p.isLiving ? 'Presente' : undefined),
                            onEdit: handleEdit,
                            onAddParent: handleAddParent,
                            onAddChild: handleAddChild,
                        },
                    };
                });

                // Reconstruct edges from relationships
                // We assume edges go from Parent -> Child
                const newEdges: Edge[] = [];
                const processedEdges = new Set<string>();

                people.forEach(p => {
                    p.relationships.forEach(rel => {
                        // If p has a CHILD relationship to X, draw p -> X
                        if (rel.type === 'CHILD') {
                            const edgeId = `e-${p.id}-${rel.personId}`;
                            if (!processedEdges.has(edgeId)) {
                                newEdges.push({
                                    id: edgeId,
                                    source: p.id,
                                    target: rel.personId,
                                    type: 'smoothstep',
                                    animated: true,
                                    reconnectable: true, // Enable reconnect
                                    style: { stroke: '#9ca3af', strokeWidth: 2 },
                                });
                                processedEdges.add(edgeId);
                            }
                        }
                        // If p has a FATHER/MOTHER relationship to X, draw X -> p
                        else if (rel.type === 'FATHER' || rel.type === 'MOTHER') {
                            const edgeId = `e-${rel.personId}-${p.id}`;
                            if (!processedEdges.has(edgeId)) {
                                newEdges.push({
                                    id: edgeId,
                                    source: rel.personId,
                                    target: p.id,
                                    type: 'smoothstep',
                                    animated: true,
                                    reconnectable: true,
                                    style: { stroke: '#9ca3af', strokeWidth: 2 },
                                });
                                processedEdges.add(edgeId);
                            }
                        }
                        // If p has a SPOUSE relationship to X, draw p <-> X
                        else if (rel.type === 'SPOUSE') {
                            // To avoid duplicate edges (A->B and B->A), sort IDs
                            const [id1, id2] = [p.id, rel.personId].sort();
                            const edgeId = `e-spouse-${id1}-${id2}`;

                            if (!processedEdges.has(edgeId)) {
                                const isFormer = rel.status === 'FORMER';
                                newEdges.push({
                                    id: edgeId,
                                    source: id1,
                                    target: id2,
                                    sourceHandle: 'right', // Connect Right of Left Node
                                    targetHandle: 'left',  // To Left of Right Node
                                    type: 'spouse', // Use custom edge
                                    animated: false,
                                    reconnectable: true,
                                    style: { stroke: isFormer ? '#9ca3af' : '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' },
                                    data: {
                                        status: rel.status || 'CURRENT',
                                        onToggleStatus: handleToggleRelationshipStatus
                                    }
                                });
                                processedEdges.add(edgeId);
                            }
                        }
                    });
                });

                setNodes(newNodes);
                setEdges(newEdges);
            }
        };
        loadData();
    }, [nodes.length, setNodes, handleEdit, handleAddParent, handleAddChild]); // Run once on mount

    // Define custom node types
    const nodeTypes = useMemo(() => ({
        person: PersonNode as any,
    }), []);

    const edgeTypes = useMemo(() => ({
        spouse: SpouseEdge,
    }), []);

    const handleSavePerson = useCallback(async (updatedPerson: Person) => {
        await updatePerson(updatedPerson);
        setEditingPerson(null);

        // Update the node data to reflect changes immediately
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === updatedPerson.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: `${updatedPerson.firstName} ${updatedPerson.lastName}`,
                            person: updatedPerson, // Update the stored person object
                            image: updatedPerson.profilePhotoUrl,
                            gender: updatedPerson.gender,
                            birthYear: updatedPerson.birth?.date?.year?.toString(),
                            deathYear: updatedPerson.death?.date?.year?.toString() || (updatedPerson.isLiving ? 'Presente' : undefined),
                            onEdit: handleEdit // Keep the handler
                        },
                    };
                }
                return node;
            })
        );
    }, [handleEdit, setNodes]);

    const handleDeletePerson = useCallback(async (id: string) => {
        // 1. Delete from storage
        await deletePerson(id);

        // 2. Remove from nodes state
        setNodes((nds) => nds.filter((node) => node.id !== id));

        // 3. Remove connected edges
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));

        // 4. Close modal
        setEditingPerson(null);
    }, [setNodes, setEdges]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        navigate(`/person/${node.id}`);
    }, [navigate]);



    return (
        <div className="w-full h-screen bg-gray-50 flex flex-col">
            {/* Navigation */}
            <Navbar />

            {/* Tree Canvas */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodeClick={onNodeClick}
                    onReconnect={onReconnect}
                    onConnect={onConnect}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="#9ca3af" gap={20} size={1} />

                    <Panel position="top-center" className="flex flex-col items-center gap-2 mt-4">
                        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-gray-200/50 flex items-center gap-1 transition-all hover:shadow-xl hover:scale-[1.02]">
                            <ControlButton onClick={() => reactFlowInstance.zoomIn()} icon={<Plus className="w-4 h-4" />} label="Acercar" />
                            <ControlButton onClick={() => reactFlowInstance.zoomOut()} icon={<Minus className="w-4 h-4" />} label="Alejar" />
                            <ControlButton onClick={() => reactFlowInstance.fitView()} icon={<Maximize className="w-4 h-4" />} label="Ajustar" />
                            <div className="w-px h-4 bg-gray-200 mx-1" />
                            <ControlButton
                                onClick={() => setIsLocked(!isLocked)}
                                icon={isLocked ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-gray-500" />}
                                label={isLocked ? "Desbloquear" : "Bloquear"}
                                active={isLocked}
                            />
                        </div>
                        <div className="text-xs text-gray-400 font-medium bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100/50 hidden md:block">
                            Para mover el lienzo, usa la <span className="font-bold text-gray-500">Rueda del ratón</span> o <span className="font-bold text-gray-500">Espacio</span> + arrastrar
                        </div>
                    </Panel>
                </ReactFlow>
            </div>

            {/* Mobile Navigation */}
            <BottomNav />

            {/* Edit Modal */}
            {editingPerson && (
                <EditPersonModal
                    person={editingPerson}
                    isOpen={!!editingPerson}
                    onClose={() => setEditingPerson(null)}
                    onSave={handleSavePerson}
                    onDelete={handleDeletePerson}
                />
            )}
        </div>
    );
};

export const TreePage = () => (
    <ReactFlowProvider>
        <TreeContent />
    </ReactFlowProvider>
);
