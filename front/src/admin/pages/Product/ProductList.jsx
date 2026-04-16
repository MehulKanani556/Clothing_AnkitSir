import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../../redux/slice/product.slice';
import {
    MdAdd,
    MdEdit,
    MdDelete,
    MdSearch,
    MdFilterList,
    MdShoppingBag,
    MdVisibility,
    MdToggleOn,
    MdToggleOff
} from 'react-icons/md';

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products = [], loading = false } = useSelector((state) => state.product || {});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            dispatch(deleteProduct(id));
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.mainCategory?._id === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getDefaultImage = (product) => {
        const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
        return defaultVariant?.images?.[0] || null;
    };

    const getPrice = (product) => {
        const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
        if (defaultVariant?.options?.length > 0) {
            const prices = defaultVariant.options.map(opt => opt.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            return minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;
        }
        return defaultVariant?.price ? `₹${defaultVariant.price}` : 'N/A';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Products</h2>
                    <p className="text-slate-500 text-sm">Manage your product catalog here.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/product/create')}
                    className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95"
                >
                    <MdAdd size={20} />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Stats and Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 text-slate-600 hover:bg-black hover:text-white rounded-2xl transition-all text-sm border border-slate-100 font-semibold group">
                        <MdFilterList size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span>Filters</span>
                    </button>
                </div>
                <div className="bg-black p-5 rounded-3xl border border-black flex items-center justify-between shadow-xl shadow-black/10">
                    <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Total Products</p>
                        <p className="text-3xl font-black text-white">{products.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <MdShoppingBag className="text-white" size={28} />
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && products.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400">Loading products...</span>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        No products found matching your search.
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Product Image */}
                            <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                {getDefaultImage(product) ? (
                                    <img
                                        src={getDefaultImage(product)}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <MdShoppingBag size={64} />
                                    </div>
                                )}

                                {/* Badge */}
                                {product.badge && (
                                    <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                                        {product.badge}
                                    </div>
                                )}

                                {/* Status */}
                                <div className="absolute top-3 right-3">
                                    {product.isActive ? (
                                        <MdToggleOn className="text-green-500 bg-white rounded-full" size={28} />
                                    ) : (
                                        <MdToggleOff className="text-slate-400 bg-white rounded-full" size={28} />
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/product/edit/${product._id}`)}
                                        className="p-3 bg-white text-black rounded-xl hover:scale-110 transition-transform"
                                    >
                                        <MdEdit size={20} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/product/view/${product._id}`)}
                                        className="p-3 bg-white text-black rounded-xl hover:scale-110 transition-transform"
                                    >
                                        <MdVisibility size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-slate-900 line-clamp-2 flex-1">{product.name}</h3>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        {product.mainCategory?.mainCategoryName}
                                    </span>
                                    <span className="text-lg font-black text-black">
                                        {getPrice(product)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
                                    <span>Views: {product.view || 0}</span>
                                    <span>Sold: {product.sold || 0}</span>
                                    <span>Variants: {product.variants?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductList;
