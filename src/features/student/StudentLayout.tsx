import { Outlet } from 'react-router-dom'
import { Layout } from '../../components/ui/Layout'

export const StudentLayout = () => {
    return (
        <Layout>
            <Outlet />
        </Layout>
    )
}
