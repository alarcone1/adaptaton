import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export const RegisterAdmin = () => {
    const [formData, setFormData] = useState({
        names: '',
        last_name: '',
        cedula: '',
        phone: '',
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false) // Nuevo estado para UI de éxito
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: `${formData.names} ${formData.last_name}`.trim(),
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('No user created')

            // 2. Insert/Update Profile Data
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.names,
                    last_name: formData.last_name,
                    cedula: formData.cedula,
                    phone: formData.phone,
                    role: 'admin'
                })
                .eq('id', authData.user.id)

            if (profileError) {
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        full_name: formData.names,
                        last_name: formData.last_name,
                        cedula: formData.cedula,
                        phone: formData.phone,
                        role: 'admin'
                    })

                if (upsertError) throw upsertError
            }

            // Éxito: Mostrar UI y redirigir
            setSuccess(true)
            setTimeout(() => {
                navigate('/admin')
            }, 2000)

        } catch (err: any) {
            setError(err.message || 'Error al registrar')
            setLoading(false)
        }
    }

    // Renderizado condicional para el estado de éxito
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
                <div className="max-w-md w-full bg-surface p-10 rounded-2xl shadow-xl border border-primary/20 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-2">¡Registro Exitoso!</h2>
                    <p className="text-text-secondary mb-6">
                        El administrador ha sido creado correctamente.<br />
                        Redirigiendo al panel de control...
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full animate-[progress_2s_ease-out_forwards]" style={{ width: '0%' }}></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-surface p-8 rounded-xl shadow-lg border border-border">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary">Registro de Administrador</h1>
                    <p className="text-text-secondary mt-1">Configuración inicial del sistema</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Nombres</label>
                            <input
                                name="names"
                                type="text"
                                required
                                value={formData.names}
                                onChange={handleChange}
                                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Apellidos</label>
                            <input
                                name="last_name"
                                type="text"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Cédula</label>
                        <input
                            name="cedula"
                            type="text"
                            required
                            value={formData.cedula}
                            onChange={handleChange}
                            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Teléfono</label>
                        <input
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Correo Electrónico</label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Contraseña</label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Registrando...' : 'Registrar Administrador'}
                    </button>

                    <div className="text-center mt-4 text-sm">
                        <Link to="/login" className="text-primary hover:underline">
                            ¿Ya tienes cuenta? Iniciar Sesión
                        </Link>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    )
}
