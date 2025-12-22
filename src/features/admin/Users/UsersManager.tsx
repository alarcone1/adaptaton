import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { ConfirmModal } from '../../../components/ConfirmModal'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Layout } from '../../../components/ui/Layout'
import { Trash2, Edit2, Plus, MoreVertical, Mail, Filter, Layers } from 'lucide-react'
import { CohortAssignmentModal } from './CohortAssignmentModal'

type Profile = any // Using any to bypass strict type check on 'profiles' generic for now

export const UsersManager = () => {
    const [users, setUsers] = useState<Profile[]>([])
    const [cohorts, setCohorts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showUserForm, setShowUserForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const [_isDeleting, setIsDeleting] = useState(false)

    // Filters
    const [filterRole, setFilterRole] = useState<string>('all')
    const [filterCohort, setFilterCohort] = useState<string>('all')

    const [newUser, setNewUser] = useState({
        names: '',
        last_name: '',
        cedula: '',
        phone: '',
        email: '',
        password: '',
        role: 'student' as const,
        cohort_id: ''
    })

    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [showCohortModal, setShowCohortModal] = useState(false)
    const [assignUser, setAssignUser] = useState<{ id: string, name: string, role: string } | null>(null)

    useEffect(() => {
        fetchData()
        fetchCohorts()
    }, [filterRole, filterCohort])

    const fetchData = async () => {
        setLoading(true)

        // 1. Get ALL instructors currently assigned to ANY cohort
        // This is necessary to exclude them from the "Sin Cohorte" filter 
        let assignedInstructorIds: string[] = []
        if (filterCohort === 'none' || filterCohort === 'all') {
            const { data: allInstructors } = await supabase
                .from('cohort_instructors')
                .select('user_id')

            if (allInstructors) {
                // Deduplicate items just in case
                assignedInstructorIds = Array.from(new Set(allInstructors.map(i => i.user_id)))
            }
        }

        // 2. Get instructors specific to the selected cohort filter (if referencing a specific cohort)
        let specificCohortInstructorIds: string[] = []
        if (filterCohort !== 'all' && filterCohort !== 'none') {
            const { data: instructors } = await supabase
                .from('cohort_instructors')
                .select('user_id')
                .eq('cohort_id', filterCohort)

            if (instructors) {
                specificCohortInstructorIds = instructors.map(i => i.user_id)
            }
        }

        let query = supabase.from('profiles').select('*, cohort:cohorts!profiles_cohort_id_fkey(name)')

        if (filterRole !== 'all') {
            query = query.eq('role', filterRole as any)
        }

        if (filterCohort !== 'all') {
            if (filterCohort === 'none') {
                // Show users with no cohort_id AND who are not assigned instructors
                query = query.is('cohort_id', null)

                // EXCLUDE active instructors
                if (assignedInstructorIds.length > 0) {
                    // Using filter syntax for 'not.in' with array string
                    query = query.not('id', 'in', `(${assignedInstructorIds.join(',')})`)
                }
            } else {
                // Combine: Students in cohort OR Instructors assigned to this specific cohort
                if (specificCohortInstructorIds.length > 0) {
                    query = query.or(`cohort_id.eq.${filterCohort},id.in.(${specificCohortInstructorIds.join(',')})`)
                } else {
                    query = query.eq('cohort_id', filterCohort)
                }
            }
        }

        const { data: usersData, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error("Users Fetch Error:", error);
            setFormError(JSON.stringify(error));
        }

        if (usersData) setUsers(usersData)
        setLoading(false)
    }

    const fetchCohorts = async () => {
        const { data } = await supabase.from('cohorts').select('id, name')
        if (data) setCohorts(data)
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUser.email || (!editingId && !newUser.password)) return

        setFormError(null)
        try {
            const payload = {
                ...newUser,
                full_name: newUser.names, // Combine names for full_name logic if needed, but simplistic here
                cohort_id: newUser.cohort_id || null
            }

            if (editingId) {
                // Update implementation
                // Using Edge Function for update to handle auth specifics if needed, or direct Table update for profile fields
                // Updating profile directly for metadata fields
                const { error } = await supabase.from('profiles').update({
                    full_name: newUser.names,
                    phone: newUser.phone,
                    role: newUser.role,
                    cohort_id: newUser.cohort_id || null,
                    cedula: newUser.cedula
                }).eq('id', editingId)

                if (error) throw error
                setSuccess('Usuario actualizado')
            } else {
                // Creation requires Edge Function to create Auth User + Profile
                const { error } = await supabase.functions.invoke('create-user', {
                    body: { ...payload }
                })
                if (error) throw error
                setSuccess('Usuario creado')
            }
            setShowUserForm(false)
            setEditingId(null)
            resetForm()
            fetchData()
        } catch (err: any) { setFormError('Error: ' + err.message) }
    }

    const resetForm = () => {
        setNewUser({ names: '', last_name: '', cedula: '', phone: '', email: '', password: '', role: 'student', cohort_id: '' })
    }

    const confirmDelete = async () => {
        if (!userToDelete) return
        setIsDeleting(true)
        try {
            const { error } = await supabase.functions.invoke('delete-user', { body: { user_id: userToDelete } })
            if (error) throw error
            setSuccess('Usuario eliminado')
            fetchData()
        } catch (err: any) { setFormError(err.message) }
        finally { setIsDeleting(false); setShowDeleteModal(false) }
    }

    const startEdit = (user: Profile) => {
        setNewUser({
            names: user.full_name || '',
            last_name: '',
            cedula: user.cedula || '',
            phone: user.phone || '',
            email: user.email || '',
            password: '',
            role: user.role || 'student',
            cohort_id: user.cohort_id || ''
        })
        setEditingId(user.id); setShowUserForm(true)
        setActiveMenu(null)
    }

    const handleResendInvite = async (email: string) => {
        try {
            const { error } = await supabase.functions.invoke('resend-invite', { body: { email } })
            if (error) throw error
            setSuccess(`Invitación reenviada a ${email}`)
            setActiveMenu(null)
        } catch (err: any) {
            alert('Error enviando correo: ' + err.message)
        }
    }

    return (

        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen space-y-6" onClick={() => setActiveMenu(null)}>
            <PageHeader title="Gestión de Usuarios" subtitle="Administra estudiantes, docentes y más." role="Admin" roleColor="red">
                <Button onClick={() => { setEditingId(null); resetForm(); setShowUserForm(true) }}>
                    <Plus size={18} className="mr-2" /> Nuevo Usuario
                </Button>
            </PageHeader>

            {/* Filters */}
            <Card className="p-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500">
                    <Filter size={18} />
                    <span className="font-medium">Filtrar:</span>
                </div>
                <select
                    className="p-2 border rounded-md bg-gray-50 text-sm min-w-[150px]"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="all">Todos los Roles</option>
                    <option value="student">Estudiantes</option>
                    <option value="teacher">Docentes</option>
                    <option value="partner">Aliados</option>
                    <option value="admin">Administradores</option>
                </select>

                <select
                    className="p-2 border rounded-md bg-gray-50 text-sm min-w-[150px]"
                    value={filterCohort}
                    onChange={(e) => setFilterCohort(e.target.value)}
                >
                    <option value="all">Todas las Cohortes</option>
                    <option value="none">Sin Cohorte</option>
                    {cohorts.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </Card>

            {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded-md flex justify-between items-center">
                    {success}
                    <button onClick={() => setSuccess(null)}>✕</button>
                </div>
            )}

            {loading ? <div className="text-center py-10">Cargando...</div> : (
                <div className="grid grid-cols-1 gap-4">
                    {users.map(user => (
                        <Card
                            key={user.id}
                            className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${activeMenu === user.id ? 'relative z-20 ring-2 ring-primary/20' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'admin' ? 'bg-red-500' :
                                    user.role === 'teacher' ? 'bg-purple-500' :
                                        user.role === 'partner' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`}>
                                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{user.full_name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="gray" className="text-xs uppercase">{user.role}</Badge>
                                        {user.cohort && (
                                            <Badge variant="green" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                                                {user.cohort.name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === user.id ? null : user.id) }}
                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600"
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {activeMenu === user.id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50 overflow-hidden text-sm">
                                        <button onClick={() => startEdit(user)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2">
                                            <Edit2 size={16} /> Editar Perfil
                                        </button>
                                        {user.role === 'student' && (
                                            <button onClick={() => startEdit(user)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-blue-600 font-medium">
                                                <Plus size={16} /> Asignar Cohorte
                                            </button>
                                        )}
                                        <button onClick={() => handleResendInvite(user.email)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2">
                                            <Mail size={16} /> Reenviar Acceso
                                        </button>

                                        {/* Multi-Cohort Management for Staff */}
                                        {user.role !== 'student' && (
                                            <button
                                                onClick={() => {
                                                    setAssignUser({ id: user.id, name: user.full_name, role: user.role });
                                                    setShowCohortModal(true);
                                                    setActiveMenu(null);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-purple-600 font-medium"
                                            >
                                                <Layers size={16} /> Gestionar Cohortes
                                            </button>
                                        )}

                                        <div className="border-t my-1"></div>
                                        <button
                                            onClick={() => { setUserToDelete(user.id); setShowDeleteModal(true); setActiveMenu(null) }}
                                            className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-2"
                                        >
                                            <Trash2 size={16} /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit User Modal */}
            {showUserForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        {formError && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{formError}</div>}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    required className="w-full p-2 border rounded-lg"
                                    value={newUser.names} onChange={e => setNewUser({ ...newUser, names: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        required type="email" className="w-full p-2 border rounded-lg disabled:opacity-50"
                                        value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        disabled={!!editingId}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                                    <input
                                        className="w-full p-2 border rounded-lg"
                                        value={newUser.cedula} onChange={e => setNewUser({ ...newUser, cedula: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                    <select
                                        className="w-full p-2 border rounded-lg"
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                                    >
                                        <option value="student">Estudiante</option>
                                        <option value="teacher">Docente</option>
                                        <option value="partner">Aliado</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cohorte</label>
                                    <select
                                        className="w-full p-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                                        value={newUser.cohort_id}
                                        onChange={e => setNewUser({ ...newUser, cohort_id: e.target.value })}
                                        disabled={newUser.role !== 'student'}
                                    >
                                        <option value="">Sin Cohorte</option>
                                        {cohorts.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal</label>
                                    <input
                                        required type="password" className="w-full p-2 border rounded-lg"
                                        value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setShowUserForm(false)} type="button">Cancelar</Button>
                                <Button className="flex-1" type="submit">Guardar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Eliminar Usuario"
                message="¿Estás seguro? Esta acción no se puede deshacer."
            />

            {/* Multi Cohort Modal */}
            {assignUser && (
                <CohortAssignmentModal
                    isOpen={showCohortModal}
                    onClose={() => { setShowCohortModal(false); setAssignUser(null) }}
                    userId={assignUser.id}
                    userName={assignUser.name}
                    userRole={assignUser.role}
                />
            )}
        </div>
    )

}
