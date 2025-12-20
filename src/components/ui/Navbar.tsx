import { useAuth } from '../../lib/AuthContext'
import { LogOut, User, ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export const Navbar = () => {
    const { user, signOut } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    // Check if we are in a sub-page (e.g., /admin/users) to show Back button instead of Logout
    // This allows "Exit" icon position to serve as "Up" navigation
    const isSubPage = location.pathname.includes('/admin/') && location.pathname !== '/admin'
    // You can extend this logic to other roles if desired, e.g. /teacher/..., but user specifically asked for Admin pages

    return (
        <nav className="bg-gradient-to-r from-secondary to-primary p-4 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
                <div className="font-bold text-xl tracking-wide flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Escudo_de_la_Universidad_de_Cartagena.svg/1200px-Escudo_de_la_Universidad_de_Cartagena.svg.png"
                            alt="Logo" className="h-8 w-8 object-contain brightness-0 invert"
                        />
                    </div>
                    Adaptatón
                </div>

                {user && (
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                            <User size={16} />
                            <span>{user.email?.split('@')[0]}</span>
                        </div>

                        {isSubPage ? (
                            <button
                                onClick={() => navigate('/admin')}
                                className="group flex items-center bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all duration-300 backdrop-blur-sm overflow-hidden"
                                title="Volver al Panel"
                            >
                                <ArrowLeft size={20} />
                                <span className="max-w-0 group-hover:max-w-xs transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap overflow-hidden text-sm font-bold ml-0 group-hover:ml-2">
                                    Volver al Panel
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={signOut}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors backdrop-blur-sm"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}
