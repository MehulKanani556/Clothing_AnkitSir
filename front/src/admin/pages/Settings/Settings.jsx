import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MdSettings, MdStore, MdEmail, MdPayment, MdLocalShipping,
    MdNotifications, MdSecurity, MdPalette, MdCode, MdSave,
    MdRefresh, MdCheckCircle, MdTune
} from 'react-icons/md';
import { fetchSettings, updateSettings } from '../../../redux/slice/settings.slice';
import toast from 'react-hot-toast';

const Settings = () => {
    const dispatch = useDispatch();
    const { settings, loading, updateLoading } = useSelector((state) => state.settings);
    const [activeTab, setActiveTab] = useState('general');

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        storeName: 'EO Studio',
        storeEmail: 'admin@eostudio.com',
        storePhone: '+1 234 567 8900',
        storeAddress: '123 Fashion Street, New York, NY 10001',
        currency: 'USD',
        timezone: 'America/New_York',
        language: 'en',
    });

    // Email Settings
    const [emailSettings, setEmailSettings] = useState({
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        fromEmail: 'noreply@eostudio.com',
        fromName: 'EO Studio',
    });

    // Payment Settings
    const [paymentSettings, setPaymentSettings] = useState({
        isStripeEnabled: true,
        stripePublicKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
        stripeSecretKey: '',
        isPaypalEnabled: false,
        paypalClientId: '',
    });

    // Shipping Settings
    const [shippingSettings, setShippingSettings] = useState({
        freeShippingThreshold: 100,
        flatRate: 25,
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        orderConfirmation: true,
        shippingUpdate: true,
        lowStockAlert: true,
        stockThreshold: 5,
    });

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings) {
            if (settings.general) setGeneralSettings(settings.general);
            if (settings.email) setEmailSettings(settings.email);
            if (settings.payment) setPaymentSettings(settings.payment);
            if (settings.shipping) setShippingSettings(settings.shipping);
            if (settings.notifications) setNotificationSettings(settings.notifications);
        }
    }, [settings]);

    const handleSave = async (section) => {
        let payload = {};
        if (section === 'General') payload = { general: generalSettings };
        if (section === 'Email') payload = { email: emailSettings };
        if (section === 'Payment') payload = { payment: paymentSettings };
        if (section === 'Shipping') payload = { shipping: shippingSettings };
        if (section === 'Notification') payload = { notifications: notificationSettings };

        dispatch(updateSettings(payload));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <MdStore size={20} /> },
        { id: 'email', label: 'Email', icon: <MdEmail size={20} /> },
        { id: 'payment', label: 'Payment', icon: <MdPayment size={20} /> },
        { id: 'shipping', label: 'Shipping', icon: <MdLocalShipping size={20} /> },
        { id: 'notifications', label: 'Notifications', icon: <MdNotifications size={20} /> },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-mainText tracking-tight">Store Settings</h2>
                    <p className="text-lightText text-sm font-medium">Change your store settings and preferences here.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2.5 bg-white text-mainText px-6 py-2.5 rounded-none font-bold hover:shadow-lg hover:shadow-black/5 transition-all border border-slate-200 active:scale-95 shadow-sm"
                >
                    <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
                    <span className="text-[14px]">Refresh List</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="bg-background rounded-none border border-border p-3 shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 rounded-none transition-all group ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                    : 'text-lightText hover:bg-mainBG hover:text-mainText'
                                    }`}
                            >
                                <span className={`${activeTab === tab.id ? 'text-white' : 'text-primary/60 group-hover:text-primary'} transition-colors`}>
                                    {tab.icon}
                                </span>
                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-primary/5 rounded-none border border-primary/10 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center text-primary">
                                <MdTune size={18} />
                            </div>
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Studio Core</h4>
                        </div>
                        <p className="text-[11px] text-primary/60 font-medium leading-relaxed">
                            These settings control the fundamental behavior of your administrative interface.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-background rounded-none border border-border shadow-sm overflow-hidden min-h-[600px]">
                        <div className="px-10 py-8 border-b border-border bg-mainBG/30 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-none bg-white border border-border flex items-center justify-center text-primary shadow-sm">
                                    {tabs.find(t => t.id === activeTab)?.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-mainText tracking-tight uppercase">
                                        {tabs.find(t => t.id === activeTab)?.label} Control
                                    </h3>
                                    <p className="text-[10px] text-lightText font-black uppercase tracking-widest">Global Configuration</p>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <span className="px-4 py-1.5 bg-green-500/10 text-green-600 rounded-none text-[10px] font-black uppercase tracking-widest border border-green-500/20 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-none bg-green-500 animate-pulse"></span>
                                    System Online
                                </span>
                            </div>
                        </div>

                        <div className="p-10">
                            {/* General Settings */}
                            {activeTab === 'general' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Studio Brand Name</label>
                                            <input
                                                type="text"
                                                value={generalSettings.storeName}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Primary Contact Email</label>
                                            <input
                                                type="email"
                                                value={generalSettings.storeEmail}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Support Hotline</label>
                                            <input
                                                type="tel"
                                                value={generalSettings.storePhone}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, storePhone: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Functional Currency</label>
                                            <select
                                                value={generalSettings.currency}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight appearance-none cursor-pointer"
                                            >
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="GBP">GBP - British Pound</option>
                                                <option value="AUD">AUD - Australian Dollar</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Physical Studio Location</label>
                                            <textarea
                                                value={generalSettings.storeAddress}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, storeAddress: e.target.value })}
                                                rows={3}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-10 border-t border-border">
                                        <button
                                            onClick={() => handleSave('General')}
                                            disabled={updateLoading}
                                            className="flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 active:scale-95"
                                        >
                                            {updateLoading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-none animate-spin" />
                                            ) : (
                                                <MdSave size={20} />
                                            )}
                                            Authorize General Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Email Settings */}
                            {activeTab === 'email' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">SMTP Host Gateway</label>
                                            <input
                                                type="text"
                                                value={emailSettings.smtpHost}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Gateway Port</label>
                                            <input
                                                type="text"
                                                value={emailSettings.smtpPort}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">System Username</label>
                                            <input
                                                type="text"
                                                value={emailSettings.smtpUser}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Encrypted Passphrase</label>
                                            <input
                                                type="password"
                                                value={emailSettings.smtpPass}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPass: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Originator Email</label>
                                            <input
                                                type="email"
                                                value={emailSettings.fromEmail}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Identity Display Name</label>
                                            <input
                                                type="text"
                                                value={emailSettings.fromName}
                                                onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-10 border-t border-border">
                                        <button
                                            onClick={() => handleSave('Email')}
                                            disabled={updateLoading}
                                            className="flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 active:scale-95"
                                        >
                                            {updateLoading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-none animate-spin" />
                                            ) : (
                                                <MdSave size={20} />
                                            )}
                                            Authorize Email Gateway
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Payment Settings */}
                            {activeTab === 'payment' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-mainBG/30 rounded-none border border-border">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-none flex items-center justify-center text-blue-600 shadow-sm border border-border">
                                                    <MdPayment size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-mainText uppercase tracking-widest">Stripe Gateway</p>
                                                    <p className="text-[10px] text-lightText font-medium mt-1">Accept high-security card transactions</p>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={paymentSettings.isStripeEnabled}
                                                    onChange={(e) => setPaymentSettings({ ...paymentSettings, isStripeEnabled: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-14 h-8 bg-border peer-focus:outline-none peer-focus:ring-8 peer-focus:ring-primary/5 rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-border after:border after:rounded-none after:h-6 after:w-6 after:transition-all peer-checked:bg-primary transition-all duration-300"></div>
                                            </div>
                                        </div>

                                        {paymentSettings.isStripeEnabled && (
                                            <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-top-4 duration-500">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Publishable Key (Public)</label>
                                                    <input
                                                        type="text"
                                                        value={paymentSettings.stripePublicKey}
                                                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripePublicKey: e.target.value })}
                                                        className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all font-mono text-[13px] font-medium bg-mainBG/10 text-mainText"
                                                        placeholder="pk_test_..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Secret API Key (Restricted)</label>
                                                    <input
                                                        type="password"
                                                        value={paymentSettings.stripeSecretKey}
                                                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })}
                                                        className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all font-mono text-[13px] font-medium bg-mainBG/10 text-mainText"
                                                        placeholder="sk_test_..."
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-10 border-t border-border">
                                        <button
                                            onClick={() => handleSave('Payment')}
                                            disabled={updateLoading}
                                            className="flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 active:scale-95"
                                        >
                                            {updateLoading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-none animate-spin" />
                                            ) : (
                                                <MdSave size={20} />
                                            )}
                                            Authorize Payment Gateway
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Shipping Settings */}
                            {activeTab === 'shipping' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Free Shipping Floor ($)</label>
                                            <input
                                                type="number"
                                                value={shippingSettings.freeShippingThreshold}
                                                onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-mainText uppercase tracking-widest ml-1 opacity-70">Global Flat Rate ($)</label>
                                            <input
                                                type="number"
                                                value={shippingSettings.flatRate}
                                                onChange={(e) => setShippingSettings({ ...shippingSettings, flatRate: e.target.value })}
                                                className="w-full px-6 py-4 border border-border rounded-none outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all bg-mainBG/10 text-sm font-black tracking-tight"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-10 border-t border-border">
                                        <button
                                            onClick={() => handleSave('Shipping')}
                                            disabled={updateLoading}
                                            className="flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 active:scale-95"
                                        >
                                            {updateLoading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-none animate-spin" />
                                            ) : (
                                                <MdSave size={20} />
                                            )}
                                            Authorize Logistics
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Notification Settings */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    <div className="space-y-4">
                                        {[
                                            { id: 'orderConfirmation', title: 'Order Confirmation', desc: 'Trigger automated receipts upon successful checkout.' },
                                            { id: 'shippingUpdate', title: 'Logistics Updates', desc: 'Notify stakeholders on shipment status changes.' },
                                            { id: 'lowStockAlert', title: 'Inventory Depletion', desc: 'Alert management when SKU levels reach critical threshold.' }
                                        ].map((item) => (
                                            <label key={item.id} className="flex items-center justify-between p-6 bg-mainBG/30 rounded-none border border-border cursor-pointer hover:border-primary/20 transition-all group">
                                                <div>
                                                    <p className="text-[11px] font-black text-mainText uppercase tracking-widest group-hover:text-primary transition-colors">{item.title}</p>
                                                    <p className="text-[10px] text-lightText font-medium mt-1">{item.desc}</p>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings[item.id]}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.id]: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-14 h-8 bg-border peer-focus:outline-none peer-focus:ring-8 peer-focus:ring-primary/5 rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-border after:border after:rounded-none after:h-6 after:w-6 after:transition-all peer-checked:bg-primary transition-all duration-300"></div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="pt-10 border-t border-border">
                                        <button
                                            onClick={() => handleSave('Notification')}
                                            disabled={updateLoading}
                                            className="flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-none font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 active:scale-95"
                                        >
                                            {updateLoading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-none animate-spin" />
                                            ) : (
                                                <MdSave size={20} />
                                            )}
                                            Authorize Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
