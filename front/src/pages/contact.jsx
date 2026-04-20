import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { submitContactInquiry } from '../redux/slice/contact.slice';
import toast from 'react-hot-toast';

export default function Contact() {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.contact);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            message: ''
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .required('Name is required'),
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            message: Yup.string()
                .required('Message is required')
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const resultAction = await dispatch(submitContactInquiry(values));
                if (submitContactInquiry.fulfilled.match(resultAction)) {
                    toast.success('Your message has been sent successfully!');
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
        <div className="bg-mainBG min-h-screen pt-12 pb-12 md:pb-24 px-6 md:px-10 font-urbanist">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-xl md:text-3xl font-semibold text-primary tracking-wide">Contact</h1>
                </div>

                <h2 className="text-base font-semibold uppercase tracking-normal text-mainText">
                    AT YOUR SERVICE.
                </h2>
                {/* Section 1: Digital Concierge */}
                <section className="mt-6">
                    <h3 className="text-sm md:text-lg font-semibold text-primary mb-1">
                        1. Digital Concierge (Immediate Assistance)
                    </h3>
                    <p className="text-sm text-lightText font-medium max-w-2xl leading-relaxed mb-1">
                        For real-time support regarding your orders or product inquiries, reach out via our digital channels.
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">WhatsApp Support: <span>+91 [Insert Number]</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Email: <span>concierge@eo-essentials.com</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Response Time: <span>Within 24 hours.</span></p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Visit Our Studio */}
                <section className="mt-6 pt-6 md:pt-8 border-t border-border">
                    <h3 className="text-sm md:text-lg font-semibold text-primary mb-1">
                        2. Visit Our Studio (By Appointment Only)
                    </h3>
                    <p className="text-sm text-lightText font-medium max-w-2xl leading-relaxed mb-2">
                        Experience the tactile world of EO. Visit our flagship location in Surat to explore our latest collections and consult with our stylists.
                    </p>
                    <div>
                        <h4 className="text-sm md:text-base font-bold text-primary mb-2">EO Flagship Studio</h4>
                        <div className="space-y-2 pl-1.5 md:pl-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Hours: Monday – Saturday | 10:00 AM – 7:00 PM</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Book an Appointment: [Link to Booking Calendar/Form]</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Specialized Inquiries */}
                <section className="mt-6 pt-6 md:pt-8 border-t border-border">
                    <h3 className="text-sm md:text-lg font-semibold text-primary mb-1">
                        3. Specialized Inquiries
                    </h3>

                    <div className="space-y-4">
                        {/* Press & Media */}
                        <div>
                            <h4 className="text-sm md:text-base font-semibold text-primary mb-1">Press & Media</h4>
                            <p className="text-xs md:text-sm text-lightText font-medium mb-2">For editorial pulls, high-res assets, or interview requests.</p>
                            <div className="flex items-center gap-2 pl-1.5 md:pl-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Hours: Monday – Saturday | 10:00 AM – 7:00 PM</p>
                            </div>
                        </div>

                        {/* Wholesale */}
                        <div>
                            <h4 className="text-sm md:text-base font-semibold text-primary mb-1">Wholesale & Partnerships</h4>
                            <p className="text-xs md:text-sm text-lightText font-medium mb-2">For global stockist inquiries and corporate collaborations.</p>
                            <div className="flex items-center gap-2 pl-1.5 md:pl-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Email: partners@eo-essentials.com</p>
                            </div>
                        </div>

                        {/* Careers */}
                        <div>
                            <h4 className="text-sm md:text-base font-semibold text-primary mb-1">Careers</h4>
                            <p className="text-xs md:text-sm text-lightText font-medium mb-2">Join our team of designers and craftsmen.</p>
                            <div className="flex items-center gap-2 pl-1.5 md:pl-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Email: careers@eo-essentials.com</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Send a Message */}
                <section className="mt-6 pt-6 md:pt-8 border-t border-border pb-24 md:pb-32">
                    <h3 className="text-sm md:text-base font-semibold text-primary mb-1">
                        4. Send a Message
                    </h3>
                    <p className="text-xs md:text-sm text-lightText font-medium mb-6 md:mb-8">
                        If you prefer, you can leave us a message below and we will get back to you shortly.
                    </p>

                    <form onSubmit={formik.handleSubmit} className="max-w-2xl space-y-4 md:space-y-6">
                        <div className="space-y-1.5">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Name"
                                className={`w-full px-5 py-3 md:py-4 bg-white border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-border'} text-sm md:text-base text-primary placeholder:text-lightText focus:outline-none focus:border-primary transition-colors`}
                                {...formik.getFieldProps('name')}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-red-500 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">{formik.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                className={`w-full px-5 py-3 md:py-4 bg-white border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-border'} text-sm md:text-base text-primary placeholder:text-lightText focus:outline-none focus:border-primary transition-colors`}
                                {...formik.getFieldProps('email')}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-red-500 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">{formik.errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <textarea
                                id="message"
                                name="message"
                                rows="6"
                                placeholder="Message"
                                className={`w-full px-5 py-3 md:py-4 bg-white border ${formik.touched.message && formik.errors.message ? 'border-red-500' : 'border-border'} text-sm md:text-base text-primary placeholder:text-lightText focus:outline-none focus:border-primary transition-all resize-none`}
                                {...formik.getFieldProps('message')}
                            ></textarea>
                            {formik.touched.message && formik.errors.message && (
                                <p className="text-red-500 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">{formik.errors.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-[0.25em] hover:bg-primary/95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'SUBMIT INQUIRY'}
                        </button>
                    </form>
                </section>

            </div>
        </div>
    );
}