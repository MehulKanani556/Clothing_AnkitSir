import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import careImage from '../assets/images/careguide.webp';
import careguide1 from '../assets/images/Care Guide1.webp';
import careguide2 from '../assets/images/Care Guide2.webp';
import careguide3 from '../assets/images/Care Guide3.webp';
import careguide4 from '../assets/images/Care Guide4.webp';
import careguide5 from '../assets/images/Care Guide5.webp';
import careguide6 from '../assets/images/Care Guide6.webp';
import { PiArrowUpRightBold } from "react-icons/pi";

const categories = [
    {
        id: 1,
        icon: careguide1,
        title: 'READY-TO-WEAR',
        description:
            'EO garments are fashioned from heritage fabrics defined by minimalist silhouettes. Our guide offers specific protocols for preserving the hand-feel of our structured wools, fluid silks, and technical Japanese denims.',
    },
    {
        id: 2,
        icon: careguide2,
        title: 'OBJECTS & CARRYALLS',
        description:
            'Our bags are the result of precision craftsmanship and sensory materials. This guide is tailored to help you maintain the "EO" patina, ensuring your leather goods remain supple and resilient against the elements.',
    },
    {
        id: 3,
        icon: careguide3,
        title: 'ACCESSORIES & JEWELRY',
        description:
            'EO jewelry requires mindful care to safeguard our hand-polished finishes and galvanized metals. Learn the daily essential practices for cleaning precious crystals and preventing oxidation on matte metal elements.',
    },
    {
        id: 4,
        icon: careguide4,
        title: 'HOME & LIFESTYLE',
        description:
            'For the items that define your space. Our care protocols for EO robes, towels, and home textiles focus on maintaining hygroscopic properties and soft-hand feel over years of use.',
    },
    {
        id: 5,
        icon: careguide5,
        title: 'OLFACTORY OBJECTS',
        description:
            'EO fragrances are complex molecular compositions designed to evolve on the skin. This guide provides the protocols necessary to safeguard the volatility of the top notes and the depth of the base, ensuring your scent remains true to its original formulation.',
    },
    {
        id: 6,
        icon: careguide6,
        title: 'THE LUXE CARE SUITE',
        description:
            'A specialized category for our proprietary care products. From botanical mists for technical fabrics to pH-neutral cleansers for delicate knits, discover the tools designed specifically for your EO collection.',
    },
];

function CategoryCard({ category }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="group bg-white p-6 md:p-8 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 border border-transparent hover:border-border/50">
            <div className="mb-5 transition-transform duration-500 group-hover:scale-110">
                <img src={category.icon} alt={category.title} className='h-20 w-20 object-contain' />
            </div>
            <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-primary mb-3">
                {category.title}
            </h3>
            <p className="text-xs md:text-sm text-lightText font-medium leading-relaxed mb-4">
                {expanded ? category.description : category.description.slice(0, 100) + (category.description.length > 100 ? '...' : '')}
            </p>
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs md:text-sm uppercase tracking-widest text-lightText font-medium transition-all group-hover:text-primary mt-auto"
            >
                {expanded ? 'Less' : 'More'}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
                >
                    <path d="M2 4 L6 8 L10 4" />
                </svg>
            </button>
        </div>
    );
}

export default function CareGuide() {
    const navigate = useNavigate();

    return (
        <div className="bg-mainBG min-h-screen pt-12 pb-12 px-6 md:px-10 font-urbanist">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-4 md:mb-10">
                    <h1 className="text-[20px] md:text-[28px] lg:text-[32px] text-primary font-semibold">
                        The Care Guide
                    </h1>
                </div>

                {/* Subtitle */}
                <h2 className="text-sm md:text-base font-bold uppercase tracking-widest text-mainText mb-1">
                    Preservation &amp; Longevity
                </h2>
                <p className="text-xs md:text-sm text-lightText font-medium mb-8 md:mb-10">
                    An EO object is designed to last a lifetime. To maintain the structural integrity, texture, and color of your garments, we recommend the following preservation rituals.
                </p>

                {/* Category Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-4 md:mb-10">
                    {categories.map((cat) => (
                        <CategoryCard key={cat.id} category={cat} />
                    ))}
                </div>

                {/* Specialist Advice Section */}
                <div className="mb-4 md:mb-10">
                    <h2 className="text-[20px] md:text-[28px] lg:text-[32px] font-semibold uppercase text-primary mb-6 md:mb-8">
                        THE "EO" SPECIALIST ADVICE
                    </h2>

                    <div className="flex flex-col lg:flex-row gap-0">
                        {/* Image */}
                        <div className="w-full lg:w-1/2">
                            <img
                                src={careImage}
                                alt="EO Specialist"
                                className="w-full h-64 lg:h-full object-cover"
                            />
                        </div>

                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 py-6 lg:px-10 flex flex-col justify-between">
                            <div>
                                <p className="text-sm md:text-base font-medium text-primary mb-2">
                                    EOs
                                </p>
                                <p className="text-xs md:text-sm text-lightText font-medium leading-relaxed mb-2">
                                    If a garment sustains significant damage or requires deep cleaning, we strongly advise against domestic treatment. Please consult the inner care label or entrust the object to a specialist cleaning service.
                                </p>

                                <div className="space-y-2">
                                    <div>
                                        <h4 className="text-sm md:text-base font-medium text-primary mb-2">
                                            The Directive
                                        </h4>
                                        <p className="text-xs md:text-sm text-lightText font-medium leading-relaxed">
                                            Features a high-contrast macro photo of a damaged silk fabric, framed within a circular 'Warning' graphic. The text underneath clearly separates the standard rule from the alternative.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm md:text-base font-medium text-primary mb-2">
                                            The Concierge Atelier
                                        </h4>
                                        <p className="text-xs md:text-sm text-lightText font-medium leading-relaxed">
                                            Visualizes the expert advice by focusing on a close-up of a master tailor's hands, wearing white cotton gloves, carefully examining an intricate piece of vintage lace.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="mt-8">
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="flex items-center gap-2 bg-primary text-white px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold uppercase hover:bg-primary/90 active:scale-[0.98] transition-all"
                                >
                                    Our Concierge Atelier
                                    <PiArrowUpRightBold className='text-lg' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
