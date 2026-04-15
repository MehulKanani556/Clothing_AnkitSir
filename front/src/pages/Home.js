import React from 'react'
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import bgImage from '../assets/images/BG.webp';

export default function Home() {
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
                    <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-gray-500 uppercase mb-4 animate-fade-in">
                        The Signature Collections
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
                        COMPOSED IN SILENCE
                    </h2>
                    <p className="text-sm md:text-base text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                        A curated balance of form, care, and detail – each expression shaped with intention.
                    </p>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: "Men's Archive", img: "https://images.unsplash.com/photo-1617130867761-1ec3730f77b7?q=80&w=1974&auto=format&fit=crop" },
                        { title: "Women's Atelier", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop" },
                        { title: "Luxe Care Rituals", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1974&auto=format&fit=crop" },
                        { title: "Objects of Desire", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1974&auto=format&fit=crop" }
                    ].map((collection, index) => (
                        <div key={index} className="group relative aspect-[4/5] overflow-hidden cursor-pointer bg-gray-100">
                            <img
                                src={collection.img}
                                alt={collection.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Bottom Label/Button */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%]">
                                <div className="bg-white/95 backdrop-blur-sm py-4 text-center shadow-lg transition-all duration-300 group-hover:bg-white">
                                    <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-primary uppercase">
                                        {collection.title}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}
