import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdShoppingCart, MdPeople, MdInventory, MdAttachMoney,
    MdTrendingUp, MdLocalShipping, MdCheckCircle, MdCancel,
    MdPending, MdRefresh, MdArrowForward, MdLocalOffer,
    MdBarChart, MdStar, MdArrowUpward, MdArrowDownward
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import axiosInstance from '../../../utils/axiosInstance';

// ── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, color, bg, border, trend }) => (
    <div className={`${bg} p-6 rounded-none border ${border} flex items-center justify-between shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 group hover:-translate-y-1 overflow-hidden relative`}>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon size={120} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-none ${color.replace('text-', 'bg-')}`}></span>
                <p className="text-lightText text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
            </div>
            <p className={`text-3xl font-black text-mainText tracking-tight`}>{value}</p>
            <div className="flex items-center gap-2 mt-2">
                {trend && (
                    <span className={`flex items-center text-[10px] font-black ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend > 0 ? <MdArrowUpward /> : <MdArrowDownward />}
                        {Math.abs(trend)}%
                    </span>
                )}
                <p className="text-[10px] text-lightText font-bold">{subtitle}</p>
            </div>
        </div>
        <div className={`w-14 h-14 rounded-none flex items-center justify-center ${color} bg-white shadow-lg shadow-black/5 relative z-10 group-hover:scale-110 transition-transform`}>
            <Icon size={26} />
        </div>
    </div>
);

// ── Order Status Badge ────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
        'On the way': 'bg-blue-50 text-blue-600 border-blue-100',
        'Delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Cancelled': 'bg-red-50 text-red-600 border-red-100',
    };
    return (
        <span className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border ${map[status] || 'bg-mainBG text-lightText border-border'}`}>
            {status}
        </span>
    );
};

// ── Payment Badge ─────────────────────────────────────────────────
const PaymentBadge = ({ status }) => {
    const map = {
        'Paid': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
        'Failed': 'bg-red-50 text-red-600 border-red-100',
        'Refunded': 'bg-mainBG text-lightText border-border',
    };
    return (
        <span className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border ${map[status] || 'bg-mainBG text-lightText border-border'}`}>
            {status}
        </span>
    );
};

// ── Mini Bar Chart ────────────────────────────────────────────────
const MiniBar = ({ label, value, max, color }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-lightText uppercase tracking-wider">{label}</span>
                <span className="text-xs font-black text-mainText">{value}</span>
            </div>
            <div className="h-2 bg-mainBG rounded-none overflow-hidden border border-border/50 p-[1px]">
                <div className={`h-full rounded-none ${color} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

// ── Main Dashboard ────────────────────────────────────────────────
const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        onTheWayOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        paidPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const fetchDashboardData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [ordersRes, customersRes, productsRes] = await Promise.all([
                axiosInstance.get('/order/admin/all?page=1&limit=5'),
                axiosInstance.get('/user/admin/all?page=1&limit=1'),
                axiosInstance.get('/product/get-all?page=1&limit=5'),
            ]);

            const recentOrdersData = ordersRes.data?.result?.orders || [];
            setRecentOrders(recentOrdersData);

            const allOrdersRes = await axiosInstance.get('/order/admin/all?page=1&limit=10000');
            const allOrders = allOrdersRes.data?.result?.orders || [];

            const totalRevenue = allOrders
                .filter(o => o.paymentStatus === 'Paid')
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            setStats({
                totalOrders: allOrdersRes.data?.result?.totalOrders || 0,
                totalRevenue,
                totalCustomers: customersRes.data?.result?.totalUsers || 0,
                totalProducts: productsRes.data?.result?.pagination?.total || 0,
                pendingOrders: allOrders.filter(o => o.orderStatus === 'Pending').length,
                onTheWayOrders: allOrders.filter(o => o.orderStatus === 'On the way').length,
                deliveredOrders: allOrders.filter(o => o.orderStatus === 'Delivered').length,
                cancelledOrders: allOrders.filter(o => o.orderStatus === 'Cancelled').length,
                paidPayments: allOrders.filter(o => o.paymentStatus === 'Paid').length,
                pendingPayments: allOrders.filter(o => o.paymentStatus === 'Pending').length,
                failedPayments: allOrders.filter(o => o.paymentStatus === 'Failed').length,
            });

            const productsAllRes = await axiosInstance.get('/product/get-all?page=1&limit=100');
            const allProducts = productsAllRes.data?.result?.products || [];
            const sorted = [...allProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
            setTopProducts(sorted);

        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-[6px] border-mainBG rounded-none" />
                    <div className="w-20 h-20 border-[6px] border-primary border-t-transparent rounded-none animate-spin absolute top-0 left-0" />
                    <MdTrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-mainText tracking-tight">Syncing Store Data</h3>
                    <p className="text-lightText text-sm mt-1">Please wait while we prepare your dashboard...</p>
                </div>
            </div>
        );
    }

    const maxOrderStatus = Math.max(stats.pendingOrders, stats.onTheWayOrders, stats.deliveredOrders, stats.cancelledOrders, 1);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-mainText tracking-tight">Dashboard</h2>
                    <p className="text-lightText text-sm font-medium">Overview of your store's performance and activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm disabled:opacity-60"
                    >
                        {refreshing
                            ? <AiOutlineLoading3Quarters size={18} className="animate-spin" />
                            : <MdRefresh size={20} />
                        }
                        <span className="text-[14px]">Refresh List</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-none font-black uppercase tracking-widest text-[11px] hover:bg-secondary transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <MdShoppingCart size={20} />
                        <span>Manage Orders</span>
                    </button>
                </div>
            </div>

            {/* Primary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Sales"
                    value={`$${fmt(stats.totalRevenue)}`}
                    subtitle="Total money earned"
                    icon={MdAttachMoney}
                    color="text-primary"
                    bg="bg-background"
                    border="border-border"
                    trend={12.5}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    subtitle={`${stats.pendingOrders} orders pending`}
                    icon={MdShoppingCart}
                    color="text-amber-600"
                    bg="bg-background"
                    border="border-border"
                    trend={5.2}
                />
                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    subtitle="Total registered users"
                    icon={MdPeople}
                    color="text-blue-600"
                    bg="bg-background"
                    border="border-border"
                    trend={8.1}
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    subtitle="Items in your shop"
                    icon={MdInventory}
                    color="text-emerald-600"
                    bg="bg-background"
                    border="border-border"
                />
            </div>

            {/* Middle Row: Order Status + Payment Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Status Breakdown */}
                <div className="lg:col-span-2 bg-background rounded-none border border-border p-8 shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-none -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-primary/10" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-mainText tracking-tight">Order Distribution</h3>
                            <p className="text-xs text-lightText font-bold uppercase tracking-wider mt-1">Current logistics pipeline</p>
                        </div>
                        <div className="w-12 h-12 bg-mainBG rounded-none flex items-center justify-center border border-border shadow-sm">
                            <MdBarChart size={24} className="text-primary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-5">
                            <MiniBar label="Pending" value={stats.pendingOrders} max={maxOrderStatus} color="bg-amber-400" />
                            <MiniBar label="On the way" value={stats.onTheWayOrders} max={maxOrderStatus} color="bg-blue-400" />
                            <MiniBar label="Delivered" value={stats.deliveredOrders} max={maxOrderStatus} color="bg-emerald-400" />
                            <MiniBar label="Cancelled" value={stats.cancelledOrders} max={maxOrderStatus} color="bg-red-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Pending', val: stats.pendingOrders, cls: 'bg-amber-50 text-amber-600 border-amber-100', icon: MdPending },
                                { label: 'Active', val: stats.onTheWayOrders, cls: 'bg-blue-50 text-blue-600 border-blue-100', icon: MdLocalShipping },
                                { label: 'Fulfilled', val: stats.deliveredOrders, cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: MdCheckCircle },
                                { label: 'Failed', val: stats.cancelledOrders, cls: 'bg-red-50 text-red-600 border-red-100', icon: MdCancel },
                            ].map(({ label, val, cls, icon: Icon }) => (
                                <div key={label} className={`${cls} rounded-none p-5 border flex flex-col items-center justify-center text-center transition-all hover:scale-105`}>
                                    <Icon size={24} className="mb-2 opacity-50" />
                                    <p className="text-2xl font-black tracking-tight">{val}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Status */}
                <div className="bg-background rounded-none border border-border p-8 shadow-xl shadow-black/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-none -mr-16 -mt-16 blur-3xl" />
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-mainText tracking-tight">Revenue Stream</h3>
                            <p className="text-xs text-lightText font-bold uppercase tracking-wider mt-1">Financial reconciliation</p>
                        </div>
                        <div className="w-12 h-12 bg-mainBG rounded-none flex items-center justify-center border border-border shadow-sm">
                            <MdAttachMoney size={24} className="text-emerald-600" />
                        </div>
                    </div>
                    <div className="space-y-4 mb-8">
                        {[
                            { label: 'Paid', value: stats.paidPayments, icon: MdCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { label: 'Pending', value: stats.pendingPayments, icon: MdPending, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                            { label: 'Failed', value: stats.failedPayments, icon: MdCancel, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                        ].map(({ label, value, icon: Icon, color, bg, border }) => (
                            <div key={label} className={`flex items-center justify-between p-4 ${bg} border ${border} rounded-none hover:scale-[1.02] transition-transform`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-none ${bg} flex items-center justify-center`}>
                                        <Icon size={18} className={color} />
                                    </div>
                                    <span className={`font-black uppercase tracking-widest text-[10px] ${color}`}>{label}</span>
                                </div>
                                <span className={`text-xl font-black ${color}`}>{value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-6 border-t border-border flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-lightText uppercase tracking-widest">Available Balance</span>
                            <span className="text-2xl font-black text-mainText tracking-tight">${fmt(stats.totalRevenue)}</span>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-none flex items-center justify-center text-emerald-600">
                            <MdTrendingUp size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Orders + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-background rounded-none border border-border overflow-hidden shadow-xl shadow-black/5 flex flex-col">
                    <div className="p-8 border-b border-border flex items-center justify-between bg-mainBG/30">
                        <div>
                            <h3 className="text-xl font-black text-mainText tracking-tight">Recent Transactions</h3>
                            <p className="text-xs text-lightText font-bold uppercase tracking-wider mt-1">Live order feed</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="w-10 h-10 bg-white rounded-none border border-border flex items-center justify-center text-lightText hover:text-primary hover:border-primary transition-all shadow-sm"
                        >
                            <MdArrowForward size={20} />
                        </button>
                    </div>
                    <div className="flex-1">
                        {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-lightText opacity-30">
                                <MdShoppingCart size={64} />
                                <p className="font-black uppercase tracking-[0.2em] text-[10px] mt-4">Queue Empty</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="px-8 py-5 flex items-center justify-between hover:bg-mainBG/50 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/admin/order/view/${order._id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center flex-shrink-0 border border-border shadow-sm group-hover:border-primary group-hover:scale-105 transition-all">
                                                <MdShoppingCart size={20} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-black text-mainText group-hover:text-primary transition-colors">#{order.orderId}</p>
                                                <p className="text-[11px] text-lightText font-bold mt-0.5">
                                                    {order.userId?.firstName} {order.userId?.lastName} · {fmtDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-lg font-black text-mainText tracking-tight">${fmt(order.totalAmount)}</p>
                                                <div className="mt-1"><PaymentBadge status={order.paymentStatus} /></div>
                                            </div>
                                            <StatusBadge status={order.orderStatus} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-background rounded-none border border-border overflow-hidden shadow-xl shadow-black/5 flex flex-col">
                    <div className="p-8 border-b border-border flex items-center justify-between bg-mainBG/30">
                        <div>
                            <h3 className="text-xl font-black text-mainText tracking-tight">Best Sellers</h3>
                            <p className="text-xs text-lightText font-bold uppercase tracking-wider mt-1">High performing products</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/product')}
                            className="w-10 h-10 bg-white rounded-none border border-border flex items-center justify-center text-lightText hover:text-primary hover:border-primary transition-all shadow-sm"
                        >
                            <MdArrowForward size={20} />
                        </button>
                    </div>
                    <div className="flex-1">
                        {topProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-lightText opacity-30">
                                <MdInventory size={64} />
                                <p className="font-black uppercase tracking-[0.2em] text-[10px] mt-4">No Sales Data</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {topProducts.map((product, idx) => {
                                    const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
                                    const image = defaultVariant?.images?.[0];
                                    return (
                                        <div
                                            key={product._id}
                                            className="px-8 py-5 flex items-center gap-4 hover:bg-mainBG/50 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/admin/product/view/${product._id}`)}
                                        >
                                            <span className="text-xs font-black text-lightText/30 w-5">0{idx + 1}</span>
                                            <div className="w-14 h-14 rounded-none bg-white overflow-hidden flex-shrink-0 border border-border group-hover:border-primary transition-all relative">
                                                {image ? (
                                                    <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <MdInventory size={20} className="text-lightText/40" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-mainText truncate group-hover:text-primary transition-colors tracking-tight">{product.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <MdStar size={14} className="text-amber-400" />
                                                        <span className="text-xs font-bold text-lightText">{product.ratings || 4.5}</span>
                                                    </div>
                                                    <div className="w-1 h-1 bg-border rounded-none" />
                                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{product.sold || 0} units sold</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-mainText tracking-tight">${fmt(product.variants?.[0]?.price || 0)}</p>
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">In Stock</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background rounded-none border border-border p-8 shadow-xl shadow-black/5">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-6 bg-primary rounded-none" />
                    <h3 className="text-xl font-black text-mainText tracking-tight">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Add Product', icon: MdInventory, path: '/admin/product/create', color: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' },
                        { label: 'Order Feed', icon: MdShoppingCart, path: '/admin/orders', color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' },
                        { label: 'Coupons', icon: MdLocalOffer, path: '/admin/coupons', color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100' },
                        { label: 'Customer List', icon: MdPeople, path: '/admin/customers', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' },
                    ].map(({ label, icon: Icon, path, color }) => (
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-none border transition-all active:scale-95 group relative overflow-hidden ${color}`}
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icon size={64} />
                            </div>
                            <Icon size={28} className="relative z-10 group-hover:scale-110 transition-transform" />
                            <span className="font-black uppercase tracking-widest text-[11px] relative z-10">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
