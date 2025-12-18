import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export const LogoutButton = ({ className = "" }: { className?: string }) => {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <button
            onClick={handleLogout}
            className={`flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors ${className}`}
            title="Cerrar Sesión"
        >
            <LogOut size={18} />
            <span>Salir</span>
        </button>
    )
}
