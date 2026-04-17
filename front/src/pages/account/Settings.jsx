import { useState, useEffect } from 'react';
import AccountLayout from './AccountLayout';
import { HiArrowUpRight } from 'react-icons/hi2';
import { HiChevronRight } from 'react-icons/hi2';
import { useSelector, useDispatch } from 'react-redux';
import { RiVisaLine, RiMastercardLine } from 'react-icons/ri';
import { SiAmericanexpress } from 'react-icons/si';
import { HiOutlineBell, HiOutlineCreditCard, HiOutlineQuestionMarkCircle, HiOutlineDevicePhoneMobile, HiOutlineGlobeAlt, HiOutlineShieldCheck } from 'react-icons/hi2';
import { fetchSavedCards } from '../../redux/slice/paymentCard.slice';
import { updateProfile, logout, fetchSessions, revokeSession, logoutAllDevices } from '../../redux/slice/auth.slice';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Settings() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, sessions = [], sessionsLoading } = useSelector((state) => state.auth);
    const { cards, selectedCardId } = useSelector((state) => state.payment);

    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        deliveryUpdates: true,
        paymentAlerts: true,
        accountActivity: false
    });

    useEffect(() => {
        if (user?.notificationPreferences) {
            setNotifications(user.notificationPreferences);
        }
    }, [user?.notificationPreferences]);

    useEffect(() => {
        dispatch(fetchSavedCards());
        dispatch(fetchSessions());
    }, [dispatch]);

    const toggleNotification = async (key) => {
        const oldValue = notifications[key];
        const newValue = !oldValue;
        setNotifications(prev => ({ ...prev, [key]: newValue }));
        try {
            const resultAction = await dispatch(updateProfile({
                notificationPreferences: { [key]: newValue }
            }));
            if (updateProfile.fulfilled.match(resultAction)) {
                toast.success(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated`);
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            setNotifications(prev => ({ ...prev, [key]: oldValue }));
            toast.error('Failed to update settings');
        }
    };

    const handleDeleteAccount = () => {
        toast.error("Account deletion is disabled for demo purposes");
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await dispatch(revokeSession(sessionId)).unwrap();
            toast.success('Device logged out successfully');
            dispatch(fetchSessions());
        } catch (error) {
            toast.error(error?.message || 'Failed to logout device');
        }
    };

    const defaultCard = cards.find(c => c._id === selectedCardId) || cards[0];

    const getCardBadge = (type) => {
        const t = type?.toLowerCase();
        if (t?.includes('visa')) return (
            <span className="inline-flex items-center gap-1 bg-[#1a1f71] text-white text-xs font-bold px-3 py-1 rounded">
                <RiVisaLine className="text-base" /> VISA
            </span>
        );
        if (t?.includes('master')) return (
            <span className="inline-flex items-center gap-1 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded">
                <RiMastercardLine className="text-base" /> Mastercard
            </span>
        );
        if (t?.includes('amex') || t?.includes('american')) return (
            <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded">
                <SiAmericanexpress className="text-base" /> Amex
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded">
                <HiOutlineCreditCard className="text-base" /> Card
            </span>
        );
    };

    // Toggle switch styled to match image (dark teal when on)
    const Toggle = ({ checked, onChange }) => (
        <button
            onClick={onChange}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#1a3c34]' : 'bg-gray-200'}`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );

    return (
        <AccountLayout>
            <div className="max-w-2xl pb-20">
                {/* Page title */}
                <h1 className="text-3xl font-bold text-dark mb-6">Settings</h1>

                <div className="space-y-4">

                    {/* NOTIFICATION */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-gray-100">
                            <HiOutlineBell className="text-dark text-lg" />
                            <span className="text-xs font-bold tracking-widest text-dark uppercase">Notification</span>
                        </div>
                        <div className="px-6 py-2 divide-y divide-gray-50">
                            {[
                                { id: 'orderUpdates', label: 'Order Updates', desc: 'Get updates when your order is confirmed and processed' },
                                { id: 'deliveryUpdates', label: 'Delivery Updates', desc: 'Track shipping status and delivery progress in real time' },
                                { id: 'paymentAlerts', label: 'Payment Alerts', desc: 'Get notified about successful and failed transactions' },
                                { id: 'accountActivity', label: 'Account Activity', desc: 'Stay informed about login activity and account changes' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-dark">{item.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <Toggle
                                        checked={notifications[item.id]}
                                        onChange={() => toggleNotification(item.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MANAGE PAYMENT */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <HiOutlineCreditCard className="text-dark text-lg" />
                                <span className="text-xs font-bold tracking-widest text-dark uppercase">Manage Payment</span>
                            </div>
                            <button
                                onClick={() => navigate('/payments')}
                                className="text-dark hover:text-primary transition-colors"
                            >
                                <HiArrowUpRight className="text-lg" />
                            </button>
                        </div>
                        <div className="px-6 py-5">
                            {defaultCard ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getCardBadge(defaultCard.cardType)}
                                        <span className="text-sm font-semibold text-dark tracking-widest">
                                            ···· {defaultCard.cardNumber.slice(-4)}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-dark">
                                        Expires {defaultCard.expiryDate}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">No payment method saved</p>
                                    <button
                                        onClick={() => navigate('/payments')}
                                        className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                                    >
                                        Add Card
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SUPPORT */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <HiOutlineQuestionMarkCircle className="text-dark text-lg" />
                                <span className="text-xs font-bold tracking-widest text-dark uppercase">Support</span>
                            </div>
                            <button
                                onClick={() => navigate('/support')}
                                className="text-dark hover:text-primary transition-colors"
                            >
                                <HiArrowUpRight className="text-lg" />
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            <button
                                onClick={() => navigate('/support')}
                                className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-sm font-medium text-dark">Contact Us</span>
                                <HiChevronRight className="text-gray-400 text-base" />
                            </button>
                            <button
                                onClick={() => navigate('/support')}
                                className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-sm font-medium text-dark">Help Center</span>
                                <HiChevronRight className="text-gray-400 text-base" />
                            </button>
                        </div>
                    </div>

                    {/* DEVICE & LOGIN INFO */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-gray-100">
                            <HiOutlineShieldCheck className="text-dark text-lg" />
                            <span className="text-xs font-bold tracking-widest text-dark uppercase">Device &amp; Login Info</span>
                        </div>
                        <div className="px-6 py-2">
                            {sessionsLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                                </div>
                            ) : sessions.length === 0 ? (
                                <p className="text-sm text-gray-400 py-6 text-center">No active sessions found</p>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {sessions.map((session) => (
                                        <div key={session._id} className="flex items-center justify-between py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${session.isCurrent ? 'text-dark' : 'text-gray-400'}`}>
                                                    {session.deviceType === 'Desktop'
                                                        ? <HiOutlineGlobeAlt className="text-xl" />
                                                        : <HiOutlineDevicePhoneMobile className="text-xl" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold capitalize ${session.isCurrent ? 'text-dark' : 'text-gray-400'}`}>
                                                        {session.os === 'Unknown' ? 'Web Browser' : session.os}
                                                        {session.isCurrent && (
                                                            <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">Current</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {session.isCurrent
                                                            ? 'Last used: Today'
                                                            : `Last used: ${formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {!session.isCurrent && (
                                                <button
                                                    onClick={() => handleRevokeSession(session._id)}
                                                    className="px-5 py-1.5 border border-red-400 text-red-500 text-xs font-semibold rounded hover:bg-red-50 transition-colors"
                                                >
                                                    Log Out
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delete Account — centered at bottom */}
                        <div className="flex justify-center px-6 py-5 border-t border-gray-100">
                            <button
                                onClick={handleDeleteAccount}
                                className="text-sm font-medium text-red-500 hover:underline underline-offset-4"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </AccountLayout>
    );
}
