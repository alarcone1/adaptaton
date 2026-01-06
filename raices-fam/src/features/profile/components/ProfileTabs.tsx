import { User, Calendar, Image } from 'lucide-react';

interface TabProps {
    activeTab: 'info' | 'timeline' | 'gallery';
    onTabChange: (tab: 'info' | 'timeline' | 'gallery') => void;
}

export const ProfileTabs = ({ activeTab, onTabChange }: TabProps) => {
    const tabs = [
        { id: 'info', label: 'Info', icon: User },
        { id: 'timeline', label: 'Historia', icon: Calendar },
        { id: 'gallery', label: 'Galería', icon: Image },
    ] as const;

    return (
        <div className="flex border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-16 z-40">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex-1 flex items-center justify-center py-4 px-1 border-b-2 text-sm font-medium transition-all ${isActive
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
