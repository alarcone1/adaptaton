import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
            <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <div className="text-center">
                    <h2 className="mt-2 text-4xl font-extrabold text-white tracking-tight">
                        Raíces Fam
                    </h2>
                    <p className="mt-2 text-sm text-indigo-100">
                        Tu historia familiar, segura y colaborativa.
                    </p>
                </div>
                <Outlet />
            </div>
        </div>
    );
};
