import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchMainCategories } from '../redux/slice/category.slice';
import { fetchProducts } from '../redux/slice/product.slice';
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import bgImage from '../assets/images/BG.webp';
import manCate from '../assets/images/mancate.webp'
import womenCate from '../assets/images/womancate.webp'
import careCate from '../assets/images/carecate.webp'
import objectCate from '../assets/images/objectcate.webp'
import craft from '../assets/images/craft.webp'
import ex1 from '../assets/images/ex1.webp'
import ex2 from '../assets/images/es2.webp'
import ex3 from '../assets/images/ex3.webp'
import editorial from '../assets/images/editorial.webp'


export default function Home() {
    const dispatch = useDispatch();
    const { mainCategories } = useSelector((state) => state.category);
    const { products, loading } = useSelector((state) => state.product);
    const [activeTab, setActiveTab] = useState(null);
    console.log(products)

    useEffect(() => {
        dispatch(fetchMainCategories());
        dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        // Set first non-Shop category as active when categories are loaded
        if (mainCategories.length > 0 && !activeTab) {
            const firstCategory = mainCategories.find(
                cat => cat.mainCategoryName?.toLowerCase() !== 'shop'
            );
            if (firstCategory) {
                setActiveTab(firstCategory._id);
            }
        }
    }, [mainCategories, activeTab]);

    // Filter products by active main category
    const getProductsByCategory = () => {
        if (!activeTab) return [];

        return products.filter(product => {
            // Check if product's mainCategory matches activeTab
            return product.mainCategory?._id === activeTab || product.mainCategory === activeTab;
        }).slice(0, 4); // Show only first 4 products
    };

    const filteredProducts = getProductsByCategory();

    // Get product image (first image from first variant or default)
    const getProductImage = (product) => {
        if (product.variants && product.variants.length > 0) {
            const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
            if (defaultVariant.images && defaultVariant.images.length > 0) {
                return defaultVariant.images[0];
            }
        }
        return bgImage; // fallback image
    };

    // Get product price (from first variant's first option)
    const getProductPrice = (product) => {
        if (product.variants && product.variants.length > 0) {
            const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
            if (defaultVariant.options && defaultVariant.options.length > 0) {
                return defaultVariant.options[0].price;
            }
        }
        return 0;
    };

    return (
        <>
            {/* Hero Section */}
            <div className="relative h-screen w-full overflow-hidden bg-black">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={bgImage}
                        alt="Fashion Hero"
                        className="h-full w-full object-cover opacity-80"
                    />
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 flex h-full flex-col items-center justify-end pb-10 md:pb-10 px-4 text-center text-white">
                    <div className="max-w-5xl animate-fade-in-up">
                        <p className="mb-4 text-[10px] sm:text-lg font-bold text-border uppercase">
                            OBJECTS OF RARITY - ARCHIVE 01/26
                        </p>
                        <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-7xl leading-[1.1]">
                            SILENCE IS THE ULTIMATE <br className="hidden md:block" /> SOPHISTICATION.
                        </h1>
                        <p className="mx-auto mb-10 text-sm sm:text-lg font-light tracking-wide text-border">
                            Discover the intersection of heritage and contemporary design. Crafted for those who define the moment.
                        </p>

                        <button className="group relative inline-flex items-center space-x-3 bg-primary px-8 py-4 text-[10px] sm:text-lg font-semibold text-white transition-all hover:bg-secondary hover:scale-105 active:scale-95 text-nowrap">
                            <span>VIEW THE LOOKBOOK</span>
                            <HiOutlineArrowUpRight className="text-lg transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* The Signature Collections Section */}
            <section className="bg-white py-24 px-4 md:px-10">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <p className="text-[10px] md:text-base font-semibold tracking-[0.3em] text-mainText uppercase mb-4 animate-fade-in">
                        The Signature Collections
                    </p>
                    <h2 className="text-3xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
                        COMPOSED IN SILENCE
                    </h2>
                    <p className="text-sm md:text-base text-lightText font-light max-w-2xl mx-auto leading-relaxed">
                        A curated balance of form, care, and detail – each expression shaped with intention.
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            title: "Men's Archive",
                            img: manCate,
                            subtitle: "Structured. Intentional.",
                            description: "Tailored silhouettes defined by precision and quiet strength.",
                            buttonText: "EXPLORE"
                        },
                        {
                            title: "Women's Atelier",
                            img: womenCate,
                            subtitle: "Fluid. Defined.",
                            description: "Soft forms shaped with clarity, movement, and understated elegance.",
                            buttonText: "EXPLORE"
                        },
                        {
                            title: "Luxe Care Rituals",
                            img: careCate,
                            subtitle: "Care. refined.",
                            description: "A considered approach to skin where texture, purity, and performance meet.",
                            buttonText: "DISCOVER"
                        },
                        {
                            title: "Objects of Desire",
                            img: objectCate,
                            subtitle: "Detail. perfected.",
                            description: "Elegant pieces elevated through studied proportion, crafted lines.",
                            buttonText: "VIEW"
                        }
                    ].map((collection, index) => (
                        <div key={index} className="group relative aspect-[4/5] overflow-hidden cursor-pointer bg-lightText">
                            <img
                                src={collection.img}
                                alt={collection.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Dark Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Hover Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 px-6">
                                <p className="text-[10px] md:text-lg font-semibold  uppercase mb-3 text-lightText">
                                    {collection.title}
                                </p>
                                <h3 className="text-xl md:text-3xl font-semibold mb-4 tracking-tight">
                                    {collection.subtitle}
                                </h3>
                                <p className="text-xs md:text-base text-lightText font-light mb-6 max-w-xs leading-relaxed">
                                    {collection.description}
                                </p>
                                <button className="group/btn inline-flex items-center gap-2 bg-primary hover:bg-teal-700 px-4 md:px-6 py-2.5 md:py-4 text-xs md:text-base font-semibold uppercase transition-all duration-300">
                                    <span>{collection.buttonText}</span>
                                    <HiOutlineArrowUpRight className="text-sm transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                                </button>
                            </div>

                            {/* Bottom Label (visible when not hovering) */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                <div className="bg-white/95 backdrop-blur-sm py-4 text-center shadow-lg">
                                    <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-primary uppercase">
                                        {collection.title}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>


            {/* CRAFT Section */}
            <section className="bg-white">
                <div className=" ">
                    {/* Top Section - Image and Content Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 ">
                        {/* Left - Image */}
                        <div className="relative  overflow-hidden bg-lightText">
                            <img
                                src={craft}
                                alt="Craft Detail"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Right - Content */}
                        <div className="flex flex-col justify-center space-x-2 lg:space-y-8 px-8 ">
                            <div>
                                <p className="text-[10px] text-center lg:text-left md:text-lg font-semibold tracking-[0.3em] text-mainText uppercase mb-4">
                                    CRAFT
                                </p>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl text-center lg:text-left font-semibold text-primary mb-6 tracking-tight leading-tight">
                                    The Art of Precision
                                </h2>
                                <p className="text-sm md:text-base  text-center md:text-left text-lightText leading-relaxed mb-8 xl:max-w-[75%]">
                                    Every piece begins with intention. From the first sketch to the final stitch, we honor the process—where patience, skill, and purpose converge. This is design as practice. Refinement over rush.
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-gray-200 xl:max-w-[75%]">
                                <div className="space-y-2 p-6 border-b sm:border-r border-gray-200">
                                    <h4 className="text-sm md:text-lg font-semibold text-primary">
                                        Italian Insight
                                    </h4>
                                    <p className="text-xs md:text-base text-lightText leading-relaxed">
                                        Sourced from mills of Italy.
                                    </p>
                                </div>
                                <div className="bg-mainBG space-y-2 p-6 border-b border-gray-200">
                                    <h4 className="text-sm md:text-lg font-semibold text-primary">
                                        Thought construction
                                    </h4>
                                    <p className="text-xs md:text-base text-lightText leading-relaxed">
                                        Patterns built for longevity and form.
                                    </p>
                                </div>
                                <div className="bg-mainBG space-y-2 p-6 sm:border-r border-gray-200">
                                    <h4 className="text-sm md:text-lg font-semibold text-primary">
                                        Refined Finish
                                    </h4>
                                    <p className="text-xs md:text-base text-lightText leading-relaxed">
                                        Hand-finished by skilled artisans.
                                    </p>
                                </div>
                                <div className="space-y-2 p-6">
                                    <h4 className="text-sm md:text-lg font-semibold text-primary">
                                        Slow Luxury
                                    </h4>
                                    <p className="text-xs md:text-base text-lightText leading-relaxed">
                                        Made to last, not to trend.
                                    </p>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className='text-center my-5 lg:text-left lg:mt-0'>
                                <button className="group inline-flex items-center  gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300">
                                    <span>Explore the Process</span>
                                    <HiOutlineArrowUpRight className="text-base transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* ONLY THE ESSENTIAL REMAINS */}
            <section className="bg-mainBG py-8 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    {/* Bottom Section - Philosophy Statement */}
                    <div className="text-center space-y-4 mb-4 md:mb-8">
                        <p className="text-[10px] md:text-lg font-semibold  text-mainText uppercase">
                            THE SIGNATURES HOUSE 2026
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold text-primary tracking-tight  mx-auto leading-tight">
                            ONLY THE ESSENTIAL REMAINS
                        </h2>
                        <p className="text-sm md:text-lg  text-center  text-lightText leading-relaxed mb-8 ">
                            What is left after excess is removed - clarity, purpose, and considered design.
                        </p>
                        <button className="group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300 mt-6">
                            <span>EXPLORE ALL</span>
                            <HiOutlineArrowUpRight className="text-base transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </button>
                        {/* Tab Navigation */}
                        <div className="flex items-center justify-center gap-6 md:gap-12 text-sm md:text-lg pt-4">
                            {mainCategories
                                .filter(category => category.mainCategoryName?.toLowerCase() !== 'shop')
                                .map((category) => (
                                    <button
                                        key={category._id}
                                        onClick={() => setActiveTab(category._id)}
                                        className={`relative pb-2 transition-colors ${activeTab === category._id
                                            ? 'font-bold text-primary border-b-2 border-primary'
                                            : 'font-light text-gray-400 hover:text-primary'
                                            }`}
                                    >
                                        {category.mainCategoryName}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Product Grid */}

                </div>
                {/* product grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide bg-white mx-5">
                    {loading ? (
                        <div className="col-span-full text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-400">Loading products...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index, array) => (
                            <div
                                key={product._id || index}
                                className={`group cursor-pointer border border-border p-4 ${index !== array.length - 1 ? 'border-r-0' : ''
                                    }`}
                            >
                                <div className="relative mb-4 overflow-hidden flex items-center justify-center aspect-square">
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => { e.target.src = bgImage }}
                                    />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="text-xs md:text-lg text-mainText font-semibold leading-snug">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs md:text-lg text-mainText font-normal">
                                        ${getProductPrice(product)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <p>No products available for this category</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Experience Section */}
            <section className="bg-mainBG py-8 md:py-16">
                <div className=" mx-auto px-4 md:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Content */}
                        <div className="lg:col-span-1 flex flex-col justify-center lg:space-y-6">
                            <div>
                                <p className="text-[10px] md:text-lg text-center lg:text-left font-semibold  text-mainText uppercase mb-4">
                                    THE EXPERIENCE
                                </p>
                                <h2 className="custom-heading text-3xl md:text-4xl lg:text-7xl text-center lg:text-left font-bold text-primary mb-6 tracking-tight leading-tight">
                                    EXCLUSIVE <br className='hidden lg:block' />
                                    SHOPPING <br className='hidden lg:block' />
                                    EXPERIENCE
                                </h2>
                                <p className="custom-heading text-sm md:text-lg text-center lg:text-left text-lightText leading-relaxed mb-8">
                                    Discover a refined approach to luxury. From curated selections and rare finds to seamless shopping, every detail is designed to elevate your experience and redefine the integrity of the modern wardrobe.
                                </p>
                            </div>
                            <div className='text-center lg:text-left'>
                                <button className="custom-heading group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300">
                                    <span>EXPLORE THE EXPERIENCE</span>
                                    <HiOutlineArrowUpRight className="text-base transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </button>
                            </div>
                        </div>

                        {/* Right Images Grid */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <div className="group">
                                <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 mb-4">
                                    <img
                                        src={ex1}
                                        alt="Crafted in Limited Form"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base md:text-2xl font-bold text-dark">
                                        1. Crafted in Limited Form
                                    </h3>
                                    <p className="text-xs md:text-lg text-lightText leading-relaxed">
                                        Each piece is produced in small quantities, ensuring exclusivity and value.
                                    </p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="group">
                                <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 mb-4">
                                    <img
                                        src={ex2}
                                        alt="Thoughtfully Curated"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base md:text-2xl font-bold text-dark">
                                        2. Thoughtfully Curated
                                    </h3>
                                    <p className="text-xs md:text-lg text-lightText leading-relaxed">
                                        Every item is selected with intention, designed to work as one.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="group">
                                <div className="relative aspect-[3/4] overflow-hidden bg-gray-200 mb-4">
                                    <img
                                        src={ex3}
                                        alt="Discreetly Delivered"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base md:text-2xl font-bold text-dark">
                                        3. Discreetly Delivered
                                    </h3>
                                    <p className="text-xs md:text-lg text-lightText leading-relaxed">
                                        Packaged with care and delivered with respect and privacy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* EDITORIAL  */}

            <section className="bg-mainBG py-8 md:py-16">
                <div className="text-center space-y-4 mb-4 md:mb-8">
                    <p className="text-[10px] md:text-lg font-semibold  text-mainText uppercase">
                        EDITORIAL
                    </p>
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold text-primary tracking-tight  mx-auto leading-tight uppercase">
                        Beyond What Is Visible.
                    </h2>
                    <p className="text-sm md:text-lg  text-center  text-lightText leading-relaxed mb-8 ">
                        Moments shaped through movement, material, and restraint—where identity exists beyond the surface.
                    </p>
                    <button className="group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300 mt-6">
                        <span>View Lookbook</span>
                        <HiOutlineArrowUpRight className="text-base transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </button>

                    <div className="pt-5">
                        <img
                            src={editorial}
                            alt="Fashion Hero"
                            className="h-full w-full object-cover "
                        />                        
                    </div>
                </div>
            </section>

        </>
    )
}
