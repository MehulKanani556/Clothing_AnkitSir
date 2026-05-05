import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MdArrowBack, MdEmail, MdPhone, MdLocationOn, MdCalendarToday,
    MdVerifiedUser, MdCancel, MdShoppingBag, MdCreditCard,
    MdNotifications, MdBlock, MdCheckCircle, MdVisibility
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';

const CustomerView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchCustomerDetails();
        fetchCustomerOrders();
    }, [id]);

    const fetchCustomerDetails = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/user/admin/${id}`);
            setCustomer(response.data?.result);
        } catch (error) {
            console.error('Error fetching customer details:', error);
            toast.error('Failed to fetch customer details');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await axiosInstance.get(`/order/admin/user/${id}`);
            setOrders(response.data?.result || []);
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            toast.error('Failed to fetch customer orders');
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleStatusToggle = async () => {
        if (!customer) return;
        
        const confirmMessage = customer.isUserDeleted
            ? 'Are you sure you want to activate this customer account?'
            : 'Are you sure you want to deactivate this customer account?';

        if (!window.confirm(confirmMessage)) return;

        setUpdating(true);
        try {
            await axiosInstance.put(`/user/admin/status/${id}`, {
                isUserDeleted: !customer.isUserDeleted
            });
            toast.success(`Customer account ${customer.isUserDeleted ? 'activated' : 'deactivated'} successfully`);
            fetchCustomerDetails();
        } catch (error) {
            console.error('Error updating customer status:', error);
            toast.error('Failed to update customer status');
        } finally {
            setUpdating(false);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-none animate-spin" />
                <span className="text-slate-400">Loading customer details...</span>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">Customer not found</p>
                <button
                    onClick={() => navigate('/admin/customers')}
                    className="mt-4 px-6 py-2 bg-black text-white rounded-none hover:bg-slate-800 transition-all"
                >
                    Back to Customers
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/customers')}
                        className="p-2 hover:bg-slate-100 rounded-none transition-colors"
                    >
                        <MdArrowBack size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Customer Details</h2>
                        <p className="text-slate-500 text-sm">View and manage customer information</p>
                    </div>
                </div>
                <button
                    onClick={handleStatusToggle}
                    disabled={updating}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-none font-bold transition-all shadow-xl active:scale-95 ${
                        customer.isUserDeleted
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                    } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {updating ? (
                        <><AiOutlineLoading3Quarters size={20} className="animate-spin" /> Updating...</>
                    ) : customer.isUserDeleted ? (
                        <><MdCheckCircle size={20} /> Activate Account</>
                    ) : (
                        <><MdBlock size={20} /> Deactivate Account</>
                    )}
                </button>
            </div>

            {/* Customer Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white rounded-none border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-none bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mb-4">
                            {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Customer ID: {customer._id.slice(-8)}</p>
                        
                        {customer.isUserDeleted ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none text-sm font-bold bg-red-100 text-red-700">
                                <MdBlock size={16} />
                                Account Deleted
                            </span>
                        ) : customer.emailVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none text-sm font-bold bg-green-100 text-green-700">
                                <MdVerifiedUser size={16} />
                                Verified Account
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none text-sm font-bold bg-yellow-100 text-yellow-700">
                                <MdCancel size={16} />
                                Unverified Account
                            </span>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-none border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-none flex items-center justify-center flex-shrink-0">
                                <MdEmail className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Email</p>
                                <p className="text-sm text-slate-900 font-medium">{customer.email}</p>
                            </div>
                        </div>
                        
                        {customer.phone && (
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-none flex items-center justify-center flex-shrink-0">
                                    <MdPhone className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Phone</p>
                                    <p className="text-sm text-slate-900 font-medium">{customer.phone}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-none flex items-center justify-center flex-shrink-0">
                                <MdCalendarToday className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Joined</p>
                                <p className="text-sm text-slate-900 font-medium">{formatDate(customer.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-none border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-none">
                            <div className="flex items-center gap-3">
                                <MdLocationOn className="text-slate-400" size={20} />
                                <span className="text-sm text-slate-600">Addresses</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{customer.address?.length || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-none">
                            <div className="flex items-center gap-3">
                                <MdCreditCard className="text-slate-400" size={20} />
                                <span className="text-sm text-slate-600">Saved Cards</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{customer.savedCards?.length || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-none">
                            <div className="flex items-center gap-3">
                                <MdShoppingBag className="text-slate-400" size={20} />
                                <span className="text-sm text-slate-600">Recently Viewed</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{customer.recentlyViewed?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Addresses Section */}
            {customer.address && customer.address.length > 0 && (
                <div className="bg-white rounded-none border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Saved Addresses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customer.address.map((addr, index) => (
                            <div key={addr._id || index} className="p-4 border border-slate-200 rounded-none hover:border-slate-300 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        {addr.addressType || 'Address'}
                                    </span>
                                    {customer.selectedAddress?.toString() === addr._id?.toString() && (
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-none">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-semibold text-slate-900 mb-1">
                                    {addr.firstName} {addr.lastName}
                                </p>
                                <p className="text-xs text-slate-600 mb-1">{addr.address}</p>
                                {addr.aptSuite && <p className="text-xs text-slate-600 mb-1">{addr.aptSuite}</p>}
                                <p className="text-xs text-slate-600">
                                    {addr.city}, {addr.state} {addr.zipcode}
                                </p>
                                {addr.phone && (
                                    <p className="text-xs text-slate-600 mt-2">
                                        <MdPhone size={12} className="inline mr-1" />
                                        {addr.phone}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Orders Section */}
            <div className="bg-white rounded-none border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MdShoppingBag size={24} />
                    Order History ({orders.length})
                </h3>
                
                {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
                        <span className="text-slate-400 text-sm">Loading orders...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <MdShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No orders found for this customer</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div 
                                key={order._id} 
                                className="p-4 border border-slate-200 rounded-none hover:border-slate-300 transition-all hover:shadow-md cursor-pointer"
                                onClick={() => navigate(`/admin/order/view/${order._id}`)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Order #{order.orderId}</p>
                                        <p className="text-xs text-slate-500">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-bold ${
                                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.orderStatus === 'On the way' ? 'bg-blue-100 text-blue-700' :
                                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.orderStatus}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-bold ${
                                            order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                            order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-4 text-xs text-slate-600">
                                        <span>{order.products?.length || 0} item{order.products?.length !== 1 ? 's' : ''}</span>
                                        <span>•</span>
                                        <span className="font-semibold text-slate-900">${Number(order.totalAmount).toFixed(2)}</span>
                                    </div>
                                    <button 
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin/order/view/${order._id}`);
                                        }}
                                    >
                                        View Details
                                        <MdVisibility size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notification Preferences */}
            {customer.notificationPreferences && (
                <div className="bg-white rounded-none border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <MdNotifications size={24} />
                        Notification Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-none">
                            <span className="text-sm text-slate-600">Email Notifications</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-none ${
                                customer.notificationPreferences.email 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {customer.notificationPreferences.email ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-none">
                            <span className="text-sm text-slate-600">SMS Notifications</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-none ${
                                customer.notificationPreferences.sms 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {customer.notificationPreferences.sms ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-none">
                            <span className="text-sm text-slate-600">Push Notifications</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-none ${
                                customer.notificationPreferences.push 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {customer.notificationPreferences.push ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Deletion Info */}
            {customer.isUserDeleted && customer.deletedAt && (
                <div className="bg-red-50 border border-red-200 rounded-none p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Account Deletion Information</h3>
                    <p className="text-sm text-red-700">
                        This account was deleted on {formatDate(customer.deletedAt)}
                    </p>
                    {customer.reasonForDeletion && (
                        <p className="text-sm text-red-700 mt-2">
                            <span className="font-semibold">Reason:</span> {customer.reasonForDeletion}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerView;
