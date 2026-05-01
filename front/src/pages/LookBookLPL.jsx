import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// Import images from assets
import look01 from '../assets/images/look01.avif';
import look02 from '../assets/images/look02.avif';
import look03 from '../assets/images/look03.avif';
import look04 from '../assets/images/look04.avif';
import look1 from '../assets/images/look1.avif';

const LookBookLPL = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const lookData = location.state?.look;

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const products = lookData?.subImage ? lookData.subImage.map((img, idx) => ({
        id: idx + 1,
        title: `Limited Edition Piece ${idx + 1}`,
        price: `$${90 + idx * 5}`,
        image: img
    })) : [
        {
            id: 1,
            title: "Limited Edition Striped Linen Blend Blazer",
            price: "$103",
            image: look01
        },
        {
            id: 2,
            title: "Limited Edition Floral Lace Skirt",
            price: "$92",
            image: look02
        },
        {
            id: 3,
            title: "Limited Edition Semi-sheer Cardigan",
            price: "$42",
            image: look03
        },
        {
            id: 4,
            title: "Limited Edition Shimmer Ring",
            price: "$22",
            image: look04
        }
    ];

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

    return (
        <div className="w-full min-h-screen bg-[#F8F9FA]">
            {/* Unified Section Header and Grid */}
            <div className="w-full p-4 sm:py-6 md:py-8 lg:py-4 px-4 lg:px-8">
                <div className="">
                    <p className='text-[#14372F] font-semibold pb-4'>{products?.length} products </p>
                </div>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-[#E9ECEF]"
                >
                    {products.map((product, index) => (
                        <React.Fragment key={product.id}>
                            {/* Insert Model Image at the 3rd position in the grid (Desktop) */}
                            {index === 2 && (
                                <motion.div
                                    variants={itemVariants}
                                    className="col-span-2 row-span-2 order-last lg:order-none border-r border-b border-[#E9ECEF] overflow-hidden bg-gray-50"
                                >
                                    <img
                                        src={lookData?.image || look1}
                                        alt="Model Look"
                                        className="w-full h-full object-cover"
                                        loading="eager"
                                    />
                                </motion.div>
                            )}
                            
                            <motion.div
                                variants={itemVariants}
                                onClick={() => {
                                    navigate(`/product/${product.id}`);
                                    window.scrollTo(0, 0);
                                }}
                                className="group cursor-pointer border-r border-b border-[#E9ECEF] flex flex-col items-center bg-white transition-colors duration-300 hover:bg-gray-50/50"
                            >
                                <div className="w-full aspect-square overflow-hidden mb-6 flex items-center justify-center p-4">
                                    <img
                                        src={product?.image}
                                        alt={product?.title}
                                        className="w-full h-full object-contain"
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
                        </React.Fragment>
                    ))}
                </motion.div>

            </div>
        </div>
    );
};

export default LookBookLPL;



