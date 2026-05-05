import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    createProductVariant,
    updateProductVariant,
    deleteProductVariant,
    fetchVariantsByProductId
} from '../../../redux/slice/product.slice';
import { MdClose, MdSave, MdAdd, MdDelete, MdCloudUpload, MdDragIndicator } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// Each image slot: { type: 'existing', url: string } | { type: 'new', file: File, preview: string }
const buildImageSlots = (existingUrls = []) =>
    existingUrls.map(url => ({ type: 'existing', url, preview: url }));

const VariantManager = ({ productId, variant, onClose }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.product || {});
    const isEditMode = Boolean(variant);

    const [formData, setFormData] = useState({
        color: variant?.color || '',
        colorCode: variant?.colorCode || '#000000',
        isDefault: variant?.isDefault || false,
        price: variant?.price ?? '',
        stock: variant?.stock ?? '',
        discount: variant?.discount || 0,
        weight: variant?.weight || '',
        dimensions: {
            length: variant?.dimensions?.length || '',
            width: variant?.dimensions?.width || '',
            height: variant?.dimensions?.height || ''
        },
        options: variant?.options || [],
        isActive: variant?.isActive ?? true
    });

    // Unified image list preserving order
    const [imageSlots, setImageSlots] = useState(buildImageSlots(variant?.images || []));
    const [useOptions, setUseOptions] = useState(variant?.options?.length > 0 || false);

    // Drag state
    const dragIndex = useRef(null);
    const dragOverIndex = useRef(null);

    // ── Image handlers ──────────────────────────────────────────────
    const handleImageAdd = (e) => {
        const files = Array.from(e.target.files);
        const newSlots = files.map(file => ({
            type: 'new',
            file,
            preview: URL.createObjectURL(file)
        }));
        setImageSlots(prev => [...prev, ...newSlots]);
        e.target.value = '';
    };

    const removeImage = (index) => {
        setImageSlots(prev => prev.filter((_, i) => i !== index));
    };

    // Drag-to-reorder
    const onDragStart = (index) => { dragIndex.current = index; };
    const onDragEnter = (index) => { dragOverIndex.current = index; };
    const onDragEnd = () => {
        const from = dragIndex.current;
        const to = dragOverIndex.current;
        if (from === null || to === null || from === to) return;
        setImageSlots(prev => {
            const updated = [...prev];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            return updated;
        });
        dragIndex.current = null;
        dragOverIndex.current = null;
    };

    // ── Options ──────────────────────────────────────────────────────
    const addOption = () =>
        setFormData(prev => ({ ...prev, options: [...prev.options, { size: '', price: '', stock: '', discount: 0 }] }));

    const removeOption = (i) =>
        setFormData(prev => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }));

    const updateOption = (i, field, value) =>
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((opt, idx) => idx === i ? { ...opt, [field]: value } : opt)
        }));

    // ── Submit ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (imageSlots.length === 0) {
            alert('At least one image is required.');
            return;
        }

        const submitData = new FormData();
        submitData.append('productId', productId);
        submitData.append('color', formData.color);
        submitData.append('colorCode', formData.colorCode);
        submitData.append('isDefault', formData.isDefault);
        submitData.append('discount', formData.discount || 0);
        submitData.append('isActive', formData.isActive);
        if (formData.weight) submitData.append('weight', formData.weight);
        if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
            submitData.append('dimensions', JSON.stringify(formData.dimensions));
        }

        if (useOptions) {
            submitData.append('options', JSON.stringify(formData.options));
        } else {
            submitData.append('price', formData.price);
            submitData.append('stock', formData.stock);
        }

        if (isEditMode) {
            // Build position map and collect kept existing URLs + new files
            const keptExisting = imageSlots.filter(s => s.type === 'existing').map(s => s.url);
            const positions = [];
            let newFileIdx = 0;
            let existingIdx = 0;

            imageSlots.forEach(slot => {
                if (slot.type === 'existing') {
                    positions.push({ type: 'existing', index: existingIdx++ });
                } else {
                    positions.push({ type: 'new', index: newFileIdx++ });
                    submitData.append('images', slot.file);
                }
            });

            submitData.append('existingImages', JSON.stringify(keptExisting));
            submitData.append('imagePositions', JSON.stringify(positions));
        } else {
            // Create — just append all files in order
            imageSlots.forEach(slot => {
                if (slot.type === 'new') submitData.append('images', slot.file);
            });
        }

        try {
            if (isEditMode) {
                await dispatch(updateProductVariant({ id: variant._id, data: submitData })).unwrap();
            } else {
                await dispatch(createProductVariant(submitData)).unwrap();
            }
            dispatch(fetchVariantsByProductId(productId));
            onClose();
        } catch (error) {
            console.error('Error saving variant:', error);
            alert(`Failed: ${error?.message || 'Unknown error'}`);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this variant?')) {
            try {
                await dispatch(deleteProductVariant(variant._id)).unwrap();
                dispatch(fetchVariantsByProductId(productId));
                onClose();
            } catch (error) {
                console.error('Error deleting variant:', error);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start p-4 md:p-8 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-0" onClick={onClose} />
            <div className="relative z-10 w-full flex justify-center py-4 md:py-10">
                <div className="animate-in zoom-in-95 duration-200 w-full max-w-4xl">
                    <div className="bg-white rounded-none shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                            <div>
                                <h3 className="font-black text-slate-900 text-lg tracking-tight">
                                    {isEditMode ? 'Edit Variant' : 'Add New Variant'}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                    Product Variant Manager
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-none text-slate-400 hover:text-black transition-all">
                                <MdClose size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

                            {/* Images — draggable */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 ml-1">
                                        Product Images * <span className="text-slate-400 font-normal">(drag to reorder)</span>
                                    </label>
                                    <span className="text-xs text-slate-400">{imageSlots.length} image{imageSlots.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {imageSlots.map((slot, index) => (
                                        <div
                                            key={index}
                                            draggable
                                            onDragStart={() => onDragStart(index)}
                                            onDragEnter={() => onDragEnter(index)}
                                            onDragEnd={onDragEnd}
                                            onDragOver={(e) => e.preventDefault()}
                                            className="relative w-20 h-20 rounded-none overflow-hidden border-2 border-slate-200 group cursor-grab active:cursor-grabbing select-none"
                                        >
                                            <img src={slot.preview} alt={`img-${index}`} className="w-full h-full object-cover" />
                                            {/* Position badge */}
                                            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold rounded-none px-1">
                                                {index + 1}
                                            </div>
                                            {/* Drag handle */}
                                            <div className="absolute top-1 right-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MdDragIndicator size={14} />
                                            </div>
                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            >
                                                <MdDelete size={20} className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Add button */}
                                    <label className="w-20 h-20 rounded-none border-2 border-dashed border-slate-200 hover:border-black transition-all flex flex-col items-center justify-center cursor-pointer bg-slate-50 flex-shrink-0">
                                        <MdCloudUpload size={22} className="text-slate-400" />
                                        <span className="text-[10px] text-slate-400 mt-1">Add</span>
                                        <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Color */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">Color Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Red, Blue, Black"
                                        className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                        value={formData.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 ml-1">Color Code</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="color"
                                            className="w-12 h-10 rounded-none border border-slate-200 cursor-pointer"
                                            value={formData.colorCode}
                                            onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                                        />
                                        <input
                                            type="text"
                                            placeholder="#000000"
                                            className="flex-1 px-4 py-2.5 rounded-none border border-slate-200 focus:border-black focus:ring-2 focus:ring-black/5 transition-all outline-none text-sm font-medium"
                                            value={formData.colorCode}
                                            onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex gap-6 p-3 bg-slate-50 rounded-none">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded-none border-slate-300"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))} />
                                    <span className="text-sm font-medium text-slate-700">Set as Default Variant</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded-none border-slate-300"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
                                    <span className="text-sm font-medium text-slate-700">Active</span>
                                </label>
                            </div>

                            {/* Pricing type */}
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-none">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="pricingType" checked={!useOptions} onChange={() => setUseOptions(false)} className="w-4 h-4" />
                                    <span className="text-sm font-medium text-slate-700">Single Price</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="pricingType" checked={useOptions} onChange={() => setUseOptions(true)} className="w-4 h-4" />
                                    <span className="text-sm font-medium text-slate-700">Multiple Sizes/Prices</span>
                                </label>
                            </div>

                            {/* Single price */}
                            {!useOptions && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 ml-1">Price ($) *</label>
                                        <input type="number" placeholder="999"
                                            className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black outline-none text-sm font-medium"
                                            value={formData.price}
                                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                            required={!useOptions} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 ml-1">Stock *</label>
                                        <input type="number" placeholder="100"
                                            className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black outline-none text-sm font-medium"
                                            value={formData.stock}
                                            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                            required={!useOptions} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 ml-1">Discount (%)</label>
                                        <input type="number" placeholder="0" min="0" max="100"
                                            className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black outline-none text-sm font-medium"
                                            value={formData.discount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))} />
                                    </div>
                                </div>
                            )}

                            {/* Multiple options */}
                            {useOptions && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700">Size Options</label>
                                        <button type="button" onClick={addOption}
                                            className="flex items-center gap-1 text-xs font-bold text-black hover:bg-slate-100 px-3 py-1.5 rounded-none transition-all">
                                            <MdAdd size={16} /> Add Size
                                        </button>
                                    </div>
                                    {formData.options.map((option, i) => (
                                        <div key={i} className="grid grid-cols-6 gap-3 p-3 bg-slate-50 rounded-none">
                                            <input type="text" placeholder="Size"
                                                className="px-3 py-2 rounded-none border border-slate-200 outline-none text-xs"
                                                value={option.size} onChange={(e) => updateOption(i, 'size', e.target.value)} required />
                                            <input type="number" placeholder="Price"
                                                className="px-3 py-2 rounded-none border border-slate-200 outline-none text-xs"
                                                value={option.price} onChange={(e) => updateOption(i, 'price', e.target.value)} required />
                                            <input type="number" placeholder="Stock"
                                                className="px-3 py-2 rounded-none border border-slate-200 outline-none text-xs"
                                                value={option.stock} onChange={(e) => updateOption(i, 'stock', e.target.value)} required />
                                            <input type="number" placeholder="Disc %" min="0" max="100"
                                                className="px-3 py-2 rounded-none border border-slate-200 outline-none text-xs"
                                                value={option.discount || 0} onChange={(e) => updateOption(i, 'discount', e.target.value)} />
                                            <div className="text-xs text-slate-400 flex items-center">Auto SKU</div>
                                            <button type="button" onClick={() => removeOption(i)}
                                                className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-red-200"
                                                title="Remove Size">
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.options.length === 0 && (
                                        <button type="button" onClick={addOption}
                                            className="w-full py-6 border-2 border-dashed border-slate-300 rounded-none hover:border-black transition-all flex flex-col items-center gap-1 text-slate-400 hover:text-black">
                                            <MdAdd size={24} />
                                            <span className="text-xs font-bold">Add First Size</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Dimensions */}
                            <div className="grid grid-cols-4 gap-4">
                                {[['weight', 'Weight (kg)', '0.5', '0.01'], ['length', 'Length (cm)', '30', '0.1'], ['width', 'Width (cm)', '20', '0.1'], ['height', 'Height (cm)', '5', '0.1']].map(([field, label, ph, step]) => (
                                    <div key={field}>
                                        <label className="text-xs font-bold text-slate-700 ml-1">{label}</label>
                                        <input type="number" step={step} placeholder={ph}
                                            className="w-full px-4 py-2.5 rounded-none border border-slate-200 mt-1 focus:border-black outline-none text-sm font-medium"
                                            value={field === 'weight' ? formData.weight : formData.dimensions[field]}
                                            onChange={(e) => field === 'weight'
                                                ? setFormData(prev => ({ ...prev, weight: e.target.value }))
                                                : setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, [field]: e.target.value } }))
                                            } />
                                    </div>
                                ))}
                            </div>

                            {isEditMode && variant?.sku && (
                                <div className="p-3 bg-blue-50 rounded-none border border-blue-200">
                                    <p className="text-xs font-bold text-blue-900">SKU: {variant.sku}</p>
                                    <p className="text-xs text-blue-600 mt-0.5">Auto-generated and unique</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                {isEditMode && (
                                    <button type="button" onClick={handleDelete}
                                        className="px-5 py-2.5 border border-red-200 text-red-600 font-bold rounded-none hover:bg-red-50 transition-all text-sm">
                                        Delete
                                    </button>
                                )}
                                <button type="button" onClick={onClose}
                                    className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-500 font-bold rounded-none hover:bg-slate-50 hover:text-black transition-all text-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-[2] px-5 py-2.5 bg-black hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black rounded-none shadow-xl shadow-black/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
                                    {loading ? <AiOutlineLoading3Quarters size={20} className="animate-spin" /> : <MdSave size={20} />}
                                    {isEditMode ? 'Update Variant' : 'Create Variant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VariantManager;
