import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from "react-icons/io5";
import { fetchWishlist, toggleWishlist, fetchRecentlyViewed } from '../redux/slice/product.slice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import bgImage from '../assets/images/BG.webp';

const Wishlist = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { wishlist, recentlyViewed, loading } = useSelector((state) => state.product);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWishlist());
            dispatch(fetchRecentlyViewed());
        }
    }, [dispatch, isAuthenticated]);

    const handleOpenRemoveModal = (e, productId) => {
        e.stopPropagation();
        setSelectedProductId(productId);
        setShowRemoveModal(true);
    };

    const handleConfirmRemove = () => {
        if (selectedProductId) {
            dispatch(toggleWishlist(selectedProductId));
            setShowRemoveModal(false);
            setSelectedProductId(null);
        }
    };

    const handleCloseModal = () => {
        setShowRemoveModal(false);
        setSelectedProductId(null);
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        navigate(`/product/${product.slug}`);
    };

    const getProductImage = (product) => {
        if (product && product.variants && product.variants.length > 0) {
            const defaultV = product.variants.find(v => v.isDefault) || product.variants[0];
            return defaultV.images?.[0] || bgImage;
        }
        return product?.images?.[0] || bgImage;
    };

    const getProductPrice = (product) => {
        if (product && product.variants && product.variants.length > 0) {
            const defaultV = product.variants.find(v => v.isDefault) || product.variants[0];
            if (defaultV.options && defaultV.options.length > 0) {
                return defaultV.options[0].price || defaultV.price || 0;
            }
            return defaultV.price || 0;
        }
        return product?.basePrice || product?.price || 0;
    };

    return (
        <div className="min-h-screen bg-white">
            <main className="px-8 py-12">
                {/* Header Section */}
                <div className="pb-8">
                    <h1 className="text-[10px] md:text-sm font-bold text-[#1a1a1a] uppercase tracking-widest">
                        {wishlist.length} PRODUCTS
                    </h1>
                </div>

                {loading && wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#14372F] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading your wishlist...</p>
                    </div>
                ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 ">
                        {wishlist.map((product) => {
                            const productId = product?._id || product;
                            const isSkeletal = !product?.name;

                            return (
                                <div
                                    key={productId}
                                    onClick={() => !isSkeletal && navigate(`/product/${product.slug}`)}
                                    className={`group relative border border-gray-100 p-4 md:p-6 lg:p-8 bg-white transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:z-10 ${isSkeletal ? 'animate-pulse cursor-default' : 'cursor-pointer'}`}
                                >
                                    {/* Top Labels & Actions */}
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-gray-300">
                                            {isSkeletal ? '...' : 'NEW'}
                                        </span>
                                        <button
                                            onClick={(e) => handleOpenRemoveModal(e, productId)}
                                            className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                                        >
                                            <IoCloseOutline size={20} className="text-gray-400 group-hover:text-dark transition-colors" />
                                        </button>
                                    </div>

                                    {/* Image Section */}
                                    <div className="relative aspect-square flex items-center justify-center mb-6 overflow-hidden">
                                        {isSkeletal ? (
                                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                                <div className="w-8 h-8 border-2 border-[#14372F] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <img
                                                src={getProductImage(product)}
                                                alt={product.name}
                                                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                                onError={(e) => { e.target.src = bgImage }}
                                            />
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="text-center mb-8">
                                        <h3 className="text-xs md:text-sm lg:text-base font-medium text-dark mb-1 line-clamp-1 group-hover:text-[#14372F] transition-colors min-h-[1.25rem]">
                                            {product.name || 'Loading Product...'}
                                        </h3>
                                        <p className="text-xs md:text-sm lg:text-base font-medium text-dark">
                                            {isSkeletal ? '...' : `$${getProductPrice(product)}`}
                                        </p>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        disabled={isSkeletal}
                                        onClick={(e) => !isSkeletal && handleAddToCart(e, product)}
                                        className={`w-full py-3 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${isSkeletal ? 'bg-gray-100 text-gray-400' : 'bg-[#14372F] text-white'}`}
                                    >
                                        {isSkeletal ? 'PLEASE WAIT' : 'ADD TO CART'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <h2 className="text-lg font-bold text-dark mb-2 tracking-tight">Your Wishlist is Empty</h2>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#14372F] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#0d2a23] transition-all"
                        >
                            CONTINUE SHOPPING
                        </button>
                    </div>
                )}

                {/* Recently Viewed Section */}
                {recentlyViewed.length > 0 && (
                    <div className="mt-32">
                        <div className="pb-8 border-b border-gray-100 mb-8">
                            <h2 className="text-[10px] md:text-sm font-bold text-[#1a1a1a] uppercase tracking-[0.3em] text-center">
                                Recently Viewed
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
                            {recentlyViewed.slice(0, 4).map((product) => (
                                <div
                                    key={product._id}
                                    onClick={() => navigate(`/product/${product.slug}`)}
                                    className="group relative border border-gray-100 p-4 md:p-6 lg:p-8 bg-white transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:z-10 cursor-pointer"
                                >
                                    {/* Image Section */}
                                    <div className="relative aspect-square flex items-center justify-center mb-6 overflow-hidden">
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.name}
                                            className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Info Section */}
                                    <div className="text-center">
                                        <h3 className="text-xs md:text-sm font-medium text-dark mb-1 line-clamp-1 group-hover:text-[#14372F] transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs md:text-sm font-medium text-dark italic">
                                            ${getProductPrice(product)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Remove Confirmation Modal */}
            {showRemoveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 transition-opacity"
                        onClick={handleCloseModal}
                    ></div>

                    {/* Modal Content */}
                    <div className="bg-white w-full max-w-[500px] p-6 md:p-10 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform transition-all duration-300 animate-in fade-in zoom-in-95">
                        {/* Close button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-dark transition-colors"
                        >
                            <IoCloseOutline className="size-6 md:size-8" strokeWidth={1.5} />
                        </button>

                        <div className="mb-6 md:mb-10">
                            <h2 className="text-lg md:text-2xl font-bold text-[#14372F] tracking-tight mb-2 md:mb-3">
                                Remove from Wishlist
                            </h2>
                            <p className="text-[#9CA3AF] text-sm md:text-lg font-medium tracking-tight">
                                Are you sure you want to remove this product?
                            </p>
                        </div>

                        <div className="flex flex-row gap-3 md:gap-4 h-12 md:h-16">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 bg-[#EBEDF0] text-[#9CA3AF] font-bold text-[10px] md:text-xs tracking-[0.1em] hover:bg-gray-200 transition-colors uppercase"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleConfirmRemove}
                                className="flex-1 bg-[#14372F] text-white font-bold text-[10px] md:text-xs tracking-[0.1em] hover:bg-[#0d2a23] transition-colors uppercase"
                            >
                                REMOVE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
