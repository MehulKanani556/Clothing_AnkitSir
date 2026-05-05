import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCoupon, updateCoupon, fetchAllCouponsAdmin } from '../../../redux/slice/coupon.slice';
import {
    MdClose, MdCloudUpload, MdLocalOffer, MdPercent, MdAttachMoney,
    MdCalendarToday, MdCheckCircle
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const CouponForm = ({ initialValues, onCancel }) => {
    const dispatch = useDispatch();
    const { saving } = useSelector((state) => state.coupon);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        percentageValue: '',
        flatValue: '',
        minOrderValue: '',
        expiryDate: '',
        isActive: true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialValues) {
            // Format date from ISO to DD/MM/YYYY for display
            let formattedDate = '';
            if (initialValues.expiryDate) {
                const d = new Date(initialValues.expiryDate);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                formattedDate = `${day}/${month}/${year}`;
            }
            setFormData({
                code: initialValues.code || '',
                description: initialValues.description || '',
                discountType: initialValues.discountType || 'percentage',
                percentageValue: initialValues.percentageValue || '',
                flatValue: initialValues.flatValue || '',
                minOrderValue: initialValues.minOrderValue || '',
                expiryDate: formattedDate,
                isActive: initialValues.isActive ?? true,
            });
            if (initialValues.couponImage) setImagePreview(initialValues.couponImage);
        }
    }, [initialValues]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.code.trim()) errs.code = 'Coupon code is required';
        if (!formData.description.trim()) errs.description = 'Description is required';
        if (!formData.expiryDate) errs.expiryDate = 'Expiry date is required';
        else {
            // Validate DD/MM/YYYY format
            const parts = formData.expiryDate.split('/');
            if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
                errs.expiryDate = 'Use DD/MM/YYYY format';
            }
        }
        if (formData.discountType === 'percentage') {
            const val = Number(formData.percentageValue);
            if (!formData.percentageValue || val <= 0 || val > 100)
                errs.percentageValue = 'Enter a value between 1 and 100';
        } else {
            const val = Number(formData.flatValue);
            if (!formData.flatValue || val <= 0)
                errs.flatValue = 'Enter a value greater than 0';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = new FormData();
        data.append('code', formData.code.toUpperCase());
        data.append('description', formData.description);
        data.append('discountType', formData.discountType);
        data.append('percentageValue', formData.percentageValue || 0);
        data.append('flatValue', formData.flatValue || 0);
        data.append('minOrderValue', formData.minOrderValue || 0);
        data.append('expiryDate', formData.expiryDate);
        data.append('isActive', formData.isActive);
        if (imageFile) data.append('couponImage', imageFile);

        const action = initialValues
            ? updateCoupon({ id: initialValues._id, formData: data })
            : createCoupon(data);

        dispatch(action).then((res) => {
            if (!res.error) {
                dispatch(fetchAllCouponsAdmin());
                onCancel();
            }
        });
    };

    const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

    // Auto-format date input as DD/MM/YYYY
    const handleDateInput = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
        if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5);
        if (val.length > 10) val = val.slice(0, 10);
        set('expiryDate', val);
    };

    return (
        <div className="bg-background rounded-none shadow-2xl overflow-hidden border border-border">
            {/* Header */}
            <div className="px-10 py-8 border-b border-border flex justify-between items-center bg-mainBG/30">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-2xl shadow-primary/20">
                        <MdLocalOffer className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-mainText tracking-tight">
                            {initialValues ? 'Edit Coupon' : 'Add New Coupon'}
                        </h3>
                        <p className="text-[10px] text-lightText font-black uppercase tracking-widest mt-0.5">Coupon Details</p>
                    </div>
                </div>
                <button 
                    onClick={onCancel} 
                    className="p-3 hover:bg-white rounded-none transition-all text-lightText hover:text-primary border border-transparent hover:border-border active:scale-95"
                >
                    <MdClose size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left column */}
                    <div className="space-y-8">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">
                                Coupon Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => set('code', e.target.value.toUpperCase())}
                                placeholder="e.g. SUMMER20"
                                className={`w-full px-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-[0.2em] uppercase ${errors.code ? 'border-red-400' : 'border-border'}`}
                            />
                            {errors.code && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.code}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => set('description', e.target.value)}
                                placeholder="Describe what this coupon offers..."
                                rows={3}
                                className={`w-full px-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-medium resize-none ${errors.description ? 'border-red-400' : 'border-border'}`}
                            />
                            {errors.description && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.description}</p>}
                        </div>

                        {/* Discount Type */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-mainText uppercase tracking-[0.2em] ml-1 opacity-70">Discount Amount</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: 'percentage', label: 'Percentage', icon: MdPercent },
                                    { value: 'flat', label: 'Fixed Amount', icon: MdAttachMoney },
                                ].map(({ value, label, icon: Icon }) => (
                                    <label
                                        key={value}
                                        className={`flex items-center gap-4 p-5 border-2 rounded-none cursor-pointer transition-all duration-500 ${formData.discountType === value ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/20 bg-mainBG/5'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="discountType"
                                            value={value}
                                            checked={formData.discountType === value}
                                            onChange={(e) => set('discountType', e.target.value)}
                                            className="hidden"
                                        />
                                        <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-all duration-500 ${formData.discountType === value ? 'bg-primary text-white scale-110 shadow-xl shadow-primary/20' : 'bg-white text-lightText border border-border'}`}>
                                            <Icon size={20} />
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${formData.discountType === value ? 'text-primary' : 'text-lightText'}`}>{label}</span>
                                        {formData.discountType === value && <MdCheckCircle className="ml-auto text-primary" size={20} />}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Discount Value */}
                        {formData.discountType === 'percentage' ? (
                            <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">
                                Discount Percentage (%) <span className="text-red-500">*</span>
                            </label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lightText group-focus-within:text-primary transition-colors">
                                        <MdPercent size={20} />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.percentageValue}
                                        onChange={(e) => set('percentageValue', e.target.value)}
                                        placeholder="e.g. 20"
                                        className={`w-full pl-14 pr-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-tight ${errors.percentageValue ? 'border-red-400' : 'border-border'}`}
                                    />
                                </div>
                                {errors.percentageValue && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.percentageValue}</p>}
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">
                                Discount Amount ($) <span className="text-red-500">*</span>
                            </label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lightText group-focus-within:text-primary transition-colors">
                                        <MdAttachMoney size={20} />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.flatValue}
                                        onChange={(e) => set('flatValue', e.target.value)}
                                        placeholder="e.g. 15"
                                        className={`w-full pl-14 pr-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-tight ${errors.flatValue ? 'border-red-400' : 'border-border'}`}
                                    />
                                </div>
                                {errors.flatValue && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.flatValue}</p>}
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-8">
                        {/* Image Upload */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Coupon Image (optional)</label>
                            <div
                                className={`relative h-[180px] border-2 border-dashed rounded-none overflow-hidden transition-all duration-500 group cursor-pointer ${imagePreview ? 'border-primary' : 'border-border hover:border-primary bg-mainBG/5'}`}
                                onClick={() => document.getElementById('couponImage').click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-sm">
                                            <div className="bg-white p-4 rounded-none shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                                <MdCloudUpload className="text-primary" size={32} />
                                            </div>
                                            <span className="text-white font-black uppercase tracking-widest text-[10px] mt-4">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
                                            <MdCloudUpload className="text-primary" size={28} />
                                        </div>
                                        <p className="text-lightText font-black text-[10px] uppercase tracking-widest mt-4">Upload Coupon Image</p>
                                    </div>
                                )}
                                <input type="file" id="couponImage" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div>

                        {/* Min Order Value */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Minimum Order Amount ($)</label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lightText group-focus-within:text-primary transition-colors">
                                    <MdAttachMoney size={20} />
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.minOrderValue}
                                    onChange={(e) => set('minOrderValue', e.target.value)}
                                    placeholder="0 = no threshold"
                                    className="w-full pl-14 pr-6 py-4 bg-mainBG/10 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-tight"
                                />
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">
                                Expiry Date (DD/MM/YYYY) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lightText group-focus-within:text-primary transition-colors">
                                    <MdCalendarToday size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.expiryDate}
                                    onChange={handleDateInput}
                                    placeholder="DD/MM/YYYY"
                                    maxLength={10}
                                    className={`w-full pl-14 pr-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-[0.2em] ${errors.expiryDate ? 'border-red-400' : 'border-border'}`}
                                />
                            </div>
                            {errors.expiryDate && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.expiryDate}</p>}
                        </div>

                        {/* Active Toggle */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Coupon Status</label>
                            <label className="flex items-center gap-5 p-6 border border-border rounded-none cursor-pointer hover:border-primary/20 bg-mainBG/10 transition-all group">
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.isActive}
                                    onChange={(e) => set('isActive', e.target.checked)}
                                />
                                <div className={`w-14 h-7 rounded-none transition-all duration-500 relative flex-shrink-0 ${formData.isActive ? 'bg-primary' : 'bg-lightText/20'}`}>
                                    <div className={`absolute top-1 w-5 h-5 rounded-none bg-white transition-all duration-500 shadow-xl ${formData.isActive ? 'left-8' : 'left-1'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-black uppercase tracking-widest transition-colors ${formData.isActive ? 'text-primary' : 'text-lightText'}`}>
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                    <p className="text-[10px] text-lightText font-medium mt-1">
                                        {formData.isActive ? 'Customers can use this coupon' : 'Customers cannot use this coupon'}
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-8 py-4 border border-border text-lightText rounded-none font-black uppercase tracking-widest text-[11px] hover:bg-mainBG transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-[2] px-8 py-4 bg-primary text-white rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                    >
                        {saving ? (
                            <><AiOutlineLoading3Quarters size={20} className="animate-spin" /> Saving...</>
                        ) : (
                            initialValues ? (
                                <><MdCheckCircle size={20} /> Update Coupon</>
                            ) : (
                                <><MdLocalOffer size={20} /> Create Coupon</>
                            )
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CouponForm;
