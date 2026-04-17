import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug, addRecentlyViewed } from '../redux/slice/product.slice';
import { IoHeartOutline, IoShareSocialOutline, IoChevronUp, IoChevronDown } from "react-icons/io5";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import Header from '../components/Header';
import ColorSidebar, { COLOR_VARIANTS } from '../components/ColorSidebar';
import SizeSidebar, { SIZE_OPTIONS } from '../components/SizeSidebar';
import ProductInfoSidebar from '../components/ProductInfoSidebar';
import ImageModal from '../components/ImageModal';
import { MdKeyboardArrowRight } from 'react-icons/md';
import product1 from '../assets/images/product1.png';
import product2 from '../assets/images/product2.png';
import product3 from '../assets/images/product3.png';
import product4 from '../assets/images/product4.png';
import product5 from '../assets/images/product5.png';

// Sample product images - replace with actual product images
const PRODUCT_IMAGES = [
    {
        id: 1,
        src: product1,
        alt: "Black & Green Striped Crochet Shorts - Main View",
        type: "main"
    },
    {
        id: 2,
        src: product2,
        alt: "Black & Green Striped Crochet Shorts - Front View",
        type: "front"
    },
    {
        id: 3,
        src: product3,
        alt: "Black & Green Striped Crochet Shorts - Back View",
        type: "back"
    },
    {
        id: 4,
        src: product4,
        alt: "Black & Green Striped Crochet Shorts - Detail View",
        type: "detail"
    },
    {
        id: 5,
        src: product5,
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
        image: product2,
        alt: "Stripe Crochet Short Sleeve Shirt"
    },
    {
        id: 2,
        name: "Tennis Bouclé Shorts",
        price: "$570",
        image: product3,
        alt: "Tennis Bouclé Shorts"
    },
    {
        id: 3,
        name: "Tennis Crochet Shorts",
        price: "$480",
        image: product4,
        alt: "Tennis Crochet Shorts"
    },
    {
        id: 4,
        name: "Motif Crochet Shorts",
        price: "$300",
        image: product5,
        alt: "Motif Crochet Shorts"
    }
];

// SIGNATURE SUGGESTIONS products
const SIGNATURE_PRODUCTS = [
    {
        id: 1,
        name: "Green Monogram Weekender Bag",
        price: "$2,495",
        image: product1,
        alt: "Green Monogram Weekender Bag"
    },
    {
        id: 2,
        name: "Black Monogram Weekender Bag",
        price: "$2,495",
        image: product2,
        alt: "Black Monogram Weekender Bag"
    },
    {
        id: 3,
        name: "Paris Store Weekender",
        price: "$2,495",
        image: product3,
        alt: "Paris Store Weekender"
    },
    {
        id: 4,
        name: "Brown Monogram Weekender",
        price: "$2,495",
        image: product4,
        alt: "Brown Monogram Weekender"
    },
    {
        id: 5,
        name: "Tennis Collar Crochet Short Sleeve Shirt",
        price: "$685",
        image: product5,
        alt: "Tennis Collar Crochet Short Sleeve Shirt"
    },
    {
        id: 6,
        name: "Tennis Collar Crochet Shorts",
        price: "$570",
        image: product1,
        alt: "Tennis Collar Crochet Shorts"
    },
    {
        id: 7,
        name: "Stripe Racket Knit Polo Shirt",
        price: "$875",
        image: product2,
        alt: "Stripe Racket Knit Polo Shirt"
    },
    {
        id: 8,
        name: "Stripe Racket Golf Trousers",
        price: "$740",
        image: product3,
        alt: "Stripe Racket Golf Trousers"
    },
    {
        id: 9,
        name: "Green Cropped Knit Polo Shirt",
        price: "$875",
        image: product4,
        alt: "Green Cropped Knit Polo Shirt"
    },
    {
        id: 10,
        name: "Green Pleated Knit Mini Skirt",
        price: "$685",
        image: product5,
        alt: "Green Pleated Knit Mini Skirt"
    },
    {
        id: 11,
        name: "Green Pleated Halter Mini Dress",
        price: "$1,240",
        image: product1,
        alt: "Green Pleated Halter Mini Dress"
    },
    {
        id: 12,
        name: "Green Cropped Short Sleeve Polo Shirt",
        price: "$875",
        image: product2,
        alt: "Green Cropped Short Sleeve Polo Shirt"
    }
];

const ProductDetails = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { currentProduct, loading } = useSelector(state => state.product);

    const [colorSidebarOpen, setColorSidebarOpen] = useState(false);
    const [sizeSidebarOpen, setSizeSidebarOpen] = useState(false);
    const [productInfoOpen, setProductInfoOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [activeInfoTab, setActiveInfoTab] = useState('Product Details');
    const [selectedVariant, setSelectedVariant] = useState(COLOR_VARIANTS[2]); // Default: Black
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const sliderRef = useRef(null);

    useEffect(() => {
        if (slug) {
            dispatch(fetchProductBySlug(slug));
        }
    }, [dispatch, slug]);

    useEffect(() => {
        if (currentProduct?._id) {
            dispatch(addRecentlyViewed(currentProduct._id));
        }
    }, [dispatch, currentProduct]);

    const handleSelectVariant = (variant) => {
        setSelectedVariant(variant);
        setColorSidebarOpen(false);
    };

    const handleSelectSize = (size) => {
        setSelectedSize(size);
        setSizeSidebarOpen(false);
    };

    const openProductInfo = (tab) => {
        setActiveInfoTab(tab);
        setProductInfoOpen(true);
    };

    // Navigate to specific image
    const goToImage = (index) => {
        if (index >= 0 && index < PRODUCT_IMAGES.length) {
            setCurrentImageIndex(index);
            if (sliderRef.current) {
                const isMobile = window.innerWidth < 1024;
                if (isMobile) {
                    const imageWidth = sliderRef.current.clientWidth;
                    sliderRef.current.scrollTo({
                        left: index * imageWidth,
                        behavior: 'smooth'
                    });
                } else {
                    const imageHeight = sliderRef.current.clientHeight;
                    sliderRef.current.scrollTo({
                        top: index * imageHeight,
                        behavior: 'smooth'
                    });
                }
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
            const isMobile = window.innerWidth < 1024;
            if (isMobile) {
                const scrollLeft = sliderRef.current.scrollLeft;
                const imageWidth = sliderRef.current.clientWidth;
                const newIndex = Math.round(scrollLeft / imageWidth);
                if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < PRODUCT_IMAGES.length) {
                    setCurrentImageIndex(newIndex);
                }
            } else {
                const scrollTop = sliderRef.current.scrollTop;
                const imageHeight = sliderRef.current.clientHeight;
                const newIndex = Math.round(scrollTop / imageHeight);
                if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < PRODUCT_IMAGES.length) {
                    setCurrentImageIndex(newIndex);
                }
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
            if (window.innerWidth < 1024) return; // Disable on mobile/tablet

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
                <div className="image-scroll-container relative h-[50vh] md:h-[calc(100vh-113px)] overflow-hidden bg-gray-50/20">
                    {/* Image Slider */}
                    <div
                        ref={sliderRef}
                        className="h-full overflow-y-hidden lg:overflow-y-auto overflow-x-auto lg:overflow-x-hidden custom-scrollbar snap-x lg:snap-y snap-mandatory"
                        onScroll={handleScroll}
                    >
                        <div className="flex flex-row lg:flex-col h-full lg:h-auto">
                            {PRODUCT_IMAGES.map((image, index) => (
                                <div
                                    key={image.id}
                                    onClick={() => setImageModalOpen(true)}
                                    className="w-full lg:w-full h-[50vh] md:h-[calc(100vh-80px)] bg-white flex items-center justify-center flex-shrink-0 snap-start cursor-pointer transition-all duration-500"
                                >
                                    <img
                                        src={image?.src}
                                        alt={image?.alt}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Indicators */}
                    <div className="absolute z-20 flex gap-3 bottom-10 left-1/2 -translate-x-1/2 flex-row lg:bottom-auto lg:top-[91%] lg:-translate-y-1/2 lg:left-6 lg:translate-x-0 lg:flex-col">
                        {PRODUCT_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToImage(index)}
                                className={`w-[7px] h-[7px] sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                                    index === currentImageIndex
                                        ? 'bg-black scale-125'
                                        : 'bg-black/30 hover:bg-black/50'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Content Area */}
                <div className="product-details-container h-auto lg:h-[calc(100vh-80px)] items-center justify-center p-6 md:p-10 lg:p-18 sticky top-0 flex">
                    <div className="max-w-xl w-full flex flex-col">
                        {/* Top Navigation Row */}
                        <div className="flex items-center justify-between mb-8 lg:mb-12">
                            <button className="flex items-center gap-2 text-[11px] lg:text-[13px] font-bold text-dark transition-all group uppercase tracking-widest">
                                <SlArrowLeft color='black' size={12} className="lg:size-[15px]" />
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
                        <div className="text-center mb-8 lg:mb-10">
                            <span className="text-[11px] lg:text-[13px] uppercase text-lightText font-black mb-3 lg:mb-6 block tracking-widest">
                                New Arrivals
                            </span>
                            <h1 className="text-2xl lg:text-2xl xl:text-3xl font-medium mb-3 lg:mb-4 text-dark tracking-tight leading-[1.2] lg:leading-[1.1] selection:bg-dark selection:text-white">
                                Black & Green Striped Crochet Shorts
                            </h1>
                            <p className="text-xl lg:text-2xl text-dark/90 font-light tracking-wide">
                                $911.00
                            </p>
                        </div>

                        {/* Customization Selectors Section */}
                        <div className="flex flex-col items-center gap-4 mb-8 lg:mb-14">
                            {/* ── Color Button ── */}
                            <button
                                onClick={() => setColorSidebarOpen(true)}
                                className="flex items-center gap-3 group outline-none hover:opacity-70 transition-opacity"
                            >
                                <span className="text-[14px] lg:text-[14px] text-lightText font-normal">Color:</span>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3.5 h-3.5 rounded-[2px] border border-black/10"
                                        style={{ backgroundColor: selectedVariant.hex }}
                                    />
                                    <span className="text-[14px] lg:text-[15px] text-dark font-normal">
                                        {selectedVariant.color}
                                    </span>
                                </div>
                                <MdKeyboardArrowRight size={18} />
                            </button>

                            <button
                                onClick={() => setSizeSidebarOpen(true)}
                                className="flex items-center gap-3 group outline-none hover:opacity-70 transition-opacity"
                            >
                                <span className="text-[14px] lg:text-[15px] text-lightText font-normal">Size:</span>
                                <span className="text-[14px] lg:text-[15px] text-dark font-normal">
                                    {selectedSize || 'Select size'}
                                </span>
                                <MdKeyboardArrowRight size={18} />
                            </button>
                        </div>

                        {/* Add to Cart CTA */}
                        {(() => {
                            const selectedSizeData = SIZE_OPTIONS.find(s => s.size === selectedSize);
                            const isSoldOut = selectedSizeData && !selectedSizeData.available;

                            return (
                                <button
                                    disabled={!selectedSize}
                                    className={`w-full py-2 lg:py-4 font-black text-[13px] lg:text-[14px] tracking-[0.25em] uppercase shadow-sm mb-6 lg:mb-8 outline-none transition-all duration-300 ${selectedSize
                                        ? 'bg-[#14372F] text-white cursor-pointer hover:opacity-90'
                                        : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
                                        }`}
                                >
                                    {!selectedSize
                                        ? 'Select Size'
                                        : isSoldOut
                                            ? 'notify me when available'
                                            : 'Add to cart'}
                                </button>
                            );
                        })()}

                        {/* Product Footer Links */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 pt-8 lg:pt-14 border-t border-gray-100/50">
                            {['Product Details', 'Size Guide', 'Delivery & Returns'].map((link) => (
                                <button
                                    key={link}
                                    onClick={() => openProductInfo(link)}
                                    className="flex items-center gap-2 text-[11px] lg:text-[13px] font-black transition-all group outline-none uppercase tracking-widest"
                                    style={{ fontWeight: "600" }}
                                >
                                    {link}
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-lightText group-hover:translate-x-1 transition-transform lg:w-[12px] lg:h-[12px]"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* WEAR IT WITH Section */}
            <div className="w-full bg-gray-50/30 py-12 md:py-16 lg:py-20">
                <div className=" mx-auto px-8">
                    {/* Section Header */}
                    <div className="text-center mb-8 lg:mb-16">
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

            {/* THE CURATED EDIT Section */}
            <div className="w-full bg-gray-50/30 py-12 md:py-16 lg:py-20">
                <div className="mx-auto px-8">
                    {/* Section Header */}
                    <div className="text-center mb-8 lg:mb-16">
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
                                className={`group cursor-pointer p-6 lg:p-8 border-b border-gray-200 ${index < 3 ? 'border-r border-gray-200' : ''
                                    } ${index === 1 ? 'lg:border-r' : ''
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
                                className={`group cursor-pointer p-6 lg:p-8 border-b border-gray-200 ${index === 0 ? 'border-r border-gray-200' : ''
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
                                className={`group cursor-pointer p-6 lg:p-8 ${index === 0 ? 'border-r border-gray-200' : ''
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
                                className={`group cursor-pointer p-6 lg:p-8 ${index < 3 ? 'border-r border-gray-200' : ''
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

            <ProductInfoSidebar
                isOpen={productInfoOpen}
                onClose={() => setProductInfoOpen(false)}
                initialTab={activeInfoTab}
            />

            <ImageModal
                isOpen={imageModalOpen}
                onClose={() => setImageModalOpen(false)}
                images={PRODUCT_IMAGES}
                initialIndex={currentImageIndex}
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