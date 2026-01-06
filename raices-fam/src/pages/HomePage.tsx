import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
export const HomePage = () => {
    return (
        <div className="p-4 space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, <span className="text-indigo-600">Edgar</span>
                </h1>
                <p className="text-gray-500">Explora tu legado familiar.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/person/1" className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative flex items-center space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Mi Árbol</h3>
                            <p className="text-sm text-gray-500">Explora tu historia familiar</p>
                        </div>
                    </div>
                </Link>

                {/* Card 2: Estadísticas */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-shadow cursor-pointer group">
                    <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-md group-hover:scale-110 transition-transform">
                        📊
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Estadísticas</h3>
                    <p className="text-gray-500 mt-2 text-sm">Descubre datos curiosos sobre tus ancestros.</p>
                </div>
            </div>
        </div>
    );
};
