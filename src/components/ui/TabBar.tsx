import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Camera, Briefcase, Users } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

export const TabBar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()

    // Only show for students for now, or adapt based on role
    // Assuming student role logic or generic bottom nav
    // const role = 'student' // Ideally get from profile context

    const tabs = [
        { icon: Home, label: 'Mi Ruta', path: '/student' },
        { icon: Camera, label: 'Capturar', path: '/student/capture' },
        { icon: Users, label: 'Radar', path: '/student/feed' },
        { icon: Briefcase, label: 'Oportunidades', path: '/student/opportunities' },
    ]

    if (!user) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] md:hidden z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path
                    const Icon = tab.icon

                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-secondary font-bold' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon size={24} className={`mb-1 transition-transform ${isActive ? '-translate-y-1' : ''}`} />
                            <span className="text-[10px] uppercase tracking-wide">{tab.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
