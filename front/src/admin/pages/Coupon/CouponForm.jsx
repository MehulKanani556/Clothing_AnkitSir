import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCoupon, updateCoupon, fetchAllCouponsAdmin } from '../../../redux/slice/coupon.slice';
import {
    MdClose, MdCloudUpload, MdLocalOffer, MdPercent, MdAttachMoney,
    MdCalendarToday, MdCheckCircle
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const CouponForm = ({ initialValues, onCancel }) => {
    const dispatch = useDispatch();
    const { saving } = useSelector((state) => state.coupon);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (initialValues?.couponImage) {
            setPreview(initialValues.couponImage);
        }
    }, [initialValues]);

    const formik = useFormik({
        initialValues: {
            code: initialValues?.code || '',
            description: initialValues?.description || '',
            discountType: initialValues?.discountType || 'percentage',
            percentageValue: initialValues?.percentageValue || '',
            flatValue: initialValues?.flatValue || '',
            minOrderValue: initialValues?.minOrderValue || '',
            expiryDate: initialValues?.expiryDate ? new Date(initialValues.expiryDate).toLocaleDateString('en-GB') : '',
            isActive: initialValues?.isActive ?? true,
            couponImage: null
        },
        validationSchema: Yup.object({
            code: Yup.string().required('Coupon code is required'),
            description: Yup.string().required('Description is required'),
            discountType: Yup.string().required(),
            percentageValue: Yup.number().when('discountType', {
                is: 'percentage',
                then: (schema) => schema.required('Percentage is required').min(1, 'Min 1%').max(100, 'Max 100%'),
            }),
            flatValue: Yup.number().when('discountType', {
                is: 'flat',
                then: (schema) => schema.required('Amount is required').min(1, 'Min $1'),
            }),
            expiryDate: Yup.string()
                .required('Expiry date is required')
                .matches(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Use DD/MM/YYYY'),
            isActive: Yup.boolean()
        }),
        enableReinitialize: true,
        onSubmit: (values) => {
            const data = new FormData();
            data.append('code', values.code.toUpperCase());
            data.append('description', values.description);
            data.append('discountType', values.discountType);
            data.append('percentageValue', values.percentageValue || 0);
            data.append('flatValue', values.flatValue || 0);
            data.append('minOrderValue', values.minOrderValue || 0);
            data.append('expiryDate', values.expiryDate);
            data.append('isActive', values.isActive);
            if (values.couponImage) data.append('couponImage', values.couponImage);

            const action = initialValues
                ? updateCoupon({ id: initialValues._id, formData: data })
                : createCoupon(data);

            dispatch(action).then((res) => {
                if (!res.error) {
                    dispatch(fetchAllCouponsAdmin());
                    onCancel();
                }
            });
        },
    });

    const handleImageChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            formik.setFieldValue('couponImage', file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDateInput = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
        if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5);
        if (val.length > 10) val = val.slice(0, 10);
        formik.setFieldValue('expiryDate', val);
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

            <form onSubmit={formik.handleSubmit} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left column */}
                    <div className="space-y-8">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">
                                Coupon Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. SUMMER20"
                                className={`w-full px-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-[0.2em] uppercase ${formik.touched.code && formik.errors.code ? 'border-red-400' : 'border-border'}`}
                                {...formik.getFieldProps('code')}
                                onChange={(e) => formik.setFieldValue('code', e.target.value.toUpperCase())}
                            />
                            {formik.touched.code && formik.errors.code && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formik.errors.code}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                placeholder="Describe what this coupon offers..."
                                rows={3}
                                className={`w-full px-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-medium resize-none ${formik.touched.description && formik.errors.description ? 'border-red-400' : 'border-border'}`}
                                {...formik.getFieldProps('description')}
                            />
                            {formik.touched.description && formik.errors.description && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formik.errors.description}</p>}
                        </div>

                        {/* Discount Type */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-mainText uppercase tracking-[0.2em] ml-1 opacity-70">Discount Amount</label>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { value: 'percentage', label: 'Percentage', icon: MdPercent },
                                    { value: 'flat', label: 'Fixed Amount', icon: MdAttachMoney },
                                ].map(({ value, label, icon: Icon }) => (
                                    <label
                                        key={value}
                                        className={`flex items-center gap-4 p-5 border-2 rounded-none cursor-pointer transition-all duration-500 ${formik.values.discountType === value ? 'border-primary bg-primary/5 shadow-inner' : 'border-border hover:border-primary/20 bg-mainBG/5'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="discountType"
                                            value={value}
                                            checked={formik.values.discountType === value}
                                            onChange={() => formik.setFieldValue('discountType', value)}
                                            className="hidden"
                                        />
                                        <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-all duration-500 ${formik.values.discountType === value ? 'bg-primary text-white scale-110 shadow-xl shadow-primary/20' : 'bg-white text-lightText border border-border'}`}>
                                            <Icon size={20} />
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${formik.values.discountType === value ? 'text-primary' : 'text-lightText'}`}>{label}</span>
                                        {formik.values.discountType === value && <MdCheckCircle className="ml-auto text-primary" size={20} />}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Discount Value */}
                        {formik.values.discountType === 'percentage' ? (
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
                                        placeholder="e.g. 20"
                                        className={`w-full pl-14 pr-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-tight ${formik.touched.percentageValue && formik.errors.percentageValue ? 'border-red-400' : 'border-border'}`}
                                        {...formik.getFieldProps('percentageValue')}
                                    />
                                </div>
                                {formik.touched.percentageValue && formik.errors.percentageValue && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formik.errors.percentageValue}</p>}
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
                                        placeholder="e.g. 15"
                                        className={`w-full pl-14 pr-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-tight ${formik.touched.flatValue && formik.errors.flatValue ? 'border-red-400' : 'border-border'}`}
                                        {...formik.getFieldProps('flatValue')}
                                    />
                                </div>
                                {formik.touched.flatValue && formik.errors.flatValue && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formik.errors.flatValue}</p>}
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-8">
                        {/* Image Upload */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Coupon Image (optional)</label>
                            <div
                                className={`relative h-[180px] border-2 border-dashed rounded-none overflow-hidden transition-all duration-500 group cursor-pointer ${preview ? 'border-primary' : 'border-border hover:border-primary bg-mainBG/5'}`}
                                onClick={() => document.getElementById('couponImage').click()}
                            >
                                {preview ? (
                                    <>
                                        <img src={preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
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
                                    placeholder="0 = no threshold"
                                    className="w-full pl-14 pr-6 py-4 bg-mainBG/10 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-tight"
                                    {...formik.getFieldProps('minOrderValue')}
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
                                    placeholder="DD/MM/YYYY"
                                    maxLength={10}
                                    className={`w-full pl-14 pr-6 py-4 bg-mainBG/10 border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black tracking-[0.2em] ${formik.touched.expiryDate && formik.errors.expiryDate ? 'border-red-400' : 'border-border'}`}
                                    {...formik.getFieldProps('expiryDate')}
                                    onChange={handleDateInput}
                                />
                            </div>
                            {formik.touched.expiryDate && formik.errors.expiryDate && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{formik.errors.expiryDate}</p>}
                        </div>

                        {/* Active Toggle */}
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black uppercase tracking-widest text-lightText ml-1 opacity-70">Coupon Status</label>
                            <label className="flex items-center gap-5 p-6 border border-border rounded-none cursor-pointer hover:border-primary/20 bg-mainBG/10 transition-all group">
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formik.values.isActive}
                                    onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                                />
                                <div className={`w-14 h-7 rounded-none transition-all duration-500 relative flex-shrink-0 ${formik.values.isActive ? 'bg-primary' : 'bg-lightText/20'}`}>
                                    <div className={`absolute top-1 w-5 h-5 rounded-none bg-white transition-all duration-500 shadow-xl ${formik.values.isActive ? 'left-8' : 'left-1'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs font-black uppercase tracking-widest transition-colors ${formik.values.isActive ? 'text-primary' : 'text-lightText'}`}>
                                        {formik.values.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                    <p className="text-[10px] text-lightText font-medium mt-1">
                                        {formik.values.isActive ? 'Customers can use this coupon' : 'Customers cannot use this coupon'}
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
                        disabled={saving || !formik.isValid}
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
