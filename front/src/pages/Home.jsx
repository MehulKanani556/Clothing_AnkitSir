import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMainCategories } from '../redux/slice/category.slice';
import { fetchProducts } from '../redux/slice/product.slice';
import WishlistButton from '../components/WishlistButton';
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
import men from '../assets/images/men.webp'
import women from '../assets/images/women.webp'
import p1 from '../assets/images/product1.png'
import p2 from '../assets/images/product2.png'
import p3 from '../assets/images/product3.png'
import s1 from '../assets/images/s1.png'
import s2 from '../assets/images/s2.png'
import s3 from '../assets/images/s3.png'
import s4 from '../assets/images/s4.png'
import t1 from '../assets/images/t1.webp'
import t2 from '../assets/images/t2.webp'
import t3 from '../assets/images/t3.webp'
import t4 from '../assets/images/t4.webp'
import philosophy from '../assets/images/philosophy.webp'
import cat1 from '../assets/images/cat1.webp'
import cat2 from '../assets/images/cat2.webp'
import cat3 from '../assets/images/cat3.webp'
import cat4 from '../assets/images/cat4.webp'
import cat5 from '../assets/images/cat5.webp'
import cat6 from '../assets/images/cat6.webp'
import cat7 from '../assets/images/cat7.webp'
import cat8 from '../assets/images/cat8.webp'
import cat9 from '../assets/images/cat9.webp'
import cat10 from '../assets/images/cat10.webp'
import newsletterImg from '../assets/images/newsletter.webp'


export default function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { mainCategories } = useSelector((state) => state.category);
    const { products, loading } = useSelector((state) => state.product);
    const [activeTab, setActiveTab] = useState(null);
    const [selectedHouseProduct, setSelectedHouseProduct] = useState(1);

    const catImages = [
        { image: cat1, name: "Tops", slug: "tops" },
        { image: cat2, name: "Bottoms", slug: "bottoms" },
        { image: cat3, name: "Outerwear", slug: "outerwear" },
        { image: cat4, name: "Dresses", slug: "dresses" },
        { image: null, name: "", slug: "" },
        { image: null, name: "", slug: "" },
        { image: cat5, name: "Accessories", slug: "accessories" },
        { image: cat6, name: "Bags", slug: "bags" },
        { image: null, name: "", slug: "" },
        { image: cat7, name: "Essentials", slug: "essentials" },
        { image: cat8, name: "Footwear", slug: "footwear" },
        { image: null, name: "", slug: "" },
        { image: null, name: "", slug: "" },
        { image: cat9, name: "Skincare", slug: "skincare" },
        { image: cat10, name: "Cosmetics", slug: "cosmetics" }
    ]


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
    
    // Function to navigate to the collection page of the active tab
    const navigateToActiveCategory = () => {
        const activeCat = mainCategories.find(cat => cat._id === activeTab);
        if (activeCat) {
            const slug = activeCat.slug || activeCat.mainCategoryName?.toLowerCase().replace(/\s+/g, '-');
            navigate(`/collection/${slug}`);
        } else {
            navigate('/collection/shop');
        }
    };

    // Get top selling products for "THE HOUSE" section
    const topSellingProducts = products?.slice(0, 3) || [];

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

                        <button 
                            onClick={() => navigate('/lookbook')}
                            className="group relative inline-flex items-center space-x-3 bg-primary px-8 py-4 text-[10px] sm:text-lg font-semibold text-white transition-all hover:bg-secondary hover:scale-105 active:scale-95 text-nowrap"
                        >
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
                            buttonText: "EXPLORE",
                            path: "/collection/men"
                        },
                        {
                            title: "Women's Atelier",
                            img: womenCate,
                            subtitle: "Fluid. Defined.",
                            description: "Soft forms shaped with clarity, movement, and understated elegance.",
                            buttonText: "EXPLORE",
                            path: "/collection/women"
                        },
                        {
                            title: "Luxe Care Rituals",
                            img: careCate,
                            subtitle: "Care. refined.",
                            description: "A considered approach to skin where texture, purity, and performance meet.",
                            buttonText: "DISCOVER",
                            path: "/collection/lux-care"
                        },
                        {
                            title: "Objects of Desire",
                            img: objectCate,
                            subtitle: "Detail. perfected.",
                            description: "Elegant pieces elevated through studied proportion, crafted lines.",
                            buttonText: "VIEW",
                            path: "/collection/accessories"
                        }
                    ].map((collection, index) => (
                        <div 
                            key={index} 
                            onClick={() => navigate(collection.path)}
                            className="group relative aspect-[4/5] overflow-hidden cursor-pointer bg-lightText"
                        >
                            <img
                                src={collection.img}
                                alt={collection?.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Dark Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Hover Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 px-6">
                                <p className="text-[10px] md:text-lg font-semibold  uppercase mb-3 text-lightText">
                                    {collection?.title}
                                </p>
                                <h3 className="text-xl md:text-3xl font-semibold mb-4 tracking-tight">
                                    {collection?.subtitle}
                                </h3>
                                <p className="text-xs md:text-base text-lightText font-light mb-6 max-w-xs leading-relaxed">
                                    {collection?.description}
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
                                <button 
                                    onClick={() => navigate('/craftsmanship')}
                                    className="group inline-flex items-center  gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300"
                                >
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
                        <button 
                            onClick={navigateToActiveCategory}
                            className="group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300 mt-6"
                        >
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
                                key={product.slug || index}
                                onClick={() => navigate(`/product/${product.slug}`)}
                                className={`group cursor-pointer border border-border p-4 ${index !== array.length - 1 ? 'border-r-0' : ''
                                    }`}
                            >
                                <div className="relative mb-4 overflow-hidden flex items-center justify-center aspect-square">
                                    <WishlistButton productId={product._id} />
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
                                <button 
                                    onClick={() => navigate('/philosophy')}
                                    className="custom-heading group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300"
                                >
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
                    <button onClick={() => navigate('/lookbook')} className="group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300 mt-6">
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

            {/* NEW ARRIVALS */}
            <section className="bg-mainBG py-8 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    {/* Bottom Section - Philosophy Statement */}
                    <div className="text-center space-y-4 mb-4 md:mb-8">
                        <p className="text-[10px] md:text-lg font-semibold  text-mainText uppercase">
                            NEW ARRIVALS
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold uppercase text-primary tracking-tight  mx-auto leading-tight">
                            New Forms, Now Available
                        </h2>
                        <p className="text-sm md:text-lg  text-center  text-lightText leading-relaxed mb-8 ">
                            A quiet introduction of new pieces - crafted with the same precision, now available in limited release.
                        </p>
                        <button 
                            onClick={navigateToActiveCategory}
                            className="group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300 mt-6"
                        >
                            <span>VIEW ALL</span>
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
                                    <WishlistButton productId={product._id} />
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

            {/* image Section */}
            <section className="bg-white">
                <div className="">
                    {/* Top Section - Image and Content Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 h-[100vh] lg:h-[80vh]">
                        {/* Left - Image (Men) */}
                        <div className="relative overflow-hidden bg-lightText h-full group">
                            <img
                                src={men}
                                alt="Men's Collection"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 lg:p-8 bg-black/10">
                                <div className=" animate-fade-in-up">
                                    <p className="text-[10px] md:text-lg font-semibold tracking-[0.3em] text-border uppercase mb-4">
                                        MEN
                                    </p>
                                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-border mb-4 md:mb-6  uppercase">
                                        DEFINED IN STRUCTURE
                                    </h2>
                                    <p className="text-sm md:text-lg text-border font-light mb-4 md:mb-8 leading-relaxed">
                                        Tailored silhouettes and refined essentials designed with clarity, strength, and quiet confidence.
                                    </p>
                                    <button 
                                        onClick={() => navigate('/collection/men')}
                                        className="group/btn inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-dark px-4 md:px-6 py-2 md:py-3 text-xs md:text-lg font-semibold uppercase tracking-widest transition-all duration-300"
                                    >
                                        <span><span className="hidden md:inline">EXPLORE THE </span>MEN'S COLLECTION</span>
                                        <HiOutlineArrowUpRight className="text-base transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right - Image (Women) */}
                        <div className="relative overflow-hidden bg-lightText h-full group">
                            <img
                                src={women}
                                alt="Women's Collection"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay Content */}
                            <div className="absolute inset-0 flex flex-col justify-start p-4 md:p-6 lg:p-8">
                                <div className="animate-fade-in-up">
                                    <p className="text-[10px] md:text-lg font-semibold tracking-[0.3em] text-primary uppercase mb-4">
                                        WOMEN
                                    </p>
                                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6 uppercase ">
                                        ELEGANCE,  COMPOSED
                                    </h2>
                                    <p className="text-sm md:text-lg text-dark font-light mb-4 md:mb-8 leading-relaxed">
                                        Elevated pieces shaped through balance, movement, and a considered sense of modern femininity.
                                    </p>
                                    <button 
                                        onClick={() => navigate('/collection/women')}
                                        className="group/btn inline-flex items-center gap-3 bg-[#1a3026] hover:bg-[#254537] text-white px-4 md:px-6 py-2 md:py-3 text-xs md:text-lg font-semibold uppercase tracking-widest transition-all duration-300"
                                    >
                                        <span><span className="hidden md:inline">DISCOVER THE </span>WOMEN'S COLLECTION</span>
                                        <HiOutlineArrowUpRight className="text-base transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SIGNATURES */}
            <section className="bg-mainBG py-8 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    {/* Bottom Section - Philosophy Statement */}
                    <div className="text-center space-y-4 mb-4 md:mb-8">
                        <p className="text-[10px] md:text-lg font-semibold  text-mainText uppercase">
                            SIGNATURES
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold uppercase text-primary tracking-tight  mx-auto leading-tight">
                            Crafted to Be Remembered
                        </h2>
                        <p className="text-sm md:text-lg  text-center  text-lightText leading-relaxed mb-8 ">
                            A considered selection of pieces shaped through precision, material, and enduring design each defined by quiet presence.
                        </p>
                        <button 
                            onClick={navigateToActiveCategory}
                            className="group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300 mt-6"
                        >
                            <span>View All Signature Pieces</span>
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
                                    <WishlistButton productId={product._id} />
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

            {/* ONLY WHAT MATTERS Section */}
            <section className="bg-mainBG">
                <div className="flex flex-col lg:flex-row px-4 md:px-6 lg:px-8">
                    {/* Left side - Content and Product List */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <div className="">
                            <p className="text-[10px] md:text-base text-center lg:text-left font-semibold text-mainText uppercase mb-4">
                                THE HOUSE
                            </p>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl text-center lg:text-left font-bold text-primary mb-4 ">
                                ONLY WHAT MATTERS
                            </h2>
                            <p className="text-sm md:text-lg text-center lg:text-left   text-lightText font-light mb-10 leading-relaxed">
                                A quiet selection of pieces defined by material, proportion, and intent.
                            </p>
                            <div className='text-center lg:text-left'>

                                <button className="group inline-flex items-center gap-3 bg-primary hover:bg-[#254537] text-white  px-6 py-3.5 text-xs md:text-lg font-semibold uppercase tracking-[0.2em] transition-all duration-300 mb-16 lg:mb-20">
                                    <span>VIEW THE PIECES</span>
                                    <HiOutlineArrowUpRight className="text-base transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </button>
                            </div>
                        </div>

                        {/* Product List Overlay Style */}
                        <div className="space-y-0 border-t border-border/50">
                            {topSellingProducts.length > 0 ? (
                                topSellingProducts.map((product, idx) => (
                                    <div
                                        key={product._id || idx}
                                        onMouseEnter={() => setSelectedHouseProduct(idx)}
                                        onClick={() => navigate(`/product/${product.slug}`)}
                                        className={`flex items-center justify-between p-4 md:p-6 bg-mainBG border-b border-border/50 transition-all duration-500 cursor-pointer group/item
                                            ${selectedHouseProduct === idx ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/50'}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-mainBG flex items-center justify-center overflow-hidden p-2">
                                                <img 
                                                    src={getProductImage(product)} 
                                                    alt={product.name} 
                                                    className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/item:scale-110" 
                                                />
                                            </div>
                                            <div>
                                                <h4 className={`text-xs md:text-lg font-semibold transition-colors mb-1 ${selectedHouseProduct === idx ? 'text-primary' : 'text-gray-500'}`}>{product.name}</h4>
                                                <p className="text-[10px] md:text-lg text-lightText">${getProductPrice(product)}</p>
                                            </div>
                                        </div>
                                        {selectedHouseProduct === idx && (
                                            <div className="hidden md:flex items-center gap-2 text-xs md:text-lg font-semibold  text-primary uppercase animate-fade-in">
                                                <span>VIEW PRODUCT</span>
                                                <HiOutlineArrowUpRight className="text-sm" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                [
                                    { name: "Tennis Cotton Crochet Short Sleeve Shirt", price: "540", img: p1 },
                                    { name: "Brown Monogram Weekender", price: "2,495", img: p2 },
                                    { name: "La Premonition Belt", price: "275", img: p3 }
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        onMouseEnter={() => setSelectedHouseProduct(idx)}
                                        className={`flex items-center justify-between p-4 md:p-6 bg-mainBG border-b border-border/50 transition-all duration-500 cursor-pointer group/item
                                            ${selectedHouseProduct === idx ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/50'}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-mainBG flex items-center justify-center overflow-hidden p-2">
                                                <img src={item.img} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/item:scale-110" />
                                            </div>
                                            <div>
                                                <h4 className={`text-xs md:text-lg font-semibold transition-colors mb-1 ${selectedHouseProduct === idx ? 'text-primary' : 'text-gray-500'}`}>{item.name}</h4>
                                                <p className="text-[10px] md:text-lg text-lightText">${item.price}</p>
                                            </div>
                                        </div>
                                        {selectedHouseProduct === idx && (
                                            <div className="hidden md:flex items-center gap-2 text-xs md:text-lg font-semibold  text-primary uppercase animate-fade-in">
                                                <span>VIEW PRODUCT</span>
                                                <HiOutlineArrowUpRight className="text-sm" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right side - Featured Image */}
                    <div className="w-full lg:w-1/2 bg-white flex items-center justify-center  border-l border-border/30">
                        <div className="relative w-full aspect-square max-w-2xl">
                            {topSellingProducts.length > 0 ? (
                                <img
                                    key={selectedHouseProduct}
                                    src={getProductImage(topSellingProducts[selectedHouseProduct] || topSellingProducts[0])}
                                    alt={topSellingProducts[selectedHouseProduct]?.name}
                                    className="w-full h-full object-contain animate-fade-in"
                                />
                            ) : (
                                <img
                                    key={selectedHouseProduct}
                                    src={selectedHouseProduct === 0 ? p1 : selectedHouseProduct === 1 ? p2 : p3}
                                    alt="Featured Product"
                                    className="w-full h-full object-contain animate-fade-in"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Defined Across Form Section */}
            <section className="bg-mainBG">
                <div className="flex flex-col lg:flex-row px-4 md:px-6 lg:px-8">
                    {/* left side - Featured Image */}
                    <div className="w-full lg:w-1/2  flex items-center justify-center  border-l border-border/30">
                        <div className="relative w-full aspect-square">
                            <img
                                key={selectedHouseProduct}
                                src={selectedHouseProduct === 0 ? s1 : selectedHouseProduct === 1 ? s2 : selectedHouseProduct === 2 ? s3 : s4}
                                alt="Featured Product"
                                className="w-full h-full object-contain animate-fade-in"
                            />
                        </div>
                    </div>
                    {/* Right side - Content and Product List */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center p-4 md:p-8">
                        <div className="">
                            <p className="text-[10px] md:text-base text-center lg:text-left font-semibold text-mainText uppercase mb-4">
                                Each Collection, A Perspective
                            </p>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl text-center lg:text-left font-bold text-primary mb-4 ">
                                DEFINED ACROSS FORM
                            </h2>
                            <p className="text-sm md:text-lg text-center lg:text-left   text-lightText font-light mb-10 leading-relaxed">
                                Each series explores a distinct mood shaped through material, tone, and environment, forming collections that exist beyond season.
                            </p>
                            <div className='text-center lg:text-left'>

                                <button 
                                    onClick={() => navigate('/lookbook')}
                                    className="group inline-flex items-center gap-3 bg-primary hover:bg-[#254537] text-white  px-6 py-3.5 text-xs md:text-lg font-semibold uppercase tracking-[0.2em] transition-all duration-300 mb-16 lg:mb-20"
                                >
                                    <span>VIEW ALL COLLECTIONS</span>
                                    <HiOutlineArrowUpRight className="text-base transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </button>
                            </div>
                        </div>

                        {/* Product List Overlay Style */}
                        <div className="space-y-0 border-t border-border/50 ">
                            {[
                                { name: "The Deep Forest Series", description: "Earth tones and textured forms inspired by depth and stillness.", img: s1 },
                                { name: "The Silent Coast", description: "Light silhouettes shaped by air, space, and movement.", img: s2 },
                                { name: "Midnight Structure", description: "Dark palettes with precise, structured detailing.", img: s3 },
                                { name: "Soft Rituals", description: "Dark palettes with precise, structured detailing.", img: s4 }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    onMouseEnter={() => setSelectedHouseProduct(idx)}
                                    className={`flex items-center justify-between p-4 md:p-6 bg-mainBG border-b border-border/50 transition-all duration-500 cursor-pointer group/item
                                        ${selectedHouseProduct === idx ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/50'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <h4 className={`text-xs md:text-lg font-semibold transition-colors mb-1 text-dark`}>{item.name}</h4>
                                            <p className="text-[10px] md:text-lg text-lightText">{item.description}</p>
                                        </div>
                                    </div>
                                    {selectedHouseProduct === idx && (
                                        <div className="hidden md:flex items-center gap-2 text-xs md:text-lg font-semibold  text-primary uppercase animate-fade-in">
                                            <span>Explore</span>
                                            <HiOutlineArrowUpRight className="text-sm" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </section>

            {/* FEATURED */}
            <section className="bg-mainBG py-8 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    {/* Bottom Section - Philosophy Statement */}
                    <div className="text-center space-y-4 mb-4 md:mb-8">
                        <p className="text-[10px] md:text-lg font-semibold  text-mainText uppercase">
                            FEATURED
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold uppercase text-primary tracking-tight  mx-auto leading-tight">
                            Nothing Unnecessary
                        </h2>
                        <p className="text-sm md:text-lg  text-center  text-lightText leading-relaxed mb-8 ">
                            A refined balance of structure and function crafted with precision and designed for everyday movement.
                        </p>
                        <button 
                            onClick={navigateToActiveCategory}
                            className="group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300 mt-6"
                        >
                            <span>View Products</span>
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
                                    <WishlistButton productId={product._id} />
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

            {/*Defined by Texture Section */}
            <section className="bg-mainBG py-24 px-4 md:px-10">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <p className="text-[10px] md:text-base font-semibold tracking-[0.3em] text-mainText uppercase mb-4 animate-fade-in">
                        ELEMENTS
                    </p>
                    <h2 className="text-3xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
                        Defined by Texture
                    </h2>
                    <p className="text-sm md:text-base text-lightText font-light max-w-2xl mx-auto leading-relaxed">
                        From fabric to formulation, every surface is chosen for its character and feel.
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            title: "Linen Blend",
                            img: t1,
                            subtitle: "Structured. Intentional.",
                            description: "Tailored silhouettes defined by precision and quiet strength.",
                            buttonText: "EXPLORE"
                        },
                        {
                            title: "Textured Cotton",
                            img: t2,
                            subtitle: "Fluid. Defined.",
                            description: "Soft forms shaped with clarity, movement, and understated elegance.",
                            buttonText: "EXPLORE"
                        },
                        {
                            title: "Refined Leather",
                            img: t3,
                            subtitle: "Care. refined.",
                            description: "A considered approach to skin where texture, purity, and performance meet.",
                            buttonText: "DISCOVER"
                        },
                        {
                            title: "Skin Formulations",
                            img: t4,
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

                            {/* Bottom Label (visible when not hovering) */}


                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] opacity-100 transition-opacity duration-300">
                                <div className="text-mainBG py-4 text-center ">
                                    <span className="text-base md:text-3xl font-semibold">
                                        {collection.title}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PHILOSOPHY Section */}
            <section className="bg-mainBG">
                <div className="flex flex-col lg:flex-row min-h-screen lg:h-[90vh]">
                    {/* Left - Image Source could be editorial or similar high-fashion portrait */}
                    <div className="w-full lg:w-1/2 relative overflow-hidden bg-lightText">
                        <img
                            src={philosophy}
                            alt="Brand Philosophy"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Right - Content */}
                    <div className="w-full lg:w-1/2 bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-center">
                        <div className="">
                            <p className="text-[10px] md:text-lg text-center lg:text-left font-semibold text-mainText uppercase mb-4 md:mb-6">
                                PHILOSOPHY
                            </p>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl text-center lg:text-left font-bold text-primary mb-4 md:mb-6 ">
                                Nothing Without Purpose
                            </h2>
                            <p className="text-sm md:text-lg text-center lg:text-left text-lightText font-light mb-4 md:mb-10  ">
                                Each piece is shaped through clarity of form and a deliberate reduction of excess—where material, proportion, and purpose remain.
                            </p>

                            {/* Features List */}
                            <div className="space-y-0 border border-border/30 mb-10">
                                {[
                                    {
                                        title: "Clarity Over Noise",
                                        desc: "Every decision is reduced to what truly matters, removing the unnecessary to preserve focus and meaning."
                                    },
                                    {
                                        title: "Timeless Perspective",
                                        desc: "Designed beyond seasons and trends, each piece exists with a sense of continuity and longevity."
                                    },
                                    {
                                        title: "Considered Presence",
                                        desc: "An approach that values subtle impact where form, space, and restraint shape the overall experience."
                                    },
                                    {
                                        title: "Measured Evolution",
                                        desc: "The brand evolves with intention refining over time rather than following constant change."
                                    }
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-6 md:p-8 transition-colors ${idx % 2 === 0 ? 'bg-mainBG' : 'bg-white'}`}
                                    >
                                        <h4 className="text-sm md:text-lg font-bold text-primary mb-2">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs md:text-base text-lightText font-light ">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className='text-center lg:text-left'>

                                <button onClick={() => navigate('/philosophy')} className="group inline-flex items-center gap-3 bg-primary hover:bg-[#254537] text-white px-6 py-3 text-xs md:text-lg font-semibold uppercase transition-all duration-300">
                                    <span>ABOUT OUR BRAND</span>
                                    <HiOutlineArrowUpRight className="text-base transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Considered Together */}
            <section className="bg-mainBG py-8 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    {/* Bottom Section - Philosophy Statement */}
                    <div className="text-center space-y-4 mb-4 md:mb-8">
                        <p className="text-[10px] md:text-lg font-semibold  text-mainText uppercase">
                            SELECTION
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold uppercase text-primary tracking-tight  mx-auto leading-tight">
                            Considered Together
                        </h2>
                        <p className="text-sm md:text-lg  text-center  text-lightText leading-relaxed mb-8 ">
                            Pieces brought together through balance, proportion, and intent.
                        </p>
                        <button 
                            onClick={navigateToActiveCategory}
                            className="group inline-flex items-center gap-2 bg-primary hover:bg-teal-800 text-white px-6 py-3.5 text-xs md:text-lg font-semibold tracking-wider uppercase transition-all duration-300 mt-6"
                        >
                            <span>View all</span>
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
                                    <WishlistButton productId={product._id} />
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

            {/* Shop by Category Grid */}
            <section className="bg-white py-16 lg:py-24">
                <div className="mx-5">                

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-t gap-4 border-l border-border">
                        {catImages.map((item, index) => (
                            <div 
                                key={index} 
                                onClick={() => item.slug && navigate(`/collection/shop/${item.slug}`)}
                                className={`relative aspect-square group overflow-hidden bg-white  flex items-center justify-center transition-all duration-700
                                    ${!item.image ? 'hidden md:flex bg-mainBG/30' : 'cursor-pointer'}
                                  `}
                            >
                                {item.image ? (
                                    <>
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-100 group-hover:scale-105"
                                        />
                                        {/* Subtle Darkening Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                                        
                                        {/* Hover Label */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                            <div className="px-5 py-2.5 flex items-center gap-2 shadow-sm">
                                                <span className="text-[10px] md:text-2xl font-bold tracking-[0.2em] text-white uppercase">
                                                    {item.name}
                                                </span>                                              
                                            </div>
                                        </div>                                      
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 text-center opacity-20">
                                       
                                        
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ACCESS WITHOUT EXCESS Section */}
            <section className="bg-mainBG py-16 lg:py-24 border-t border-border/30">
                <div className="mx-auto px-4 md:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Left Column */}
                        <div className="flex flex-col justify-between">
                            <div className="space-y-6">
                                <p className="text-[10px] md:text-lg text-center lg:text-left font-semibold  text-mainText uppercase">
                                    A MORE PRIVATE RELATIONSHIP
                                </p>
                                <h2 className="text-3xl md:text-6xl text-center lg:text-left font-bold text-primary uppercase ">
                                    ACCESS WITHOUT  EXCESS
                                </h2>
                                <p className="text-sm md:text-lg text-center lg:text-left text-lightText font-light  leading-relaxed">
                                    A quieter way to stay connected where new releases, refined selections, and updates are shared with intention, not frequency.
                                </p>
                                
                                <div className="pt-8 space-y-4">
                                    <p className="text-sm md:text-lg font-semibold text-mainText">
                                        Receive early access to new collections and considered updates.
                                    </p>
                                    <div className="flex max-w-md">
                                        <input 
                                            type="email" 
                                            placeholder="Enter email address" 
                                            className="flex-1 border border-border px-4 py-3 text-xs md:text-lg focus:outline-none focus:border-primary bg-white/50"
                                        />
                                        <button className="bg-primary text-white px-8 py-3 text-xs md:text-lg font-bold  uppercase hover:bg-primary transition-colors">
                                            ACCESS
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-sm md:text-lg text-gray-600 font-light leading-relaxed ">
                                    Removed from <span className="font-bold text-primary">noise</span> and <span className="font-bold text-primary">excess</span>, this space is shaped for a more <span className="font-bold text-primary">considered experience</span> where access feels <span className="font-bold text-primary">personal</span>, timing remains <span className="font-bold text-primary">deliberate</span>, and every detail reflects a deeper sense of <span className="font-bold text-primary">refinement</span>. Here, what is shared is not frequent, but <span className="font-bold text-primary">meaningful</span>, allowing each release to be experienced with clarity, presence, and lasting value.
                                </p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4 md:space-y-12">
                            <div className="aspect-[16/7] overflow-hidden grayscale-[0.1] contrast-[1.05]">
                                <img 
                                    src={newsletterImg} 
                                    alt="Access Without Excess" 
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="space-y-4 md:space-y-8">
                                <h3 className="text-base md:text-2xl font-bold  text-primary uppercase">
                                    WHAT YOU RECEIVE
                                </h3>
                                <div className="divide-y divide-border/50 border-t border-border/50">
                                    <div className="py-2 md:py-6">
                                        <p className="text-sm md:text-lg font-semibold text-mainText">New releases shared before public availability.</p>
                                    </div>
                                    <div className="py-2 md:py-6">
                                        <p className="text-sm md:text-lg font-semibold text-mainText">Occasional communication, considered and relevant.</p>
                                    </div>
                                    <div className="py-2 md:py-6">
                                        <p className="text-sm md:text-lg font-semibold text-mainText">Occasional communication, considered and relevant.</p>
                                    </div>
                                    <div className="pt-2 md:pt-6 border-b border-border/50">
                                        <p className="text-sm md:text-lg font-semibold text-mainText">Collections presented with focus and clarity.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}
