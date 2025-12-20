import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Layout } from '../../components/ui/Layout'
import { Users, FileText, Activity } from 'lucide-react'

type Profile = any // Database['public']['Tables']['profiles']['Row'] -- Bypass type error for now

export const AdminDashboard = () => {
    const navigate = useNavigate()
    const [_loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ users: 0, evidence: 0, impact: 0, resources: 0, opportunities: 0 })
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [showUserForm, setShowUserForm] = useState(false)
    const [newUser, setNewUser] = useState({ names: '', last_name: '', cedula: '', phone: '', email: '', password: '', role: 'student' })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            const { count: evidenceCount } = await supabase.from('evidences').select('*', { count: 'exact', head: true })
            const { count: resourcesCount } = await supabase.from('resource_library').select('*', { count: 'exact', head: true })
            const { count: opportunitiesCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true })

            const { data: impactData } = await supabase.from('evidences').select('impact_data').eq('status', 'validated')
            const totalImpact = impactData?.reduce((acc: number, curr: any) => acc + (curr.impact_data?.value || 0), 0) || 0

            setStats({
                users: usersCount || 0,
                evidence: evidenceCount || 0,
                impact: totalImpact,
                resources: resourcesCount || 0,
                opportunities: opportunitiesCount || 0
            })
        } catch (error) {
            console.error('Error fetching admin stats:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
        window.addEventListener('focus', fetchData)
        return () => window.removeEventListener('focus', fetchData)
    }, [fetchData])

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedUsers)
        if (newSelection.has(id)) newSelection.delete(id)
        else newSelection.add(id)
        setSelectedUsers(newSelection)
        // Close menu if deselecting
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

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
                <PageHeader title="Torre de Control" subtitle="Gestión centralizada de la plataforma." role="Admin" roleColor="red" />

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="flex items-center gap-4 !bg-white/70 border-l-4 border-l-blue-500 cursor-pointer hover:scale-105 transition-transform hover:shadow-lg" onClick={() => navigate('/admin/users')}>
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Users size={24} /></div>
                        <div>
                            <p className="text-sm font-bold text-text-secondary uppercase">Usuarios</p>
                            <p className="text-3xl font-black text-primary">{stats.users}</p>
                        </div>
                    </Card>
                    <Card className="flex items-center gap-4 !bg-white/70 border-l-4 border-l-orange-500 cursor-pointer hover:scale-105 transition-transform hover:shadow-lg" onClick={() => navigate('/admin/resources')}>
                        <div className="p-3 bg-orange-100 rounded-full text-orange-600"><FileText size={24} /></div>
                        <div>
                            <p className="text-sm font-bold text-text-secondary uppercase">Recursos</p>
                            <p className="text-3xl font-black text-primary">{stats.resources}</p>
                        </div>
                    </Card>
                    <Card className="flex items-center gap-4 !bg-white/70 border-l-4 border-l-teal-500 cursor-pointer hover:scale-105 transition-transform hover:shadow-lg" onClick={() => navigate('/admin/opportunities')}>
                        <div className="p-3 bg-teal-100 rounded-full text-teal-600"><Users size={24} /></div>
                        <div>
                            <p className="text-sm font-bold text-text-secondary uppercase">Oportunidades</p>
                            <p className="text-3xl font-black text-primary">{stats.opportunities}</p>
                        </div>
                    </Card>
                    <Card className="flex items-center gap-4 !bg-white/70 border-l-4 border-l-purple-500">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600"><FileText size={24} /></div>
                        <div>
                            <p className="text-sm font-bold text-text-secondary uppercase">Evidencias</p>
                            <p className="text-3xl font-black text-primary">{stats.evidence}</p>
                        </div>
                    </Card>
                    <Card className="flex items-center gap-4 !bg-white/70 border-l-4 border-l-green-500 col-span-2 md:col-span-1">
                        <div className="p-3 bg-green-100 rounded-full text-green-600"><Activity size={24} /></div>
                        <div>
                            <p className="text-sm font-bold text-text-secondary uppercase">Impacto</p>
                            <p className="text-3xl font-black text-primary">{stats.impact}</p>
                        </div>
                    </Card>
                </div>

                {/* Module Navigation */}
                <div className="flex border-b border-gray-200">
                    <Link to="/admin/users" className="px-6 py-3 text-text-secondary hover:text-primary hover:bg-gray-50 font-medium transition-colors flex items-center gap-2">
                        <Users size={18} /> Usuarios
                    </Link>
                    <Link to="/admin/resources" className="px-6 py-3 text-text-secondary hover:text-primary hover:bg-gray-50 font-medium transition-colors flex items-center gap-2">
                        <FileText size={18} /> Recursos
                    </Link>
                    <Link to="/admin/opportunities" className="px-6 py-3 text-text-secondary hover:text-primary hover:bg-gray-50 font-medium transition-colors flex items-center gap-2">
                        <Users size={18} /> Oportunidades
                    </Link>
                </div>

                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <h3 className="text-lg font-bold text-gray-500">Selecciona un módulo arriba para comenzar</h3>
                    <p className="text-sm text-gray-400">Torre de Control Admin</p>
                </div>
            </div>
        </Layout>
    )
}
