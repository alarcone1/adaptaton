import { createContext, useState, useEffect, type ReactNode } from 'react';
import { googleLogout, useGoogleLogin, type TokenResponse } from '@react-oauth/google';

interface User {
    id: string;
    name: string;
    email: string;
    picture: string;
}

interface AuthContextType {
    user: User | null;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from local storage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/drive.file',
        onSuccess: async (tokenResponse: TokenResponse) => {
            try {
                // Store access token for Drive API calls
                localStorage.setItem('google_access_token', tokenResponse.access_token);

                // Fetch user info from Google
                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await response.json();

                const newUser: User = {
                    id: userInfo.sub,
                    name: userInfo.name,
                    email: userInfo.email,
                    picture: userInfo.picture,
                };

                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
            } catch (error) {
                console.error('Failed to fetch user info', error);
            }
        },
        onError: (error) => console.log('Login Failed:', error),
    });

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('google_access_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
