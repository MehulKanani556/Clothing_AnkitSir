import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    fetchProductById,
    clearCurrentProduct,
    fetchVariantsByProductId
} from '../../../redux/slice/product.slice';
import {
    MdArrowBack,
    MdEdit,
    MdAdd,
    MdShoppingBag,
    MdVisibility,
    MdSell
} from 'react-icons/md';
import VariantManager from './VariantManager';

const ProductView = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentProduct, variants = [], loading } = useSelector((state) => state.product || {});
    const [showVariantManager, setShowVariantManager] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
            dispatch(fetchVariantsByProductId(id));
        }

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, id]);

    if (loading || !currentProduct) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-none animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/product')}
                        className="p-2 hover:bg-slate-100 rounded-none transition-colors"
                    >
                        <MdArrowBack size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{currentProduct.name}</h2>
                        <p className="text-slate-500 text-sm">Product Details</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/admin/product/edit/${id}`)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-none font-bold hover:bg-slate-800 transition-all"
                >
                    <MdEdit size={20} />
                    Edit Product
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-none border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Views</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{currentProduct.view || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-none flex items-center justify-center">
                            <MdVisibility className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-none border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Sold</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{currentProduct.sold || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-none flex items-center justify-center">
                            <MdSell className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-none border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Variants</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{variants.length || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-none flex items-center justify-center">
                            <MdShoppingBag className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-none border border-slate-200 p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Product Name</p>
                                <p className="text-base font-bold text-slate-900 mt-1">{currentProduct.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Brand</p>
                                <p className="text-base font-bold text-slate-900 mt-1">{currentProduct.brand || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Badge</p>
                                {currentProduct.badge ? (
                                    <span className="inline-block mt-1 bg-black text-white px-3 py-1 rounded-none text-xs font-bold">
                                        {currentProduct.badge}
                                    </span>
                                ) : (
                                    <p className="text-base text-slate-400 mt-1">No Badge</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Status</p>
                                <div className="flex gap-2 mt-1">
                                    {currentProduct.isActive && (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-none text-xs font-bold">Active</span>
                                    )}
                                    {currentProduct.isFeatured && (
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-none text-xs font-bold">Featured</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-none border border-slate-200 p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Categories</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Main Category</p>
                                <p className="text-base font-bold text-slate-900 mt-1">{currentProduct.mainCategory?.mainCategoryName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Category</p>
                                <p className="text-base font-bold text-slate-900 mt-1">{currentProduct.category?.categoryName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Sub Category</p>
                                <p className="text-base font-bold text-slate-900 mt-1">{currentProduct.subCategory?.subCategoryName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Inside Sub Category</p>
                                <p className="text-base font-bold text-slate-900 mt-1">
                                    {currentProduct.insideSubCategory?.insideSubCategoryName || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {currentProduct.productDetails?.description && (
                        <div className="bg-white rounded-none border border-slate-200 p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Product Details</h3>
                            <p className="text-slate-600 mb-4">{currentProduct.productDetails.description}</p>
                            {currentProduct.productDetails.points?.length > 0 && (
                                <ul className="space-y-2">
                                    {currentProduct.productDetails.points.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-black rounded-none mt-2"></span>
                                            <span className="text-slate-600">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {currentProduct.material && (
                        <div className="bg-white rounded-none border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">Material</h3>
                            <p className="text-slate-600">{currentProduct.material}</p>
                        </div>
                    )}

                    {currentProduct.careInstructions && (
                        <div className="bg-white rounded-none border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">Care Instructions</h3>
                            <p className="text-slate-600">{currentProduct.careInstructions}</p>
                        </div>
                    )}

                    {currentProduct.countryOfOrigin && (
                        <div className="bg-white rounded-none border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">Country of Origin</h3>
                            <p className="text-slate-600">{currentProduct.countryOfOrigin}</p>
                        </div>
                    )}

                    {currentProduct.tags?.length > 0 && (
                        <div className="bg-white rounded-none border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-900 mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {currentProduct.tags.map((tag, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-none text-xs font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Variants Section */}
            <div className="bg-white rounded-none border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Product Variants</h3>
                    <button
                        onClick={() => {
                            setEditingVariant(null);
                            setShowVariantManager(true);
                        }}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-none font-bold hover:bg-slate-800 transition-all text-sm"
                    >
                        <MdAdd size={18} />
                        Add Variant
                    </button>
                </div>

                {variants.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <MdShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No variants added yet. Add your first variant to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {variants.map((variant) => (
                            <div
                                key={variant._id}
                                className="border border-slate-200 rounded-none p-4 hover:border-black transition-colors cursor-pointer"
                                onClick={() => {
                                    setEditingVariant(variant);
                                    setShowVariantManager(true);
                                }}
                            >
                                <div className="aspect-square bg-slate-100 rounded-none overflow-hidden mb-3">
                                    {variant.images?.[0] ? (
                                        <img src={variant.images[0]} alt={variant.color} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <MdShoppingBag size={48} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900">{variant.color}</span>
                                        {variant.isDefault && (
                                            <span className="bg-black text-white px-2 py-0.5 rounded-none text-xs font-bold">Default</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {variant.options?.length > 0 ? (
                                            <span>{variant.options.length} size options</span>
                                        ) : (
                                            <span>₹{variant.price} • Stock: {variant.stock}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Variant Manager Modal */}
            {showVariantManager && (
                <VariantManager
                    productId={id}
                    variant={editingVariant}
                    onClose={() => {
                        setShowVariantManager(false);
                        setEditingVariant(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProductView;
