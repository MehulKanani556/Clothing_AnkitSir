import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendOtp, verifyOtp } from '../redux/slice/auth.slice'

export default function Auth() {

    const [step, setStep] = useState(1);
    const [mobileNo, setMobileNo] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error, isNewUser } = useSelector((state) => state.auth);
    const [timer, setTimer] = useState(30);
    const [showResend, setShowResend] = useState(false);

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setShowResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Step 1: Send OTP
    const formik = useFormik({
        initialValues: {
            mobileNumber: '',
        },
        validationSchema: Yup.object({
            mobileNumber: Yup.string()
                .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
                .required('Please fill this field'),
        }),
        onSubmit: async (values) => {
            const result = await dispatch(sendOtp({ mobileNo: values.mobileNumber }));
            if (sendOtp.fulfilled.match(result)) {
                setMobileNo(values.mobileNumber);
                setStep(2);
            }
        },
    });

    // OTP input handlers
    const handleotpChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }

        const otpValue = newOtp.join('');
        if (otpValue.length === 4) {
            otpFormik.setFieldValue('otp', otpValue);
        }
    };

    const handleotpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleotpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 4);

        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            pastedData.split('').forEach((digit, index) => {
                if (index < 4) newOtp[index] = digit;
            });
            setOtp(newOtp);

            if (pastedData.length === 4) {
                otpFormik.setFieldValue('otp', pastedData);
            }
            const focusIndex = Math.min(pastedData.length, 3);
            inputRefs.current[focusIndex].focus();
        }
    };

    // Step 2: Verify OTP
    const otpFormik = useFormik({
        initialValues: {
            otp: '',
        },
        validationSchema: Yup.object({
            otp: Yup.string()
                .matches(/^[0-9]{4}$/, 'OTP must be exactly 4 digits')
                .required('Please fill this field'),
        }),
        onSubmit: async (values) => {
            const result = await dispatch(verifyOtp({ mobileNo, otp: values.otp }));
            if (verifyOtp.fulfilled.match(result)) {
                // Read isNewUser from the action result, not stale closure
                const newUser = result.payload?.isNewUser;
                if (newUser) {
                    setStep(3);
                } else {
                    navigate('/');
                }
            }
        },
    });

    // Resend OTP
    const handleResendOtp = async () => {
        const result = await dispatch(sendOtp({ mobileNo }));
        if (sendOtp.fulfilled.match(result)) {
            setOtp(['', '', '', '']);
            otpFormik.resetForm();
            setTimer(30);
            setShowResend(false);
        }
    };

    return (
        <div className='min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-mainBG relative overflow-hidden'>

            <div className="flex items-center justify-center p-8 lg:p-16">
                {step === 1 ? (
                    <div className='w-full max-w-md space-y-8 mt-12 lg:mt-0'>
                        {/* Header */}
                        <div className="text-center lg:text-left mb-6">
                            <h1 className='text-2xl font-medium text-dark mb-2'>Welcome to</h1>
                            <img src={require('../assets/images/Logo.webp')} alt="LOGO" />
                        </div>
                        <p className='text-dark text-base font-medium leading-5 max-w-sm'>
                            Login / Register with us to get latest updates and manage your orders
                        </p>

                        {/* Form */}
                        <form className='mt-6 space-y-6' onSubmit={formik.handleSubmit}>
                            <div className="space-y-1">
                                <input
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    type="text"
                                    placeholder='Enter Mobile Number'
                                    maxLength={10}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        formik.setFieldValue('mobileNumber', value);
                                    }}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.mobileNumber}
                                    className={`w-full p-4 bg-background border ${formik.touched.mobileNumber && formik.errors.mobileNumber ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-dark focus:border-transparent transition-all outline-none text-dark`}
                                />
                                {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.mobileNumber}</div>
                                )}
                                {error && (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{error}</div>
                                )}
                            </div>

                            <button
                                type='submit'
                                disabled={!(formik.isValid && formik.dirty && formik.values.mobileNumber.length === 10) || loading}
                                className={`${formik.values.mobileNumber.length === 10 ? 'bg-primary text-white border-primary' : 'bg-border text-secondary border-border'} w-full font-semibold py-4 px-6 border transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? 'SENDING...' : 'SEND OTP'}
                            </button>
                        </form>
                    </div>

                ) : step === 2 ? (
                    <div className='w-full max-w-md space-y-8 mt-12 lg:mt-0'>
                        {/* Header */}
                        <div className="text-center lg:text-left mb-6">
                            <h1 className='text-[32px] font-bold text-primary mb-2'>VERIFICATION</h1>
                        </div>
                        <p className='text-dark text-base font-medium max-w-sm leading-6'>
                            Enter OTP sent on your registered Mobile Number <span className='font-bold'>{mobileNo}</span>
                        </p>

                        {/* Form */}
                        <form className='mt-6 space-y-6' onSubmit={otpFormik.handleSubmit}>
                            <div className="space-y-1">
                                <div className='flex gap-2'>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            name="otp"
                                            type="text"
                                            placeholder='0'
                                            ref={(ref) => (inputRefs.current[index] = ref)}
                                            maxLength={1}
                                            onChange={(e) => handleotpChange(e, index)}
                                            onBlur={otpFormik.handleBlur}
                                            value={digit}
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            onKeyDown={(e) => handleotpKeyDown(e, index)}
                                            onPaste={handleotpPaste}
                                            className={`h-[50px] w-[50px] bg-background border ${otpFormik.touched.otp && otpFormik.errors.otp ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-dark focus:border-transparent transition-all outline-none text-dark text-center`}
                                        />
                                    ))}
                                </div>
                                {otpFormik.touched.otp && otpFormik.errors.otp && (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{otpFormik.errors.otp}</div>
                                )}
                                {error && (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{error}</div>
                                )}
                            </div>

                            {showResend ? (
                                <button
                                    type='button'
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    className='text-dark text-sm font-extrabold leading-5 max-w-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    RESEND OTP
                                </button>
                            ) : (
                                <p className='text-dark text-sm font-medium'>
                                    Resend OTP in <span className='font-bold'>{timer}s</span>
                                </p>
                            )}

                            <button
                                type='submit'
                                disabled={!(otpFormik.isValid && otpFormik.dirty && otpFormik.values.otp.length === 4) || loading}
                                className={`${otpFormik.values.otp.length === 4 ? 'bg-primary text-white border-primary' : 'bg-border text-secondary border-border'} w-full font-semibold py-4 px-6 border transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? 'VERIFYING...' : 'VERIFY'}
                            </button>
                        </form>
                    </div>

                ) : (
                    <div className='w-full max-w-md space-y-8 mt-12 lg:mt-0'>
                        {/* Header */}
                        <div className="text-center lg:text-left mb-6">
                            <h1 className='text-[32px] font-bold text-primary mb-2'>CONGRATULATIONS</h1>
                        </div>
                        <p className='text-dark text-base font-medium max-w-sm leading-6'>
                            You are successfully registered with us.
                        </p>

                        <button
                            onClick={() => navigate('/')}
                            className='bg-primary text-white border-primary uppercase w-full font-semibold py-4 px-6 border transition-all'
                        >
                            CONTINUE
                        </button>
                    </div>
                )}

                <div className="absolute left-5 -bottom-48 opacity-40 pointer-events-none">
                    <img src={require('../assets/images/eofooter.webp')} alt="LOGO footer" />
                </div>
            </div>

            <div className="hidden lg:block relative font-['Urbanist']">
                <img src={require('../assets/images/auth.webp')} alt="auth image" className='w-full h-full object-cover' />
            </div>
        </div>
    )
}
