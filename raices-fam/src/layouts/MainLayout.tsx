import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { BottomNav } from '../components/ui/BottomNav';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            {/* Desktop Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pb-24 md:pb-6 animate-fade-in">
                <Outlet />
            </main>

            {/* Mobile Navigation */}
            <BottomNav />
        </div>
    );
};
