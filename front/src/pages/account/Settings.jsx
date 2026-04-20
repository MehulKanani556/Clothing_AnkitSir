import { useState, useEffect, Fragment } from 'react';
import AccountLayout from './AccountLayout';
import { HiArrowUpRight } from 'react-icons/hi2';
import { HiChevronRight } from 'react-icons/hi2';
import { useSelector, useDispatch } from 'react-redux';
import { RiVisaLine, RiMastercardLine } from 'react-icons/ri';
import { SiAmericanexpress } from 'react-icons/si';
import { HiOutlineBell, HiOutlineCreditCard, HiOutlineQuestionMarkCircle, HiOutlineDevicePhoneMobile, HiOutlineGlobeAlt, HiOutlineShieldCheck, HiXMark } from 'react-icons/hi2';
import { fetchSavedCards } from '../../redux/slice/paymentCard.slice';
import { updateProfile, logoutUser, fetchSessions, revokeSession, logoutAllDevices } from '../../redux/slice/auth.slice';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    requestAccountDeletion,
    verifyDeletionOtp,
    finalizeAccountDeletion
} from '../../redux/slice/auth.slice';

export default function Settings() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        user,
        sessions = [],
        sessionsLoading,
        deleteRequestLoading,
        deleteVerifyLoading,
        deleteFinalizeLoading
    } = useSelector((state) => state.auth);
    const { cards, selectedCardId } = useSelector((state) => state.payment);

    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        deliveryUpdates: true,
        paymentAlerts: true,
        accountActivity: false
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showFinalDeleteModal, setShowFinalDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        setShowDeleteModal(true);
    };

    const confirmDeleteAccount = async (reason) => {
        try {
            await dispatch(requestAccountDeletion({ reason })).unwrap();
            setShowDeleteModal(false);
            setShowOtpModal(true);
        } catch (error) {
            // Error handled by slice toast
        }
    };

    const handleVerifyOtp = async (otp) => {
        try {
            await dispatch(verifyDeletionOtp({ otp })).unwrap();
            setShowOtpModal(false);
            setShowFinalDeleteModal(true);
        } catch (error) {
            // Error handled by slice toast
        }
    };

    const handleFinalDelete = async () => {
        try {
            await dispatch(finalizeAccountDeletion()).unwrap();
            setShowFinalDeleteModal(false);
            setShowSuccessModal(true);
        } catch (error) {
            // Error handled by slice toast
        }
    };

    const handleSuccessfulLogout = () => {
        setShowSuccessModal(false);
        dispatch(logoutUser());
        navigate('/');
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
            <span className="inline-flex items-center gap-1 bg-border/50 text-dark text-xs font-bold px-3 py-1 rounded">
                <HiOutlineCreditCard className="text-base" /> Card
            </span>
        );
    };

    // Toggle switch styled to match image (dark teal when on)
    const Toggle = ({ checked, onChange }) => (
        <button
            onClick={onChange}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-primary' : 'bg-border'}`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );

    return (
        <AccountLayout>
            <div className="max-w-2xl">
                {/* Page title */}
                <div className="flex justify-between items-center md:mb-8 mb-4">
                    <h1 className="text-2xl md:text-[28px] font-semibold text-primary">Settings</h1>
                </div>

                <div className="space-y-4">
                    {/* NOTIFICATION */}
                    <div className="bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 mx-6 pt-5 pb-4 border-b border-border">
                            <HiOutlineBell className="text-mainText text-lg" />
                            <span className="text-sm md:text-base font-semibold tracking-widest text-mainText uppercase">Notification</span>
                        </div>
                        <div className="px-6 py-2">
                            {[
                                { id: 'orderUpdates', label: 'Order Updates', desc: 'Get updates when your order is confirmed and processed' },
                                { id: 'deliveryUpdates', label: 'Delivery Updates', desc: 'Track shipping status and delivery progress in real time' },
                                { id: 'paymentAlerts', label: 'Payment Alerts', desc: 'Get notified about successful and failed transactions' },
                                { id: 'accountActivity', label: 'Account Activity', desc: 'Stay informed about login activity and account changes' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-4 gap-2 md:gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm md:text-base font-medium text-dark">{item.label}</p>
                                        <p className="text-[12px] md:text-sm font-medium text-lightText mt-0.5">{item.desc}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Toggle
                                            checked={notifications[item.id]}
                                            onChange={() => toggleNotification(item.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MANAGE PAYMENT */}
                    <div className="bg-white overflow-hidden">
                        <div className="flex items-center justify-between mx-6 pt-5 pb-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <HiOutlineCreditCard className="text-dark text-lg" />
                                <span className="text-sm md:text-base font-semibold tracking-wide text-mainText uppercase">Manage Payment</span>
                            </div>
                            <button
                                onClick={() => navigate('/payments')}
                                className="text-mainText hover:text-mainText transition-colors"
                            >
                                <HiArrowUpRight className="text-lg" />
                            </button>
                        </div>
                        <div className="px-6 py-5">
                            {defaultCard ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {getCardBadge(defaultCard.cardType)}
                                        <span className="text-sm md:text-base font-semibold text-dark tracking-widest leading-none">
                                            ···· {defaultCard.cardNumber.slice(-4)}
                                        </span>
                                    </div>
                                    <span className="text-sm md:text-base font-semibold text-dark leading-none">
                                        Expires {defaultCard.expiryDate}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-lightText">No payment method saved</p>
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
                    <div className="bg-white overflow-hidden">
                        <div className="flex items-center justify-between mx-6 pt-5 pb-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <HiOutlineQuestionMarkCircle className="text-dark text-lg" />
                                <span className="text-sm md:text-base font-bold tracking-widest text-mainText uppercase">Support</span>
                            </div>
                            <button
                                onClick={() => navigate('/support')}
                                className="text-dark hover:text-primary transition-colors"
                            >
                                <HiArrowUpRight className="text-lg" />
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={() => navigate('/support')}
                                className="flex items-center justify-between w-full px-6 py-4 hover:bg-mainBG transition-colors"
                            >
                                <span className="text-base font-medium text-dark">Contact Us</span>
                                <HiChevronRight className="text-lightText text-base" />
                            </button>
                            <button
                                onClick={() => navigate('/support')}
                                className="flex items-center justify-between w-full px-6 py-4 hover:bg-mainBG transition-colors"
                            >
                                <span className="text-base font-medium text-dark">Help Center</span>
                                <HiChevronRight className="text-lightText text-base" />
                            </button>
                        </div>
                    </div>

                    {/* DEVICE & LOGIN INFO */}
                    <div className="bg-white overflow-hidden">
                        <div className="flex items-center gap-2 mx-6 pt-5 pb-4 border-b border-border">
                            <HiOutlineShieldCheck className="text-dark text-lg" />
                            <span className="text-sm md:text-base font-bold tracking-widest text-mainText uppercase">Device &amp; Login Info</span>
                        </div>
                        <div className="px-6 py-2">
                            {sessionsLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                                </div>
                            ) : sessions.length === 0 ? (
                                <p className="text-sm text-lightText py-6 text-center">No active sessions found</p>
                            ) : (
                                <div className="">
                                    {sessions.map((session) => (
                                        <div key={session._id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4 border-b border-border/50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 relative flex items-center justify-center shrink-0 ${session.isCurrent ? 'text-primary' : 'text-lightText'}`}>
                                                    {session.deviceType === 'Desktop'
                                                        ? <HiOutlineGlobeAlt className="text-xl" />
                                                        : <HiOutlineDevicePhoneMobile className="text-xl" />
                                                    }
                                                    {session.isCurrent && (
                                                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 absolute top-2 right-3 border-2 border-white"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm md:text-base font-semibold capitalize ${session.isCurrent ? 'text-dark' : 'text-lightText'}`}>
                                                        {session.os === 'Unknown' ? 'Web Browser' : session.os}
                                                    </p>
                                                    <p className="text-[12px] md:text-sm text-lightText mt-0.5">
                                                        {session.isCurrent
                                                            ? 'Last used: Today'
                                                            : `Last used: ${formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRevokeSession(session._id)}
                                                className="w-full sm:w-auto px-5 py-2 border border-[#EC221F] text-[#EC221F] text-xs md:text-sm font-semibold hover:bg-[#EC221F] hover:text-white transition-all duration-200"
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delete Account — centered at bottom */}
                        <div className="flex justify-center px-6 py-5">
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

            <DeleteAccountModal
                isOpen={showDeleteModal}
                isLoading={deleteRequestLoading}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteAccount}
            />

            <VerificationModal
                isOpen={showOtpModal}
                isLoading={deleteVerifyLoading}
                onClose={() => setShowOtpModal(false)}
                onVerify={handleVerifyOtp}
                phoneNumber={user?.phoneNumber || "****6232"}
            />

            <ConfirmDeletionModal
                isOpen={showFinalDeleteModal}
                isLoading={deleteFinalizeLoading}
                onClose={() => setShowFinalDeleteModal(false)}
                onConfirm={handleFinalDelete}
            />

            <DeletionSuccessModal
                isOpen={showSuccessModal}
                onLogout={handleSuccessfulLogout}
            />
        </AccountLayout>
    );
}

// Success Modal with Auto-Logout
const DeletionSuccessModal = ({ isOpen, onLogout }) => {
    const [seconds, setSeconds] = useState(5);

    useEffect(() => {
        let interval;
        if (isOpen) {
            setSeconds(5);
            interval = setInterval(() => {
                setSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        onLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOpen, onLogout]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 md:p-0">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300" />
            <div className="relative bg-white w-full max-w-[440px] px-6 py-10 md:px-12 md:py-14 shadow-2xl animate-in zoom-in-95 duration-300 text-center rounded-sm">
                <div className="flex flex-col items-center">
                    <div className="mb-6 md:mb-8 relative">
                        <img
                            src={require("../../assets/images/deleteaccount.webp")}
                            alt="deleteaccount"
                            className="w-24 h-24 md:w-32 md:h-32 object-contain"
                        />
                    </div>
                    <h2 className="text-[20px] md:text-[24px] font-bold text-primary mb-3 leading-tight tracking-tight px-2">Account deletion request submitted.</h2>
                    <p className="text-sm md:text-base font-medium text-lightText mb-10 md:mb-12 tracking-wide">
                        You will be logged out in <span className="font-bold text-dark">{seconds}</span> seconds.
                    </p>
                    <div className="h-10 w-10 border-[3px] border-gray-100 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        </div>
    );
};

// Final Confirmation Modal
const ConfirmDeletionModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        if (!isOpen) setAgreed(false);
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative bg-white w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-300 rounded-sm">

                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Confirm Permanent Deletion</h2>
                    <button
                        onClick={onClose}
                        className="text-lightText hover:text-dark transition-colors"
                    >
                        <HiXMark className="text-2xl" />
                    </button>
                </div>
                <div className="text-[13px] sm:text-sm md:text-base font-medium text-lightText/60 space-y-4 mb-6 sm:mb-8 leading-relaxed">
                    <p>Everything you&apos;ve built with us—your Order History, Saved Addresses, and Rewards—will be gone forever. This cannot be recovered.</p>
                </div>

                <label className="flex items-start gap-3 sm:gap-4 cursor-pointer group mb-8 md:mb-10">
                    <div className="relative flex items-center justify-center h-5 w-5 mt-0.5 shrink-0">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="peer h-5 w-5 cursor-pointer appearance-none border-2 border-gray-200 checked:bg-dark checked:border-dark transition-all rounded-sm"
                        />
                        <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="text-[13px] sm:text-sm font-semibold text-lightText leading-tight group-hover:text-dark transition-colors">
                        I understand that this action is permanent and irreversible.
                    </span>
                </label>

                <div className="space-y-4 sm:space-y-5">
                    <button
                        onClick={onConfirm}
                        disabled={!agreed || isLoading}
                        className="w-full py-4 sm:py-5 bg-[#EC221F] text-white text-[13px] sm:text-sm font-bold tracking-[0.15em] hover:bg-red-700 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : 'Delete Account'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full py-2 text-[13px] sm:text-sm font-bold tracking-[0.15em] text-dark hover:opacity-70 transition-all uppercase disabled:opacity-30"
                    >
                        Keep My Account
                    </button>
                </div>
            </div>
        </div>
    );
};

// Verification Modal Component
const VerificationModal = ({ isOpen, onClose, onVerify, phoneNumber, isLoading }) => {
    const [timer, setTimer] = useState(29);

    const formik = useFormik({
        initialValues: { otp: ['', '', '', ''] },
        validationSchema: Yup.object({
            otp: Yup.array().of(Yup.string().required()).length(4)
        }),
        onSubmit: (values) => {
            onVerify(values.otp.join(''));
        },
    });

    useEffect(() => {
        let interval;
        if (isOpen && timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isOpen, timer]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...formik.values.otp];
        newOtp[index] = value.slice(-1);
        formik.setFieldValue('otp', newOtp);

        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formik.values.otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 4);
        if (!/^\d+$/.test(pasteData)) return;

        const digits = pasteData.split('');
        const newOtp = [...formik.values.otp];

        digits.forEach((digit, idx) => {
            if (idx < 4) newOtp[idx] = digit;
        });

        formik.setFieldValue('otp', newOtp);

        // Focus the last filled input or the next empty one
        const nextIndex = Math.min(digits.length, 3);
        const nextInput = document.getElementById(`otp-${nextIndex}`);
        if (nextInput) nextInput.focus();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative bg-white w-full max-w-md p-6 sm:p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 rounded-sm">
                <div className="flex justify-between items-center mb-2">

                    <h2 className="text-xl sm:text-2xl font-bold text-primary">Verification</h2>
                    <button
                        onClick={onClose}
                        className="text-lightText hover:text-dark transition-colors"
                    >
                        <HiXMark className="text-2xl" />
                    </button>
                </div>

                <p className="text-[13px] sm:text-sm font-medium text-lightText/60 mb-6 sm:mb-8 tracking-tight">
                    A 4-digit OTP has been sent to {phoneNumber ? `****${phoneNumber.slice(-4)}` : "****6232"}
                </p>

                <form onSubmit={formik.handleSubmit}>
                    <div className="flex gap-2.5 sm:gap-4 mb-6 sm:mb-8">
                        {formik.values.otp.map((digit, idx) => (
                            <input
                                key={idx}
                                id={`otp-${idx}`}
                                type="text"
                                inputMode="numeric"
                                value={digit}
                                autoFocus={idx === 0}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                onPaste={handlePaste}
                                disabled={isLoading}
                                className={`h-[50px] w-[50px] bg-mainBG border ${formik.touched.otp && formik.errors.otp ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-dark focus:border-transparent transition-all outline-none text-dark text-center`}
                            />
                        ))}
                    </div>

                    <div className="text-[13px] sm:text-sm font-medium text-lightText mb-8 sm:mb-10">
                        Resend OTP in <span className="text-dark font-bold">00:{timer < 10 ? `0${timer}` : timer}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={formik.values.otp.some(d => !d) || isLoading}
                        className="w-full py-4 sm:py-5 bg-primary text-white text-[13px] sm:text-sm font-bold tracking-[0.2em] hover:bg-primary/95 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : 'Verify & Proceed'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Modal Component
const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const reasons = [
        "Privacy concerns",
        "Too many emails/notifications",
        "Not happy with the service",
        "Other"
    ];

    const formik = useFormik({
        initialValues: { reason: '' },
        validationSchema: Yup.object({
            reason: Yup.string().required('Please select a reason')
        }),
        onSubmit: (values) => {
            onConfirm(values.reason);
        }
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            formik.resetForm();
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-md p-5 sm:p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 rounded-sm">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-primary">Delete Account</h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-lightText hover:text-dark transition-colors scale-110 sm:scale-125 md:scale-150 disabled:opacity-30"
                    >
                        <HiXMark className="text-lg" />
                    </button>
                </div>
                <p className="text-[13px] sm:text-sm md:text-base font-medium text-lightText mb-5 tracking-wide leading-snug">Please let us know the reason why you are leaving:</p>

                <form onSubmit={formik.handleSubmit}>
                    <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
                        {reasons.map((deleteReason) => (
                            <label key={deleteReason} className="flex items-center gap-3 cursor-pointer group">
                                <span
                                    className={`w-4 h-4 md:w-5 md:h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${formik.values.reason === deleteReason ? 'border-dark bg-white' : 'border-dark bg-white group-hover:border-dark'}`}
                                >
                                    {formik.values.reason === deleteReason && (
                                        <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-dark" />
                                    )}
                                </span>
                                <input
                                    type="radio"
                                    name="reason"
                                    value={deleteReason}
                                    checked={formik.values.reason === deleteReason}
                                    onChange={formik.handleChange}
                                    disabled={isLoading}
                                    className="sr-only"
                                />
                                <span className="text-[14px] sm:text-[15px] md:text-base text-lightText group-hover:text-dark transition-colors">{deleteReason}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full sm:flex-1 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold tracking-normal text-dark hover:bg-mainBG transition-all uppercase disabled:opacity-30 order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formik.values.reason || isLoading}
                            className="w-full sm:flex-1 py-3.5 sm:py-4 bg-primary text-white text-xs sm:text-sm font-semibold tracking-normal transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : 'Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
