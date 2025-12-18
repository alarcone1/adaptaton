import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { LogoutButton } from '../../components/LogoutButton'
import { MoreVertical, Edit2, Trash2, Mail } from 'lucide-react'
import { ConfirmModal } from '../../components/ConfirmModal'

type Cohort = Database['public']['Tables']['cohorts']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export const AdminDashboard = () => {
    const [cohorts, setCohorts] = useState<Cohort[]>([])
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [showUserForm, setShowUserForm] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [stats, setStats] = useState({ users: 0, evidence: 0, impact: 0 })

    // User Form State
    const [newUser, setNewUser] = useState({
        names: '',
        last_name: '',
        cedula: '',
        phone: '',
        email: '',
        password: '',
        role: 'student' as Database['public']['Enums']['user_role']
    })

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null) // ID of user with open menu
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedUsers)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedUsers(newSelected)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data: cohortsData } = await supabase.from('cohorts').select('*')
        // Order by created_at desc to see new ones
        const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)

        // Stats Fetching
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        const { count: evidenceCount } = await supabase.from('evidences').select('*', { count: 'exact', head: true })

        // Impact Calculation: Fetch only validated impact data
        const { data: impactData } = await supabase
            .from('evidences')
            .select('impact_data')
            .eq('status', 'validated')

        const totalImpact = impactData?.reduce((acc, curr) => acc + ((curr.impact_data as any)?.value || 0), 0) || 0

        if (cohortsData) setCohorts(cohortsData)
        if (usersData) setUsers(usersData)
        setStats({ users: usersCount || 0, evidence: evidenceCount || 0, impact: totalImpact })

        setLoading(false)
    }

    const createCohort = async () => {
        const name = prompt('Nombre de la Cohorte:')
        const type = prompt('Tipo (minor/adult):')
        if (!name || (type !== 'minor' && type !== 'adult')) {
            if (name) alert('Tipo inválido. Use "minor" o "adult".')
            return
        }

        const { error } = await supabase.from('cohorts').insert({
            name,
            type: type as 'minor' | 'adult',
            start_date: new Date().toISOString()
        })

        if (error) alert('Error: ' + error.message)
        else fetchData()
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        // Validation: Password required only for new users
        if (!newUser.email || (!editingId && !newUser.password)) return

        try {
            // IF EDITING
            if (editingId) {
                // Call Edge Function to update auth data AND profile
                const { error } = await supabase.functions.invoke('update-user', {
                    body: {
                        user_id: editingId,
                        email: newUser.email,
                        password: newUser.password, // Optional, will be ignored if empty
                        full_name: newUser.names,
                        last_name: newUser.last_name,
                        cedula: newUser.cedula,
                        phone: newUser.phone,
                        role: newUser.role
                    }
                })

                if (error) throw error

                setSuccess('Usuario actualizado exitosamente')
            }
            // IF CREATING
            else {
                const { error } = await supabase.functions.invoke('create-user', {
                    body: {
                        email: newUser.email,
                        password: newUser.password,
                        full_name: newUser.names,
                        last_name: newUser.last_name,
                        cedula: newUser.cedula,
                        phone: newUser.phone,
                        role: newUser.role
                    }
                })
                if (error) throw error
                setSuccess('Usuario creado exitosamente. Se ha enviado un correo de validación.')
            }

            setShowUserForm(false)
            setEditingId(null)
            setNewUser({
                names: '', last_name: '', cedula: '', phone: '', email: '', password: '', role: 'student'
            })
            fetchData()

        } catch (err: any) {
            setFormError('Error: ' + err.message)
        }
    }

    const startEdit = (user: Profile) => {
        setNewUser({
            names: user.full_name || '',
            last_name: user.last_name || '',
            cedula: user.cedula || '',
            phone: user.phone || '',
            email: (user as any).email || '',
            password: '', // Don't show password
            role: user.role || 'student'
        })
        setEditingId(user.id)
        setShowUserForm(true)
        setActionMenuOpen(null)
        setSuccess(null)
        setFormError(null)
    }

    const requestDelete = (id: string) => {
        setUserToDelete(id)
        setShowDeleteModal(true)
        setActionMenuOpen(null)
    }

    const confirmDelete = async () => {
        if (!userToDelete) return
        setIsDeleting(true)
        try {
            // Call Edge Function to delete from auth.users (cascade to profiles)
            const { error } = await supabase.functions.invoke('delete-user', {
                body: { user_id: userToDelete }
            })
            if (error) throw error

            setSuccess('Usuario eliminado correctamente')
            fetchData()
        } catch (err: any) {
            setFormError('No se pudo eliminar: ' + err.message)
        } finally {
            setIsDeleting(false)
            setShowDeleteModal(false)
            setUserToDelete(null)
        }
    }

    const resendEmail = async (email: string) => {
        try {
            setSuccess(null)
            setFormError(null)
            const { error } = await supabase.functions.invoke('resend-invite', {
                body: { email }
            })
            if (error) throw error
            setSuccess('Correo de confirmación reenviado exitosamente a ' + email)
        } catch (err: any) {
            setFormError('Error al reenviar correo: ' + err.message)
        }
        setActionMenuOpen(null)
    }

    return (
        <div className="p-6 space-y-8 min-h-screen bg-background">
            <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-primary">Torre de Control</h1>
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded border border-red-200">Rol: Administrador</span>
                </div>
                <LogoutButton />
            </div>
            {loading && <p className="text-secondary animate-pulse">Cargando datos...</p>}

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
                <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                    <h3 className="text-text-secondary font-semibold text-sm uppercase">Total Usuarios</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                    <h3 className="text-text-secondary font-semibold text-sm uppercase">Evidencias Subidas</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.evidence}</p>
                </div>
                <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-green-500">
                    <h3 className="text-text-secondary font-semibold text-sm uppercase">Impacto Generado</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.impact} pts</p>
                </div>
            </div>

            {/* Users Section */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-secondary">Gestión de Usuarios</h2>
                    <button
                        onClick={() => {
                            if (!showUserForm) {
                                setEditingId(null)
                                setNewUser({
                                    names: '', last_name: '', cedula: '', phone: '', email: '', password: '', role: 'student'
                                })
                            }
                            setShowUserForm(!showUserForm)
                            setSuccess(null)
                            setFormError(null)
                        }}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow transition-all"
                    >
                        {showUserForm ? 'Cancelar' : '+ Crear Usuario'}
                    </button>
                </div>

                {showUserForm && (
                    <div className="bg-surface p-6 rounded-xl shadow-lg border border-border mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button onClick={() => setShowUserForm(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Nombres" className="border p-2 rounded" value={newUser.names} onChange={e => setNewUser({ ...newUser, names: e.target.value })} required />
                                <input placeholder="Apellidos" className="border p-2 rounded" value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} required />
                                <input placeholder="Cédula" className="border p-2 rounded" value={newUser.cedula} onChange={e => setNewUser({ ...newUser, cedula: e.target.value })} required />
                                <input placeholder="Teléfono" className="border p-2 rounded" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} required />
                                <input placeholder="Correo" type="email" className="border p-2 rounded" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                <input placeholder={editingId ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"} type="password" className="border p-2 rounded" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required={!editingId} />
                                <select
                                    className="border p-2 rounded bg-white"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                                >
                                    <option value="student">Estudiante</option>
                                    <option value="teacher">Profesor</option>
                                    <option value="partner">Aliado</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div >
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg mt-4">
                                {editingId ? 'Guardar Cambios' : 'Confirmar Creación'}
                            </button>
                        </form >
                    </div >
                )}

                {/* Success Message Global */}
                {
                    success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between" role="alert">
                            <span className="block sm:inline">{success}</span>
                            <button onClick={() => setSuccess(null)} className="font-bold text-xl px-2">&times;</button>
                        </div>
                    )
                }
                {/* Error Message Global (or from form) */}
                {
                    formError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between" role="alert">
                            <span className="block sm:inline">{formError}</span>
                            <button onClick={() => setFormError(null)} className="font-bold text-xl px-2">&times;</button>
                        </div>
                    )
                }

                <div className="bg-surface rounded-xl shadow overflow-hidden border border-border/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-text-secondary text-sm">
                                <tr>
                                    <th className="w-10 p-4">
                                        <div className="flex items-center justify-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                                        </div>
                                    </th>
                                    <th className="p-4 font-medium">Nombre Completo</th>
                                    <th className="p-4 font-medium">Rol</th>
                                    <th className="p-4 font-medium">Cédula</th>
                                    <th className="p-4 font-medium">Teléfono</th>
                                    <th className="p-4 font-medium">Correo (ID)</th>
                                    <th className="p-4 font-medium w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                                    checked={selectedUsers.has(u.id)}
                                                    onChange={() => toggleSelection(u.id)}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-text-main">
                                            {u.full_name} {u.last_name}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${u.role === 'student' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                u.role === 'teacher' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {u.role?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-text-secondary">{u.cedula || '-'}</td>
                                        <td className="p-4 text-sm text-text-secondary">{u.phone || '-'}</td>
                                        <td className="p-4 text-sm text-text-secondary">
                                            <span className="font-medium text-text-main block">{(u as any).email || 'Sin correo'}</span>
                                            <span className="text-xs opacity-50 font-mono">{u.id.substring(0, 8)}...</span>
                                        </td>
                                        <td className="p-4 relative">
                                            <button
                                                onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
                                                disabled={!selectedUsers.has(u.id)}
                                                className={`p-2 rounded-full transition-all duration-200 ${selectedUsers.has(u.id)
                                                    ? 'hover:bg-gray-200 text-gray-500 cursor-pointer'
                                                    : 'text-gray-300 cursor-not-allowed opacity-50'
                                                    }`}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {/* Action Menu Popover */}
                                            {actionMenuOpen === u.id && selectedUsers.has(u.id) && (
                                                <div className="absolute right-8 top-8 z-10 w-32 bg-white rounded-lg shadow-lg border border-border py-1 animate-in fade-in zoom-in-95">
                                                    <button
                                                        onClick={() => startEdit(u)}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 className="w-3 h-3" /> Editar
                                                    </button>
                                                    <button
                                                        onClick={() => resendEmail((u as any).email)}
                                                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                                    >
                                                        <Mail className="w-3 h-3" /> Reenviar
                                                    </button>
                                                    <button
                                                        onClick={() => requestDelete(u.id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Borrar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section >

            {/* Cohorts Section - Minimized or Secondary */}
            < section >
                <div className="flex justify-between items-center mb-4 pt-8 border-t">
                    <h2 className="text-xl font-bold text-secondary">Cohortes</h2>
                    <button onClick={createCohort} className="text-sm bg-gray-100 hover:bg-gray-200 text-text-main px-3 py-1 rounded">
                        + Nueva
                    </button>
                </div>
                <div className="grid gap-4 md:grid-cols-3 opacity-75">
                    {cohorts.map(c => (
                        <div key={c.id} className="p-3 bg-gray-50 rounded border text-sm">
                            <b>{c.name}</b> ({c.type})
                        </div>
                    ))}
                </div>
            </section >

            {/* Modals */}
            < ConfirmModal
                isOpen={showDeleteModal}
                title="¿Eliminar Usuario?"
                message="Esta acción no se puede deshacer. El usuario perderá acceso y sus datos serán borrados permanentemente."
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                isLoading={isDeleting}
            />
        </div >
    )
}
