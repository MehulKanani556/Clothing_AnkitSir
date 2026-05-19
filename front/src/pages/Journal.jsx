import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fashion from '../assets/images/fashion.jpg';
import fragrance1 from '../assets/images/Fragrance1.jpg';
import cosmetics1 from '../assets/images/Cosmetics1.jpg';
import BagsLuxury1 from '../assets/images/BagsLuxury1.jpg';
import fashion2 from '../assets/images/Fashion2.png';
import BehingTheScene from '../assets/images/BehindtheScenes.png';
import Cosmetic2 from '../assets/images/Cosmetics2.png';
import BehindTheBrand from '../assets/images/BehindtheBrand.jpg';
import Fragrance2 from '../assets/images/Fragrance2.jpg';
import { GoArrowUpRight } from "react-icons/go";
import newsletter from '../assets/images/style.jpg';

const CATEGORIES = ["All Stories", "Fashion", "Fragrance", "Cosmetics", "Behind", "Bags"];

const JOURNAL_ARTICLES = [
    {
        id: 1,
        image: fashion,
        category: "Fashion",
        subtitle: "5 Wardrobe Essentials for the Elite Traveler.",
        title: "FASHION",
        excerpt: "From the Sovereign Tote to our linen staples, discover the essentials for a seamless transition from the airport to the boardroom.",
        date: "July 26, 2026",
        isFeatured: true
    },
    {
        id: 2,
        image: fragrance1,
        category: "Fragrance",
        title: "The Art of Packing Light: A Minimalist's Guide",
        excerpt: "Decoding base notes and essential oils. Understand the craftsmanship behind a parfum that stays with you all day.",
        date: "July 28, 2026",
        isFeatured: false
    },
    {
        id: 3,
        image: cosmetics1,
        category: "Cosmetics",
        title: "Beyond the Seam: The Story of Our Linen",
        excerpt: "Learn how to use our Pure Radiance palette to create a flawless, natural look that enhances your skin's health.",
        date: "August 2, 2026",
        isFeatured: false
    },
    {
        id: 4,
        image: BagsLuxury1,
        category: "Bags",
        title: "5 Hidden Destinations for the Soulful Traveler",
        excerpt: "Exploring the history of our hand-stitched leather-work and why a classic bag is a lifelong investment.",
        date: "August 5, 2026",
        isFeatured: false
    },
    {
        id: 5,
        image: fashion2,
        category: "Fashion",
        title: "Scent and Memory: The Science of Perfume",
        excerpt: "Fashion trends fade, but style is eternal. We look at the silhouettes and textures defining this year's luxury landscape.",
        date: "August 8, 2026",
        isFeatured: false
    },
    {
        id: 6,
        image: BehingTheScene,
        category: "Behind",
        title: "The Clean Beauty Revolution",
        excerpt: "From the flower fields of France to the leather tanneries of Italy—how we bring 'EO' quality to your doorstep.",
        date: "August 12, 2026",
        isFeatured: false
    },
    {
        id: 7,
        image: Cosmetic2,
        category: "Cosmetics",
        title: "The Architecture of the Perfect Tote",
        excerpt: "Precision meets simplicity. How to use our 'Sculpt & Define' range for a sharp, professional look every single morning.",
        date: "August 15, 2026",
        isFeatured: false
    },
    {
        id: 8,
        image: BehindTheBrand,
        category: "Behind",
        title: "The Architecture of the Perfect Tote",
        excerpt: "Precision meets simplicity. How to use our 'Sculpt & Define' range for a sharp, professional look every single morning.",
        date: "August 15, 2026",
        isFeatured: false
    },
    {
        id: 9,
        image: Fragrance2,
        category: "Fragrance",
        title: "The Architecture of the Perfect Tote",
        excerpt: "Precision meets simplicity. How to use our 'Sculpt & Define' range for a sharp, professional look every single morning.",
        date: "August 15, 2026",
        isFeatured: false
    }
];

const Journal = () => {
    const [activeCategory, setActiveCategory] = useState("All Stories");
    const navigate = useNavigate();

    const featuredArticle = JOURNAL_ARTICLES.find(article => article.isFeatured);

    // Filter grid articles based on active category
    const gridArticles = JOURNAL_ARTICLES.filter(article => {
        if (activeCategory === "All Stories") return true;
        if (activeCategory === "Behind the Scenes") return article.category === "Craftsmanship" || article.category === "Sustainability";
        return article.category === activeCategory;
    });

    // Determine if hero should be visible (only for "All Stories" or "Fashion")
    const isHeroVisible = activeCategory === "All Stories" || activeCategory === "Fashion";

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <div className="max-w-[1682px] mx-auto px-6 md:px-12 lg:px-20 py-10 pb-20">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl text-primary mb-4 tracking-tight font-bold">
                        The Journal: Aesthetic & Essence
                    </h1>
                    <p className="text-xs md:text-sm font-bold text-lightText uppercase tracking-[0.2em]">
                        {featuredArticle?.date}
                    </p>
                </div>

                {/* Featured Story Section (Conditionally rendered based on filter) */}
                {isHeroVisible && [featuredArticle].filter(a => a).map((article) => (
                    <div key={article.id} className="relative w-full aspect-[4/5] md:aspect-[21/9] lg:aspect-[2.4/1] overflow-hidden group shadow-sm mb-14 lg:mb-20">
                        <img
                            src={article?.image}
                            alt={article?.title}
                            className="w-full h-[800px] object-cover"
                        />

                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
                            <div className="max-w-2xl">
                                <span className="inline-block text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.2em] mb-3 md:mb-4">
                                    {article?.subtitle}
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-4 md:mb-6">
                                    {article?.title}
                                </h2>
                                <p className="text-xs md:text-sm lg:text-base text-white/90 font-medium leading-relaxed mb-6 md:mb-8 max-w-xl line-clamp-3 md:line-clamp-none">
                                    {article?.excerpt}
                                </p>
                                <button 
                                    onClick={() => navigate(`/journal/${article.id}`)}
                                    className="w-fit bg-white px-6 md:px-8 py-3 md:py-4 flex items-center gap-4 text-dark text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300"
                                >
                                    READ THE STORY
                                    <span className="text-lg">↗</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Grid Section */}
                <div className={isHeroVisible ? "pt-0" : "pt-4"}>
                    <div className="text-center mb-10 lg:mb-16">
                        <p className="text-[11px] lg:text-[13px] uppercase text-[#343A40] font-black mb-4 tracking-widest">
                            ELEMENTS
                        </p>
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#14372F] tracking-tight">
                            Latest News
                        </h2>
                        <p className="text-sm lg:text-base text-[#ADB5BD] mt-4 font-normal">
                            Discover eco-friendly tips, travel inspiration, and the latest trends in sustainable backpacks and accessories.
                        </p>
                    </div>

                    {/* Category Filter Bar */}
                    <div className="border-y border-gray-100 py-6 mb-12 overflow-x-auto scrollbar-hide bg-white/95 backdrop-blur-md z-10 sticky top-[70px]">
                        <div className="flex items-center justify-start md:justify-center gap-8 md:gap-12 whitespace-nowrap px-6 min-w-max">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`text-sm md:text-base transition-all duration-300 ${activeCategory === cat
                                        ? "text-[#14372F] font-bold scale-110"
                                        : "text-[#ADB5BD] font-medium hover:text-[#14372F]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 lg:gap-y-20">
                        {gridArticles.map((article) => (
                            <div key={article.id} className="group cursor-pointer flex flex-col">
                                <div className="h-[300px] md:h-[400px] lg:h-[275px] w-full overflow-hidden mb-6 md:mb-8 relative shadow-sm">
                                    <img
                                        src={article?.image}
                                        alt={article?.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 hover:opacity-90"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-dark uppercase tracking-widest">
                                            {article?.category}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-[#ADB5BD] uppercase tracking-widest mb-2">
                                    {article?.date}
                                </span>
                                <h3 className="text-xl md:text-xl text-primary font-bold mb-3 md:mb-4">
                                    {article?.title}
                                </h3>
                                <p className="text-sm md:text-base text-lightText leading-relaxed mb-6 line-clamp-3">
                                    {article?.excerpt}
                                </p>
                                <button 
                                    onClick={() => navigate(`/journal/${article.id}`)}
                                    className="text-[14px] md:text-[14px] flex items-center gap-2 uppercase text-[#14372F] border-dark/20 pb-1 w-fit"
                                >
                                    see more <GoArrowUpRight className="text-lg" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Section */}
                    <div className="flex flex-col items-center justify-center py-10 gap-6">
                        <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-lightText">
                            {gridArticles.length} / {JOURNAL_ARTICLES.length + 3} stories
                        </span>
                        <button className="px-10 py-4 bg-gray-100 hover:bg-[#14372F] hover:text-white text-dark text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300">
                            SHOW MORE STORIES
                        </button>
                    </div>

                    {/* Membership Section */}
                    <div className="mt-8 lg:mt-16 bg-white flex flex-col-reverse lg:flex-row shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex-1 p-6 md:p-12 lg:p-20 flex flex-col justify-center">
                            <span className="text-[10px] md:text-xs font-bold text-[#6C757D] uppercase tracking-[0.2em] mb-4">
                                Join the inner circle
                            </span>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#14372F] uppercase tracking-tight leading-[1.1] mb-6 md:mb-8">
                                Your Best Style<br />Awaits
                            </h2>
                            <p className="text-sm md:text-base text-[#6C757D] leading-relaxed mb-6 md:mb-10 max-w-lg font-medium">
                                Subscribe to receive exclusive styling tips, early access to new collections, and the latest from The Journal.
                            </p>

                            <div className="space-y-4">
                                <p className="text-[11px] md:text-xs font-bold text-dark uppercase tracking-widest">
                                    Unlock the exclusive inner circle access...
                                </p>
                                <div className="flex flex-col sm:flex-row gap-0 max-w-xl">
                                    <input
                                        type="email"
                                        placeholder="Enter email address"
                                        className="flex-1 px-6 py-4 border border-gray-200 outline-none focus:border-[#14372F] transition-colors text-sm w-full text-blackget"
                                    />
                                    <button className="bg-[#14372F] px-8 py-4 text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#0D241F] transition-all duration-300 w-full sm:w-auto whitespace-nowrap">
                                        Become a Member
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[45%] h-[400px] md:h-[500px] lg:h-auto relative overflow-hidden">
                            <img
                                src={newsletter}
                                alt="Style Inner Circle"
                                className="w-full h-[700px] object-cover grayscale-[20%] hover:scale-105 transition-transform duration-[2s]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Journal;