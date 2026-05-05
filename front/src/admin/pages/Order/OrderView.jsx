import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MdArrowBack, MdLocalShipping, MdCheckCircle, MdCancel, MdPending,
    MdPerson, MdEmail, MdPhone, MdLocationOn, MdPayment, MdShoppingCart,
    MdEdit, MdPrint
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';

// ── Status Badge ──────────────────────────────────────────────────
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
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-sm font-bold ${config.bg} ${config.text}`}>
            <Icon size={16} />
            {status}
        </span>
    );
};

// ── Payment Badge ─────────────────────────────────────────────────
const PaymentBadge = ({ status }) => {
    const config = {
        'Paid': { bg: 'bg-green-100', text: 'text-green-700' },
        'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
        'Failed': { bg: 'bg-red-100', text: 'text-red-700' },
    };

    const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-none text-sm font-bold ${bg} ${text}`}>
            {status}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────────
const OrderView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            // Fetch from the orders list and find the specific order
            const response = await axiosInstance.get(`/order/admin/all?page=1&limit=10000`);
            const allOrders = response.data?.result?.orders || [];
            const foundOrder = allOrders.find(o => o._id === id);
            
            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                toast.error('Order not found');
                navigate('/admin/orders');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to fetch order details');
            navigate('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `$${Number(amount).toFixed(2)}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-none animate-spin" />
                <span className="text-slate-400">Loading order details...</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">Order not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-none transition-colors"
                    >
                        <MdArrowBack size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Order #{order.orderId}</h2>
                        <p className="text-slate-500 text-sm">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-3 border border-border text-mainText rounded-none font-black uppercase text-xs tracking-widest hover:bg-mainBG transition-all shadow-sm active:scale-95"
                    >
                        <MdPrint size={20} />
                        Print Order
                    </button>
                    <button
                        onClick={() => navigate(`/admin/orders`)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-none font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <MdEdit size={20} />
                        Update Status
                    </button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">Order Status</p>
                    <StatusBadge status={order.orderStatus} />
                </div>
                <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">Payment Status</p>
                    <PaymentBadge status={order.paymentStatus} />
                </div>
                <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">Total Amount</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Products */}
                    <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <MdShoppingCart size={20} className="text-slate-600" />
                                <h3 className="font-bold text-slate-900">Order Items</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {order.products?.map((item, index) => {
                                const product = item.productId;
                                const variant = item.variantId;
                                return (
                                    <div key={index} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
                                        <div className="w-20 h-20 bg-slate-100 rounded-none overflow-hidden flex-shrink-0">
                                            {variant?.images?.[0] ? (
                                                <img
                                                    src={variant.images[0]}
                                                    alt={product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <MdShoppingCart size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{product?.name || item.name}</h4>
                                            <div className="flex gap-4 mt-1 text-sm text-slate-500">
                                                {variant?.color && <span>Color: {variant.color}</span>}
                                                {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                                {item.sku && <span>SKU: {item.sku}</span>}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-slate-600">Qty: {item.quantity}</span>
                                                <span className="font-bold text-slate-900">{formatCurrency(item.subtotal)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Timeline */}
                    {order.timeline && order.timeline.length > 0 && (
                        <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <h3 className="font-bold text-slate-900">Order Timeline</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.timeline.map((event, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 bg-black rounded-none" />
                                                {index < order.timeline.length - 1 && (
                                                    <div className="w-0.5 h-full bg-slate-200 my-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <StatusBadge status={event.status} />
                                                    <span className="text-xs text-slate-400">
                                                        {formatDate(event.timestamp || order.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">{event.message}</p>
                                                <p className="text-xs text-slate-400 mt-1">By: {event.updatedBy}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Customer & Payment Info */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <MdPerson size={20} className="text-slate-600" />
                                <h3 className="font-bold text-slate-900">Customer</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <MdPerson size={20} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Name</p>
                                    <p className="font-semibold text-slate-900">
                                        {order.userId?.firstName} {order.userId?.lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MdEmail size={20} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                                    <p className="font-semibold text-slate-900">{order.userId?.email}</p>
                                </div>
                            </div>
                            {order.userId?.mobileNo && (
                                <div className="flex items-start gap-3">
                                    <MdPhone size={20} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Phone</p>
                                        <p className="font-semibold text-slate-900">{order.userId.mobileNo}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <MdLocationOn size={20} className="text-slate-600" />
                                    <h3 className="font-bold text-slate-900">Shipping Address</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="font-semibold text-slate-900">
                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                </p>
                                <p className="text-sm text-slate-600 mt-2">
                                    {order.shippingAddress.address}
                                    {order.shippingAddress.aptSuite && `, ${order.shippingAddress.aptSuite}`}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipcode}
                                </p>
                                {order.shippingAddress.country && (
                                    <p className="text-sm text-slate-600">{order.shippingAddress.country}</p>
                                )}
                                {order.shippingAddress.phone && (
                                    <p className="text-sm text-slate-600 mt-2">
                                        <span className="font-semibold">Phone:</span> {order.shippingAddress.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <MdPayment size={20} className="text-slate-600" />
                                <h3 className="font-bold text-slate-900">Payment</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Payment Method</span>
                                <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(order.billingAmount)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Discount</span>
                                    <span className="font-semibold text-green-600">-{formatCurrency(order.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Shipping</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(order.shippingCost)}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-900">Total</span>
                                    <span className="font-black text-xl text-slate-900">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coupon Info */}
                    {order.appliedCoupon?.code && (
                        <div className="bg-green-50 rounded-none border border-green-200 p-6">
                            <p className="text-xs text-green-700 uppercase tracking-wide font-bold mb-1">Coupon Applied</p>
                            <p className="font-bold text-green-900">{order.appliedCoupon.code}</p>
                            <p className="text-sm text-green-700 mt-1">
                                Saved {formatCurrency(order.discountAmount)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderView;
