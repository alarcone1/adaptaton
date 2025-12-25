import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Home, Newspaper, Rocket, Camera, LogOut, User } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

export const StudentLayout = () => {
    const { signOut, user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const navItems = [
        { icon: Home, label: 'Inicio', path: '/student/home' },
        { icon: Newspaper, label: 'Muro', path: '/student/feed' },
        { icon: Rocket, label: 'Oport.', path: '/student/opportunities' },
        { icon: Camera, label: 'Capturar', path: '/student/capture' },
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
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4B3179] to-[#42A799] bg-clip-text text-transparent">
                        Adaptatón
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Estudiante</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-[#4B3179]/10 text-[#4B3179] font-bold'
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
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                            <p className="text-xs text-gray-500 truncate">Estudiante</p>
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
                <span className="font-bold text-[#4B3179]">Adaptatón Student</span>
                <button onClick={handleSignOut}><LogOut size={20} /></button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-14 pb-20 md:pb-0 md:pt-0 md:pl-64">
                <div className="p-4 md:p-6 max-w-4xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around py-3 z-20">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)
                    return (
                        <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'text-[#4B3179] font-bold' : 'text-gray-400'}`}>
                            <item.icon size={24} />
                            <span className="text-[10px] truncate w-full text-center">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
