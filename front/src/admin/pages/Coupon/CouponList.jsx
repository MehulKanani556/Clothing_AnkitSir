import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCouponsAdmin, deleteCoupon } from '../../../redux/slice/coupon.slice';
import {
    MdAdd, MdEdit, MdDelete, MdSearch, MdLocalOffer,
    MdPercent, MdAttachMoney, MdCheckCircle, MdCancel,
    MdRefresh, MdFilterList, MdAccessTime
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import CouponForm from './CouponForm';
import Pagination from '../../components/Pagination';

// ── Status Badge ──────────────────────────────────────────────────
const StatusBadge = ({ isActive, expiryDate }) => {
    const isExpired = new Date(expiryDate) < new Date();
    if (isExpired) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.1em] bg-mainBG text-lightText border border-border">
                <MdAccessTime size={13} />
                Expired
            </span>
        );
    }
    return isActive ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.1em] bg-emerald-50 text-emerald-600 border border-emerald-100">
            <MdCheckCircle size={13} />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.1em] bg-red-50 text-red-600 border border-red-100">
            <MdCancel size={13} />
            Inactive
        </span>
    );
};

// ── Discount Badge ────────────────────────────────────────────────
const DiscountBadge = ({ discountType, percentageValue, flatValue }) => {
    return discountType === 'percentage' ? (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-none text-[11px] font-black bg-primary/5 text-primary border border-primary/10">
            <MdPercent size={13} />
            {percentageValue}% OFF
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-none text-[11px] font-black bg-blue-50 text-blue-600 border border-blue-100">
            <MdAttachMoney size={13} />
            ${flatValue} OFF
        </span>
    );
};

// ── Delete Confirm Modal ──────────────────────────────────────────
const DeleteModal = ({ coupon, onClose, onConfirm, loading }) => {
    if (!coupon) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-primary/20 backdrop-blur-md" onClick={onClose} />
            <div className="relative z-10 bg-background rounded-none shadow-2xl border border-border w-full max-w-sm animate-in zoom-in-95 duration-300 p-8">
                <div className="w-16 h-16 bg-red-50 rounded-none flex items-center justify-center mx-auto mb-6 border border-red-100">
                    <MdDelete className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-black text-mainText text-center tracking-tight">Remove Coupon?</h3>
                <p className="text-sm text-lightText text-center mt-2 mb-8 font-medium">
                    Are you sure you want to delete <span className="font-black text-mainText">{coupon.code}</span>? This action is irreversible.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3 border border-border text-lightText font-black rounded-none hover:bg-mainBG transition-all text-[11px] uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-[2] px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-black rounded-none transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest active:scale-95"
                    >
                        {loading
                            ? <AiOutlineLoading3Quarters size={16} className="animate-spin" />
                            : 'Confirm'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────
const CouponList = () => {
    const dispatch = useDispatch();
    const { coupons, loading, saving } = useSelector((state) => state.coupon);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [deletingCoupon, setDeletingCoupon] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchAllCouponsAdmin());
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(fetchAllCouponsAdmin());
    };

    const handleDelete = () => {
        if (!deletingCoupon) return;
        dispatch(deleteCoupon(deletingCoupon._id)).then((res) => {
            if (!res.error) setDeletingCoupon(null);
        });
    };

    const openCreate = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const openEdit = (coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    // Stats
    const now = new Date();
    const stats = {
        total: coupons.length,
        active: coupons.filter(c => c.isActive && new Date(c.expiryDate) > now).length,
        inactive: coupons.filter(c => !c.isActive).length,
        expired: coupons.filter(c => new Date(c.expiryDate) <= now).length,
    };

    // Filter + search
    const filtered = coupons.filter(c => {
        const matchSearch =
            c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const isExpired = new Date(c.expiryDate) <= now;
        const matchFilter =
            filterStatus === 'All' ||
            (filterStatus === 'Active' && c.isActive && !isExpired) ||
            (filterStatus === 'Inactive' && !c.isActive) ||
            (filterStatus === 'Expired' && isExpired);
        return matchSearch && matchFilter;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DeleteModal
                coupon={deletingCoupon}
                onClose={() => setDeletingCoupon(null)}
                onConfirm={handleDelete}
                loading={saving}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-mainText tracking-tight">Discount Coupons</h2>
                    <p className="text-lightText text-sm font-medium">Create and manage discount codes for your customers here.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm"
                    >
                        <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
                        <span className="text-[14px]">Refresh List</span>
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-none font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase text-xs tracking-widest"
                    >
                        <MdAdd size={20} />
                        New Coupon
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background p-5 rounded-none border border-border shadow-sm">
                    <p className="text-lightText text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total</p>
                    <p className="text-2xl font-black text-mainText leading-none">{stats.total}</p>
                </div>
                <div className="bg-emerald-50/50 p-5 rounded-none border border-emerald-100">
                    <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active</p>
                    <p className="text-2xl font-black text-emerald-700 leading-none">{stats.active}</p>
                </div>
                <div className="bg-red-50/50 p-5 rounded-none border border-red-100">
                    <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Paused</p>
                    <p className="text-2xl font-black text-red-700 leading-none">{stats.inactive}</p>
                </div>
                <div className="bg-mainBG p-5 rounded-none border border-border">
                    <p className="text-lightText text-[10px] font-black uppercase tracking-[0.2em] mb-1">Expired</p>
                    <p className="text-2xl font-black text-lightText leading-none">{stats.expired}</p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="bg-background p-4 rounded-none border border-border flex flex-col md:flex-row gap-4 items-stretch md:items-center shadow-sm">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lightText" size={18} />
                    <input
                        type="text"
                        placeholder="Search by code or description..."
                        className="w-full pl-12 pr-4 py-3 bg-mainBG border border-border rounded-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm text-mainText font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 px-4 py-1.5 bg-mainBG rounded-none border border-border">
                    <MdFilterList size={18} className="text-lightText" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent outline-none text-[11px] font-black uppercase tracking-widest text-mainText cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active Only</option>
                        <option value="Inactive">Paused Only</option>
                        <option value="Expired">Expired Only</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-background rounded-none border border-border overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-lightText opacity-50">Syncing database...</span>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="text-center py-20 text-lightText">
                        <MdLocalOffer size={64} className="mx-auto mb-4 opacity-10" />
                        <p className="font-black uppercase tracking-widest text-xs opacity-50">No coupons found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-mainBG/50 border-b border-border">
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Coupon Code</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Benefit</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Requirements</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Validity</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em] text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {paginated.map((coupon) => (
                                        <tr key={coupon._id} className="hover:bg-mainBG/30 transition-colors group">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-mainBG rounded-none flex items-center justify-center border border-border group-hover:border-primary/20 transition-all duration-500 overflow-hidden">
                                                        {coupon.couponImage ? (
                                                            <img src={coupon.couponImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        ) : (
                                                            <MdLocalOffer size={20} className="text-lightText/30" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-mainText tracking-widest uppercase">{coupon.code}</span>
                                                        <span className="text-[10px] text-lightText font-bold truncate max-w-[150px]">{coupon.description}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <DiscountBadge
                                                    discountType={coupon.discountType}
                                                    percentageValue={coupon.percentageValue}
                                                    flatValue={coupon.flatValue}
                                                />
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-mainText">Min. Order:</span>
                                                    <span className="text-[10px] text-lightText font-bold uppercase tracking-widest">
                                                        {coupon.minOrderValue > 0 ? `$${coupon.minOrderValue.toLocaleString()}` : 'No Minimum'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-mainText">Expires on:</span>
                                                    <span className="text-[10px] text-lightText font-bold uppercase tracking-widest">{formatDate(coupon.expiryDate)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <StatusBadge isActive={coupon.isActive} expiryDate={coupon.expiryDate} />
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(coupon)}
                                                        className="p-2.5 text-primary hover:bg-primary hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-primary/20"
                                                        title="Edit"
                                                    >
                                                        <MdEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingCoupon(coupon)}
                                                        className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-red-200"
                                                        title="Delete"
                                                    >
                                                        <MdDelete size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filtered.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-start p-4 md:p-8 overflow-y-auto">
                    <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-0" onClick={() => setIsModalOpen(false)} />
                    <div className="relative z-10 w-full flex justify-center py-4 md:py-10">
                        <div className="animate-in zoom-in-95 duration-300 w-full max-w-2xl">
                            <CouponForm
                                initialValues={editingCoupon}
                                onCancel={() => {
                                    setIsModalOpen(false);
                                    setEditingCoupon(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponList;
