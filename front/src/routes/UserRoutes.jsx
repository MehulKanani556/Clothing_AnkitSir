import { Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Auth from '../components/Auth';
import ProductDetails from '../pages/ProductDetails';
import Wishlist from '../pages/Wishlist';
import Support from '../pages/Support';
import SupportDetail from '../pages/SupportDetail';
import CollectionPage from '../pages/CollectionPage';
import Craftsmanship from '../pages/Craftsmanship';
import ProtectedRoute from './ProtectedRoute';
import Profile from '../pages/account/Profile';
import Orders from '../pages/account/Orders';
import OrderDetail from '../pages/account/OrderDetail';
import Address from '../pages/account/Address';
import PaymentsCard from '../pages/account/PaymentsCard';
import Settings from '../pages/account/Settings';

const UserRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/product" element={<ProductDetails />} />
            <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
            <Route path="/craftsmanship" element={<Layout><Craftsmanship /></Layout>} />
            <Route path="/support" element={<Layout><Support /></Layout>} />
            <Route path="/support/:id" element={<Layout><SupportDetail /></Layout>} />
            <Route path="/product/:slug" element={<Layout><ProductDetails /></Layout>} />

            {/* Collection routes — driven by header category slugs */}
            <Route path="/collection/:mainCategorySlug" element={<CollectionPage />} />
            <Route path="/collection/:mainCategorySlug/:categorySlug" element={<CollectionPage />} />
            <Route path="/collection/:mainCategorySlug/:categorySlug/:subCategorySlug" element={<CollectionPage />} />

            {/* Protected user-only routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/orders" element={<Layout><Orders /></Layout>} />
                <Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />
                <Route path="/addresses" element={<Layout><Address /></Layout>} />
                <Route path="/payments" element={<Layout><PaymentsCard /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
            </Route>
        </Routes>
    );
};

export default UserRoutes;
