import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug, addRecentlyViewed } from '../redux/slice/product.slice';
import { IoShareSocialOutline, IoChevronUp, IoChevronDown } from "react-icons/io5";
import { fetchProductById, fetchVariantsByProductId, clearCurrentProduct, fetchProducts, toggleWishlist, fetchWishlist } from '../redux/slice/product.slice';
import WishlistButton from '../components/WishlistButton';
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import Header from '../components/Header';
import ColorSidebar, { COLOR_VARIANTS } from '../components/ColorSidebar';
import SizeSidebar, { SIZE_OPTIONS } from '../components/SizeSidebar';
import ProductInfoSidebar from '../components/ProductInfoSidebar';
import ImageModal from '../components/ImageModal';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import { addToCart, openCart } from '../redux/slice/cart.slice';
import toast from 'react-hot-toast';
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

// Dynamic WEAR IT WITH products are now fetched from the backend


const ProductDetails = () => {
    const { slug, id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentProduct, variants, loading, wishlist, wearItWith } = useSelector((state) => state.product);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const isWishlisted = wishlist?.some(p => (p._id || p) === currentProduct?._id);

    // Dynamic Section Titles based on Category
    const getSuggestionsHeader = () => {
        const mainCat = currentProduct?.mainCategory?.mainCategoryName?.toUpperCase() || "";
        const cat = currentProduct?.category?.categoryName?.toUpperCase() || "";
        const fullCat = `${mainCat} ${cat}`;

        if (fullCat.includes("BEAUTY") || fullCat.includes("COSMETIC") || fullCat.includes("SKINCARE")) {
            return {
                title: "COMPLETE YOUR ROUTINE",
                subtitle: "Elevate your daily ritual with these essential pairings"
            };
        }

        if (fullCat.includes("OBJECT") || fullCat.includes("HOME") || fullCat.includes("DESIGNER")) {
            return {
                title: "STYLE WITH",
                subtitle: "Curated selections to complement your aesthetic"
            };
        }

        return {
            title: "WEAR IT WITH",
            subtitle: "Complete the look with our most coveted seasonal pairings"
        };
    };

    const sectionHeader = getSuggestionsHeader();

    const [colorSidebarOpen, setColorSidebarOpen] = useState(false);
    const [sizeSidebarOpen, setSizeSidebarOpen] = useState(false);
    const [productInfoOpen, setProductInfoOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [activeInfoTab, setActiveInfoTab] = useState('Product Details');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showMiniBar, setShowMiniBar] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const mainSectionRef = useRef(null);

    useEffect(() => {
        if (slug) {
            dispatch(fetchProductBySlug(slug));
            dispatch(fetchProducts()); // For related products
        } else if (id) {
            dispatch(fetchProductById(id));
            dispatch(fetchProducts());
        }

        if (isAuthenticated) {
            dispatch(fetchWishlist());
        }

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, slug, id, isAuthenticated]);

    useEffect(() => {
        if (currentProduct?._id) {
            dispatch(fetchVariantsByProductId(currentProduct._id));
            dispatch(addRecentlyViewed(currentProduct._id));
        }
    }, [dispatch, currentProduct?._id]);

    useEffect(() => {
        if (variants && variants.length > 0) {
            const defaultV = variants.find(v => v.isDefault) || variants[0];
            setSelectedVariant(defaultV);
        }
    }, [variants]);

    const handleAddToCartClick = async () => {
        if (!selectedSize) {
            setSizeSidebarOpen(true);
            return;
        }

        try {
            setAddingToCart(true);
            await dispatch(addToCart({
                productId: currentProduct._id,
                productVariantId: selectedVariant?._id,
                selectedSize: selectedSize.size || selectedSize,
                quantity: 1
            })).unwrap();

            // Open cart sidebar and show success message
            dispatch(openCart());
            toast.success('Product added to bag');
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error(error?.message || 'Failed to add product to bag');
        } finally {
            setAddingToCart(false);
        }
    };

    const productImages = selectedVariant?.images?.map((src, idx) => ({
        id: idx,
        src: src,
        alt: `${currentProduct?.name} - ${selectedVariant?.color} View ${idx + 1}`,
        type: "product"
    })) || [];

    const productPrice = selectedVariant?.options?.length > 0
        ? selectedVariant.options[0].price
        : (currentProduct?.basePrice || 0);

    const sizeOptions = selectedVariant?.options?.map(opt => ({
        size: opt.size,
        available: opt.stock > 0,
        price: opt.price
    })) || [];

    const handleSelectVariant = (variant) => {
        setSelectedVariant(variant);
        setSelectedSize(null); // Clear size selection when color Changes
        setColorSidebarOpen(false);
    };

    const handleSelectSize = (size) => {
        setSelectedSize(size);
        setSizeSidebarOpen(false);
    };

    const handleWishlistToggle = () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        dispatch(toggleWishlist(currentProduct._id));
    };

    // Filter dynamic related products
    const relatedProducts = useSelector((state) =>
        state.product.products.filter(p =>
            p.category?._id === currentProduct?.category?._id && p._id !== currentProduct?._id
        ).slice(0, 4)
    );

    const signatureSuggestions = useSelector((state) => {
        const allProducts = state.product.products;
        if (!allProducts || allProducts.length === 0) return [];

        // Exclude current product
        const otherProducts = allProducts.filter(p => p._id !== currentProduct?._id);

        const uniqueSuggestions = [];
        const seenCategories = new Set();

        // Try to get one from each category first
        otherProducts.forEach(p => {
            if (!seenCategories.has(p.category?._id) && uniqueSuggestions.length < 12) {
                uniqueSuggestions.push(p);
                seenCategories.add(p.category?._id);
            }
        });

        // Fill remaining slots
        otherProducts.forEach(p => {
            if (!uniqueSuggestions.some(us => us._id === p._id) && uniqueSuggestions.length < 12) {
                uniqueSuggestions.push(p);
            }
        });

        return uniqueSuggestions;
    });

    const openProductInfo = (tab) => {
        setActiveInfoTab(tab);
        setProductInfoOpen(true);
    };

    // Handle scroll for Floating Card visibility
    useEffect(() => {
        const handleCardVisibility = () => {
            if (mainSectionRef.current) {
                const rect = mainSectionRef.current.getBoundingClientRect();
                setShowMiniBar(rect.bottom < 100);
            }
        };

        window.addEventListener('scroll', handleCardVisibility);
        // Initial check
        handleCardVisibility();

        return () => {
            window.removeEventListener('scroll', handleCardVisibility);
        };
    }, [loading]);

    // Intersection Observer for scroll tracking
    const imageRefs = useRef([]);
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index'));
                    setCurrentImageIndex(index);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        imageRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => {
            imageRefs.current.forEach(ref => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [productImages]);

    const scrollToImage = (index) => {
        const element = imageRefs.current[index];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-[#14372F] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!currentProduct || !selectedVariant) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-[#14372F] text-white rounded"
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#F8F9FA] font-sans text-dark selection:bg-dark selection:text-white">
            {/* Main Product Section */}
            <div ref={mainSectionRef} className="w-full grid grid-cols-1 lg:grid-cols-2 items-start">
                {/* Left Column: Scrollable Images */}
                <div className="relative flex flex-col gap-0 w-full">
                    {productImages.map((image, index) => (
                        <div
                            key={image.id}
                            ref={el => imageRefs.current[index] = el}
                            data-index={index}
                            onClick={() => {
                                setCurrentImageIndex(index);
                                setImageModalOpen(true);
                            }}
                            className="w-full h-[70vh] md:h-[85vh] lg:h-screen bg-white flex items-center justify-center cursor-pointer transition-all duration-500"
                        >
                            <img
                                src={image?.src}
                                alt={image?.alt}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}

                    {/* Vertical Indicators */}
                    <div className="hidden lg:flex fixed left-10 bottom-10 z-30 flex-col gap-3">
                        {productImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToImage(index)}
                                className={`group flex items-center gap-4 outline-none`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${index === currentImageIndex
                                    ? 'bg-dark scale-125'
                                    : 'bg-dark/20 group-hover:bg-dark/40'
                                    }`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Content Area */}
                <div className="product-details-container lg:sticky lg:top-0 h-auto lg:h-screen flex items-center justify-center p-6 md:p-10 lg:p-18">
                    <div className="max-w-xl w-full flex flex-col">
                        {/* Top Navigation Row */}
                        <div className="flex items-center justify-between mb-8 lg:mb-12">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-[11px] lg:text-[13px] font-bold text-dark transition-all group uppercase tracking-widest"
                            >
                                <SlArrowLeft color='black' size={12} className="lg:size-[15px]" />
                                <span>{currentProduct?.category?.categoryName || "Back"}</span>
                            </button>
                            <div className="flex items-center gap-6">
                                <WishlistButton
                                    productId={currentProduct._id}
                                    className="text-dark/80 hover:text-dark hover:scale-110 transition-all outline-none"
                                    activeColor="text-[#14372F]"
                                    inactiveColor="text-dark/80"
                                />
                                <button className="text-dark/80 hover:text-dark hover:scale-110 transition-all outline-none">
                                    <IoShareSocialOutline size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Product Title & Info Section */}
                        <div className="text-center mb-8 lg:mb-10">
                            <span className="text-[11px] lg:text-[13px] uppercase text-lightText font-black mb-3 lg:mb-6 block tracking-widest">
                                {currentProduct?.mainCategory?.mainCategoryName || 'New Arrivals'}
                            </span>
                            <h1 className="text-2xl lg:text-2xl xl:text-3xl font-medium mb-3 lg:mb-4 text-dark tracking-tight leading-[1.2] lg:leading-[1.1] selection:bg-dark selection:text-white">
                                {currentProduct?.name}
                            </h1>
                            <p className="text-xl lg:text-2xl text-dark/90 font-light tracking-wide">
                                ${productPrice}
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
                                        style={{ backgroundColor: selectedVariant?.colorCode || '#000' }}
                                    />
                                    <span className="text-[14px] lg:text-[15px] text-dark font-normal">
                                        {selectedVariant?.color}
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
                            const sizeOptions = selectedVariant?.options || [];
                            const selectedSizeData = sizeOptions.find(s => s.size === selectedSize);
                            const isSoldOut = selectedSizeData && selectedSizeData.stock <= 0;

                            return (
                                <button
                                    onClick={handleAddToCartClick}
                                    disabled={addingToCart}
                                    className={`w-full py-2 lg:py-4 font-black text-[13px] lg:text-[14px] tracking-[0.25em] uppercase shadow-sm mb-6 lg:mb-8 outline-none transition-all duration-300 ${(!selectedSize || isSoldOut)
                                        ? 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
                                        : 'bg-[#14372F] text-white cursor-pointer hover:opacity-90'
                                        }`}
                                >
                                    {addingToCart
                                        ? 'Adding...'
                                        : !selectedSize
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
            {wearItWith && wearItWith.length > 0 && (
                <div className="w-full bg-gray-50/30 pt-12 md:pt-16 lg:pt-20">
                    <div className=" mx-auto px-8">
                        {/* Section Header */}
                        <div className="text-center mb-8 lg:mb-16">
                            <p className="text-[11px] lg:text-[13px] uppercase text-[#343A40] font-black mb-4 tracking-widest">
                                COMPLEMENTARY OBJECTS OF DESIRE
                            </p>
                            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#14372F] tracking-tight">
                                {sectionHeader.title}
                            </h2>
                            <p className="text-sm lg:text-base text-[#ADB5BD] mt-4 font-normal">
                                {sectionHeader.subtitle}
                            </p>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 bg-white">
                            {wearItWith.map((product, index) => {
                                const firstVariant = product.variants?.[0];
                                const imageUrl = firstVariant?.images?.[0] || product.image;
                                const name = product.name;
                                const price = firstVariant?.options?.[0]?.price ? `$${firstVariant.options[0].price}` : `$${product.basePrice || 0}`;

                                return (
                                    <div
                                        key={product._id}
                                        onClick={() => {
                                            navigate(`/product/${product.slug}`);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`group cursor-pointer p-6 lg:p-8 ${index < wearItWith.length - 1 ? 'border-r border-[#E9ECEF]' : ''} ${index < 2 ? 'lg:border-r lg:border-[#E9ECEF]' : ''}`}
                                    >
                                        <div className="overflow-hidden mb-4 aspect-square flex items-center justify-center">
                                            <img
                                                src={imageUrl}
                                                alt={name}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-sm lg:text-base font-medium text-dark mb-1 uppercase tracking-tight">
                                                {name}
                                            </h3>
                                            <p className="text-sm lg:text-base text-dark font-light">
                                                {price}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* SIGNATURE SUGGESTIONS Section */}
            <div className="w-full bg-gray-50/30  pt-12 md:pt-16 lg:pt-20">
                <div className="mx-auto px-8">
                    {/* Section Header */}
                    <div className="text-center mb-8 lg:mb-16">
                        <p className="text-[11px] lg:text-[13px] uppercase text-[#343A40] font-black mb-4 tracking-widest">
                            THE CURATED EDIT
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-[#14372F] tracking-tight">
                            SIGNATURE SUGGESTIONS
                        </h2>
                        <p className="text-sm lg:text-base text-[#ADB5BD] mt-4 font-normal max-w-2xl mx-auto">
                            Explore the latest arrivals and seasonal staples curated by our stylists to complete your signature look.
                        </p>
                    </div>

                    {/* Responsive Grid Layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 bg-white border-t border-l border-gray-100">
                        {(() => {
                            // Pure dynamic suggestions
                            if (signatureSuggestions.length === 0) return null;
                            const combinedSuggestions = [...signatureSuggestions];

                            const renderSuggestionCard = (product, borderClasses = "") => {
                                const firstVariant = product.variants?.[0];
                                const imageUrl = firstVariant?.images?.[0] || product.image;
                                const name = product.name;
                                const price = firstVariant?.options?.[0]?.price ? `$${firstVariant.options[0].price}` : (product.price || "$0.00");

                                return (
                                    <div
                                        key={product._id || product.id || Math.random()}
                                        onClick={() => {
                                            if (product.slug) {
                                                navigate(`/product/${product.slug}`);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        className={`group cursor-pointer p-4 md:p-6 lg:p-8 border-b border-r border-gray-100 transition-colors hover:bg-[#FDFDFD] ${borderClasses}`}
                                    >
                                        <div className="overflow-hidden mb-4 aspect-square flex items-center justify-center bg-gray-50/50">
                                            <img
                                                src={imageUrl}
                                                alt={name}
                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xs md:text-sm font-semibold text-dark mb-1 tracking-tight uppercase line-clamp-1">
                                                {name}
                                            </h3>
                                            <p className="text-xs md:text-sm text-dark/60 font-medium tracking-tight">
                                                {price}
                                            </p>
                                        </div>
                                    </div>
                                );
                            };

                            return (
                                <>
                                    {/* Slot 1-4 */}
                                    {combinedSuggestions.slice(0, 4).map((p) => renderSuggestionCard(p))}

                                    {/* Slot 5-6 */}
                                    {combinedSuggestions.slice(4, 6).map((p) => renderSuggestionCard(p))}

                                    {/* Featured Slot (Spans 2x2) */}
                                    <div className="col-span-2 row-span-2 overflow-hidden border-b border-r border-gray-100 group relative">
                                        <img
                                            src={combinedSuggestions[0]?.variants?.[0]?.images?.[1] || combinedSuggestions[0]?.variants?.[0]?.images?.[0] || "/images/product.png"}
                                            alt="Featured Signature Look"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-in-out"
                                        />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>

                                    {/* Slot 7-8 */}
                                    {combinedSuggestions.slice(6, 8).map((p) => renderSuggestionCard(p))}

                                    {/* Slot 9-12 */}
                                    {combinedSuggestions.slice(8, 12).map((p) => renderSuggestionCard(p))}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <ColorSidebar
                isOpen={colorSidebarOpen}
                onClose={() => setColorSidebarOpen(false)}
                selectedVariant={selectedVariant}
                onSelectVariant={handleSelectVariant}
                variants={variants}
            />

            <SizeSidebar
                isOpen={sizeSidebarOpen}
                onClose={() => setSizeSidebarOpen(false)}
                selectedSize={selectedSize}
                onSelectSize={handleSelectSize}
                sizeOptions={sizeOptions}
            />

            <ProductInfoSidebar
                isOpen={productInfoOpen}
                onClose={() => setProductInfoOpen(false)}
                initialTab={activeInfoTab}
                productDetails={currentProduct?.description}
            />

            <ImageModal
                isOpen={imageModalOpen}
                onClose={() => setImageModalOpen(false)}
                images={productImages}
                initialIndex={currentImageIndex}
            />

            {/* Sticky Mini Product Bar (Floating Card) - Fully Responsive */}
            <div className={`fixed z-[55] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform
                /* Mobile: Centered at bottom */
                bottom-4 left-4 right-4 w-auto 
                /* Tablet/Desktop: Corner anchored */
                md:left-auto md:right-8 md:bottom-8 lg:right-10 lg:bottom-10 md:w-[500px] lg:w-[650px]
                bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-100/50
                ${showMiniBar ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>

                <div className="p-3 md:p-5 lg:p-6 flex items-center justify-between gap-3 md:gap-6">
                    {/* Left: Product Info Group */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        {/* Mini Image */}
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-[#F8F9FA] flex-shrink-0 flex items-center justify-center border border-gray-50">
                            <img
                                src={selectedVariant?.images?.[0] || productImages[0]?.src}
                                alt={currentProduct?.name}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Info Text */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs md:text-base font-medium text-dark truncate leading-tight mb-1">
                                {currentProduct?.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-[11px] lg:text-xs">
                                <div className="flex items-center gap-1">
                                    <span className="text-[#999FA6]">Color:</span>
                                    <div className="flex items-center gap-1 text-dark font-medium">
                                        <div className="w-2 h-2 rounded-full hidden xs:block" style={{ backgroundColor: selectedVariant?.colorCode }} />
                                        <span>{selectedVariant?.color}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[#999FA6]">Size:</span>
                                    <div className="flex items-center gap-1 text-dark font-medium">
                                        <span>{selectedSize || '-'}</span>
                                        <button
                                            onClick={() => {
                                                // setSizeSidebarOpen(true);
                                                if (mainSectionRef.current) {
                                                    mainSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                            className="text-[#999FA6] font-bold underline ml-1 hover:opacity-70 text-[9px] md:text-[11px]"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs md:text-lg font-semibold text-dark mt-0.5 md:mt-1">
                                ${productPrice}
                            </p>
                        </div>
                    </div>

                    {/* Right: Action Button */}
                    <button
                        onClick={handleAddToCartClick}
                        className={`whitespace-nowrap flex-shrink-0 px-4 md:px-8 lg:px-10 py-3 md:py-4 text-[9px] md:text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-300
                            ${selectedSize
                                ? 'bg-[#14372F] text-white hover:opacity-95 active:scale-97 shadow-lg shadow-[#14372F]/10'
                                : 'bg-[#E9ECEF] text-[#ADB5BD] cursor-pointer'
                            }`}
                    >
                        {addingToCart ? 'Adding...' : selectedSize ? 'Add to cart' : 'Select Size'}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
                    .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    
                    .color-sidebar-scroll::-webkit-scrollbar { width: 4px; }
                    .color-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                    .color-sidebar-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 99px; }
                    .color-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }
                    
                    @media (max-width: 1024px) {
                        .h-screen { height: auto; min-height: 100vh; overflow: auto; }
                    }
                `
            }} />
        </div>
    );
};

export default ProductDetails;