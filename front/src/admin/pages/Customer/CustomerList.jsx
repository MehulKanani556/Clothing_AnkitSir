import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdSearch, MdFilterList, MdPeople, MdVisibility,
    MdEmail, MdPhone, MdLocationOn, MdRefresh,
    MdCheckCircle, MdCancel, MdBlock, MdVerifiedUser
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';

// ── Status Badge ──────────────────────────────────────────────────
const StatusBadge = ({ isDeleted, emailVerified }) => {
    if (isDeleted) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.1em] bg-red-50 text-red-600 border border-red-100">
                <MdBlock size={13} />
                Blocked
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.1em] border ${
            emailVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
            {emailVerified ? <MdVerifiedUser size={13} /> : <MdCancel size={13} />}
            {emailVerified ? 'Verified' : 'Pending'}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────────
const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        deleted: 0,
    });

    const fetchCustomers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/user/admin/all?page=${page}&limit=10`);
            const data = response.data?.result;
            setCustomers(data?.users || []);
            setCurrentPage(data?.currentPage || 1);
            setTotalPages(data?.totalPages || 1);
            setTotalCustomers(data?.totalUsers || 0);
            
            // Calculate stats
            const users = data?.users || [];
            setStats({
                total: data?.totalUsers || 0,
                verified: users.filter(u => u.emailVerified).length,
                unverified: users.filter(u => !u.emailVerified).length,
                deleted: users.filter(u => u.isUserDeleted).length,
            });
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(currentPage);
    }, [currentPage]);

    const handleRefresh = () => {
        fetchCustomers(currentPage);
        toast.success('Customers refreshed');
    };

    const filteredCustomers = customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        return (
            customer.firstName?.toLowerCase().includes(searchLower) ||
            customer.lastName?.toLowerCase().includes(searchLower) ||
            customer.email?.toLowerCase().includes(searchLower) ||
            customer.phone?.toLowerCase().includes(searchLower)
        );
    });

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-mainText tracking-tight">Manage Customers</h2>
                    <p className="text-lightText text-sm font-medium">View and manage all your registered customers here.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center justify-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm"
                >
                    <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
                    <span className="text-[14px]">Refresh List</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background p-5 rounded-none border border-border shadow-sm">
                    <p className="text-lightText text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Customers</p>
                    <p className="text-2xl font-black text-mainText leading-none">{stats.total}</p>
                </div>
                <div className="bg-emerald-50/50 p-5 rounded-none border border-emerald-100">
                    <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Verified</p>
                    <p className="text-2xl font-black text-emerald-700 leading-none">{stats.verified}</p>
                </div>
                <div className="bg-amber-50/50 p-5 rounded-none border border-amber-100">
                    <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pending</p>
                    <p className="text-2xl font-black text-amber-700 leading-none">{stats.unverified}</p>
                </div>
                <div className="bg-red-50/50 p-5 rounded-none border border-red-100">
                    <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Blocked</p>
                    <p className="text-2xl font-black text-red-700 leading-none">{stats.deleted}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-background p-4 rounded-none border border-border flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative flex-1 w-full">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lightText" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        className="w-full pl-12 pr-4 py-3 bg-mainBG border border-border rounded-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm text-mainText font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 text-lightText hover:bg-mainBG hover:text-mainText rounded-none transition-all text-[11px] border border-border font-black uppercase tracking-widest group">
                    <MdFilterList size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    Filters
                </button>
            </div>

            {/* Customers Table */}
            <div className="bg-background rounded-none border border-border overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-lightText opacity-50">Syncing database...</span>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-20 text-lightText font-black uppercase tracking-widest text-xs opacity-50">
                        <MdPeople size={64} className="mx-auto mb-4 opacity-10" />
                        No members found
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-mainBG/50 border-b border-border">
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Profile</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Communication</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Activity</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-lightText uppercase tracking-[0.2em] text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-mainBG/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                                        {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-mainText tracking-tight">
                                                            {customer.firstName} {customer.lastName}
                                                        </span>
                                                        <span className="text-[10px] text-lightText font-black uppercase tracking-widest">ID: {customer._id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[11px] font-black text-mainText">
                                                        <MdEmail size={14} className="text-primary opacity-50" />
                                                        {customer.email}
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-lightText">
                                                            <MdPhone size={14} className="text-lightText/50" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] font-black text-mainText">Joined: {formatDate(customer.createdAt)}</span>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-lightText uppercase tracking-widest">
                                                        <MdLocationOn size={14} className="opacity-50" />
                                                        {customer.address?.length || 0} Saved Addresses
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <StatusBadge 
                                                    isDeleted={customer.isUserDeleted} 
                                                    emailVerified={customer.emailVerified} 
                                                />
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => navigate(`/admin/customer/view/${customer._id}`)}
                                                    className="p-2.5 text-primary hover:bg-primary hover:text-white rounded-none transition-all duration-300 shadow-sm border border-border group-hover:border-primary/20"
                                                    title="Inspect Profile"
                                                >
                                                    <MdVisibility size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalCustomers}
                            itemsPerPage={10}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomerList;
