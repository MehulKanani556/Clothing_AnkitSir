import React from 'react'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useState } from 'react'
import { useRef } from 'react'

export default function Auth() {

    const [step, setStep] = useState(1);
    const [mobileNo, setMobileNo] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef([]);

    const formik = useFormik({
        initialValues: {
            mobileNumber: '',
        },
        validationSchema: Yup.object({
            mobileNumber: Yup.string()
                .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
                .required('Please fill this field'),
        }),
        onSubmit: (values) => {
            console.log('Form submitted:', values);
            // Handle OTP sending logic here
            // alert(`OTP sent to ${values.mobileNumber}`);
            setMobileNo(values.mobileNumber);
            setStep(3)
        },
    });

    const handleotpChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 4 - 1) {
            inputRefs.current[index + 1].focus();
        }

        const otpValue = newOtp.join("");
        if (otpValue.length === 4) {
            otpFormik.setFieldValue("otp", otpValue);
        }
    };

    const handleotpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleotpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 4);

        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            pastedData.split("").forEach((digit, index) => {
                if (index < 4) {
                    newOtp[index] = digit;
                }
            });
            setOtp(newOtp);

            if (pastedData.length === 4) {
                otpFormik.setFieldValue("otp", pastedData);
            }
            // Focus last filled input or first empty input
            const focusIndex = Math.min(pastedData.length, 4 - 1);
            inputRefs.current[focusIndex].focus();
        }
    };

    const otpFormik = useFormik({
        initialValues: {
            otp: '',
        },
        validationSchema: Yup.object({
            otp: Yup.string()
                .matches(/^[0-9]{4}$/, 'OTP must be exactly 4 digits')
                .required('Please fill this field'),
        }),
        onSubmit: (values) => {
            console.log('Form submitted:', values);
            // Handle OTP sending logic here
            // alert(`OTP sent to ${mobileNo}`);
            setStep(3)
        },
    });

    return (
        <div className='min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-mainBG relative overflow-hidden'>
            {/* Back to Home Link */}
            {/* <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Website
            </Link> */}

            <div className="flex items-center justify-center p-8 lg:p-16">
                {step === 1 ? (
                    <div className='w-full max-w-md space-y-8 mt-12 lg:mt-0'>
                        {/* Header */}
                        <div className="text-center lg:text-left mb-6">
                            <h1 className='text-2xl font-medium text-dark mb-2'>Welcome to</h1>
                            <img src={require("../assets/Logo.webp")} alt="LOGO" />
                        </div>
                        <p className='text-dark text-base font-medium leading-5 max-w-sm'>Login / Register with us to get latest updates and manage your orders</p>

                        {/* Form */}
                        <form className='mt-6 space-y-6' onSubmit={formik.handleSubmit}>
                            <div className="space-y-1">
                                <div>
                                    <input
                                        id="mobileNumber"
                                        name="mobileNumber"
                                        type="text"
                                        placeholder='Enter Mobile Number'
                                        maxLength={10}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            formik.setFieldValue("mobileNumber", value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.mobileNumber}
                                        className={`w-full p-4 bg-background border ${formik.touched.mobileNumber && formik.errors.mobileNumber ? 'border-red-500' : 'border-border'} focus:ring-1 focus:ring-dark focus:border-transparent transition-all outline-none text-dark`}
                                    />
                                    {formik.touched.mobileNumber && formik.errors.mobileNumber ? (
                                        <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.mobileNumber}</div>
                                    ) : null}
                                </div>
                            </div>

                            <button
                                type='submit'
                                className={`${formik.values.mobileNumber ? 'bg-primary text-white border-primary' : 'bg-border text-secondary border-border'} w-full  font-semibold py-4 px-6 border transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                disabled={!(formik.isValid && formik.dirty && formik.values.mobileNumber.length === 10)}
                            >
                                SEND OTP
                            </button>
                        </form>
                    </div>
                ) : step === 2 ? (
                    <div className='w-full max-w-md space-y-8 mt-12 lg:mt-0'>
                        {/* Header */}
                        <div className="text-center lg:text-left mb-6">
                            {/* <img src={require("../assets/Logo.webp")} alt="LOGO" /> */}
                            <h1 className='text-[32px] font-bold text-primary mb-2'>VERIFICATION</h1>
                        </div>
                        <p className='text-dark text-base font-medium max-w-sm leading-6'>Enter OTP sent on your registered Mobile Number {mobileNo}</p>

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
                                            maxLength={4}
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
                                {otpFormik.touched.otp && otpFormik.errors.otp ? (
                                    <div className="text-red-500 text-xs mt-1 font-medium">{otpFormik.errors.otp}</div>
                                ) : null}
                            </div>

                            <p className='text-dark text-sm font-extrabold leading-5 max-w-sm'>RESEND OTP</p>

                            <button
                                type='submit'
                                className={`${otpFormik.values.otp ? 'bg-primary text-white border-primary' : 'bg-border text-secondary border-border'} w-full  font-semibold py-4 px-6 border transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                disabled={!(otpFormik.isValid && otpFormik.dirty && otpFormik.values.otp.length === 4)}
                            >
                                VERIFY
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className='w-full max-w-md space-y-8 mt-12 lg:mt-0'>
                        {/* Header */}
                        <div className="text-center lg:text-left mb-6">
                            {/* <img src={require("../assets/Logo.webp")} alt="LOGO" /> */}
                            <h1 className='text-[32px] font-bold text-primary mb-2'>CONGRATULATIONS</h1>
                        </div>
                        <p className='text-dark text-base font-medium max-w-sm leading-6'>You are successfully registered with us.</p>

                        <button
                            className={`bg-primary text-white border-primary uppercase w-full font-semibold py-4 px-6 border transition-all`}
                        >
                            continue
                        </button>
                    </div>
                )}


                <div className="absolute left-5 -bottom-48 opacity-40 pointer-events-none">
                    <img src={require("../assets/eofooter.webp")} alt="LOGO footer" />
                </div>
            </div>
            <div className="hidden lg:block relative font-['Urbanist']">
                <img src={require("../assets/auth.webp")} alt="auth image" className='w-full h-full object-cover' />
            </div>
        </div>
    )
}