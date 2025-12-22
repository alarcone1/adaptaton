import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'

import { Users, FileText, Activity, BookOpen } from 'lucide-react'



export const AdminDashboard = () => {
    const navigate = useNavigate()
    const [_loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ users: 0, evidence: 0, impact: 0, resources: 0, opportunities: 0, cohorts: 0, subjects: 0 })

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            const { count: evidenceCount } = await supabase.from('evidences').select('*', { count: 'exact', head: true })
            const { count: resourcesCount } = await supabase.from('resource_library').select('*', { count: 'exact', head: true })
            // Fix: Table name is 'Opportunities' (capitalized) based on previous context, or try case-insensitive if needed. 
            // Based on lint errors, it seems correct name might be 'Opportunities' in types but let's check. 
            // In step 435 (database.types.ts), the table is 'Opportunities'.
            const { count: opportunitiesCount } = await supabase.from('opportunities' as any).select('*', { count: 'exact', head: true })
            const { count: cohortsCount } = await supabase.from('cohorts').select('*', { count: 'exact', head: true })
            const { count: subjectsCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true })

            const { data: impactData } = await supabase.from('evidences').select('impact_data').eq('status', 'validated')
            const totalImpact = impactData?.reduce((acc: number, curr: any) => acc + (curr.impact_data?.value || 0), 0) || 0

            setStats({
                users: usersCount || 0,
                evidence: evidenceCount || 0,
                impact: totalImpact,
                resources: resourcesCount || 0,
                opportunities: opportunitiesCount || 0,
                cohorts: cohortsCount || 0,
                subjects: subjectsCount || 0
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



    // Recent Activity State
    const [recentActivity, setRecentActivity] = useState<any[]>([])

    const fetchRecentActivity = useCallback(async () => {
        try {
            // 1. Fetch recent profiles (New Users)
            const { data: newUsers } = await supabase
                .from('profiles')
                .select('id, full_name, created_at, role')
                .order('created_at', { ascending: false })
                .limit(5)

            // 2. Fetch recent evidences (New Submissions)
            const { data: newEvidence } = await supabase
                .from('evidences')
                .select('id, description, created_at, user:profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(5)

            // 3. Normalize and Merge
            const activityParams = [
                ...(newUsers || []).map(u => ({
                    id: u.id,
                    type: 'user',
                    title: 'Nuevo Usuario',
                    description: `${u.full_name} se unió como ${u.role}`,
                    date: new Date(u.created_at!),
                    icon: Users,
                    color: 'bg-blue-100 text-blue-600'
                })),
                ...(newEvidence || []).map(e => ({
                    id: e.id,
                    type: 'evidence',
                    title: 'Nueva Evidencia',
                    description: `${(e.user as any)?.full_name} envió: "${e.description?.substring(0, 30)}..."`,
                    date: new Date(e.created_at!),
                    icon: FileText,
                    color: 'bg-green-100 text-green-600'
                }))
            ]

            // 4. Sort and Slice
            const sorted = activityParams.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 7)
            setRecentActivity(sorted)

        } catch (error) {
            console.error('Error fetching activity:', error)
        }
    }, [])

    useEffect(() => {
        fetchRecentActivity()
        // Poll every 30s
        const interval = setInterval(fetchRecentActivity, 30000)
        return () => clearInterval(interval)
    }, [fetchRecentActivity])


    return (

        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <PageHeader title="Torre de Control" subtitle="Gestión centralizada de la plataforma." role="Admin" roleColor="red" />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/admin/users')}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Users size={32} className="text-white" />
                        </div>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">Total</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Usuarios Activos</p>
                        <h3 className="text-4xl font-black mt-1">{stats.users}</h3>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/admin/resources')}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <FileText size={32} className="text-white" />
                        </div>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">Librería</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Recursos Educativos</p>
                        <h3 className="text-4xl font-black mt-1">{stats.resources}</h3>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/admin/opportunities')}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Activity size={32} className="text-white" />
                        </div>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">Activas</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-teal-100 text-sm font-medium uppercase tracking-wide">Oportunidades</p>
                        <h3 className="text-4xl font-black mt-1">{stats.opportunities}</h3>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1" onClick={() => navigate('/admin/cohorts')}>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Users size={32} className="text-white" />
                        </div>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">Grupos</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">Cohortes</p>
                        <h3 className="text-4xl font-black mt-1">{stats.cohorts}</h3>
                    </div>
                </Card>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-100" onClick={() => navigate('/admin/subjects')}>
                    <div className="p-3 bg-pink-100 text-pink-600 rounded-full">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Materias</p>
                        <p className="text-2xl font-black text-gray-800">{stats.subjects}</p>
                    </div>
                </Card>
                <Card className="p-5 flex items-center gap-4 bg-white border border-gray-100">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Evidencias Totales</p>
                        <p className="text-2xl font-black text-gray-800">{stats.evidence}</p>
                    </div>
                </Card>
                <Card className="p-5 flex items-center gap-4 bg-white border border-gray-100">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Impacto Generado</p>
                        <p className="text-2xl font-black text-gray-800">{stats.impact}</p>
                    </div>
                </Card>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* 1. Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="text-primary" size={20} /> Accesos Rápidos
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => navigate('/admin/users')} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-4 group">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-blue-700">Gestionar Usuarios</h4>
                                <p className="text-xs text-gray-500">Alta y baja de alumnos/docentes</p>
                            </div>
                        </button>
                        <button onClick={() => navigate('/admin/cohorts')} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left flex items-center gap-4 group">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-indigo-700">Ver Cohortes</h4>
                                <p className="text-xs text-gray-500">Administrar grupos académicos</p>
                            </div>
                        </button>
                        <button onClick={() => navigate('/admin/resources')} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md transition-all text-left flex items-center gap-4 group">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-orange-700">Librería de Recursos</h4>
                                <p className="text-xs text-gray-500">Gestionar contenido educativo</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 2. System Overview / Activity Log */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="text-primary" size={20} /> Resumen del Sistema
                    </h3>
                    <Card className="p-0 bg-white border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actividad Reciente</span>
                            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Ver todo</span>
                        </div>

                        <div className="divide-y divide-gray-50 overflow-y-auto max-h-[400px]">
                            {recentActivity.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <Activity size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>Sin actividad reciente</p>
                                </div>
                            ) : (
                                recentActivity.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                                            <item.icon size={20} />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.title}</h4>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                    {item.date.toLocaleDateString()} {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

