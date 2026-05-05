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
import { MdArrowBack, MdSave, MdAdd, MdDelete, MdCloudUpload, MdCheck } from 'react-icons/md';
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
                options: v.options ? JSON.parse(JSON.stringify(v.options)) : [],
                useOptions: v.options?.length > 0,
                images: [],           // new uploads only
                imagePreviews: v.images ? [...v.images] : [],  // show existing images as previews
                existingImages: v.images ? [...v.images] : [],
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
            gender: currentProduct?.gender || 'Unisex',
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/admin/product')}
                    className="p-3 bg-white hover:bg-primary/5 rounded-none transition-all border border-border hover:border-primary/20 hover:shadow-sm active:scale-95"
                >
                    <MdArrowBack size={24} className="text-lightText" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-mainText tracking-tight">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <p className="text-[11px] text-lightText font-black uppercase tracking-widest mt-1">
                        {isEditMode ? 'Update product information' : 'Create a new item for your store'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* General Details */}
                <div className="bg-background rounded-none border border-border p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                        <div className="w-2 h-6 bg-primary rounded-none"></div>
                        <h3 className="text-base font-black text-mainText uppercase tracking-tight">General Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Product Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Men's Cotton T-Shirt"
                                className={`w-full px-4 py-2.5 rounded-none border mt-1 transition-all outline-none text-sm font-medium ${formik.touched.name && formik.errors.name
                                    ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                                    : 'border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5'
                                    }`}
                                {...formik.getFieldProps('name')}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-xs font-bold text-red-500 ml-1 mt-1">{formik.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Brand Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Nike, Adidas"
                                className="w-full px-6 py-4 rounded-none border border-border bg-mainBG/10 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight"
                                {...formik.getFieldProps('brand')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Product Tag</label>
                            <select
                                className="w-full px-6 py-4 rounded-none border border-border bg-mainBG/10 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight appearance-none"
                                {...formik.getFieldProps('badge')}
                            >
                                <option value="">No Tag</option>
                                <option value="NEW">NEW</option>
                                <option value="FAV">FAV</option>
                                <option value="RESTOCK">RESTOCK</option>
                                <option value="LIMITED">LIMITED</option>
                                <option value="RARE">RARE</option>
                                <option value="BEST">BEST</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Category For *</label>
                            <select
                                className="w-full px-6 py-4 rounded-none border border-border bg-mainBG/10 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight appearance-none"
                                {...formik.getFieldProps('gender')}
                            >
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Unisex">Unisex</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Category */}
                <div className="bg-background rounded-none border border-border p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                        <div className="w-2 h-6 bg-primary rounded-none"></div>
                        <h3 className="text-base font-black text-mainText uppercase tracking-tight">Product Category</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Top Category *</label>
                            <select
                                className={`w-full px-6 py-4 rounded-none border transition-all outline-none text-sm font-black tracking-tight appearance-none bg-mainBG/10 ${formik.touched.mainCategory && formik.errors.mainCategory
                                    ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                                    : 'border-border focus:border-primary focus:ring-8 focus:ring-primary/5'
                                    }`}
                                {...formik.getFieldProps('mainCategory')}
                            >
                                <option value="">Select Top Category</option>
                                {mainCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.mainCategoryName}</option>
                                ))}
                            </select>
                            {formik.touched.mainCategory && formik.errors.mainCategory && (
                                <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest mt-1">{formik.errors.mainCategory}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Category *</label>
                            <select
                                className={`w-full px-6 py-4 rounded-none border transition-all outline-none text-sm font-black tracking-tight appearance-none bg-mainBG/10 ${formik.touched.category && formik.errors.category
                                    ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                                    : 'border-border focus:border-primary focus:ring-8 focus:ring-primary/5'
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
                                <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest mt-1">{formik.errors.category}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Sub Category *</label>
                            <select
                                className={`w-full px-6 py-4 rounded-none border transition-all outline-none text-sm font-black tracking-tight appearance-none bg-mainBG/10 ${formik.touched.subCategory && formik.errors.subCategory
                                    ? 'border-red-300 focus:border-red-500 bg-red-50/10'
                                    : 'border-border focus:border-primary focus:ring-8 focus:ring-primary/5'
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
                                <p className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-widest mt-1">{formik.errors.subCategory}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Detailed Category</label>
                            <select
                                className="w-full px-6 py-4 rounded-none border border-border bg-mainBG/10 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight appearance-none"
                                {...formik.getFieldProps('insideSubCategory')}
                                disabled={!formik.values.subCategory}
                            >
                                <option value="">Select Detailed Category (Optional)</option>
                                {filteredInsideSubCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.insideSubCategoryName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Description */}
                <div className="bg-background rounded-none border border-border p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                        <div className="w-2 h-6 bg-primary rounded-none"></div>
                        <h3 className="text-base font-black text-mainText uppercase tracking-tight">Product Description</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Description</label>
                            <textarea
                                rows="3"
                                placeholder="Write a detailed description of the product..."
                                className="w-full px-6 py-4 rounded-none border border-border bg-mainBG/10 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('productDetails.description')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Key Features (one per line)</label>
                            <textarea
                                rows="3"
                                placeholder="e.g. Premium quality fabric&#10;Comfortable fit&#10;Machine washable"
                                className="w-full px-6 py-4 rounded-none border border-border bg-mainBG/10 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('productDetails.points')}
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-none border border-slate-200 p-5 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Additional Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Material</label>
                            <input
                                type="text"
                                placeholder="e.g. 100% Cotton"
                                className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('material')}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 ml-1">Country of Origin</label>
                            <input
                                type="text"
                                placeholder="e.g. India"
                                className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('countryOfOrigin')}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Care Instructions</label>
                            <textarea
                                rows="2"
                                placeholder="Machine wash cold, tumble dry low..."
                                className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('careInstructions')}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 ml-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                placeholder="summer, casual, trending"
                                className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                {...formik.getFieldProps('tags')}
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping & Returns */}
                <div className="bg-background rounded-none border border-border p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                        <div className="w-2 h-6 bg-primary rounded-none"></div>
                        <h3 className="text-base font-black text-mainText uppercase tracking-tight">Shipping & Returns</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Policy Description</label>
                            <textarea
                                rows="2"
                                placeholder="Describe your shipping and return policy..."
                                className="w-full px-6 py-4 rounded-none border border-border bg-mainBG/10 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('deliveryReturns.description')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Policy Points (one per line)</label>
                            <textarea
                                rows="3"
                                placeholder="e.g. Free delivery on orders above ₹999&#10;Easy 30-day returns"
                                className="w-full px-6 py-4 rounded-none border border-border bg-mainBG/10 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-medium resize-none"
                                {...formik.getFieldProps('deliveryReturns.points')}
                            />
                        </div>
                    </div>
                </div>

                {/* Product Sizes & Colors */}
                <div className="bg-background rounded-none border border-border p-8 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border pb-4 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-6 bg-primary rounded-none"></div>
                            <div>
                                <h3 className="text-base font-black text-mainText uppercase tracking-tight">Product Sizes & Colors *</h3>
                                <p className="text-[10px] text-lightText font-black uppercase tracking-widest mt-1">
                                    At least one color/variant is required
                                    {categoryAttributes.length > 0 && (
                                        <span className="ml-2 text-primary font-black">
                                            • Category has {categoryAttributes.length} attribute(s): {categoryAttributes.map(a => a.name).join(', ')}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        {variants.length > 0 && (
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-none font-black uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                            >
                                <MdAdd size={18} />
                                Add Variant
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {variants.map((variant, index) => (
                            <div key={index} className="border border-border rounded-none p-6 space-y-6 bg-mainBG/20 group hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <h4 className="text-xs font-black text-mainText uppercase tracking-widest">Variant {index + 1}</h4>
                                    {variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-none transition-all active:scale-90"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    )}
                                </div>

                                {/* Images */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Variant Images * (Add at least 1)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {variant.imagePreviews?.map((preview, imgIndex) => (
                                            <div key={imgIndex} className="relative aspect-square rounded-none overflow-hidden border-2 border-border group/img bg-white">
                                                <img src={preview} alt={`Preview ${imgIndex}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantImage(index, imgIndex)}
                                                        className="bg-white text-red-500 p-2.5 rounded-none shadow-xl hover:scale-110 transition-transform active:scale-90"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-none border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer bg-white group/upload">
                                            <MdCloudUpload size={28} className="text-lightText group-hover/upload:text-primary transition-colors" />
                                            <span className="text-[10px] font-black text-lightText uppercase tracking-widest mt-2">Add Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleVariantImageChange(index, e)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                                              {/* Color & Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Color Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Red, Blue, Black"
                                            className="w-full px-6 py-4 rounded-none border border-border bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight"
                                            value={variant.color}
                                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Color Hex Code</label>
                                        <div className="flex gap-4">
                                            <div className="relative w-14 h-14 rounded-none overflow-hidden border border-border shadow-sm shrink-0">
                                                <input
                                                    type="color"
                                                    className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer"
                                                    value={variant.colorCode}
                                                    onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="#000000"
                                                className="flex-1 px-6 py-4 rounded-none border border-border bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight"
                                                value={variant.colorCode}
                                                onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
    </div>

                                {/* Pricing Type Toggle */}
                                <div className="flex items-center gap-8 p-6 bg-mainBG/30 rounded-none border border-border/50">
                                    <label className="flex items-center gap-3 cursor-pointer group/radio">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name={`pricingType-${index}`}
                                                className="peer appearance-none w-5 h-5 rounded-none border-2 border-border checked:border-primary transition-all cursor-pointer"
                                                checked={!variant.useOptions}
                                                onChange={() => updateVariant(index, 'useOptions', false)}
                                            />
                                            <div className="absolute w-2.5 h-2.5 rounded-none bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
                                        </div>
                                        <span className="text-[11px] font-black text-mainText uppercase tracking-widest opacity-70 group-hover/radio:opacity-100 transition-opacity">Same Price for All Sizes</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group/radio">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name={`pricingType-${index}`}
                                                className="peer appearance-none w-5 h-5 rounded-none border-2 border-border checked:border-primary transition-all cursor-pointer"
                                                checked={variant.useOptions}
                                                onChange={() => updateVariant(index, 'useOptions', true)}
                                            />
                                            <div className="absolute w-2.5 h-2.5 rounded-none bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
                                        </div>
                                        <span className="text-[11px] font-black text-mainText uppercase tracking-widest opacity-70 group-hover/radio:opacity-100 transition-opacity">Different Price per Size</span>
                                    </label>
                                </div>

                                {/* Single Price Fields */}
                                {!variant.useOptions && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Selling Price (₹) *</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 999"
                                                className="w-full px-6 py-4 rounded-none border border-border bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Total Stock *</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 100"
                                                className="w-full px-6 py-4 rounded-none border border-border bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight"
                                                value={variant.stock}
                                                onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Discount (%)</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                max="100"
                                                className="w-full px-6 py-4 rounded-none border border-border bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm font-black tracking-tight"
                                                value={variant.discount}
                                                onChange={(e) => updateVariant(index, 'discount', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Multiple Size Options */}
                                {variant.useOptions && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Size Wise Pricing</label>
                                            <button
                                                type="button"
                                                onClick={() => addVariantOption(index)}
                                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-none font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-lg shadow-primary/10"
                                            >
                                                <MdAdd size={16} />
                                                Add Size
                                            </button>
                                        </div>

                                        {variant.options?.map((option, optIndex) => (
                                            <div key={optIndex} className="grid grid-cols-6 gap-3 p-3 bg-white rounded-none border border-slate-200">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Size"
                                                        className="w-full px-3 py-2 rounded-none border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs font-medium"
                                                        value={option.size || ''}
                                                        onChange={(e) => updateVariantOption(index, optIndex, 'size', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        placeholder="Price"
                                                        className="w-full px-3 py-2 rounded-none border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs font-medium"
                                                        value={option.price || ''}
                                                        onChange={(e) => updateVariantOption(index, optIndex, 'price', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        placeholder="Stock"
                                                        className="w-full px-3 py-2 rounded-none border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs font-medium"
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
                                                        className="w-full px-3 py-2 rounded-none border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-xs font-medium"
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
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-none transition-colors"
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
                                                className="w-full py-12 border-2 border-dashed border-border rounded-none hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 bg-white group/empty"
                                            >
                                                <div className="w-12 h-12 rounded-none bg-mainBG/5 flex items-center justify-center group-hover/empty:bg-primary/10 transition-colors">
                                                    <MdAdd size={24} className="text-lightText group-hover/empty:text-primary transition-colors" />
                                                </div>
                                                <span className="text-[11px] font-black text-lightText uppercase tracking-widest group-hover/empty:text-primary transition-colors">Add First Size Option</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Default Variant Toggle */}
                                <div className="flex items-center gap-3 p-4 bg-mainBG/10 rounded-none border border-border/50">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="peer appearance-none w-5 h-5 rounded-none border-2 border-border checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                            checked={variant.isDefault}
                                            onChange={(e) => {
                                                const newVariants = variants.map((v, i) => ({
                                                    ...v,
                                                    isDefault: i === index ? e.target.checked : false
                                                }));
                                                setVariants(newVariants);
                                            }}
                                        />
                                        <MdCheck className="absolute text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" size={14} />
                                    </div>
                                    <label className="text-[11px] font-black text-mainText uppercase tracking-widest opacity-70">Set as Primary Variant</label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {variants.length === 0 && (
                        <button
                            type="button"
                            onClick={addVariant}
                            className="w-full py-12 border-2 border-dashed border-border rounded-none hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 bg-background group/empty"
                        >
                            <div className="w-16 h-16 rounded-none bg-mainBG/5 flex items-center justify-center group-hover/empty:bg-primary/10 transition-colors">
                                <MdAdd size={32} className="text-lightText group-hover/empty:text-primary transition-colors" />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-black text-mainText uppercase tracking-tight">Add Your First Variant</span>
                                <span className="block text-[10px] text-lightText font-black uppercase tracking-widest mt-1">Colors, Sizes, and Pricing</span>
                            </div>
                        </button>
                    )}
                </div>

                {/* Visibility & Status */}
                <div className="bg-background rounded-none border border-border p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border pb-4 mb-2">
                        <div className="w-2 h-6 bg-primary rounded-none"></div>
                        <h3 className="text-base font-black text-mainText uppercase tracking-tight">Visibility & Status</h3>
                    </div>

                    <div className="flex flex-wrap gap-8">
                        <label className="flex items-center gap-3 cursor-pointer group/status">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none w-6 h-6 rounded-none border-2 border-border checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                    {...formik.getFieldProps('isActive')}
                                    checked={formik.values.isActive}
                                />
                                <MdCheck className="absolute text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" size={16} />
                            </div>
                            <span className="text-[11px] font-black text-mainText uppercase tracking-widest opacity-70 group-hover/status:opacity-100 transition-opacity">Show on Website</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group/status">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none w-6 h-6 rounded-none border-2 border-border checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                    {...formik.getFieldProps('isFeatured')}
                                    checked={formik.values.isFeatured}
                                />
                                <MdCheck className="absolute text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" size={16} />
                            </div>
                            <span className="text-[11px] font-black text-mainText uppercase tracking-widest opacity-70 group-hover/status:opacity-100 transition-opacity">Featured Product</span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/product')}
                        className="flex-1 px-8 py-4 border border-border text-lightText font-black uppercase tracking-widest rounded-none hover:bg-mainBG/5 hover:text-mainText transition-all text-[11px]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formik.isValid}
                        className="flex-[2] px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-none hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-[11px] flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <AiOutlineLoading3Quarters size={18} className="animate-spin" />
                        ) : (
                            <MdSave size={18} />
                        )}
                        <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
                    </button>
                </div>
            </form >
        </div >
    );
};

export default ProductForm;
