
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Users, FileText, Activity, BookOpen, ExternalLink, Zap, Clock, LayoutGrid } from 'lucide-react'

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
                    color: 'bg-[#66AD9D]/10 text-[#66AD9D]'
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
        const interval = setInterval(fetchRecentActivity, 30000)
        return () => clearInterval(interval)
    }, [fetchRecentActivity])


    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <PageHeader
                title="Torre de Control"
                subtitle="Visión global del ecosistema de aprendizaje."
                icon={LayoutGrid}
            />

            {/* Stats Overview */}
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

                {/* 1. Usuarios - #66AD9D */}
                <Card onClick={() => navigate('/admin/users')} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-[#66AD9D] text-white cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <Users size={80} />
                    </div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <Users size={24} className="text-white" />
                            </div>
                            <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">Total</span>
                        </div>
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Usuarios Activos</p>
                            <h3 className="text-4xl font-black">{stats.users}</h3>
                        </div>
                    </div>
                </Card>

                {/* 2. Recursos - #E8BD47 */}
                <Card onClick={() => navigate('/admin/resources')} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-[#E8BD47] text-white cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <FileText size={80} />
                    </div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <FileText size={24} className="text-white" />
                            </div>
                            <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">Librería</span>
                        </div>
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Recursos</p>
                            <h3 className="text-4xl font-black">{stats.resources}</h3>
                        </div>
                    </div>
                </Card>

                {/* 3. Oportunidades - #E49744 */}
                <Card onClick={() => navigate('/admin/opportunities')} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-[#E49744] text-white cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <Activity size={80} />
                    </div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <Activity size={24} className="text-white" />
                            </div>
                            <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">Oportunidades</span>
                        </div>
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Activas</p>
                            <h3 className="text-4xl font-black">{stats.opportunities}</h3>
                        </div>
                    </div>
                </Card>

                {/* 4. Cohortes - #D45A4E */}
                <Card onClick={() => navigate('/admin/cohorts')} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-[#D45A4E] text-white cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <Users size={80} />
                    </div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <Users size={24} className="text-white" />
                            </div>
                            <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">Grupos</span>
                        </div>
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Cohortes</p>
                            <h3 className="text-4xl font-black">{stats.cohorts}</h3>
                        </div>
                    </div>
                </Card>

                {/* 5. Materias (Moved Up) - #1B1B3F */}
                <Card onClick={() => navigate('/admin/subjects')} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-[#1B1B3F] text-white cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <BookOpen size={80} />
                    </div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <BookOpen size={24} className="text-white" />
                            </div>
                            <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">Academia</span>
                        </div>
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Materias</p>
                            <h3 className="text-4xl font-black">{stats.subjects}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Secondary Stats Row - Only Evidence and Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-5 flex items-center gap-5 hover:shadow-lg transition-all border-l-4 border-l-[#4B3179] group">
                    <div className="p-3 bg-[#4B3179]/10 text-[#4B3179] rounded-xl group-hover:bg-[#4B3179] group-hover:text-white transition-colors duration-300">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Actividad</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-gray-800">{stats.evidence}</p>
                            <span className="text-sm text-gray-500 font-medium">Evidencias</span>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 flex items-center gap-5 hover:shadow-lg transition-all border-l-4 border-l-[#4B3179] group">
                    <div className="p-3 bg-[#4B3179]/10 text-[#4B3179] rounded-xl group-hover:bg-[#4B3179] group-hover:text-white transition-colors duration-300">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Métricas</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-gray-800">{stats.impact}</p>
                            <span className="text-sm text-gray-500 font-medium">Impacto KGs</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Content & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* 1. Quick Actions */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Zap className="text-secondary" size={20} />
                        <h3 className="text-lg font-bold text-gray-800">Accesos Directos</h3>
                    </div>

                    <div className="space-y-4">
                        <button onClick={() => navigate('/admin/users')} className="w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#66AD9D]/50 hover:shadow-lg hover:shadow-[#66AD9D]/5 transition-all text-left flex items-start gap-4 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={16} className="text-gray-400" />
                            </div>
                            <div className="p-3 bg-[#66AD9D]/10 text-[#66AD9D] rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Users size={22} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-[#66AD9D] transition-colors">Gestionar Usuarios</h4>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Administración de roles, altas y bajas de estudiantes.</p>
                            </div>
                        </button>

                        <button onClick={() => navigate('/admin/cohorts')} className="w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#D45A4E]/50 hover:shadow-lg hover:shadow-[#D45A4E]/5 transition-all text-left flex items-start gap-4 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={16} className="text-gray-400" />
                            </div>
                            <div className="p-3 bg-[#D45A4E]/10 text-[#D45A4E] rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Users size={22} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-[#D45A4E] transition-colors">Gestionar Grupos</h4>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Creación de cohortes y asignación de profesores.</p>
                            </div>
                        </button>

                        <button onClick={() => navigate('/admin/resources')} className="w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/5 transition-all text-left flex items-start gap-4 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={16} className="text-gray-400" />
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <FileText size={22} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-secondary transition-colors">Librería de Recursos</h4>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">Configuración de retos, métricas y contenido.</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 2. System Overview / Activity Log */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Clock className="text-gray-400" size={20} />
                            <h3 className="text-lg font-bold text-gray-800">Actividad del Sistema</h3>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full animate-pulse">En vivo</span>
                    </div>

                    <Card className="p-0 bg-white border border-gray-100 shadow-sm overflow-hidden h-full">
                        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {recentActivity.length === 0 ? (
                                <div className="p-12 text-center text-gray-300 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Activity size={32} className="opacity-50" />
                                    </div>
                                    <p className="font-medium">Esperando nueva actividad...</p>
                                </div>
                            ) : (
                                recentActivity.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="p-5 flex gap-5 hover:bg-gray-50/80 transition-colors group">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${item.color} group-hover:scale-105 transition-transform`}>
                                            <item.icon size={22} />
                                        </div>
                                        <div className="flex-grow min-w-0 pt-0.5">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h4 className="font-bold text-gray-800 text-sm truncate pr-4">{item.title}</h4>
                                                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{item.description}</p>
                                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                                <Clock size={10} /> {item.date.toLocaleDateString()}
                                            </p>
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

