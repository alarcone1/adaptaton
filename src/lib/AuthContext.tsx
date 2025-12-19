import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from './database.types'

type UserRole = Database['public']['Enums']['user_role'] | null

interface AuthContextType {
    session: Session | null
    user: User | null
    role: UserRole
    loading: boolean
    signInWithMagicLink: (email: string) => Promise<{ data: { user: User | null; session: Session | null }; error: any }>
    signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    signInWithMagicLink: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null })
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<UserRole>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) fetchRole(session.user.id)
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) fetchRole(session.user.id)
            else {
                setRole(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching role:', error)
                // If error (e.g. no profile), default to student or null?
                // Prompt implies role is crucial.
            }

            if (data) setRole(data.role)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const signInWithMagicLink = async (email: string) => {
        return supabase.auth.signInWithOtp({ email })
    }

    const signOut = async () => {
        return supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ session, user, role, loading, signInWithMagicLink, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
