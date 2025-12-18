import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Camera, Users, Briefcase } from 'lucide-react'
import { LogoutButton } from '../../components/LogoutButton'
import clsx from 'clsx'

export const StudentLayout = () => {
    const location = useLocation()

    const navItems = [
        { path: '/student', icon: Home, label: 'Mi Ruta' },
        { path: '/student/capture', icon: Camera, label: 'Capturar' },
        { path: '/student/feed', icon: Users, label: 'Radar' },
        { path: '/student/opportunities', icon: Briefcase, label: 'Oportunidades' },
    ]

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20">
            <header className="flex justify-between items-center p-4 bg-surface shadow-sm sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-lg">Adaptatón</span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">ESTUDIANTE</span>
                </div>
                <LogoutButton />
            </header>
            <main className="flex-1 p-4">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-surface shadow-lg border-t border-gray-100 flex justify-around items-center p-2 z-40">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full py-2 rounded-lg transition-colors",
                                isActive ? "text-primary bg-purple-50" : "text-text-secondary"
                            )}
                        >
                            <item.icon size={24} color={isActive ? '#4A2574' : '#64748B'} />
                            <span className="text-xs font-medium mt-1">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
