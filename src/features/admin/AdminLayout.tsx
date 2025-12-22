import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { LayoutGrid, Users, FileText, Activity, BookOpen, LogOut, User } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

export const AdminLayout = () => {
    const { signOut, user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const navItems = [
        { icon: LayoutGrid, label: 'Torre de Control', path: '/admin' }, // Exact match handled by logic or regex if needed, but here simple startsWith usually works except for root.
        { icon: Users, label: 'Usuarios', path: '/admin/users' },
        { icon: FileText, label: 'Recursos', path: '/admin/resources' },
        { icon: Activity, label: 'Oportunidades', path: '/admin/opportunities' },
        { icon: Users, label: 'Cohortes', path: '/admin/cohorts' },
        { icon: BookOpen, label: 'Materias', path: '/admin/subjects' },
    ]

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Adaptatón
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Admin Panel</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        // Strict check for root path to avoid highlighting everything
                        const isActive = item.path === '/admin'
                            ? location.pathname === '/admin'
                            : location.pathname.startsWith(item.path)

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-secondary/10 text-secondary font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3 px-4 py-3 text-gray-700 mb-2">
                        <User size={20} className="text-gray-400" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.email || 'Administrador'}</p>
                            <p className="text-xs text-gray-500 truncate">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b px-4 py-3 flex justify-between items-center">
                <span className="font-bold text-secondary">Adaptatón Admin</span>
                <button onClick={handleSignOut}><LogOut size={20} /></button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-14 pb-20 md:pb-0 md:pt-0 md:pl-64">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around py-3 z-20 overflow-x-auto">
                {navItems.map((item) => {
                    const isActive = item.path === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.path)

                    return (
                        <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'text-secondary' : 'text-gray-400'}`}>
                            <item.icon size={24} />
                            <span className="text-[10px] truncate w-full text-center">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
