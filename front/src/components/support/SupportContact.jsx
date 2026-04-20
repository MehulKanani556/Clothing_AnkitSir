import React from 'react';
import supportTeam from '../../assets/images/support_team.webp';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { submitSupportInquiry } from '../../redux/slice/contact.slice';

const SupportContact = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.contact);

    const expectations = [
        "Fast and helpful responses from our support team",
        "Clear guidance for orders, payments, and account issues",
        "Secure and reliable communication",
        "Support designed to solve your problems quickly"
    ];

    const formik = useFormik({
        initialValues: {
            fullName: '',
            email: '',
            subject: '',
            message: ''
        },
        validationSchema: Yup.object({
            fullName: Yup.string()
                .min(2, 'Name must be at least 2 characters')
                .required('Full Name is required'),
            email: Yup.string()
                .email('Email Address is invalid')
                .required('Email Address is required'),
            subject: Yup.string()
                .min(2, 'Subject must be at least 2 characters')
                .required('Subject is required'),
            message: Yup.string()
                .required('Message is required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const resultAction = await dispatch(submitSupportInquiry(values));
                if (submitSupportInquiry.fulfilled.match(resultAction)) {
                    toast.success('Your message has been sent successfully. We will get back to you soon!');
                    resetForm();
                } else {
                    toast.error(resultAction.payload?.message || 'Failed to send message');
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.');
            }
        }
    });

    return (
        <section className="py-24 px-4 md:px-10 lg:px-20 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                {/* Left side: Image and Features */}
                <div className="space-y-12">
                    <div className="aspect-[4/3] overflow-hidden rounded-sm grayscale-[0.2] contrast-[1.05]">
                        <img
                            src={supportTeam}
                            alt="Support Team"
                            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-base md:text-2xl font-bold text-primary uppercase ">What you can expect</h3>
                        <div className=" divide-y divide-border/50 border-t border-border/50">
                            {expectations.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="py-2 md:py-4">
                                        <p className="text-sm md:text-lg font-semibold text-mainText">{item}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side: Form */}
                <div className="bg-white flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] md:text-lg font-semibold uppercase text-mainText mb-4 animate-fade-in">
                            SUPPORT
                        </p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-4">
                            WITHOUT DELAY
                        </h1>
                        <p className="text-sm md:text-lg text-lightText font-light mb-8  mx-auto ">
                            Have a question or need help? Reach out and our team will assist you with quick and reliable support.
                        </p>

                        <form className="space-y-8" onSubmit={formik.handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1 group">
                                    <label htmlFor="fullName" className={`text-[10px] md:text-xs font-bold uppercase transition-colors ${formik.touched.fullName && formik.errors.fullName ? 'text-red-500' : 'text-primary group-focus-within:text-gold'}`}>
                                        Full Name
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        placeholder="Enter full name"
                                        className={`w-full border-b py-3 text-sm md:text-lg text-dark focus:outline-none outline-none bg-transparent transition-all ${formik.touched.fullName && formik.errors.fullName ? 'border-red-500' : 'border-border focus:border-primary'}`}
                                        {...formik.getFieldProps('fullName')}
                                    />
                                    {formik.touched.fullName && formik.errors.fullName && (
                                        <div className="text-red-500 text-[10px] md:text-xs font-medium mt-1">{formik.errors.fullName}</div>
                                    )}
                                </div>
                                <div className="space-y-1 group">
                                    <label htmlFor="email" className={`text-[10px] md:text-xs font-bold uppercase transition-colors ${formik.touched.email && formik.errors.email ? 'text-red-500' : 'text-primary group-focus-within:text-gold'}`}>
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Add your email address"
                                        className={`w-full border-b py-3 text-sm md:text-lg text-dark focus:outline-none outline-none bg-transparent transition-all ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-border focus:border-primary'}`}
                                        {...formik.getFieldProps('email')}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="text-red-500 text-[10px] md:text-xs font-medium mt-1">{formik.errors.email}</div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1 group">
                                <label htmlFor="subject" className={`text-[10px] md:text-xs font-bold uppercase transition-colors ${formik.touched.subject && formik.errors.subject ? 'text-red-500' : 'text-primary group-focus-within:text-gold'}`}>
                                    Subject
                                </label>
                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    placeholder="e.g., Payment Issue"
                                    className={`w-full border-b py-3 text-sm md:text-lg text-dark focus:outline-none outline-none bg-transparent transition-all ${formik.touched.subject && formik.errors.subject ? 'border-red-500' : 'border-border focus:border-primary'}`}
                                    {...formik.getFieldProps('subject')}
                                />
                                {formik.touched.subject && formik.errors.subject && (
                                    <div className="text-red-500 text-[10px] md:text-xs font-medium mt-1">{formik.errors.subject}</div>
                                )}
                            </div>
                            <div className="space-y-1 group">
                                <label htmlFor="message" className={`text-[10px] md:text-xs font-bold uppercase transition-colors ${formik.touched.message && formik.errors.message ? 'text-red-500' : 'text-primary group-focus-within:text-gold'}`}>
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="e.g., Start typing your thoughts..."
                                    rows="1"
                                    className={`w-full border-b py-3 text-sm md:text-lg text-dark focus:outline-none outline-none bg-transparent resize-none transition-all ${formik.touched.message && formik.errors.message ? 'border-red-500' : 'border-border focus:border-primary'}`}
                                    {...formik.getFieldProps('message')}
                                ></textarea>
                                {formik.touched.message && formik.errors.message && (
                                    <div className="text-red-500 text-[10px] md:text-xs font-medium mt-1">{formik.errors.message}</div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={formik.isSubmitting || loading}
                                className="bg-primary text-white px-6 md:px-12 py-2 md:py-4 text-sm md:text-lg font-semibold uppercase hover:bg-[#1a3026] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {formik.isSubmitting || loading ? 'Submitting...' : 'SUBMIT'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-10">
                        <p className="text-sm md:text-xl text-mainText font-medium">
                            We're here to make your experience smooth and hassle-free. Whether you need help with orders, payments, or your account, our team is ready to assist you with clear and timely responses. Every request is handled with care to ensure you get the support you need without unnecessary delays.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SupportContact;
