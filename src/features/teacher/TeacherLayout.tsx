import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { BookOpen, LogOut, User } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

export const TeacherLayout = () => {
    const { signOut, user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const navItems = [
        { icon: BookOpen, label: 'Mis Cursos', path: '/teacher' },
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
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Adaptatón
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Panel Docente</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        // For Teacher, 'Mis Cursos' is /teacher. 
                        // If we are in /teacher/course/:id, we want to highlight 'Mis Cursos' as it's the parent context?
                        // Or maybe not, but usually yes. 
                        // Let's keep strict check for now or basic startWith. 
                        // /teacher encompasses everything here.
                        const isActive = location.pathname.startsWith('/teacher')

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
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
                            <p className="text-sm font-medium truncate">{user?.email || 'Docente'}</p>
                            <p className="text-xs text-gray-500 truncate">Docente</p>
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
                <span className="font-bold text-blue-600">Adaptatón Docente</span>
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
                    const isActive = location.pathname.startsWith('/teacher')

                    return (
                        <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                            <item.icon size={24} />
                            <span className="text-[10px] truncate w-full text-center">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
