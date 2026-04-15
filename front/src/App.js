import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdminLayout from './admin/layouts/AdminLayout';
import MainCategoryList from './admin/pages/MainCategory/CategoryList';
import CategoryList from './admin/pages/Category/CategoryList';
import SubCategoryList from './admin/pages/SubCategory/SubCategoryList';
import InsideSubCategoryList from './admin/pages/InsideSubCategory/InsideSubCategoryList';
import Auth from './components/Auth';
import ProductDetails from './pages/ProductDetails';

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/product" element={<ProductDetails />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<div className="p-6">Admin Dashboard</div>} />
        <Route path="main-category" element={<MainCategoryList />} />
        <Route path="category" element={<CategoryList />} />
        <Route path="sub-category" element={<SubCategoryList />} />
        <Route path="inside-sub-category" element={<InsideSubCategoryList />} />
      </Route>
    </Routes>
  );
}

export default App;

