import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const LookBook = () => {
    const navigate = useNavigate();
    const [lookbookItems, setLookbookItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Aspect ratio patterns for masonry grid to maintain original design variety
    const spans = [
        "aspect-[3/4]",
        "aspect-[4/5]",
        "aspect-square",
        "aspect-[2/3]",
        "aspect-[4/3]",
        "aspect-[3/5]",
        "aspect-[4/5]",
        "aspect-square",
        "aspect-[9/16]",
        "aspect-[3/4]",
        "aspect-[2/3]",
        "aspect-[16/9]"
    ];

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchLookbooks();
    }, []);

    const fetchLookbooks = async () => {
        try {
            const response = await axiosInstance.get('/lookbook/get-all');
            if (response.data.success) {
                // Map the API data and assign spans cyclically
                const mappedData = response.data.result.map((item, index) => ({
                    ...item,
                    span: spans[index % spans.length]
                }));
                setLookbookItems(mappedData);
            }
        } catch (error) {
            console.error("Error fetching lookbooks:", error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading && lookbookItems.length === 0) {
        return (
            <div className="bg-[#F8F9FA] min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-primary font-medium">Loading Collections...</div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            {/* Masonry Grid */}
            <main className="py-4 md:py-4 px-10">
                <p className='text-[#14372F] font-semibold pb-4'>{lookbookItems?.length} collections </p>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="columns-1 md:columns-3 xl:columns-4 gap-6 space-y-6"
                >
                    {lookbookItems.map((item) => (
                        <motion.div
                            key={item._id}
                            variants={itemVariants}
                            onClick={() => navigate('/lookbook-lpl', { state: { look: item } })}
                            className="break-inside-avoid group cursor-pointer"
                        >
                            <div className="relative overflow-hidden bg-gray-100">
                                <img
                                    src={item?.lookImage}
                                    alt={item?.title}
                                    className="w-full h-auto transition-transform duration-1000 group-hover:scale-110"
                                    loading="lazy"
                                />
                            </div>

                            {/* Item Details */}
                            <div className="mt-1">
                                <p className="text-md font-bold text-primary uppercase">
                                    {item?.title}
                                </p>
                                <div className="flex justify-between items-end">
                                    <h3 className="text-sm font-bold tracking-[0.1em] text-lightText mb-2 line-clamp-2">
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