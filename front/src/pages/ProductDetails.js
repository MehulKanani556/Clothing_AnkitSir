import React, { useState, useRef, useEffect } from 'react';
import { IoHeartOutline, IoShareSocialOutline, IoChevronUp, IoChevronDown } from "react-icons/io5";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import Header from '../components/Header';
import ColorSidebar, { COLOR_VARIANTS } from '../components/ColorSidebar';
import SizeSidebar from '../components/SizeSidebar';
import { MdKeyboardArrowRight } from 'react-icons/md';

// Sample product images - replace with actual product images
const PRODUCT_IMAGES = [
    {
        id: 1,
        src: "/images/product.png",
        alt: "Black & Green Striped Crochet Shorts - Main View",
        type: "main"
    },
    {
        id: 2,
        src: "/images/product.png", // Replace with actual front view image when available
        alt: "Black & Green Striped Crochet Shorts - Front View",
        type: "front"
    },
    {
        id: 3,
        src: "/images/product.png", // Replace with actual back view image when available
        alt: "Black & Green Striped Crochet Shorts - Back View",
        type: "back"
    },
    {
        id: 4,
        src: "/images/product.png", // Replace with actual detail view image when available
        alt: "Black & Green Striped Crochet Shorts - Detail View",
        type: "detail"
    },
    {
        id: 5,
        src: "/images/product.png", // Replace with actual close-up image when available
        alt: "Black & Green Striped Crochet Shorts - Close-up View",
        type: "closeup"
    }
];

// WEAR IT WITH products
const WEAR_IT_WITH_PRODUCTS = [
    {
        id: 1,
        name: "Stripe Crochet Short Sleeve Shirt",
        price: "$685",
        image: "/images/product.png",
        alt: "Stripe Crochet Short Sleeve Shirt"
    },
    {
        id: 2,
        name: "Tennis Bouclé Shorts",
        price: "$570",
        image: "/images/product.png",
        alt: "Tennis Bouclé Shorts"
    },
    {
        id: 3,
        name: "Tennis Crochet Shorts",
        price: "$480",
        image: "/images/product.png",
        alt: "Tennis Crochet Shorts"
    },
    {
        id: 4,
        name: "Motif Crochet Shorts",
        price: "$300",
        image: "/images/product.png",
        alt: "Motif Crochet Shorts"
    }
];

// SIGNATURE SUGGESTIONS products
const SIGNATURE_PRODUCTS = [
    {
        id: 1,
        name: "Green Monogram Weekender Bag",
        price: "$2,495",
        image: "/images/product.png",
        alt: "Green Monogram Weekender Bag"
    },
    {
        id: 2,
        name: "Black Monogram Weekender Bag",
        price: "$2,495",
        image: "/images/product.png",
        alt: "Black Monogram Weekender Bag"
    },
    {
        id: 3,
        name: "Paris Store Weekender",
        price: "$2,495",
        image: "/images/product.png",
        alt: "Paris Store Weekender"
    },
    {
        id: 4,
        name: "Brown Monogram Weekender",
        price: "$2,495",
        image: "/images/product.png",
        alt: "Brown Monogram Weekender"
    },
    {
        id: 5,
        name: "Tennis Collar Crochet Short Sleeve Shirt",
        price: "$685",
        image: "/images/product.png",
        alt: "Tennis Collar Crochet Short Sleeve Shirt"
    },
    {
        id: 6,
        name: "Tennis Collar Crochet Shorts",
        price: "$570",
        image: "/images/product.png",
        alt: "Tennis Collar Crochet Shorts"
    },
    {
        id: 7,
        name: "Stripe Racket Knit Polo Shirt",
        price: "$875",
        image: "/images/product.png",
        alt: "Stripe Racket Knit Polo Shirt"
    },
    {
        id: 8,
        name: "Stripe Racket Golf Trousers",
        price: "$740",
        image: "/images/product.png",
        alt: "Stripe Racket Golf Trousers"
    },
    {
        id: 9,
        name: "Green Cropped Knit Polo Shirt",
        price: "$875",
        image: "/images/product.png",
        alt: "Green Cropped Knit Polo Shirt"
    },
    {
        id: 10,
        name: "Green Pleated Knit Mini Skirt",
        price: "$685",
        image: "/images/product.png",
        alt: "Green Pleated Knit Mini Skirt"
    },
    {
        id: 11,
        name: "Green Pleated Halter Mini Dress",
        price: "$1,240",
        image: "/images/product.png",
        alt: "Green Pleated Halter Mini Dress"
    },
    {
        id: 12,
        name: "Green Cropped Short Sleeve Polo Shirt",
        price: "$875",
        image: "/images/product.png",
        alt: "Green Cropped Short Sleeve Polo Shirt"
    }
];

const ProductDetails = () => {
    const [colorSidebarOpen, setColorSidebarOpen] = useState(false);
    const [sizeSidebarOpen, setSizeSidebarOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(COLOR_VARIANTS[2]); // Default: Black
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const sliderRef = useRef(null);

    const handleSelectVariant = (variant) => {
        setSelectedVariant(variant);
        setColorSidebarOpen(false);
    };

    const handleSelectSize = (size) => {
        setSelectedSize(size);
        setSizeSidebarOpen(false);
    };

    // Navigate to specific image
    const goToImage = (index) => {
        if (index >= 0 && index < PRODUCT_IMAGES.length) {
            setCurrentImageIndex(index);
            if (sliderRef.current) {
                const imageHeight = sliderRef.current.clientHeight;
                sliderRef.current.scrollTo({
                    top: index * imageHeight,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Navigate to next image
    const nextImage = () => {
        const nextIndex = (currentImageIndex + 1) % PRODUCT_IMAGES.length;
        goToImage(nextIndex);
    };

    // Navigate to previous image
    const prevImage = () => {
        const prevIndex = currentImageIndex === 0 ? PRODUCT_IMAGES.length - 1 : currentImageIndex - 1;
        goToImage(prevIndex);
    };

    // Handle scroll to update current image index
    const handleScroll = () => {
        if (sliderRef.current) {
            const scrollTop = sliderRef.current.scrollTop;
            const imageHeight = sliderRef.current.clientHeight;
            const newIndex = Math.round(scrollTop / imageHeight);
            if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < PRODUCT_IMAGES.length) {
                setCurrentImageIndex(newIndex);
            }
        }
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                prevImage();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                nextImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentImageIndex]);

    // Handle wheel event to control image scrolling
    React.useEffect(() => {
        const handleWheel = (e) => {
            const rightColumn = document.querySelector('.product-details-container');

            if (!rightColumn) return;

            // Check if cursor is over right column only
            const rightColumnRect = rightColumn.getBoundingClientRect();
            const isOverRightColumn = (
                e.clientX >= rightColumnRect.left &&
                e.clientX <= rightColumnRect.right &&
                e.clientY >= rightColumnRect.top &&
                e.clientY <= rightColumnRect.bottom
            );

            if (isOverRightColumn) {
                // Check if we're at the boundaries
                const isAtFirstImage = currentImageIndex === 0;
                const isAtLastImage = currentImageIndex === PRODUCT_IMAGES.length - 1;

                if (e.deltaY < 0 && isAtFirstImage) {
                    return;
                } else if (e.deltaY > 0 && isAtLastImage) {
                    return;
                }

                // Otherwise, control image navigation
                e.preventDefault();
                if (e.deltaY > 0 && !isAtLastImage) {
                    nextImage();
                } else if (e.deltaY < 0 && !isAtFirstImage) {
                    prevImage();
                }
            }
        };

        // Add wheel event listener to the entire document
        document.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            document.removeEventListener('wheel', handleWheel);
        };
    }, [currentImageIndex]);

    return (
        <div className="w-full bg-[#F8F9FA] font-sans text-dark selection:bg-dark selection:text-white">
            <Header />

            {/* Main Product Section */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2">
                {/* Left Column: Vertical Image Slider */}
                <div className="image-scroll-container relative h-screen overflow-hidden bg-gray-50/20">
                    {/* Image Slider */}
                    <div
                        ref={sliderRef}
                        className="h-full overflow-y-auto custom-scrollbar snap-y snap-mandatory"
                        onScroll={handleScroll}
                    >
                        <div className="flex flex-col">
                            {PRODUCT_IMAGES.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="w-full h-screen bg-white flex items-center justify-center flex-shrink-0 snap-start"
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Indicators */}
                    <div className="absolute left-4 bottom-4 flex flex-col gap-3 z-10">
                        {PRODUCT_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                                    ? 'bg-black shadow-lg scale-110'
                                    : 'hover:scale-105'
                                    }`}
                                style={{
                                    backgroundColor: index === currentImageIndex ? '#000000' : '#ADB5BD'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Content Area */}
                <div className="product-details-container h-screen flex flex-col items-center justify-center p-8 md:p-16 lg:p-18 xl:p-20 sticky top-0">
                    <div className="max-w-xl w-full flex flex-col">
                        {/* Top Navigation Row */}
                        <div className="flex items-center justify-between mb-10 lg:mb-12">
                            <button className="flex items-center gap-3 text-[13px] font-bold text-dark transition-all group uppercase tracking-widest">
                                <SlArrowLeft color='black' size={15} />
                                <span>Men's Shirt</span>
                            </button>
                            <div className="flex items-center gap-6">
                                <button className="text-dark/80 hover:text-dark hover:scale-110 transition-all outline-none">
                                    <IoHeartOutline size={22} />
                                </button>
                                <button className="text-dark/80 hover:text-dark hover:scale-110 transition-all outline-none">
                                    <IoShareSocialOutline size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Product Title & Info Section */}
                        <div className="text-center mb-10 lg:mb-10">
                            <span className="text-[13px] uppercase text-lightText font-black mb-6 block">
                                New Arrivals
                            </span>
                            <h1 className="text-3xl lg:text-2xl xl:text-3xl font-medium mb-4 text-dark tracking-tight leading-[1.1] selection:bg-dark selection:text-white">
                                Black & Green Striped Crochet Shorts
                            </h1>
                            <p className="text-xl lg:text-2xl text-dark/90 font-light tracking-wide">
                                $911.00
                            </p>
                        </div>

                        {/* Customization Selectors Section */}
                        <div className="flex flex-col items-center gap-4 mb-10 lg:mb-14">
                            {/* ── Color Button ── */}
                            <button
                                onClick={() => setColorSidebarOpen(true)}
                                className="flex items-center gap-3 group outline-none hover:opacity-70 transition-opacity"
                            >
                                <span className="text-[18px] lg:text-[14px] text-lightText font-normal">Color:</span>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-[2px] border border-black/10"
                                        style={{ backgroundColor: selectedVariant.hex }}
                                    />
                                    <span className="text-[18px] lg:text-[15px] text-dark font-normal">
                                        {selectedVariant.color}
                                    </span>
                                </div>
                                <MdKeyboardArrowRight />
                            </button>

                            <button 
                                onClick={() => setSizeSidebarOpen(true)}
                                className="flex items-center gap-3 group outline-none hover:opacity-70 transition-opacity"
                            >
                                <span className="text-[18px] lg:text-[15px] text-lightText font-normal">Size:</span>
                                <span className="text-[18px] lg:text-[15px] text-dark font-normal">
                                    {selectedSize || 'Select size'}
                                </span>
                                <MdKeyboardArrowRight />
                            </button>
                        </div>

                        {/* Add to Cart CTA */}
                        <button className="w-full py-2 lg:py-4 bg-[#14372F] text-white font-black text-[13px] lg:text-[14px] tracking-[0.25em] uppercase shadow-sm mb-6 lg:mb-8 outline-none">
                            Select Size
                        </button>

                        {/* Product Footer Links */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4 pt-8 lg:pt-10">
                            {['Product Details', 'Size Guide', 'Delivery & Returns'].map((link) => (
                                <button key={link} className="flex items-center gap-2 text-[9px] lg:text-[16px] font-black transition-all group outline-none" style={{ fontWeight: "500" }}>
                                    {link}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-lightText group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* WEAR IT WITH Section */}
            <div className="w-full bg-gray-50/30 py-16 lg:py-20">
                <div className=" mx-auto px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12 lg:mb-16">
                        <p className="text-[11px] lg:text-[13px] uppercase text-[#343A40] font-black mb-4 tracking-widest">
                            COMPLEMENTARY OBJECTS OF DESIRE
                        </p>
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#14372F] tracking-tight">
                            WEAR IT WITH
                        </h2>
                        <p className="text-sm lg:text-base text-[#ADB5BD] mt-4 font-normal">
                            Complete the look with our most coveted seasonal pairings
                        </p>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 bg-white">
                        {WEAR_IT_WITH_PRODUCTS.map((product, index) => (
                            <div
                                key={product.id}
                                className={`group cursor-pointer p-6 lg:p-8 ${index < WEAR_IT_WITH_PRODUCTS.length - 1 ? 'border-r border-[#E9ECEF]' : ''
                                    } ${index < 2 ? 'lg:border-r lg:border-[#E9ECEF]' : ''
                                    }`}
                            >
                                <div className="overflow-hidden mb-4 aspect-square flex items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={product.alt}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm lg:text-base font-medium text-dark mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm lg:text-base text-dark font-light">
                                        {product.price}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full bg-gray-50/30 py-16 lg:py-20">
                <div className="mx-auto px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12 lg:mb-16">
                        <p className="text-[11px] lg:text-[13px] uppercase text-[#343A40] font-black mb-4 tracking-widest">
                            THE CURATED EDIT
                        </p>
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#14372F] tracking-tight">
                            SIGNATURE SUGGESTIONS
                        </h2>
                        <p className="text-sm lg:text-base text-[#ADB5BD] mt-4 font-normal">
                            Explore the latest arrivals and seasonal staples curated by our stylists.
                        </p>
                    </div>

                    {/* Responsive Grid Layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 bg-white">
                        {/* Row 1 - 4 Products */}
                        {SIGNATURE_PRODUCTS.slice(0, 4).map((product, index) => (
                            <div
                                key={product.id}
                                className={`group cursor-pointer p-6 lg:p-8 border-b border-gray-200 ${
                                    index < 3 ? 'border-r border-gray-200' : ''
                                } ${
                                    index === 1 ? 'lg:border-r' : ''
                                }`}
                            >
                                <div className="overflow-hidden mb-4 aspect-square flex items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={product.alt}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm lg:text-base font-medium text-dark mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm lg:text-base text-dark font-light">
                                        {product.price}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Row 2 - 2 Products + Featured Image */}
                        {SIGNATURE_PRODUCTS.slice(4, 6).map((product, index) => (
                            <div
                                key={product.id}
                                className={`group cursor-pointer p-6 lg:p-8 border-b border-gray-200 ${
                                    index === 0 ? 'border-r border-gray-200' : ''
                                }`}
                            >
                                <div className="overflow-hidden mb-4 aspect-square flex items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={product.alt}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm lg:text-base font-medium text-dark mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm lg:text-base text-dark font-light">
                                        {product.price}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Featured Image - Spans 2 columns */}
                        <div className="col-span-2 row-span-2 overflow-hidden border-b border-gray-200">
                            <img
                                src="/images/product.png"
                                alt="Featured Collection"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Row 3 - 2 Products (left side) */}
                        {SIGNATURE_PRODUCTS.slice(6, 8).map((product, index) => (
                            <div
                                key={product.id}
                                className={`group cursor-pointer p-6 lg:p-8 ${
                                    index === 0 ? 'border-r border-gray-200' : ''
                                }`}
                            >
                                <div className="overflow-hidden mb-4 aspect-square flex items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={product.alt}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm lg:text-base font-medium text-dark mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm lg:text-base text-dark font-light">
                                        {product.price}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Row 4 - 4 Products */}
                        {SIGNATURE_PRODUCTS.slice(8, 12).map((product, index) => (
                            <div
                                key={product.id}
                                className={`group cursor-pointer p-6 lg:p-8 ${
                                    index < 3 ? 'border-r border-gray-200' : ''
                                }`}
                            >
                                <div className="overflow-hidden mb-4 aspect-square flex items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={product.alt}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-sm lg:text-base font-medium text-dark mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm lg:text-base text-dark font-light">
                                        {product.price}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ColorSidebar
                isOpen={colorSidebarOpen}
                onClose={() => setColorSidebarOpen(false)}
                selectedVariant={selectedVariant}
                onSelectVariant={handleSelectVariant}
            />

            <SizeSidebar
                isOpen={sizeSidebarOpen}
                onClose={() => setSizeSidebarOpen(false)}
                selectedSize={selectedSize}
                onSelectSize={handleSelectSize}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
                    .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    
                    .image-scroll-container {
                        scroll-behavior: smooth;
                    }
                    
                    .snap-y {
                        scroll-snap-type: y mandatory;
                    }
                    
                    .snap-start {
                        scroll-snap-align: start;
                    }
                    
                    .color-sidebar-scroll::-webkit-scrollbar { width: 4px; }
                    .color-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                    .color-sidebar-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 99px; }
                    .color-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }
                    
                    @media (max-width: 1024px) {
                        .h-screen { height: auto; min-height: 100vh; overflow: auto; }
                        
                        /* Hide navigation controls on mobile for cleaner look */
                        .image-scroll-container .absolute:not(.bottom-4) {
                            display: none;
                        }
                    }
                    
                    /* Smooth transitions for image hover effects */
                    .image-scroll-container img {
                        transition: transform 0.3s ease-in-out;
                    }
                    
                    /* Enhanced button hover effects */
                    .image-scroll-container button:hover {
                        transform: scale(1.05);
                    }
                    
                    .image-scroll-container button:active {
                        transform: scale(0.95);
                    }
                `
            }} />
        </div>
    );
};

export default ProductDetails;