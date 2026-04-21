import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AccountLayout from './AccountLayout';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { updateProfile, sendEmailOtp, verifyEmailOtp, fetchSessions, revokeSession, logoutUser, logoutAllDevices } from '../../redux/slice/auth.slice';
import { FaArrowRight } from 'react-icons/fa';
import { HiOutlineDevicePhoneMobile, HiOutlineGlobeAlt } from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ArrowUpRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7M7 7h10v10" />
    </svg>
);

const profileSchema = Yup.object({
    firstName: Yup.string().trim().required('First name is required'),
    lastName: Yup.string().trim().required('Last name is required'),
    email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
});

export default function Profile() {
    const dispatch = useDispatch();
    const { user, loading, emailOtpLoading, sessions = [], sessionsLoading } = useSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);

    // Email verify modal state
    const [verifyModal, setVerifyModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef([]);
    const timerRef = useRef(null);

    const startResendTimer = () => {
        setResendTimer(30);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        dispatch(fetchSessions());
    }, [dispatch]);

    useEffect(() => () => clearInterval(timerRef.current), []);

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 3) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (pasted.length === 4) {
            setOtp(pasted.split(''));
            inputRefs.current[3]?.focus();
        }
        e.preventDefault();
    };

    const handleSendOtp = async () => {
        try {
            await dispatch(sendEmailOtp()).unwrap();
            setVerifyModal(true);
            setOtp(['', '', '', '']);
            startResendTimer();
        } catch (_) { }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        try {
            await dispatch(sendEmailOtp()).unwrap();
            setOtp(['', '', '', '']);
            startResendTimer();
            inputRefs.current[0]?.focus();
        } catch (_) { }
    };

    const handleVerifyOtp = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 4) return;
        try {
            await dispatch(verifyEmailOtp({ otp: otpString })).unwrap();
            setVerifyModal(false);
            setOtp(['', '', '', '']);
        } catch (_) { }
    };

    const closeModal = () => {
        setVerifyModal(false);
        setOtp(['', '', '', '']);
        clearInterval(timerRef.current);
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).getFullYear()
        : new Date().getFullYear();

    const defaultAddress = user?.address?.find(
        (a) => String(a._id) === String(user?.selectedAddress)
    ) || user?.address?.[0] || null;

    const addressLine = defaultAddress
        ? [
            defaultAddress.address,
            defaultAddress.aptSuite,
            defaultAddress.city,
            defaultAddress.state,
            defaultAddress.zipcode,
        ].filter(Boolean).join(', ')
        : null;

    const defaultCard = user?.savedCards?.find(
        (c) => String(c._id) === String(user?.selectedCard)
    ) || user?.savedCards?.[0] || null;

    const formik = useFormik({
        initialValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
        },
        validationSchema: profileSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                await dispatch(updateProfile({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email || undefined,
                })).unwrap();
                setIsEditing(false);
            } catch (_) { }
        },
    });

    const handleRevokeSession = async (sessionId) => {
        try {
            await dispatch(revokeSession(sessionId)).unwrap();
            toast.success('Device logged out successfully');
            dispatch(fetchSessions());
        } catch (error) {
            toast.error(error?.message || 'Failed to logout device');
        }
    };

    const handleLogoutAll = async () => {
        try {
            await dispatch(logoutAllDevices()).unwrap();
            toast.success('Logged out from all devices');
        } catch (error) {
            toast.error(error?.message || 'Failed to logout from all devices');
        }
    };

    const handleMainLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const handleEdit = () => {
        formik.resetForm({
            values: {
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
            },
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        formik.resetForm();
        setIsEditing(false);
    };

    const inputClass = (field) =>
        `w-full text-sm md:text-lg font-medium bg-transparent outline-none border-none placeholder:text-lightText ${formik.touched[field] && formik.errors[field] ? 'text-red-500' : 'text-primary'
        }`;

    return (
        <AccountLayout>
            <form onSubmit={formik.handleSubmit}>
                {/* Page Title */}
                <div className="flex justify-between items-center md:mb-8 mb-4">
                    <h1 className="text-2xl md:text-[28px] font-semibold text-primary">Profile</h1>
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="bg-primary text-white uppercase py-2 px-4 md:px-6 text-xs md:text-base font-semibold hover:bg-primary/90 transition-colors tracking-wide"
                        >
                            EDIT
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-border text-lightText uppercase py-2 px-4 md:px-6 text-xs md:text-base font-semibold hover:bg-border/70 transition-colors tracking-wide"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formik.isValid}
                                className="bg-primary text-white uppercase py-2 px-4 md:px-6 text-xs md:text-base font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 tracking-wide"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Personal Information ── */}
                <div className="md:mb-10 mb-6">
                    <p className="text-xs sm:text-sm lg:text-base font-semibold tracking-widest text-mainText uppercase mb-5">
                        Personal Information (Member since {memberSince})
                    </p>

                    {/* Row 1: First Name / Last Name */}
                    <div className="grid grid-cols-2 gap-x-10 mb-6">
                        {/* First Name */}
                        <div className="border-b border-border sm:pb-3">
                            <p className={`text-sm mb-1 font-bold ${formik.touched.firstName && formik.errors.firstName ? 'text-red-500' : user?.firstName ? 'text-lightText' : 'text-primary'}`}>
                                {formik.touched.firstName && formik.errors.firstName
                                    ? formik.errors.firstName
                                    : 'First Name'}
                            </p>
                            {isEditing ? (
                                <input
                                    name="firstName"
                                    className={inputClass('firstName')}
                                    value={formik.values.firstName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter first name"
                                />
                            ) : (
                                <p className={`text-sm md:text-lg font-medium ${user?.firstName ? 'text-primary' : 'text-lightText'}`}>
                                    {user?.firstName || '—'}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="border-b border-border sm:pb-3">
                            <p className={`text-sm mb-1 font-bold ${formik.touched.lastName && formik.errors.lastName ? 'text-red-500' : user?.lastName ? 'text-lightText' : 'text-primary'}`}>
                                {formik.touched.lastName && formik.errors.lastName
                                    ? formik.errors.lastName
                                    : 'Last Name'}
                            </p>
                            {isEditing ? (
                                <input
                                    name="lastName"
                                    className={inputClass('lastName')}
                                    value={formik.values.lastName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter last name"
                                />
                            ) : (
                                <p className={`text-sm md:text-lg font-medium ${user?.lastName ? 'text-primary' : 'text-lightText'}`}>
                                    {user?.lastName || '—'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Contact / Email */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-5 xl:gap-x-10">
                        {/* Contact Number — always read-only */}
                        <div>
                            <div className="border-b border-border pb-3">
                                <p className={`text-sm mb-1 font-bold ${user?.mobileNo ? 'text-lightText' : 'text-primary'}`}>
                                    Contact Number
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm md:text-lg font-medium ${user?.mobileNo ? 'text-primary' : 'text-lightText'}`}>
                                        {user?.mobileNo ? `+1 ${user.mobileNo}` : 'Not added yet'}
                                    </p>
                                    {user?.verified && (
                                        <span className="flex items-center gap-1 text-xs sm:text-base font-semibold text-primary tracking-widest uppercase">
                                            <HiOutlineCheckCircle className="text-base text-[#009951]" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <div className="border-b border-border pb-3">
                                <p className={`text-sm mb-1 font-bold ${formik.touched.email && formik.errors.email ? 'text-red-500' : user?.email ? 'text-lightText' : 'text-primary'}`}>
                                    {formik.touched.email && formik.errors.email
                                        ? formik.errors.email
                                        : 'Email Address'}
                                </p>
                                {isEditing ? (
                                    <input
                                        name="email"
                                        type="email"
                                        className={inputClass('email')}
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter email address"
                                    />
                                ) : user?.email ? (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm md:text-lg font-medium text-primary truncate" title={user.email}>
                                            <span className="hidden sm375:inline">{user.email}</span>
                                            <span className="sm375:hidden">{user.email.split('@')[0]}@...</span>
                                        </p>
                                        {user?.emailVerified ? (
                                            <span className="flex items-center gap-1 text-xs sm:text-base font-semibold text-primary tracking-widest uppercase">
                                                <HiOutlineCheckCircle className="text-base text-[#009951]" />
                                                Verified
                                            </span>
                                        ) : (
                                            <button type="button" onClick={handleSendOtp} disabled={emailOtpLoading} className="flex items-center gap-1 text-xs sm:text-base font-semibold text-mainText tracking-widest uppercase hover:opacity-80 transition-opacity disabled:opacity-50">
                                                Verify
                                                <FaArrowRight className="text-xs sm:text-base text-gold" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <p className="text-sm md:text-lg text-lightText">Not added yet</p>
                                        <button type="button" onClick={handleSendOtp} disabled={emailOtpLoading} className="flex items-center gap-1 text-xs sm:text-base font-semibold text-mainText tracking-widest uppercase hover:opacity-80 transition-opacity mt-0.5 disabled:opacity-50">
                                            <HiOutlineExclamationTriangle className="text-base text-gold" />
                                            Verify
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!isEditing && !user?.email && !user?.emailVerified && (
                                <p className="text-xs sm:text-base text-lightText mt-1">Add your email for order updates.</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* ── Default Address ── */}
            <div className="md:mb-10 mb-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-5 xl:gap-x-10">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-xs sm:text-sm lg:text-base font-semibold tracking-normal text-mainText uppercase">
                            Default Address (Preview)
                        </p>
                        <Link to="/addresses"
                            className="flex items-center gap-1 text-xs sm:text-sm lg:text-base font-semibold tracking-widest text-mainText uppercase hover:text-primary transition-colors">
                            Manage <ArrowUpRight />
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-5 xl:gap-x-10">
                    <div className="border-b border-border pb-3">
                        <p className={`text-sm mb-1 font-bold ${addressLine ? 'text-lightText' : 'text-primary'}`}>Address</p>
                        {addressLine ? (
                            <p className="text-sm md:text-lg font-medium text-primary">{addressLine}</p>
                        ) : (
                            <p className="text-sm md:text-lg text-lightText">No address saved yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Payment Preview ── */}
            <div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-5 xl:gap-x-10">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-xs sm:text-sm lg:text-base font-semibold tracking-normal text-mainText uppercase">
                            Payment (Preview)
                        </p>
                        <Link to="/payments"
                            className="flex items-center gap-1 text-xs sm:text-sm lg:text-base font-semibold tracking-widest text-mainText uppercase hover:text-primary transition-colors">
                            View <ArrowUpRight />
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-5 xl:gap-x-10">
                    <div className="border-b border-border pb-3">
                        <p className={`text-sm mb-1 font-bold ${defaultCard ? 'text-lightText' : 'text-primary'}`}>Payment</p>
                        {defaultCard ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#1A1F71] text-white text-[10px] font-extrabold px-2 py-1 rounded-sm uppercase tracking-wider">
                                        {defaultCard.cardType || 'Card'}
                                    </div>
                                    <span className="text-sm font-medium text-dark">
                                        ···· {defaultCard.cardNumber?.slice(-4)}
                                    </span>
                                </div>
                                <span className="text-sm text-primary font-semibold">
                                    Expires {defaultCard.expiryDate}
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm md:text-lg text-lightText">No payment method saved yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Security & Sessions ── */}
            {/* <div className="md:mt-12 mt-8">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-xs sm:text-sm lg:text-base font-semibold tracking-normal text-mainText uppercase">
                        Security & Sessions
                    </p>
                    <Link to="/settings"
                        className="flex items-center gap-1 text-xs sm:text-sm lg:text-base font-semibold tracking-widest text-mainText uppercase hover:text-primary transition-colors">
                        All Settings <ArrowUpRight />
                    </Link>
                </div>
                
                <div className="bg-white border border-border/50 p-4 md:p-6 mb-6">
                    {sessionsLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-center py-4 text-lightText/60">No active sessions</p>
                    ) : (
                        <div className="space-y-5">
                            {sessions.map((session) => (
                                <div key={session._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.isCurrent ? 'bg-primary text-white' : 'bg-mainBG text-lightText'}`}>
                                            {session.deviceType === 'Desktop' ? <HiOutlineGlobeAlt className="text-xl" /> : <HiOutlineDevicePhoneMobile className="text-xl" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm md:text-base font-bold text-dark truncate capitalize">{session.os === 'Unknown' ? 'Web' : session.os}</p>
                                                {session.isCurrent && <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">Current</span>}
                                            </div>
                                            <p className="text-[10px] md:text-xs text-lightText/60">
                                                {session.isCurrent ? 'Online Now' : formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    {!session.isCurrent && (
                                        <button 
                                            onClick={() => handleRevokeSession(session._id)}
                                            className="text-[10px] font-bold text-red-500 uppercase hover:underline underline-offset-4"
                                        >
                                            Log Out
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button 
                        type="button"
                        onClick={handleMainLogout}
                        className="flex-1 bg-dark text-white py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                    >
                        Log Out From This Device
                    </button>
                    <button 
                        type="button"
                        onClick={handleLogoutAll}
                        className="flex-1 border border-border text-dark py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-500/20 transition-all"
                    >
                        Sign Out All Devices
                    </button>
                </div>
            </div> */}


            {/* ── Email Verify OTP Modal ── */}
            {verifyModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-[100]" onClick={closeModal} />
                    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 pointer-events-none">
                        <div className="bg-white w-full max-w-md p-4 md:p-8 shadow-xl relative pointer-events-auto">

                            <div className="flex items-center justify-between mb-2">
                                {/* Title */}
                                <h2 className="text-lg lg:text-2xl font-semibold text-dark ">Verify your email</h2>
                                {/* Close */}
                                <button
                                    onClick={closeModal}
                                    className="text-lightText hover:text-dark transition-colors"
                                    aria-label="Close"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs md:text-sm text-lightText mb-4 md:mb-8">
                                We've sent a 4-digit code to{' '}
                                <span className="text-dark">
                                    {user?.email
                                        ? `•••${user.email.slice(user.email.lastIndexOf('@') - 2)}`
                                        : 'your email'}
                                </span>
                            </p>

                            {/* 4 OTP boxes */}
                            <div className="flex gap-3 mb-6" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (inputRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] text-center text-base md:text-2xl font-medium text-dark bg-mainBG border border-border outline-none focus:border-primary transition-colors"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            {/* Resend */}
                            <p className="text-xs md:text-sm text-lightText mb-4 md:mb-8">
                                Didn't receive it?{' '}
                                {resendTimer > 0 ? (
                                    <span className="text-lightText">Resend OTP in <span className="font-semibold text-dark">{resendTimer}s</span></span>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={emailOtpLoading}
                                        className="font-bold text-dark hover:text-primary transition-colors disabled:opacity-50"
                                    >
                                        Resend code
                                    </button>
                                )}
                            </p>

                            {/* Verify button */}
                            <button
                                onClick={handleVerifyOtp}
                                disabled={otp.join('').length !== 4 || emailOtpLoading}
                                className="w-full py-2 md:py-4 bg-mainBG text-lightText uppercase text-xs md:text-sm font-semibold tracking-widest transition-colors disabled:opacity-60 enabled:bg-primary enabled:text-white enabled:hover:bg-primary/90"
                            >
                                {emailOtpLoading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </AccountLayout>
    );
}
