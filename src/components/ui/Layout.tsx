import { type ReactNode } from 'react'
import { Navbar } from './Navbar'
import { TabBar } from './TabBar'

interface LayoutProps {
    children: ReactNode
    hideNavbar?: boolean
    hideTabBar?: boolean
}

export const Layout = ({ children, hideNavbar = false, hideTabBar = false }: LayoutProps) => {
    return (
        <div className="flex flex-col min-h-screen">
            {!hideNavbar && <Navbar />}

            <main className="flex-grow relative z-0 pb-20 md:pb-0">
                {/* Background Shapes Layer */}
                <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[100px]" />
                    <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px]" />
                    <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[40%] bg-accent-gold/5 rounded-full blur-[120px]" />
                </div>

                {children}
            </main>

            {!hideTabBar && <TabBar />}
        </div>
    )
}
