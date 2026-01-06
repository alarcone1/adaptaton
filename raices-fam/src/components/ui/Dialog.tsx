
import React, { createContext, useContext } from 'react';
import { X } from 'lucide-react';

const DialogContext = createContext<{ open: boolean; onOpenChange: (open: boolean) => void }>({
    open: false,
    onOpenChange: () => { },
});

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    if (!open) return null;

    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => onOpenChange(false)}
                />
                {/* Content Wrapper */}
                {children}
            </div>
        </DialogContext.Provider>
    );
};

export const DialogContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const { onOpenChange } = useContext(DialogContext);

    return (
        <div className={`relative z-50 bg-white rounded-xl shadow-xl w-full p-6 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
            <button
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100"
            >
                <X className="h-4 w-4 text-gray-500" />
                <span className="sr-only">Close</span>
            </button>
            {children}
        </div>
    );
};

export const DialogHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`}>
            {children}
        </div>
    );
};

export const DialogTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
        <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h2>
    );
};
