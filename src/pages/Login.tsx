import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { AlertCircle, Lock } from 'lucide-react'

export const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasAdmin, setHasAdmin] = useState<boolean | null>(null) // null = loading check
    const [roleEmails, setRoleEmails] = useState<Record<string, string>>({}) // { role: email }
    const navigate = useNavigate()
    const { role, session } = useAuth()

    // 1. Check if ANY admin exists and get ALL role emails
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: hasAdminData, error: hasAdminError } = await supabase.rpc('app_has_admin')
            if (!hasAdminError && hasAdminData !== null) {
                setHasAdmin(hasAdminData)

                // If there is an admin, get emails for all roles
                if (hasAdminData) {
                    const { data: emailsData } = await supabase.rpc('get_role_emails')
                    if (emailsData) {
                        setRoleEmails(emailsData as Record<string, string>)
                    }
                }
            } else {
                console.error('Error checking admin status', hasAdminError)
                setHasAdmin(false)
            }
        }
        checkAdmin()
    }, [])

    // 2. Redirect if already logged in
    useEffect(() => {
        if (session && role) {
            console.log('Redirecting based on role:', role)
            switch (role) {
                case 'admin':
                    navigate('/admin', { replace: true })
                    break
                case 'student':
                    navigate('/student/home', { replace: true })
                    break
                case 'teacher':
                    navigate('/teacher', { replace: true })
                    break
                case 'partner':
                    navigate('/partner', { replace: true })
                    break
                default:
                    break
            }
        }
    }, [session, role, navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            if (error) {
                // Traducción básica de errores comunes
                let msg = error.message
                if (msg.includes('Invalid login credentials')) msg = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
                if (msg.includes('Email not confirmed')) msg = 'Tu correo no ha sido confirmado.'
                setError(msg)
            } else {
                console.log('Logged in')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fillCredentials = (targetRole: string) => {
        if (roleEmails[targetRole]) {
            setEmail(roleEmails[targetRole])
        } else {
            setEmail(`${targetRole}@adaptaton.com`)
        }
        // Assuming dev password.
        setPassword('password123')
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left: Standard Login */}
            <div className="flex-1 flex items-center justify-center bg-background p-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-primary">Adaptatón Digital</h1>
                        <p className="text-text-secondary mt-2">Bienvenido de nuevo</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-4 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
                            <input
                                type="password"
                                placeholder="******"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full p-4 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (session && !!role)}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-primary/20"
                        >
                            {loading ? 'Iniciando Sesión...' : (session && role ? 'Redirigiendo...' : 'Iniciar Sesión')}
                        </button>
                    </form>

                    {/* Mostrar enlace de registro SOLO si NO hay admin */}
                    {hasAdmin === false && (
                        <div className="text-center mt-6 animate-in fade-in slide-in-from-bottom-2">
                            <Link to="/register-admin" className="text-sm text-primary font-medium hover:underline flex items-center justify-center gap-2 border border-primary/20 p-3 rounded-lg bg-primary/5">
                                ¿Eres el primer administrador? Configura la cuenta maestra
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Dev Tools - Condicional */}
            <div className={`flex-1 bg-surface border-l border-border flex items-center justify-center p-8 relative overflow-hidden transition-all duration-500 ${hasAdmin ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>

                {!hasAdmin && (
                    <div className="absolute inset-0 z-10 bg-surface/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center">
                        <Lock className="w-12 h-12 text-text-secondary mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-text-secondary">Modo Desarrollo Bloqueado</h3>
                        <p className="text-sm text-text-secondary mt-2">
                            Registra un administrador primero para habilitar el acceso rápido.
                        </p>
                    </div>
                )}

                <div className="absolute top-0 right-0 bg-yellow-500/10 text-yellow-600 px-4 py-1 text-xs font-bold rounded-bl-xl border-l border-b border-yellow-500/20">
                    MODO DESARROLLO
                </div>

                <div className="max-w-sm w-full space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Acceso Rápido</h2>
                        <p className="text-sm text-text-secondary">Haz clic para rellenar datos</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <DevButton
                            role="admin"
                            label="Administrador"
                            emailDisplay={roleEmails['admin'] || 'admin@adaptaton.com'}
                            onClick={() => fillCredentials('admin')}
                        />
                        <DevButton
                            role="student"
                            label="Estudiante"
                            emailDisplay={roleEmails['student'] || 'student@adaptaton.com'}
                            onClick={() => fillCredentials('student')}
                        />
                        <DevButton
                            role="teacher"
                            label="Profesor"
                            emailDisplay={roleEmails['teacher'] || 'teacher@adaptaton.com'}
                            onClick={() => fillCredentials('teacher')}
                        />
                        <DevButton
                            role="partner"
                            label="Aliado"
                            emailDisplay={roleEmails['partner'] || 'partner@adaptaton.com'}
                            onClick={() => fillCredentials('partner')}
                        />
                    </div>

                    <p className="text-xs text-center text-text-secondary/50 mt-8">
                        Contraseña por defecto: <code className="bg-background px-1 rounded">password123</code>
                    </p>
                </div>
            </div>
        </div>
    )
}

const DevButton = ({ role, label, emailDisplay, onClick }: { role: string, label: string, emailDisplay: string, onClick: () => void }) => {
    const colors: Record<string, string> = {
        admin: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200',
        student: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
        teacher: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
        partner: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
    }

    return (
        <button
            onClick={onClick}
            type="button"
            className={`p-4 rounded-xl border-2 font-bold transition-all hover:-translate-y-1 hover:shadow-md flex flex-col items-center gap-2 ${colors[role]}`}
        >
            <span className="capitalize text-lg">{label}</span>
            <span className="text-[10px] opacity-75 font-normal break-all leading-tight">{emailDisplay}</span>
        </button>
    )
}
