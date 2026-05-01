import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';

// Import images (using the ones available in the project as seen in Home.jsx)
import bgImage from '../assets/images/BG.webp';
import manCate from '../assets/images/mancate.webp';
import womenCate from '../assets/images/womancate.webp';
import careCate from '../assets/images/carecate.webp';
import objectCate from '../assets/images/objectcate.webp';
import craft from '../assets/images/craft.webp';
import ex1 from '../assets/images/ex1.webp';
import ex2 from '../assets/images/es2.webp';
import ex3 from '../assets/images/ex3.webp';
import editorial from '../assets/images/editorial.webp';
import men from '../assets/images/men.webp';
import women from '../assets/images/women.webp';
import look1 from '../assets/images/look1.avif'
import look01 from '../assets/images/look01.avif'
import look02 from '../assets/images/look02.avif'
import look03 from '../assets/images/look03.avif'
import look04 from '../assets/images/look04.avif'
import look20 from '../assets/images/look20.png'
import look201 from '../assets/images/look201.png'
import look203 from '../assets/images/look203.png'
import look204 from '../assets/images/look204.png'

const LookBook = () => {
    const navigate = useNavigate();
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const lookbookItems = [
        {
            id: 1,
            category: "MEN",
            image: look1,
            subImage: [look01, look02, look03, look04],
            span: "aspect-[3/4]",
            description: "ARCHIVE 01 explores timeless men's fashion inspired by classic silhouettes and modern refinement."
        },
        {
            id: 2,
            category: "WOMEN",
            image: look20,
            subImage: [look201, look203, look203, look204],
            span: "aspect-[4/5]",
            description: "ATELIER 02 showcases elegant women's designs crafted with precision and artistic detail."
        },
        {
            id: 3,
            category: "CARE",
            image: careCate,
            subImage: [ex1, ex2, ex3, careCate],
            span: "aspect-square",
            description: "RITUALS 03 focuses on self-care essentials designed to elevate everyday routines."
        },
        {
            id: 4,
            category: "DESIGN",
            image: objectCate,
            subImage: [look04, ex1, look02, objectCate],
            span: "aspect-[2/3]",
            description: "OBJECTS 04 highlights curated design pieces blending functionality with aesthetics."
        },
        {
            id: 5,
            category: "HERITAGE",
            image: craft,
            subImage: [look01, look02, craft, ex3],
            span: "aspect-[4/3]",
            description: "CRAFT 05 celebrates heritage craftsmanship rooted in tradition and skilled artistry."
        },
        {
            id: 6,
            category: "LIFESTYLE",
            image: ex1,
            span: "aspect-[3/5]",
            description: "ESSENTIAL 06 presents lifestyle staples that combine simplicity with everyday utility."
        },
        {
            id: 7,
            category: "COLLECTION",
            image: ex2,
            span: "aspect-[4/5]",
            description: "FORM 07 introduces a curated collection focused on structure, balance, and modern style."
        },
        {
            id: 8,
            category: "CRAFTSMANSHIP",
            image: ex3,
            span: "aspect-square",
            description: "DETAIL 08 emphasizes fine craftsmanship through intricate detailing and precision."
        },
        {
            id: 9,
            category: "EDITORIAL",
            image: editorial,
            span: "aspect-[9/16]",
            description: "VISION 09 delivers editorial storytelling through bold visuals and creative direction."
        },
        {
            id: 10,
            category: "MEN",
            image: men,
            span: "aspect-[3/4]",
            description: "STRENGTH 10 reflects powerful men's fashion defined by confidence and durability."
        },
        {
            id: 11,
            category: "WOMEN",
            image: women,
            span: "aspect-[2/3]",
            description: "GRACE 11 captures the essence of femininity with flowing and elegant designs."
        },
        {
            id: 12,
            category: "SEASONAL",
            image: bgImage,
            span: "aspect-[16/9]",
            description: "HORIZON 12 explores seasonal trends inspired by changing landscapes and fresh perspectives."
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.215, 0.61, 0.355, 1]
            }
        }
    };

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            {/* Masonry Grid */}
            <main className="py-4 md:py-4 px-10">
                <p className='text-[#14372F] font-semibold pb-4'>{lookbookItems?.length} products </p>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6"
                >
                    {lookbookItems.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            onClick={() => navigate('/lookbook-lpl', { state: { look: item } })}
                            className="break-inside-avoid group cursor-pointer"
                        >
                            <div className={`relative overflow-hidden bg-gray-100 ${item?.span}`}>
                                <img
                                    src={item?.image}
                                    alt={item?.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    loading="lazy"
                                />
                            </div>

                            {/* Item Details */}
                            <div className="mt-1">
                                <p className="text-md font-bold text-primary">
                                    {item?.category}
                                </p>
                                <div className="flex justify-between items-end">
                                    <h3 className="text-sm font-bold tracking-[0.1em] text-lightText mb-2">
                                        {item?.description}
                                    </h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </main>            
        </div>
    );
};

export default LookBook;