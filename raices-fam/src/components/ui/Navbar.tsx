import { Home, Users, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm hidden md:block transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Raíces Fam
                            </span>
                        </div>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className={`${location.pathname === '/'
                                    ? 'border-indigo-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Inicio
                            </Link>
                            <Link
                                to="/tree"
                                className={`${location.pathname === '/tree'
                                    ? 'border-indigo-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all`}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Árbol
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                        {user && (
                            <>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                                    <img
                                        className="h-8 w-8 rounded-full border border-indigo-200"
                                        src={user.picture}
                                        alt={user.name}
                                    />
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-indigo-50 p-2 rounded-full text-indigo-600 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
