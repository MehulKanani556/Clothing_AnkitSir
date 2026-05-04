import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../admin/layouts/AdminLayout';
import MainCategoryList from '../admin/pages/MainCategory/CategoryList';
import CategoryList from '../admin/pages/Category/CategoryList';
import SubCategoryList from '../admin/pages/SubCategory/SubCategoryList';
import InsideSubCategoryList from '../admin/pages/InsideSubCategory/InsideSubCategoryList';
import ProductList from '../admin/pages/Product/ProductList';
import ProductForm from '../admin/pages/Product/ProductForm';
import ProductView from '../admin/pages/Product/ProductView';
import OrderList from '../admin/pages/Order/OrderList';
import OrderView from '../admin/pages/Order/OrderView';
import CustomerList from '../admin/pages/Customer/CustomerList';
import CustomerView from '../admin/pages/Customer/CustomerView';
import Settings from '../admin/pages/Settings/Settings';
import LookbookList from '../admin/pages/Lookbook/LookbookList';
import ProtectedRoute from './ProtectedRoute';

const AdminRoutes = () => {
    return (
        <Routes>
            {/* All admin routes are protected — must be authenticated with role "admin" */}
            <Route element={<ProtectedRoute allowedRole="admin" redirectTo="/auth" />}>
                <Route path="/" element={<AdminLayout />}>
                    <Route index element={<div className="p-6">Admin Dashboard</div>} />
                    <Route path="main-category" element={<MainCategoryList />} />
                    <Route path="category" element={<CategoryList />} />
                    <Route path="sub-category" element={<SubCategoryList />} />
                    <Route path="inside-sub-category" element={<InsideSubCategoryList />} />
                    <Route path="product" element={<ProductList />} />
                    <Route path="product/create" element={<ProductForm />} />
                    <Route path="product/edit/:id" element={<ProductForm />} />
                    <Route path="product/view/:id" element={<ProductView />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="order/view/:id" element={<OrderView />} />
                    <Route path="customers" element={<CustomerList />} />
                    <Route path="customer/view/:id" element={<CustomerView />} />
                    <Route path="lookbook" element={<LookbookList />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
