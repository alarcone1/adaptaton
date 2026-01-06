import { Home, Users, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BottomNav = () => {
    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-indigo-600 transition-transform active:scale-95">
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-1">Inicio</span>
                </Link>
                <Link to="#" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-indigo-600 transition-colors active:scale-95">
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-1">Familia</span>
                </Link>
                <Link to="#" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-indigo-600 transition-colors active:scale-95">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-1">Perfil</span>
                </Link>
                <Link to="#" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-indigo-600 transition-colors active:scale-95">
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-1">Ajustes</span>
                </Link>
            </div>
        </div>
    );
};
