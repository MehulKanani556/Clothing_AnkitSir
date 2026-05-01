import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdSearch, MdFilterList, MdShoppingCart, MdVisibility,
    MdLocalShipping, MdCheckCircle, MdCancel, MdPending,
    MdEdit, MdRefresh
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';

// ── Order Status Badge ────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: MdPending },
        'On the way': { bg: 'bg-blue-100', text: 'text-blue-700', icon: MdLocalShipping },
        'Delivered': { bg: 'bg-green-100', text: 'text-green-700', icon: MdCheckCircle },
        'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: MdCancel },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: MdPending };
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
            <Icon size={14} />
            {status}
        </span>
    );
};

// ── Payment Status Badge ──────────────────────────────────────────
const PaymentBadge = ({ status }) => {
    const config = {
        'Paid': { bg: 'bg-green-100', text: 'text-green-700' },
        'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
        'Failed': { bg: 'bg-red-100', text: 'text-red-700' },
    };

    const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bg} ${text}`}>
            {status}
        </span>
    );
};

// ── Update Status Modal ───────────────────────────────────────────
const UpdateStatusModal = ({ order, onClose, onUpdate }) => {
    const [selectedStatus, setSelectedStatus] = useState(order?.orderStatus || 'Pending');
    const [updating, setUpdating] = useState(false);

    const statuses = ['Pending', 'On the way', 'Delivered', 'Cancelled'];

    const handleUpdate = async () => {
        if (selectedStatus === order.orderStatus) {
            toast.error('Please select a different status');
            return;
        }

        setUpdating(true);
        try {
            await axiosInstance.put(`/order/admin/status/${order._id}`, {
                orderStatus: selectedStatus
            });
            toast.success('Order status updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <MdEdit className="text-blue-600" size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900">Update Order Status</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Order #{order.orderId}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Current Status: <StatusBadge status={order.orderStatus} />
                        </label>
                        <div className="space-y-2">
                            {statuses.map((status) => (
                                <label
                                    key={status}
                                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                        selectedStatus === status
                                            ? 'border-black bg-black/5'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status}
                                        checked={selectedStatus === status}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <StatusBadge status={status} />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={updating}
                        className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex-[2] px-5 py-2.5 bg-black hover:bg-slate-800 disabled:bg-slate-300 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                    >
                        {updating
                            ? <><AiOutlineLoading3Quarters size={16} className="animate-spin" /> Updating...</>
                            : <><MdEdit size={18} /> Update Status</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────
const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [orderToUpdate, setOrderToUpdate] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        onTheWay: 0,
        delivered: 0,
        cancelled: 0,
    });

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/order/admin/all?page=${page}&limit=10`);
            const data = response.data?.result;
            setOrders(data?.orders || []);
            setCurrentPage(data?.currentPage || 1);
            setTotalPages(data?.totalPages || 1);
            setTotalOrders(data?.totalOrders || 0);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Fetch all orders without pagination to get accurate stats
            const response = await axiosInstance.get(`/order/admin/all?page=1&limit=10000`);
            const allOrders = response.data?.result?.orders || [];
            
            setStats({
                total: allOrders.length,
                pending: allOrders.filter(o => o.orderStatus === 'Pending').length,
                onTheWay: allOrders.filter(o => o.orderStatus === 'On the way').length,
                delivered: allOrders.filter(o => o.orderStatus === 'Delivered').length,
                cancelled: allOrders.filter(o => o.orderStatus === 'Cancelled').length,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
        fetchStats(); // Fetch stats separately
    }, [currentPage]);

    const handleRefresh = () => {
        fetchOrders(currentPage);
        fetchStats(); // Refresh stats too
        toast.success('Orders refreshed');
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === 'All' || order.orderStatus === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `$${Number(amount).toFixed(2)}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UpdateStatusModal
                order={orderToUpdate}
                onClose={() => setOrderToUpdate(null)}
                onUpdate={() => {
                    fetchOrders(currentPage);
                    fetchStats(); // Refresh stats after update
                }}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
                    <p className="text-slate-500 text-sm">Manage and track all customer orders</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95"
                >
                    <MdRefresh size={20} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Total</p>
                    <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                    <p className="text-yellow-700 text-xs font-bold uppercase tracking-wide mb-1">Pending</p>
                    <p className="text-2xl font-black text-yellow-700">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                    <p className="text-blue-700 text-xs font-bold uppercase tracking-wide mb-1">On the Way</p>
                    <p className="text-2xl font-black text-blue-700">{stats.onTheWay}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                    <p className="text-green-700 text-xs font-bold uppercase tracking-wide mb-1">Delivered</p>
                    <p className="text-2xl font-black text-green-700">{stats.delivered}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                    <p className="text-red-700 text-xs font-bold uppercase tracking-wide mb-1">Cancelled</p>
                    <p className="text-2xl font-black text-red-700">{stats.cancelled}</p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-4 items-stretch md:items-center shadow-sm">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer name, or email..."
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <MdFilterList size={18} className="text-slate-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all text-sm font-semibold"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="On the way">On the way</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-400">Loading orders...</span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <MdShoppingCart size={64} className="mx-auto mb-4 opacity-20" />
                        <p>No orders found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Payment</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-slate-900">#{order.orderId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {order.userId?.firstName} {order.userId?.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{order.userId?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs text-slate-600">{formatDate(order.createdAt)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-slate-900">{order.products?.length || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <PaymentBadge status={order.paymentStatus} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={order.orderStatus} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/order/view/${order._id}`)}
                                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <MdVisibility size={18} className="text-slate-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => setOrderToUpdate(order)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Update Status"
                                                    >
                                                        <MdEdit size={18} className="text-blue-600" />
                                                    </button>
                                                </div>
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
                            totalItems={totalOrders}
                            itemsPerPage={10}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderList;
