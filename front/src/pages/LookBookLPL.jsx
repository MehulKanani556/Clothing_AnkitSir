import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const LookBookLPL = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const lookData = location.state?.look;

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const products = lookData?.products ? lookData.products.slice(0, 4).map((product) => {
        // Find default variant or first variant
        const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
        
        // Get price from variant or options
        const priceValue = defaultVariant?.finalPrice || (defaultVariant?.options?.[0]?.finalPrice) || 0;
        const image = defaultVariant?.images?.[0];

        return {
            id: product._id,
            title: product.name,
            price: `$${priceValue}`,
            image: image,
            slug: product.slug
        };
    }) : [];

    // Ensure we always have 4 slots for products to maintain the grid layout
    const displayProducts = [...products];
    while (displayProducts.length < 4) {
        displayProducts.push(null);
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: [0.25, 1, 0.5, 1]
            }
        }
    };

    if (!lookData) {
        return (
            <div className="w-full min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <p className="text-gray-500">No collection data found.</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#F8F9FA]">
            {/* Unified Section Header and Grid */}
            <div className="w-full p-4 sm:py-6 md:py-8 lg:py-4 px-4 lg:px-8">
                <div className="">
                    <p className='text-[#14372F] font-semibold pb-4 uppercase tracking-wider'>
                        {lookData?.title} — {products?.length} products
                    </p>
                </div>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-[#E9ECEF]"
                >
                    {displayProducts.map((product, index) => (
                        <React.Fragment key={index}>
                            {/* Insert Model Image at the 3rd position in the grid (Desktop) */}
                            {index === 2 && (
                                <motion.div
                                    variants={itemVariants}
                                    className="col-span-2 row-span-2 order-last lg:order-none border-r border-b border-[#E9ECEF] overflow-hidden bg-gray-50"
                                >
                                    <img
                                        src={lookData?.lookImage}
                                        alt={lookData?.title}
                                        className="w-full h-full object-cover"
                                        loading="eager"
                                    />
                                </motion.div>
                            )}
                            
                            {product ? (
                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => {
                                        navigate(`/product/${product.slug}`);
                                        window.scrollTo(0, 0);
                                    }}
                                    className="group cursor-pointer border-r border-b border-[#E9ECEF] flex flex-col items-center bg-white transition-colors duration-300 hover:bg-gray-50/50"
                                >
                                    <div className="w-full aspect-square overflow-hidden mb-6 flex items-center justify-center p-4">
                                        <img
                                            src={product?.image}
                                            alt={product?.title}
                                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                            loading="eager"
                                        />
                                    </div>
                                    <div className="text-center pb-6 md:pb-8 px-2 md:px-4">
                                        <h3 className="text-[11px] sm:text-xs md:text-sm lg:text-base font-semibold text-[#1A1A1A] mb-1 tracking-tight line-clamp-1 uppercase">
                                            {product?.title}
                                        </h3>
                                        <p className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm text-gray-500 font-medium">
                                            {product?.price}
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                // Blank placeholder div
                                <div className="border-r border-b border-[#E9ECEF] bg-white hidden lg:block" />
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>

            </div>
        </div>
    );
};

export default LookBookLPL;
