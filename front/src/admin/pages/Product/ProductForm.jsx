import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../../utils/axiosInstance';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProductById,
    clearCurrentProduct
} from '../../../redux/slice/product.slice';
import {
    fetchMainCategories,
    fetchCategories,
    fetchSubCategories,
    fetchInsideSubCategories
} from '../../../redux/slice/category.slice';
import { MdArrowBack, MdSave, MdAdd, MdDelete, MdCloudUpload } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ProductForm = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const { currentProduct, loading } = useSelector((state) => state.product || {});
    const { mainCategories = [], categories = [], subCategories = [], insideSubCategories = [] } = useSelector((state) => state.category || {});

    const [filteredCategories, setFilteredCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [filteredInsideSubCategories, setFilteredInsideSubCategories] = useState([]);
    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [variants, setVariants] = useState([{
        color: '',
        colorCode: '#000000',
        isDefault: true,
        price: '',
        stock: '',
        discount: 0,
        images: [],
        imagePreviews: [],
        options: [],
        useOptions: false
    }]);

    useEffect(() => {
        dispatch(fetchMainCategories());
        dispatch(fetchCategories());
        dispatch(fetchSubCategories());
        dispatch(fetchInsideSubCategories());

        if (isEditMode) {
            dispatch(fetchProductById(id));
        }

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, id, isEditMode]);

    // Populate variants from existing product in edit mode
    useEffect(() => {
        if (isEditMode && currentProduct?.variants?.length > 0) {
            const loaded = currentProduct.variants.map((v) => ({
                _id: v._id,
                color: v.color || '',
                colorCode: v.colorCode || '#000000',
                isDefault: v.isDefault || false,
                price: v.price ?? '',
                stock: v.stock ?? '',
                discount: v.discount || 0,
                options: v.options || [],
                useOptions: v.options?.length > 0,
                images: [],           // new uploads only
                imagePreviews: v.images || [],  // show existing images as previews
                existingImages: v.images || [],
            }));
            setVariants(loaded);
        }
    }, [isEditMode, currentProduct]);

    const formik = useFormik({
        initialValues: {
            name: currentProduct?.name || '',
            brand: currentProduct?.brand || '',
            mainCategory: currentProduct?.mainCategory?._id || '',
            category: currentProduct?.category?._id || '',
            subCategory: currentProduct?.subCategory?._id || '',
            insideSubCategory: currentProduct?.insideSubCategory?._id || '',
            badge: currentProduct?.badge || '',
            tags: currentProduct?.tags?.join(', ') || '',
            productDetails: {
                description: currentProduct?.productDetails?.description || '',
                points: currentProduct?.productDetails?.points?.join('\n') || ''
            },
            deliveryReturns: {
                description: currentProduct?.deliveryReturns?.description || '',
                points: currentProduct?.deliveryReturns?.points?.join('\n') || ''
            },
            material: currentProduct?.material || '',
            careInstructions: currentProduct?.careInstructions || '',
            countryOfOrigin: currentProduct?.countryOfOrigin || '',
            isActive: currentProduct?.isActive ?? true,
            isFeatured: currentProduct?.isFeatured ?? false,
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Product name is required'),
            mainCategory: Yup.string().required('Main category is required'),
            category: Yup.string().required('Category is required'),
            subCategory: Yup.string().required('Sub category is required'),
        }),
        enableReinitialize: true,
        onSubmit: async (values) => {
            // Validate variants
            if (variants.length === 0) {
                alert('Please add at least one variant');
                return;
            }

            const invalidVariant = variants.find(v => !v.color || (v.images.length === 0 && (v.existingImages?.length ?? v.imagePreviews?.length ?? 0) === 0));
            if (invalidVariant) {
                alert('Please complete all variant fields (color and at least one image)');
                return;
            }

            // Validate variants
            if (variants.length === 0) {
                alert('Please add at least one variant');
                return;
            }

            // Validate pricing
            for (const variant of variants) {
                if (variant.useOptions) {
                    // Validate size options
                    if (!variant.options || variant.options.length === 0) {
                        alert('Please add at least one size option for each variant with multiple sizes');
                        return;
                    }

                    for (const option of variant.options) {
                        if (!option.price || !option.stock) {
                            alert('Please complete all size option fields (price and stock)');
                            return;
                        }

                        // Validate required attributes if category has them
                        if (categoryAttributes.length > 0) {
                            for (const attr of categoryAttributes) {
                                if (attr.isRequired && !option[attr.name]) {
                                    alert(`Please fill in required attribute: ${attr.name}`);
                                    return;
                                }
                            }
                        }
                    }
                } else {
                    // Validate single price
                    if (!variant.price || !variant.stock) {
                        alert('Please complete all variant fields (price and stock)');
                        return;
                    }
                }
            }

            const productData = {
                ...values,
                tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                productDetails: {
                    description: values.productDetails.description,
                    points: values.productDetails.points ? values.productDetails.points.split('\n').filter(Boolean) : []
                },
                deliveryReturns: {
                    description: values.deliveryReturns.description,
                    points: values.deliveryReturns.points ? values.deliveryReturns.points.split('\n').filter(Boolean) : []
                }
            };

            try {
                let productId = id;

                if (isEditMode) {
                    const res = await dispatch(updateProduct({ id, data: productData }));
                    if (res.error) return;
                } else {
                    const res = await dispatch(createProduct(productData));
                    if (res.error) return;
                    productId = res.payload?.result?._id;
                }

                if (!productId) {
                    alert('Failed to get product ID. Please try again.');
                    return;
                }

                // Create/update variants — rollback product if any variant fails
                try {
                    for (const variant of variants) {
                        const variantData = new FormData();
                        variantData.append('productId', productId);
                        variantData.append('color', variant.color);
                        variantData.append('colorCode', variant.colorCode);
                        variantData.append('isDefault', variant.isDefault);
                        variantData.append('discount', variant.discount || 0);
                        variantData.append('isActive', true);

                        if (variant.useOptions && variant.options?.length > 0) {
                            variantData.append('options', JSON.stringify(variant.options));
                        } else {
                            variantData.append('price', variant.price);
                            variantData.append('stock', variant.stock);
                        }

                        // New image files
                        variant.images.forEach(image => {
                            variantData.append('images', image);
                        });

                        // Keep existing images when editing — send positions
                        if (variant._id) {
                            const keptExisting = (variant.existingImages || []);
                            const positions = [];
                            let newFileIdx = 0;
                            let existingIdx = 0;

                            (variant.imagePreviews || []).forEach(preview => {
                                if (preview?.startsWith('blob:')) {
                                    positions.push({ type: 'new', index: newFileIdx++ });
                                } else {
                                    positions.push({ type: 'existing', index: existingIdx++ });
                                }
                            });

                            variantData.append('existingImages', JSON.stringify(keptExisting));
                            variantData.append('imagePositions', JSON.stringify(positions));
                        }

                        if (variant._id) {
                            // Existing variant — update
                            await axiosInstance.put(`/product-variant/update/${variant._id}`, variantData);
                        } else {
                            // New variant — create
                            await axiosInstance.post('/product-variant/create', variantData);
                        }
                    }
                } catch (variantError) {
                    console.error('Variant save failed, rolling back product...', variantError);

                    // Rollback: delete the product (only on create, not edit)
                    if (!isEditMode) {
                        await dispatch(deleteProduct(productId));
                    }

                    alert(
                        `Variant save failed: ${variantError.response?.data?.message || variantError.message}.\n` +
                        (!isEditMode ? 'Product has been removed. Please try again.' : 'Please fix the variant and try again.')
                    );
                    return;
                }

                navigate(`/admin/product/view/${productId}`);
            } catch (error) {
                console.error('Error saving product:', error);
                alert(`Error: ${error.response?.data?.message || error.message}`);
            }
        }
    });

    // Filter categories based on selections
    useEffect(() => {
        if (formik.values.mainCategory) {
            setFilteredCategories(categories.filter(cat => cat.mainCategoryId?._id === formik.values.mainCategory));
        } else {
            setFilteredCategories([]);
        }
    }, [formik.values.mainCategory, categories]);

    useEffect(() => {
        if (formik.values.category) {
            setFilteredSubCategories(subCategories.filter(sub => sub.categoryId?._id === formik.values.category));
        } else {
            setFilteredSubCategories([]);
        }
    }, [formik.values.category, subCategories]);

    useEffect(() => {
        if (formik.values.subCategory) {
            setFilteredInsideSubCategories(insideSubCategories.filter(inside => inside.subCategoryId?._id === formik.values.subCategory));
        } else {
            setFilteredInsideSubCategories([]);
        }
    }, [formik.values.subCategory, insideSubCategories]);

    // Get attributes from selected category hierarchy
    useEffect(() => {
        let attributes = [];

        // Priority: InsideSubCategory > SubCategory > Category
        if (formik.values.insideSubCategory) {
            const selected = insideSubCategories.find(c => c._id === formik.values.insideSubCategory);
            if (selected?.attributes?.length > 0) {
                attributes = selected.attributes;
            }
        }

        if (attributes.length === 0 && formik.values.subCategory) {
            const selected = subCategories.find(c => c._id === formik.values.subCategory);
            if (selected?.attributes?.length > 0) {
                attributes = selected.attributes;
            }
        }

        if (attributes.length === 0 && formik.values.category) {
            const selected = categories.find(c => c._id === formik.values.category);
            if (selected?.attributes?.length > 0) {
                attributes = selected.attributes;
            }
        }

        setCategoryAttributes(attributes);
    }, [formik.values.category, formik.values.subCategory, formik.values.insideSubCategory, categories, subCategories, insideSubCategories]);

    const addVariant = () => {
        setVariants([...variants, {
            color: '',
            colorCode: '#000000',
            isDefault: false,
            price: '',
            stock: '',
            discount: 0,
            images: [],
            imagePreviews: [],
            options: [],
            useOptions: false
        }]);
    };

    const removeVariant = (index) => {
        if (variants.length === 1) {
            alert('At least one variant is required');
            return;
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleVariantImageChange = (index, e) => {
        const files = Array.from(e.target.files);
        const newVariants = [...variants];
        newVariants[index].images = [...newVariants[index].images, ...files];

        files.forEach(file => {
            const blobUrl = URL.createObjectURL(file);
            newVariants[index].imagePreviews = [...(newVariants[index].imagePreviews || []), blobUrl];
        });
        setVariants([...newVariants]);
        e.target.value = '';
    };

    const removeVariantImage = (variantIndex, imageIndex) => {
        const newVariants = [...variants];
        const v = newVariants[variantIndex];
        // Remove from both previews and existingImages/images tracking
        const preview = v.imagePreviews[imageIndex];
        v.imagePreviews = v.imagePreviews.filter((_, i) => i !== imageIndex);
        // If it's an existing image (URL string, not blob)
        if (v.existingImages) {
            v.existingImages = v.existingImages.filter(url => url !== preview);
        }
        // If it's a new file (blob URL), remove from images array too
        if (preview?.startsWith('blob:')) {
            // find matching index in images by revoking and filtering
            const newFileIndex = v.imagePreviews.filter(p => p?.startsWith('blob:')).length;
            v.images = v.images.filter((_, i) => i !== newFileIndex);
        }
        setVariants(newVariants);
    };

    const addVariantOption = (variantIndex) => {
        const newVariants = [...variants];
        if (!newVariants[variantIndex].options) {
            newVariants[variantIndex].options = [];
        }
        newVariants[variantIndex].options.push({});
        setVariants(newVariants);
    };

    const removeVariantOption = (variantIndex, optionIndex) => {
        const newVariants = [...variants];
        newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
        setVariants(newVariants);
    };

    const updateVariantOption = (variantIndex, optionIndex, field, value) => {
        const newVariants = [...variants];
        if (!newVariants[variantIndex].options[optionIndex]) {
            newVariants[variantIndex].options[optionIndex] = {};
        }
        newVariants[variantIndex].options[optionIndex][field] = value;
        setVariants(newVariants);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/product')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <MdArrowBack size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {isEditMode ? 'Edit Product' : 'Create New Product'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {isEditMode ? 'Update product information' : 'Add a new product to your catalog'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Product Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Men's Cotton T-Shirt"
                                className={`w-full px-4 py-2.5 rounded-xl border mt-1 transition-all outline-none text-sm font-medium ${formik.touched.name && formik.errors.name
                                    ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                                    : 'border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5'
                                    }`}
                                {...formik.getFieldProps('name')}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-xs font-bold text-red-500 ml-1 mt-1">{formik.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Brand</label>
                            <input
                                type="text"
                                placeholder="e.g. Nike, Adidas"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('brand')}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Badge</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('badge')}
                            >
                                <option value="">No Badge</option>
                                <option value="NEW">NEW</option>
                                <option value="FAV">FAV</option>
                                <option value="RESTOCK">RESTOCK</option>
                                <option value="LIMITED">LIMITED</option>
                                <option value="RARE">RARE</option>
                                <option value="BEST">BEST</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Categories</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Main Category *</label>
                            <select
                                className={`w-full px-4 py-2.5 rounded-xl border mt-1 transition-all outline-none text-sm font-medium ${formik.touched.mainCategory && formik.errors.mainCategory
                                    ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                                    : 'border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5'
                                    }`}
                                {...formik.getFieldProps('mainCategory')}
                            >
                                <option value="">Select Main Category</option>
                                {mainCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.mainCategoryName}</option>
                                ))}
                            </select>
                            {formik.touched.mainCategory && formik.errors.mainCategory && (
                                <p className="text-xs font-bold text-red-500 ml-1 mt-1">{formik.errors.mainCategory}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Category *</label>
                            <select
                                className={`w-full px-4 py-2.5 rounded-xl border mt-1 transition-all outline-none text-sm font-medium ${formik.touched.category && formik.errors.category
                                    ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                                    : 'border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5'
                                    }`}
                                {...formik.getFieldProps('category')}
                                disabled={!formik.values.mainCategory}
                            >
                                <option value="">Select Category</option>
                                {filteredCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                ))}
                            </select>
                            {formik.touched.category && formik.errors.category && (
                                <p className="text-xs font-bold text-red-500 ml-1 mt-1">{formik.errors.category}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Sub Category *</label>
                            <select
                                className={`w-full px-4 py-2.5 rounded-xl border mt-1 transition-all outline-none text-sm font-medium ${formik.touched.subCategory && formik.errors.subCategory
                                    ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                                    : 'border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5'
                                    }`}
                                {...formik.getFieldProps('subCategory')}
                                disabled={!formik.values.category}
                            >
                                <option value="">Select Sub Category</option>
                                {filteredSubCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.subCategoryName}</option>
                                ))}
                            </select>
                            {formik.touched.subCategory && formik.errors.subCategory && (
                                <p className="text-xs font-bold text-red-500 ml-1 mt-1">{formik.errors.subCategory}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Inside Sub Category</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('insideSubCategory')}
                                disabled={!formik.values.subCategory}
                            >
                                <option value="">Select Inside Sub Category (Optional)</option>
                                {filteredInsideSubCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.insideSubCategoryName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Product Details</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Description</label>
                            <textarea
                                rows="3"
                                placeholder="Detailed product description..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('productDetails.description')}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Key Points (one per line)</label>
                            <textarea
                                rows="3"
                                placeholder="Premium quality fabric&#10;Comfortable fit&#10;Machine washable"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('productDetails.points')}
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Additional Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Material</label>
                            <input
                                type="text"
                                placeholder="e.g. 100% Cotton"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('material')}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Country of Origin</label>
                            <input
                                type="text"
                                placeholder="e.g. India"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('countryOfOrigin')}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Care Instructions</label>
                            <textarea
                                rows="2"
                                placeholder="Machine wash cold, tumble dry low..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('careInstructions')}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                placeholder="summer, casual, trending"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('tags')}
                            />
                        </div>
                    </div>
                </div>

                {/* Delivery & Returns */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Delivery & Returns</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Description</label>
                            <textarea
                                rows="2"
                                placeholder="Delivery and return policy..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('deliveryReturns.description')}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Policy Points (one per line)</label>
                            <textarea
                                rows="3"
                                placeholder="Free delivery on orders above ₹999&#10;Easy 30-day returns&#10;Cash on delivery available"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('deliveryReturns.points')}
                            />
                        </div>
                    </div>
                </div>

                {/* Product Variants */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Product Variants *</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                At least one variant is required
                                {categoryAttributes.length > 0 && (
                                    <span className="ml-2 text-blue-600 font-bold">
                                        • Category has {categoryAttributes.length} attribute(s): {categoryAttributes.map(a => a.name).join(', ')}
                                    </span>
                                )}
                            </p>
                        </div>
                        {variants.length > 0 && (
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
                            >
                                <MdAdd size={18} />
                                Add Variant
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {variants.map((variant, index) => (
                            <div key={index} className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-700">Variant {index + 1}</h4>
                                    {variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">Images * (at least 1)</label>
                                    <div className="grid grid-cols-5 gap-3 mt-2">
                                        {variant.imagePreviews?.map((preview, imgIndex) => (
                                            <div key={imgIndex} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group">
                                                <img src={preview} alt={`Preview ${imgIndex}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariantImage(index, imgIndex)}
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <MdDelete size={20} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-black transition-all flex flex-col items-center justify-center cursor-pointer bg-white">
                                            <MdCloudUpload size={24} className="text-slate-400" />
                                            <span className="text-xs text-slate-400 mt-1">Add</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleVariantImageChange(index, e)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Color & Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 ml-1">Color Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Red, Blue, Black"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium bg-white"
                                            value={variant.color}
                                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 ml-1">Color Code</label>
                                        <div className="flex gap-2 mt-1">
                                            <input
                                                type="color"
                                                className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                                value={variant.colorCode}
                                                onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="#000000"
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium bg-white"
                                                value={variant.colorCode}
                                                onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Type Toggle */}
                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`pricingType-${index}`}
                                            checked={!variant.useOptions}
                                            onChange={() => updateVariant(index, 'useOptions', false)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Single Price</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`pricingType-${index}`}
                                            checked={variant.useOptions}
                                            onChange={() => updateVariant(index, 'useOptions', true)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Multiple Sizes/Prices</span>
                                    </label>
                                </div>

                                {/* Single Price Fields */}
                                {!variant.useOptions && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 ml-1">Price (₹) *</label>
                                            <input
                                                type="number"
                                                placeholder="999"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium bg-white"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 ml-1">Stock *</label>
                                            <input
                                                type="number"
                                                placeholder="100"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium bg-white"
                                                value={variant.stock}
                                                onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 ml-1">Discount (%)</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                max="100"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium bg-white"
                                                value={variant.discount}
                                                onChange={(e) => updateVariant(index, 'discount', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Multiple Size Options */}
                                {variant.useOptions && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-700">Size Options</label>
                                            <button
                                                type="button"
                                                onClick={() => addVariantOption(index)}
                                                className="flex items-center gap-1 text-xs font-bold text-black hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                <MdAdd size={16} />
                                                Add Size
                                            </button>
                                        </div>

                                        {variant.options?.map((option, optIndex) => (
                                            <div key={optIndex} className="grid grid-cols-6 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Size"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs font-medium"
                                                        value={option.size || ''}
                                                        onChange={(e) => updateVariantOption(index, optIndex, 'size', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        placeholder="Price"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs font-medium"
                                                        value={option.price || ''}
                                                        onChange={(e) => updateVariantOption(index, optIndex, 'price', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        placeholder="Stock"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs font-medium"
                                                        value={option.stock || ''}
                                                        onChange={(e) => updateVariantOption(index, optIndex, 'stock', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        placeholder="Disc %"
                                                        min="0"
                                                        max="100"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs font-medium"
                                                        value={option.discount || 0}
                                                        onChange={(e) => updateVariantOption(index, optIndex, 'discount', e.target.value)}
                                                    />
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center px-2">
                                                    Auto SKU
                                                </div>
                                                <div className="flex items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantOption(index, optIndex)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <MdDelete size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {(!variant.options || variant.options.length === 0) && (
                                            <button
                                                type="button"
                                                onClick={() => addVariantOption(index)}
                                                className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-black transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-black"
                                            >
                                                <MdAdd size={24} />
                                                <span className="text-xs font-bold">Add First Size</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Default Variant Toggle */}
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black"
                                        checked={variant.isDefault}
                                        onChange={(e) => {
                                            const newVariants = variants.map((v, i) => ({
                                                ...v,
                                                isDefault: i === index ? e.target.checked : false
                                            }));
                                            setVariants(newVariants);
                                        }}
                                    />
                                    <label className="text-xs font-medium text-slate-700">Set as Default Variant</label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {
                        variants.length === 0 && (
                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-black transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-black"
                            >
                                <MdAdd size={32} />
                                <span className="text-sm font-bold">Add Your First Variant</span>
                            </button>
                        )
                    }
                </div >

                {/* Status */}
                < div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4" >
                    <h3 className="text-base font-bold text-slate-900">Status</h3>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-300 text-black focus:ring-black"
                                {...formik.getFieldProps('isActive')}
                                checked={formik.values.isActive}
                            />
                            <span className="text-sm font-medium text-slate-700">Active</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-300 text-black focus:ring-black"
                                {...formik.getFieldProps('isFeatured')}
                                checked={formik.values.isFeatured}
                            />
                            <span className="text-sm font-medium text-slate-700">Featured</span>
                        </label>
                    </div>
                </div >

                {/* Actions */}
                < div className="flex items-center gap-3" >
                    <button
                        type="button"
                        onClick={() => navigate('/admin/product')}
                        className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-black transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formik.isValid}
                        className="flex-[2] px-5 py-2.5 bg-black hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black rounded-xl shadow-xl shadow-black/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                    >
                        {loading ? (
                            <AiOutlineLoading3Quarters size={20} className="animate-spin" />
                        ) : (
                            <MdSave size={20} />
                        )}
                        {isEditMode ? 'Update Product' : 'Create Product & Variants'}
                    </button>
                </div >
            </form >
        </div >
    );
};

export default ProductForm;
