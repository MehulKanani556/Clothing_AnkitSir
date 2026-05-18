import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoArrowUpRight } from "react-icons/go";
import { fetchLookbooks } from '../redux/slice/lookbook.slice';
import fashion from '../assets/images/fashion.jpg';
import fragrance1 from '../assets/images/Fragrance1.jpg';
import cosmetics1 from '../assets/images/Cosmetics1.jpg';
import BagsLuxury1 from '../assets/images/BagsLuxury1.jpg';
import fashion2 from '../assets/images/Fashion2.png';
import BehingTheScene from '../assets/images/BehindtheScenes.png';
import Cosmetic2 from '../assets/images/Cosmetics2.png';
import BehindTheBrand from '../assets/images/BehindtheBrand.jpg';
import Fragrance2 from '../assets/images/Fragrance2.jpg';
import journal1 from '../assets/images/journal1.png';
import journal2 from '../assets/images/journal2.jpg';

const JOURNAL_ARTICLES = [
    {
        id: 1,
        image: fashion,
        productImage: fashion2,
        category: "Fashion",
        subtitle: "5 Wardrobe Essentials for the Elite Traveler.",
        title: "5 Wardrobe Essentials for the Elite Traveler.",
        excerpt: "From the Sovereign Tote to our linen staples, discover the essentials for a seamless transition from the airport to the boardroom.",
        date: "AUGUST 6, 2026",
        isFeatured: true,
        content: [
            {
                type: 'section',
                heading: "1. The Invisible Accessory: How to Match Your Fragrance with Your Outfit.",
                text: "Luxury is more than what you see; it's what you linger in. Understanding the harmony between fabric and fragrance is the final step in mastering your personal aesthetic."
            },
            {
                type: 'section',
                heading: "2. The Sensory Connection",
                text: "Fashion is a visual language, but fragrance is the silent aura that anchors your presence in memory. True style is not just about the silhouette of a garment; it is a multisensory experience. When your attire and your scent are in perfect synchronization, you transcend a mere 'look' and embody an unforgettable identity."
            },
            {
                type: 'section',
                heading: "3. Curating the Senses",
                subHeading: "The Power Suit meets 'Oud Majesty'",
                list: [
                    "Command, Authority, and Sophistication.",
                    "When wearing a sharp blazer or a structured ensemble from The Heritage Collection, you require a scent that is grounded and commanding. The rich, woody depth of Oud complements the crisp lines of formal tailoring, adding a layer of royal prestige to your professional stature."
                ]
            },
            {
                type: 'section',
                subHeading: "The Weekend Ease",
                list: [
                    "Freedom, Freshness, and Relaxation.",
                    "Linen shirts and relaxed loafers demand a scent that breathes. 'Oceanic Mist' provides airy, aquatic notes that mirror the lightness of your casual attire, creating a refreshing atmosphere that feels effortless and refined."
                ]
            },
            {
                type: 'section',
                subHeading: "Midnight Musk",
                list: [
                    "Mystery, Elegance, and Allure.",
                    "For moments defined by silk textures and evening lights, 'Midnight Musk' offers a sensuous appeal. The warm, lingering notes of amber and musk wrap around luxurious fabrics like a second skin, perfect for the most exclusive of nights."
                ]
            },
            {
                type: 'section',
                heading: "4. The Lingering Impression",
                subHeading: "Pulse Point Precision",
                list: [
                    "Apply your fragrance to pulse points before dressing. This allows the scent to develop with your body heat rather than sitting flat on the fabric."
                ]
            },
            {
                type: 'section',
                subHeading: "Fiber Sensitivity",
                list: [
                    "Avoid spraying directly onto delicate fabrics like silk or satin. Instead, spray into the air and walk through the mist for an even, subtle distribution."
                ]
            },
            {
                type: 'section',
                subHeading: "Seasonal Harmony",
                list: [
                    "Align your fragrance weight with your fabric weight. Use light florals and citrus for cotton and linens; switch to spicy, resinous scents for wools and velvets."
                ]
            },
            {
                type: 'section',
                heading: "5. Shop the Duo",
                text: "Elevate your wardrobe with the ultimate pairing:"
            }
        ],
        shopTheDuo: [
            {
                image: fashion2,
                label: "SHOP THE LOOK"
            },
            {
                image: Fragrance2,
                label: "DISCOVER THE SCENT"
            }
        ],
        detailImage: [
            { image: journal1, title: "THE SIGNATURE LOOK" },
            { image: journal2, title: "CRAFTED DETAILS" }
        ]
    },
    {
        id: 2,
        image: fragrance1,
        productImage: Fragrance2,
        category: "Fragrance",
        title: "The Art of Packing Light: A Minimalist's Guide",
        date: "JULY 28, 2026",
        excerpt: "Decoding base notes and essential oils. Understand the craftsmanship behind a parfum that stays with you all day.",
        content: [{ type: 'section', heading: "1. Minimalism in Travel", text: "Packing light is an art form that requires discipline and vision..." }],
        detailImage: [
            { image: journal1, title: "ESSENTIAL PACKING" },
            { image: journal2, title: "MINIMALIST FORMS" }
        ]
    },
    {
        id: 3,
        image: cosmetics1,
        productImage: Cosmetic2,
        category: "Cosmetics",
        title: "Beyond the Seam: The Story of Our Linen",
        date: "AUGUST 2, 2026",
        excerpt: "Learn how to use our Pure Radiance palette to create a flawless, natural look that enhances your skin's health.",
        content: [{ type: 'section', heading: "1. The Origin of Linen", text: "Our linen is sourced from the finest fields in Belgium..." }],
        detailImage: [
            { image: journal1, title: "LINEN TEXTURES" },
            { image: journal2, title: "RADIANCE TECHNIQUES" }
        ]
    },
    {
        id: 4,
        image: BagsLuxury1,
        productImage: BagsLuxury1,
        category: "Bags/Luxury",
        title: "The Evolution of the Satchel: From Utility to Ultimate Luxury.",
        date: "MAY 31, 2026",
        excerpt: "Exploring the history of our hand-stitched leather-work and why a classic bag is a lifelong investment.",
        content: [{ type: 'section', heading: "1. A Timeless Classic", text: "The satchel has evolved from a simple carrier to a luxury statement..." }],
        detailImage: [
            { image: journal1, title: "LEATHER CRAFT" },
            { image: journal2, title: "ETERNAL DESIGN" }
        ]
    },
    {
        id: 5,
        image: fashion2,
        productImage: fashion2,
        category: "Fashion",
        title: "Curating Your Signature Look for 2026.",
        date: "APRIL 28, 2026",
        excerpt: "Fashion trends fade, but style is eternal. We look at the silhouettes and textures defining this year's luxury landscape.",
        content: [{ type: 'section', heading: "1. Defining Your Style", text: "Your signature look is a reflection of your inner self..." }],
        detailImage: [
            { image: journal1, title: "SILHOUETTE ANALYSIS" },
            { image: journal2, title: "TEXTURE HARMONY" }
        ]
    },
    {
        id: 6,
        image: BehingTheScene,
        productImage: BehindTheBrand,
        category: "Behind the Scenes",
        title: "Sourcing the Rare: Inside Our Global Search for Ingredients.",
        date: "MARCH 11, 2026",
        excerpt: "From the flower fields of France to the leather tanneries of Italy—how we bring 'EO' quality to your doorstep.",
        content: [{ type: 'section', heading: "1. The Global Search", text: "We travel the world to find the finest materials for our products..." }],
        detailImage: [
            { image: journal1, title: "RAW MATERIALS" },
            { image: journal2, title: "ARTISANAL SOURCING" }
        ]
    },
];

const JournalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { lookbooks } = useSelector((state) => state.lookbook);
    const article = JOURNAL_ARTICLES.find(a => a.id === parseInt(id)) || JOURNAL_ARTICLES[0];

    // Randomly pick 2 lookbook images each time
    const displayLookbooks = useMemo(() => {
        if (!lookbooks || lookbooks.length === 0) return [];
        const shuffled = [...lookbooks].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2);
    }, [lookbooks]);

    useEffect(() => {
        window.scrollTo(0, 0);
        dispatch(fetchLookbooks());
    }, [id, dispatch]);

    return (
        <div className="min-h-screen bg-white text-dark font-sans">
            <div className="max-w-[1682px] mx-auto px-6 md:px-12 lg:px-20 py-10 pb-20">
                {/* Header */}
                <div className="mb-10 animate-fade-in">
                    <h1 className="text-3xl md:text-5xl lg:text-3xl text-primary font-bold mb-6 tracking-tight leading-[1.1] max-w-4xl">
                        {article?.title}
                    </h1>
                    <p className="text-[11px] md:text-xs font-bold text-lightText uppercase tracking-[0.3em]">
                        {article?.date}
                    </p>
                </div>

                {/* Featured Image */}
                <div className="w-full aspect-[16/9] mb-16 overflow-hidden shadow-sm animate-fade-in">
                    <img
                        src={article?.image}
                        alt={article?.title}
                        className="w-full h-full object-cover transition-transform duration-1000"
                    />
                </div>

                {/* Main Content Area */}
                <div className="">
                    <div className="">
                        {article.content?.map((section, index) => (
                            <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                {section.heading && (
                                    <h2 className="text-md md:text-lg font-bold text-primary mb-2 tracking-tight">
                                        {section?.heading}
                                    </h2>
                                )}

                                {section.subHeading && (
                                    <h3 className="text-sm md:text-base font-bold text-primary mb-2">
                                        {section?.subHeading}
                                    </h3>
                                )}

                                {section.text && (
                                    <p className="text-sm md:text-base text-mainText/80 leading-relaxed font-light mb-2">
                                        {section?.text}
                                    </p>
                                )}

                                {section.list && (
                                    <ul className="space-y-4">
                                        {section?.list.map((item, i) => (
                                            <li key={i} className="text-[13px] md:text-sm text-mainText/70 leading-relaxed flex items-start gap-3">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-lightText/40 shrink-0"></span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {index < article.content.length - 1 && (
                                    <div className="h-px bg-gray-100 w-full my-4 opacity-60"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Dynamic Lookbook Images Section */}
                    {displayLookbooks.length > 0 && (
                        <div className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {displayLookbooks.map((look) => (
                                    <div
                                        key={look._id}
                                        onClick={() => navigate('/lookbook-lpl', { state: { look } })}
                                        className="relative group cursor-pointer overflow-hidden shadow-lg transition-all duration-500"
                                    >
                                        <div className="h-[400px] overflow-hidden w-full">
                                            <img
                                                src={look?.lookImage}
                                                alt={look?.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
                                            />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-primary/95 hover:bg-[#1D5356] backdrop-blur-sm py-5 px-8 flex justify-between items-center text-white transition-colors duration-300">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] line-clamp-1">
                                                    {look?.title}
                                                </span>
                                            </div>
                                            <GoArrowUpRight className="text-xl shrink-0" />
                                        </div>
                                        {/* Static Overlay for Mobile */}
                                        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-primary py-4 px-6 flex justify-between items-center text-white">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                                READ STORY
                                            </span>
                                            <GoArrowUpRight className="text-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* YOU MAY ALSO LIKE Section */}
                    <div className="mt-24">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                                YOU MAY ALSO LIKE
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {JOURNAL_ARTICLES
                                .filter(a => a.id !== article.id)
                                .slice(0, 3)
                                .map((post, index) => (
                                    <div key={index} className="group cursor-pointer">
                                        <div className="relative aspect-[4/3] overflow-hidden mb-6">
                                            <img
                                                src={post?.image}
                                                alt={post?.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white px-3 py-1 text-[10px] font-bold text-dark uppercase tracking-widest">
                                                    {post?.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold text-lightText uppercase tracking-widest">
                                                {post?.date}
                                            </p>
                                            <h3 className="text-lg md:text-xl font-bold text-primary leading-tight line-clamp-2">
                                                {post?.title}
                                            </h3>
                                            <p className="text-sm text-lightText leading-relaxed line-clamp-2 font-light">
                                                {post?.excerpt || "Exploring the history and craftsmanship behind our latest collection and sustainable practices."}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    window.scrollTo(0, 0);
                                                    window.location.href = `/journal/${post?.id}`;
                                                }}
                                                className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-widest pt-2 border-primary/20 hover:gap-4 transition-all"
                                            >
                                                SEE MORE <GoArrowUpRight className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalDetail;
