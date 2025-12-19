import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Layout } from '../components/ui/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    // Development backdoor - Pre-fills credentials
    const handleDevLogin = async (role: string) => {
        const devUsers: Record<string, { email: string, pass: string }> = {
            'student': { email: 'ealarcon@udc.edu.co', pass: '123456' },
            'teacher': { email: 'ealarcon@unicartagena.edu.co', pass: '123456' },
            'partner': { email: 'ctm@udc.edu.co', pass: '123456' },
            'admin': { email: 'alarcone1@gmail.com', pass: '123456' }
        }

        if (devUsers[role]) {
            setEmail(devUsers[role].email)
            setPassword(devUsers[role].pass)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error: _error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role) {
                    switch (profile.role) {
                        case 'student': navigate('/student'); break;
                        case 'teacher': navigate('/teacher'); break;
                        case 'partner': navigate('/partner'); break;
                        case 'admin': navigate('/admin'); break;
                        default: navigate('/'); break;
                    }
                } else {
                    navigate('/')
                }
            }
        } catch (error: any) {
            alert('Error al iniciar sesión: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout hideNavbar hideTabBar>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

                {/* Branding */}
                <div className="text-center mb-8 relative z-10">
                    <div className="bg-white/30 p-4 rounded-3xl backdrop-blur-md inline-block mb-4 shadow-xl border border-white/40">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Escudo_de_la_Universidad_de_Cartagena.svg/1200px-Escudo_de_la_Universidad_de_Cartagena.svg.png"
                            alt="Logo"
                            className="w-24 h-24 object-contain brightness-0 invert-0"
                        />
                    </div>
                    <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Adaptatón<span className="text-secondary">.Digital</span></h1>
                    <p className="text-text-secondary font-medium">Plataforma de Impacto Territorial</p>
                </div>

                <Card className="w-full max-w-md p-8 !bg-white/60 !backdrop-blur-xl luxury">
                    <h2 className="text-2xl font-bold text-center text-primary mb-6">Iniciar Sesión</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2">Correo Institucional</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                placeholder="usuario@unicartagena.edu.co"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" fullWidth disabled={loading} size="lg" className="mt-4">
                            {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200/50">
                        <p className="text-center text-xs text-text-secondary uppercase tracking-widest font-bold mb-4">Acceso Rápido (Dev)</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="p-2 text-xs font-bold text-secondary bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
                                onClick={() => handleDevLogin('student')}
                            >
                                Estudiante
                            </button>
                            <button
                                type="button"
                                className="p-2 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                onClick={() => handleDevLogin('teacher')}
                            >
                                Profesor
                            </button>
                            <button
                                type="button"
                                className="p-2 text-xs font-bold text-accent-orange bg-accent-orange/10 rounded-lg hover:bg-accent-orange/20 transition-colors"
                                onClick={() => handleDevLogin('admin')}
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                className="p-2 text-xs font-bold text-accent-gold bg-accent-gold/10 rounded-lg hover:bg-accent-gold/20 transition-colors"
                                onClick={() => handleDevLogin('partner')}
                            >
                                Aliado
                            </button>
                        </div>
                    </div>
                </Card>

                <p className="mt-8 text-xs text-primary/60 font-medium">© 2024 Universidad de Cartagena</p>
            </div>
        </Layout>
    )
}
