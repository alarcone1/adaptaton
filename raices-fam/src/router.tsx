import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProfileLayout } from './features/profile/layout/ProfileLayout';
import { ErrorPage } from './pages/ErrorPage';
import { TreePage } from './pages/TreePage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute />,
        errorElement: <ErrorPage />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <HomePage />,
                    },
                    {
                        path: 'person/:id',
                        element: <ProfileLayout />,
                    },
                ],
            },
            {
                path: 'tree',
                element: <TreePage />,
            },
        ],
    },
    {
        path: '/login',
        element: <AuthLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <LoginPage />,
            },
        ],
    },
]);
