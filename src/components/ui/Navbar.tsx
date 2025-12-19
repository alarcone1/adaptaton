import { useAuth } from '../../lib/AuthContext'
import { LogOut, User } from 'lucide-react'

export const Navbar = () => {
    const { user, signOut } = useAuth()

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
                        <button
                            onClick={signOut}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors backdrop-blur-sm"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}
