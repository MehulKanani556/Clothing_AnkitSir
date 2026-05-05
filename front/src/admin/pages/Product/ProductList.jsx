import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../../redux/slice/product.slice';
import {
    MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList,
    MdShoppingBag, MdVisibility, MdToggleOn, MdToggleOff, MdWarning, MdRefresh
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Pagination from '../../components/Pagination';

// ── Delete Confirmation Modal ─────────────────────────────────────
const DeleteModal = ({ product, onConfirm, onCancel, deleting }) => {
    if (!product) return null;

    const variants = product.variants || [];
    const totalStock = variants.reduce((sum, v) => {
        if (v.options?.length > 0) return sum + v.options.reduce((s, o) => s + (o.stock || 0), 0);
        return sum + (v.stock || 0);
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative z-10 bg-background rounded-none shadow-2xl border border-border w-full max-w-md animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-none flex items-center justify-center flex-shrink-0">
                            <MdWarning className="text-red-600" size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-mainText">Delete Product</h3>
                            <p className="text-xs text-lightText mt-0.5">This action cannot be undone</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-mainText">
                        You are about to delete <span className="font-bold text-mainText">"{product.name}"</span> and all its variants.
                    </p>

                    {/* Variants list */}
                    {variants.length > 0 ? (
                        <div className="bg-red-50 border border-red-100 rounded-none overflow-hidden">
                            <div className="px-4 py-2.5 bg-red-100/60 border-b border-red-100">
                                <p className="text-xs font-bold text-red-800 uppercase tracking-wide">
                                    {variants.length} variant{variants.length !== 1 ? 's' : ''} will be deleted · Total stock: {totalStock}
                                </p>
                            </div>
                            <div className="divide-y divide-red-100 max-h-48 overflow-y-auto">
                                {variants.map((v, i) => {
                                    const variantStock = v.options?.length > 0
                                        ? v.options.reduce((s, o) => s + (o.stock || 0), 0)
                                        : (v.stock || 0);
                                    return (
                                        <div key={v._id || i} className="px-4 py-2.5 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5">
                                                {v.images?.[0] && (
                                                    <img src={v.images[0]} alt={v.color} className="w-8 h-8 rounded-none object-cover border border-red-200" />
                                                )}
                                                <div>
                                                    <p className="text-xs font-bold text-mainText">{v.color}</p>
                                                    {v.options?.length > 0 && (
                                                        <p className="text-[10px] text-lightText">{v.options.length} size{v.options.length !== 1 ? 's' : ''}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-red-700">{variantStock} in stock</p>
                                                {v.sku && <p className="text-[10px] text-lightText/60">{v.sku}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No variants attached to this product.</p>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="flex-1 px-5 py-2.5 border border-border text-lightText font-bold rounded-none hover:bg-mainBG transition-all text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-[2] px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-black rounded-none transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                    >
                        {deleting
                            ? <><AiOutlineLoading3Quarters size={16} className="animate-spin" /> Deleting...</>
                            : <><MdDelete size={18} /> Delete Product & Variants</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────
const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products = [], loading = false } = useSelector((state) => state.product || {});
    const [searchTerm, setSearchTerm] = useState('');
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleDeleteClick = (product) => setProductToDelete(product);
    const handleDeleteCancel = () => { if (!deleting) setProductToDelete(null); };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        setDeleting(true);
        await dispatch(deleteProduct(productToDelete._id));
        setDeleting(false);
        setProductToDelete(null);
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getDefaultImage = (product) => {
        const v = product.variants?.find(v => v.isDefault) || product.variants?.[0];
        return v?.images?.[0] || null;
    };

    const getPrice = (product) => {
        const v = product.variants?.find(v => v.isDefault) || product.variants?.[0];
        if (v?.options?.length > 0) {
            const prices = v.options.map(o => o.price);
            const min = Math.min(...prices), max = Math.max(...prices);
            return min === max ? `$${min}` : `$${min} – $${max}`;
        }
        return v?.price ? `$${v.price}` : 'N/A';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DeleteModal
                product={productToDelete}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                deleting={deleting}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-mainText">Manage Products</h2>
                    <p className="text-lightText text-sm">View and manage all your products here.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => dispatch(fetchProducts())}
                        className="flex items-center justify-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm"
                    >
                        <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
                        <span className="text-[14px]">Refresh List</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/product/create')}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-none font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <MdAdd size={20} />
                        Add New Product
                    </button>
                </div>
            </div>

            {/* Search + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-background p-4 rounded-none border border-border flex gap-4 items-center shadow-sm">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lightText" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-12 pr-4 py-2.5 bg-mainBG border border-border rounded-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm text-mainText"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 text-lightText hover:bg-primary hover:text-white rounded-none transition-all text-sm border border-border font-semibold group">
                        <MdFilterList size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        Filters
                    </button>
                </div>
                <div className="bg-primary p-5 rounded-none flex items-center justify-between shadow-xl shadow-primary/10">
                    <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Total Products</p>
                        <p className="text-3xl font-black text-white">{products.length}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-none flex items-center justify-center">
                        <MdShoppingBag className="text-white" size={28} />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="bg-background rounded-none border border-border p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading && products.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin" />
                            <span className="text-lightText">Loading products...</span>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-lightText">
                            No products found.
                        </div>
                    ) : paginatedProducts.map((product) => (
                        <div key={product._id} className="bg-background rounded-none border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group">
                            <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                {getDefaultImage(product) ? (
                                    <img src={getDefaultImage(product)} alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <MdShoppingBag size={64} />
                                    </div>
                                )}
                                {product.badge && (
                                    <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-none text-xs font-bold">
                                        {product.badge}
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    {product.isActive
                                        ? <MdToggleOn className="text-green-500 bg-white rounded-none" size={28} />
                                        : <MdToggleOff className="text-slate-400 bg-white rounded-none" size={28} />
                                    }
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => navigate(`/admin/product/edit/${product._id}`)}
                                        className="p-3 bg-white text-primary rounded-none hover:bg-primary hover:text-white transition-all duration-300 shadow-xl scale-90 hover:scale-100 border border-transparent hover:border-primary/20"
                                        title="Edit Product">
                                        <MdEdit size={20} />
                                    </button>
                                    <button onClick={() => navigate(`/admin/product/view/${product._id}`)}
                                        className="p-3 bg-white text-primary rounded-none hover:bg-primary hover:text-white transition-all duration-300 shadow-xl scale-90 hover:scale-100 border border-transparent hover:border-primary/20"
                                        title="View Details">
                                        <MdVisibility size={20} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(product)}
                                        className="p-3 bg-white text-red-500 rounded-none hover:bg-red-500 hover:text-white transition-all duration-300 shadow-xl scale-90 hover:scale-100 border border-transparent hover:border-red-200"
                                        title="Delete Product">
                                        <MdDelete size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                <h3 className="font-bold text-mainText line-clamp-2">{product.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-lightText">{product.mainCategory?.mainCategoryName}</span>
                                    <span className="text-lg font-black text-primary">{getPrice(product)}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-lightText pt-2 border-t border-border">
                                    <span>Views: {product.view || 0}</span>
                                    <span>Sold: {product.sold || 0}</span>
                                    <span>Variants: {product.variants?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
