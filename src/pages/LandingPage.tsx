import React from 'react'
import { Link } from 'react-router-dom'
import { Rocket, Target, Users, MapPin, ArrowRight } from 'lucide-react'

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-text-main flex flex-col font-sans">
            {/* Header / Nav */}
            <header className="px-6 py-4 flex justify-between items-center border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Adaptatón
                    </span>
                </div>
                <Link
                    to="/login"
                    className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-primary/20 flex items-center gap-2"
                >
                    Ingresar <ArrowRight size={16} />
                </Link>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                        Activa tu <span className="text-primary">Poder</span> de <br className="hidden md:block" />
                        <span className="text-accent">Transformación</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Únete a la comunidad que está rediseñando el futuro. Participa en retos, conecta con oportunidades y deja tu huella en el mapa.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Link
                            to="/login"
                            className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-primary/30 hover:-translate-y-1"
                        >
                            Comenzar Ahora
                        </Link>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="py-16 bg-surface/50">
                    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Target className="w-8 h-8 text-secondary" />}
                            title="Cumple Retos"
                            desc="Supera misiones diseñadas para desarrollar tus habilidades y ganar recompensas."
                        />
                        <FeatureCard
                            icon={<MapPin className="w-8 h-8 text-accent" />}
                            title="Mapa de Impacto"
                            desc="Visualiza y comparte las iniciativas que están cambiando tu comunidad."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-primary" />}
                            title="Conecta"
                            desc="Encuentra mentores, aliados y oportunidades exclusivas para tu crecimiento."
                        />
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-text-secondary text-sm border-t border-border">
                <p>© 2025 Adaptatón. Todos los derechos reservados.</p>
            </footer>
        </div>
    )
}

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <div className="mb-4 bg-background w-14 h-14 rounded-xl flex items-center justify-center border border-border">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-text-secondary leading-relaxed">
            {desc}
        </p>
    </div>
)
