import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MdAttachMoney,
    MdCalendarToday,
    MdSearch,
    MdRefresh,
    MdReceipt,
    MdCheckCircle,
    MdAccessTime,
    MdError,
    MdCreditCard,
    MdTrendingUp,
    MdFilterList
} from 'react-icons/md';
import { fetchAllPayments } from '../../../redux/slice/payment.slice';
import Pagination from '../../components/Pagination';

const PaymentList = () => {
    const dispatch = useDispatch();
    const { payments, loading } = useSelector((state) => state.paymentHistory);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        dispatch(fetchAllPayments());
    }, [dispatch]);

    const filteredPayments = (payments || []).filter(payment =>
        payment.orderId?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

    const getStatusBadge = (status) => {
        const baseClass = "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all";
        switch (status?.toLowerCase()) {
            case 'success':
            case 'succeeded':
            case 'paid':
                return (
                    <span className={`${baseClass} bg-emerald-500/10 text-emerald-600 border-emerald-500/10`}>
                        <MdCheckCircle size={14} />
                        Settled
                    </span>
                );
            case 'pending':
                return (
                    <span className={`${baseClass} bg-amber-500/10 text-amber-600 border-amber-500/10`}>
                        <MdAccessTime size={14} />
                        Awaiting
                    </span>
                );
            case 'failed':
                return (
                    <span className={`${baseClass} bg-red-500/10 text-red-600 border-red-500/10`}>
                        <MdError size={14} />
                        Declined
                    </span>
                );
            default:
                return (
                    <span className={`${baseClass} bg-mainBG text-lightText border-border`}>
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-mainText tracking-tight">Payment History</h2>
                    <p className="text-lightText text-sm font-medium">View and check all your store payments here.</p>
                </div>
                <button
                    onClick={() => dispatch(fetchAllPayments())}
                    className="flex items-center justify-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm"
                >
                    <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
                    <span className="text-[14px]">Refresh List</span>
                </button>
            </div>

            {/* Stats and Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-background p-4 rounded-none border border-border flex flex-col md:flex-row gap-4 items-center shadow-sm">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lightText" size={18} />
                        <input
                            type="text"
                            placeholder="Identify transaction record..."
                            className="w-full pl-12 pr-4 py-3 bg-mainBG border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm text-mainText font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 text-lightText hover:bg-mainBG hover:text-mainText rounded-none transition-all text-[11px] border border-border font-black uppercase tracking-widest group">
                        <MdFilterList size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        Refine
                    </button>
                </div>
                <div className="bg-primary p-6 rounded-none border border-primary/10 flex items-center justify-between shadow-xl shadow-primary/20 group overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Gross Volume</p>
                        <p className="text-2xl font-black text-white leading-tight">
                            ${filteredPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-md relative z-10 border border-white/10">
                        <MdTrendingUp className="text-white" size={28} />
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-none -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-background rounded-none border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-mainBG/50 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Transaction Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Client Node</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em] text-center">Reference</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Quantum</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em] text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading && payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin"></div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-lightText opacity-50">Syncing Financial Cloud...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center font-black uppercase tracking-widest text-xs text-lightText opacity-50">No transaction records detected.</td>
                                </tr>
                            ) : (
                                currentItems.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-mainBG/30 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-none bg-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
                                                        <MdCreditCard size={16} />
                                                    </div>
                                                    <span className="font-black text-mainText tracking-tight text-[13px]">
                                                        {payment.transactionId || '---'}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-lightText font-black uppercase tracking-[0.2em] ml-11 opacity-60">
                                                    {payment.paymentMethod || 'Studio Gateway'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-black text-mainText text-[13px] tracking-tight">{payment.userId?.name || 'Guest Participant'}</span>
                                                <span className="text-[11px] text-lightText font-medium">{payment.userId?.email || 'unverified@node.io'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center whitespace-nowrap">
                                            <span className="px-4 py-2 bg-mainBG/50 border border-border rounded-none text-[10px] font-black text-mainText tracking-[0.1em] shadow-sm">
                                                ORD#{payment.orderId?._id?.slice(-8).toUpperCase() || '---'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-sm font-black text-mainText tabular-nums">
                                                ${(payment.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-8 py-5 text-right whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-mainText">
                                                    {new Date(payment.createdAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-[10px] text-lightText font-bold uppercase tracking-widest">Logged</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredPayments.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default PaymentList;
