import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { submitContactInquiry } from '../redux/slice/contact.slice';
import toast from 'react-hot-toast';
import { PiArrowUpRightBold } from 'react-icons/pi';

// Hero image
import evolutionHero from '../assets/images/evolution.webp';

// Timeline images
import era2005 from '../assets/images/evolution1.webp';
import era2010 from '../assets/images/evolution2.webp';
import era2015 from '../assets/images/evolution3.webp';
import era2020 from '../assets/images/evolution4.webp';
import era2025 from '../assets/images/evolution5.webp';

// Contact side image
import contactImg from '../assets/images/philosophystory.webp';

const timelineData = [
    {
        year: '2005',
        title: 'The Master’s Sketch',
        description:
            'EO began in a quiet atelier with a singular vision: to create the perfect silhouette. We launched our first line of bespoke tailoring, focusing on heritage fabrics and the art of the perfect fit.',
        image: era2005,
        imageLeft: true,
    },
    {
        year: '2010',
        title: 'The Leather Legacy',
        description:
            'Recognizing that style extends beyond the garment, we introduced our leather goods collection. The "Sovereign" range was born, defining the standard for luxury bags and accessories.',
        image: era2010,
        imageLeft: false,
    },
    {
        year: '2015',
        title: 'The Soul of Scent',
        description:
            'We entered the world of olfactory art. By launching our signature fragrance line, we gave the EO man and woman an invisible yet unforgettable accessory that anchors presence in memory.',
        image: era2015,
        imageLeft: true,
    },
    {
        year: '2020',
        title: 'Defining Radiance',
        description:
            'The launch of EO Cosmetics marked our foray into high-performance beauty. We developed formulas that blend skincare benefits with professional finishes, completing the full luxury ritual.',
        image: era2020,
        imageLeft: false,
    },
    {
        year: '2025',
        title: 'The Global Horizon',
        description:
            'Today, EO stands as a comprehensive lifestyle house. With our new digital flagship, we bring the immersive experience of our atelier to a global audience of modern connoisseurs.',
        image: era2025,
        imageLeft: true,
    },
];

const milestones = ['All Journey', '2005', '2010', '2015', '2020', '2025'];

export default function Evolution() {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.contact);
    const [activeYear, setActiveYear] = useState('All Journey');

    const formik = useFormik({
        initialValues: { name: '', email: '', message: '' },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            message: Yup.string().required('Message is required'),
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
            } catch {
                toast.error('Something went wrong. Please try again.');
            }
        },
    });

    return (
        <div className="bg-mainBG min-h-screen font-urbanist">

            {/* ── Hero Section — contained with side padding, text top-left ── */}
            <div className="px-6 md:px-10 pt-8 md:pt-10">
                <div className="max-w-7xl mx-auto">
                    <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
                        <img
                            src={evolutionHero}
                            alt="EO Evolution Hero"
                            className="w-full h-full object-cover object-center"
                        />

                        {/* Hero text — top-left positioned with responsive padding */}
                        <div className="absolute inset-0 flex flex-col justify-start pt-4 md:pt-12 px-6 md:px-12 lg:px-16">
                            <div className="max-w-4xl">
                                <p className="text-border text-[10px] md:text-sm uppercase tracking-widest font-medium mb-2 pr-4">
                                    Where the art of fine tailoring meets the soul of signature fragrances.
                                </p>
                                <h1 className="text-white text-[24px] md:text-[42px] lg:text-[56px] font-bold uppercase leading-tight mb-4">
                                    Redefining The<br className="hidden md:block" /> Modern Aesthetic.
                                </h1>
                                <p className="text-border text-xs md:text-base font-medium leading-relaxed max-w-3xl">
                                    We don't just create products; we curate identities. EO was born from a desire to blend the tactile richness of luxury clothing with the sensory depth of artisanal scents and cosmetics.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Timeline Header ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 pt-14 pb-10 text-center">
                <p className="text-xs md:text-sm uppercase tracking-normal text-mainText font-semibold mb-2">
                    Ten years of relentless craftsmanship and sensory innovation.
                </p>
                <h2 className="text-[24px] md:text-[36px] lg:text-[50px] font-bold uppercase text-primary">
                    The Evolution of EO
                </h2>

                {/* Milestone nav */}
                <div className="flex items-center justify-center gap-4 md:gap-8 mt-6 flex-wrap border-y border-border py-5">
                    {milestones.map((m) => (
                        <button
                            key={m}
                            onClick={() => setActiveYear(m)}
                            className={`text-xs md:text-sm font-medium transition-all ${activeYear === m
                                ? 'text-primary'
                                : 'text-lightText hover:text-primary'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Timeline Entries ──────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 pb-6 md:pb-16">
                {timelineData.map((entry, index) => (
                    <div
                        key={entry.year}
                        className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${index < timelineData.length - 1 ? 'border-b border-border' : ''
                            }`}
                    >
                        {/* Image block */}
                        <div
                            className={`overflow-hidden ${entry.imageLeft ? 'md:order-1' : 'md:order-2'
                                } order-1`}
                        >
                            <img
                                src={entry.image}
                                alt={`EO ${entry.year}`}
                                className="w-full h-64 md:h-80 object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>

                        {/* Text block */}
                        <div
                            className={`flex flex-col justify-center px-6 md:px-12 py-6 md:py-14 ${entry.imageLeft ? 'md:order-2 items-start' : 'md:order-1 md:items-end items-start'} order-2`}
                        >
                            <span className="text-[48px] md:text-[64px] font-bold text-lightText leading-none select-none mb-2">
                                {entry.year}
                            </span>
                            <h3 className="text-base md:text-lg font-medium text-dark uppercase tracking-normal mb-4">
                                {entry.title}
                            </h3>
                            <p className={`text-xs md:text-sm text-lightText font-medium leading-relaxed ${entry.imageLeft ? 'text-start' : 'md:text-end text-start'}`}>
                                {entry.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Get In Touch Section ──────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto pb-16 bg-background">
                <div className="flex flex-col lg:flex-row gap-0">

                    {/* Form side */}
                    <div className="w-full lg:w-1/2 py-10 md:py-14 px-6 md:px-10">
                        <p className="text-xs md:text-sm uppercase tracking-normal text-mainText font-semibold mb-1">
                            Join the Inner Circle
                        </p>
                        <h2 className="text-[28px] md:text-[40px] lg:text-[48px] font-bold uppercase text-primary mb-2 leading-tight">
                            Get Into Touch
                        </h2>
                        <p className="text-sm md:text-base text-lightText font-medium leading-relaxed mb-8">
                            Subscribe to receive exclusive styling tips, early access to new collections, and the latest from The Journal.
                        </p>

                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <input
                                    id="evo-name"
                                    name="name"
                                    type="text"
                                    placeholder="Name"
                                    className={`w-full px-5 py-3 md:py-4 bg-white border ${formik.touched.name && formik.errors.name
                                        ? 'border-red-500'
                                        : 'border-border'
                                        } text-sm text-primary placeholder:text-lightText focus:outline-none focus:border-primary transition-colors`}
                                    {...formik.getFieldProps('name')}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-red-500 text-[9px] uppercase font-bold tracking-wider">
                                        {formik.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <input
                                    id="evo-email"
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    className={`w-full px-5 py-3 md:py-4 bg-white border ${formik.touched.email && formik.errors.email
                                        ? 'border-red-500'
                                        : 'border-border'
                                        } text-sm text-primary placeholder:text-lightText focus:outline-none focus:border-primary transition-colors`}
                                    {...formik.getFieldProps('email')}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <p className="text-red-500 text-[9px] uppercase font-bold tracking-wider">
                                        {formik.errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <textarea
                                    id="evo-message"
                                    name="message"
                                    rows="5"
                                    placeholder="Message"
                                    className={`w-full px-5 py-3 md:py-4 bg-white border ${formik.touched.message && formik.errors.message
                                        ? 'border-red-500'
                                        : 'border-border'
                                        } text-sm text-primary placeholder:text-lightText focus:outline-none focus:border-primary transition-all resize-none`}
                                    {...formik.getFieldProps('message')}
                                />
                                {formik.touched.message && formik.errors.message && (
                                    <p className="text-red-500 text-[9px] uppercase font-bold tracking-wider">
                                        {formik.errors.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex items-center gap-2 bg-primary text-white px-6 py-3 md:py-4 text-xs md:text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Inquiry'}
                            </button>
                        </form>
                    </div>

                    {/* Image side */}
                    <div className="w-full lg:w-1/2 hidden lg:block">
                        <img
                            src={contactImg}
                            alt="EO Atelier"
                            className="w-full h-full object-cover"
                            style={{ minHeight: '500px' }}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
