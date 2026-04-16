import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute
 * @param {string} allowedRole - 'user' | 'admin' (optional, if omitted just checks auth)
 * @param {string} redirectTo  - where to redirect if access is denied
 */
const ProtectedRoute = ({ allowedRole, redirectTo = '/auth' }) => {
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    // Wait for redux-persist rehydration before making any redirect decision
    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }
    console.log(user,allowedRole);

    if (allowedRole && user?.role !== allowedRole) {
        // Authenticated but wrong role → send to home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
