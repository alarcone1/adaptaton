import { useEffect, useState } from 'react'

import { supabase } from '../../../lib/supabase'
import type { Database } from '../../../lib/database.types'
import { ConfirmModal } from '../../../components/ConfirmModal'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Layout } from '../../../components/ui/Layout'
import { Users, Trash2, Edit2, Plus, MoreVertical, Mail } from 'lucide-react'

type Profile = any // Database['public']['Tables']['profiles']['Row'] -- Bypass type error for now

export const UsersManager = () => {
    const [users, setUsers] = useState<Profile[]>([])
    const [_loading, setLoading] = useState(true)
    const [showUserForm, setShowUserForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const [_isDeleting, setIsDeleting] = useState(false)
    const [newUser, setNewUser] = useState({ names: '', last_name: '', cedula: '', phone: '', email: '', password: '', role: 'student' as any })

    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        if (usersData) setUsers(usersData)
        setLoading(false)
    }

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedUsers)
        if (newSelection.has(id)) newSelection.delete(id)
        else newSelection.add(id)
        setSelectedUsers(newSelection)
        if (activeMenu === id && selectedUsers.has(id)) setActiveMenu(null)
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUser.email || (!editingId && !newUser.password)) return
        try {
            if (editingId) {
                const { error } = await supabase.functions.invoke('update-user', { body: { ...newUser, user_id: editingId, full_name: newUser.names } })
                if (error) throw error
                setSuccess('Usuario actualizado')
            } else {
                const { error } = await supabase.functions.invoke('create-user', { body: { ...newUser, full_name: newUser.names } })
                if (error) throw error
                setSuccess('Usuario creado')
            }
            setShowUserForm(false)
            setEditingId(null)
            setNewUser({ names: '', last_name: '', cedula: '', phone: '', email: '', password: '', role: 'student' })
            fetchData()
        } catch (err: any) { setFormError('Error: ' + err.message) }
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

    function startEdit(user: Profile) {
        setNewUser({
            names: user.full_name || '', last_name: '', cedula: '', phone: (user as any).phone || '', email: (user as any).email || '', password: '', role: user.role || 'student'
        })
        setEditingId(user.id); setShowUserForm(true)
    }

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen" onClick={() => setActiveMenu(null)}>


                <PageHeader title="Gestión de Usuarios" subtitle="Administra estudiantes, profesores y aliados." role="Admin" roleColor="red" />

                <section onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-primary">Usuarios Registrados</h2>
                        <Button
                            onClick={() => {
                                if (showUserForm) {
                                    setShowUserForm(false)
                                    setEditingId(null)
                                    setNewUser({ names: '', last_name: '', cedula: '', phone: '', email: '', password: '', role: 'student' as any })
                                } else {
                                    setNewUser({ names: '', last_name: '', cedula: '', phone: '', email: '', password: '', role: 'student' as any })
                                    setEditingId(null)
                                    setShowUserForm(true)
                                }
                            }}
                            size="sm"
                        >
                            <Plus size={18} /> {showUserForm ? 'Cerrar' : 'Nuevo Usuario'}
                        </Button>
                    </div>

                    {showUserForm && (
                        <Card className="mb-8 border-2 border-primary/10 p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-primary">
                                {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                                {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                            </h3>
                            <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase ml-1">Nombre Completo</label>
                                    <input placeholder="Ej: Juan Pérez" value={newUser.names} onChange={e => setNewUser({ ...newUser, names: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase ml-1">Teléfono</label>
                                    <input placeholder="Ej: 300 123 4567" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase ml-1">Email</label>
                                    <input placeholder="correo@ejemplo.com" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none" />
                                </div>
                                {!editingId && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-text-secondary uppercase ml-1">Contraseña</label>
                                        <input placeholder="••••••••" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none" />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase ml-1">Rol</label>
                                    <div className="relative">
                                        <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as any })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none appearance-none cursor-pointer">
                                            <option value="student">Estudiante</option>
                                            <option value="teacher">Profesor</option>
                                            <option value="partner">Aliado</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex justify-end mt-4">
                                    <Button type="submit" className="!w-auto px-8 min-w-[200px]">
                                        Guardar Usuario
                                    </Button>
                                </div>
                            </form>
                            {formError && <p className="text-red-500 mt-4 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{formError}</p>}
                            {success && <p className="text-green-600 mt-4 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-100">{success}</p>}
                        </Card>
                    )}

                    <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/50 overflow-visible">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-primary/5 text-primary font-bold text-xs uppercase">
                                <tr>
                                    <th className="p-4 w-10">#</th>
                                    <th className="p-4">Usuario</th>
                                    <th className="p-4 hidden md:table-cell">Contacto</th>
                                    <th className="p-4 hidden md:table-cell">Rol</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/50">
                                {users.map(user => {
                                    const isSelected = selectedUsers.has(user.id)
                                    return (
                                        <tr key={user.id} className={`transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-white/40'}`}>
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(user.id)}
                                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-text-main">{user.full_name}</div>
                                                <div className="text-xs text-text-secondary">{(user as any).email}</div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell text-sm text-text-secondary">
                                                {(user as any).phone || 'Sin teléfono'}
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <Badge variant={user.role === 'admin' ? 'purple' : user.role === 'teacher' ? 'green' : user.role === 'partner' ? 'gold' : 'gray'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right relative">
                                                <button
                                                    disabled={!isSelected}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setActiveMenu(activeMenu === user.id ? null : user.id)
                                                    }}
                                                    className={`p-2 rounded-full transition-colors ${isSelected
                                                        ? 'text-primary hover:bg-primary/10 cursor-pointer'
                                                        : 'text-gray-300 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <MoreVertical size={20} />
                                                </button>

                                                {/* Context Menu */}
                                                {activeMenu === user.id && isSelected && (
                                                    <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <button
                                                            onClick={() => { startEdit(user); setActiveMenu(null) }}
                                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-text-main"
                                                        >
                                                            <Edit2 size={16} /> Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleResendInvite((user as any).email)}
                                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 text-text-main"
                                                        >
                                                            <Mail size={16} /> Reenviar Correo
                                                        </button>
                                                        <div className="h-px bg-gray-100 my-0"></div>
                                                        <button
                                                            onClick={() => { setUserToDelete(user.id); setShowDeleteModal(true); setActiveMenu(null) }}
                                                            className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                                        >
                                                            <Trash2 size={16} /> Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <ConfirmModal
                    isOpen={showDeleteModal}
                    title="Eliminar Usuario"
                    message="¿Estás seguro?"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            </div>
        </Layout>
    )
}
