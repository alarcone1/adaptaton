import React from 'react';
import { Rocket } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    role?: string;
    roleColor?: 'purple' | 'blue' | 'red' | 'green' | 'gold';
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, role, roleColor = 'purple' }) => {
    const roleColors = {
        purple: "bg-purple-100 text-purple-800 border-purple-200",
        blue: "bg-blue-100 text-blue-800 border-blue-200",
        red: "bg-red-100 text-red-800 border-red-200",
        green: "bg-green-100 text-green-800 border-green-200",
        gold: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };

    return (
        <header className="mb-6 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Rocket className="text-primary" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-primary">{title}</h1>
                    {role && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${roleColors[roleColor]}`}>
                            {role}
                        </span>
                    )}
                </div>
                {subtitle && <p className="text-text-secondary">{subtitle}</p>}
            </div>
        </header>
    );
};
