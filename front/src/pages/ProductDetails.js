import React from 'react';
import { IoHeartOutline, IoShareSocialOutline } from "react-icons/io5";
import { SlArrowLeft } from "react-icons/sl";

const ProductDetails = () => {
    return (
        <div className="h-screen w-full bg-white font-sans text-dark overflow-hidden selection:bg-dark selection:text-white">
            <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2">

                {/* Left Column: Image Area - Split screen design */}
                <div className="relative h-64 lg:h-full flex items-center justify-center p-12 lg:p-0">
                    <img
                        src="/images/product.png"
                        alt="Black & Green Striped Crochet Shorts"
                        className="max-h-[100%] max-w-[100%] object-contain"
                    />

                    {/* Vertical Pagination Indicator */}
                    <div className="absolute bottom-6 lg:bottom-12 left-6 lg:left-12 flex lg:flex-col gap-3 lg:gap-4">
                        {[1, 2, 3, 4, 5].map((dot, index) => (
                            <div
                                key={dot}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === 0 ? 'bg-dark scale-150' : 'bg-lightText/30 hover:bg-lightText'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Content Area - Split screen design */}
                <div className="h-full flex flex-col items-center justify-center p-8 md:p-16 lg:p-18 xl:p-20 overflow-y-auto custom-scrollbar">
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
                            <button className="flex items-center gap-3 group outline-none hover:opacity-70 transition-opacity">
                                <span className="text-[18px] lg:text-[14px] text-lightText font-normal">Color:</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-black rounded-[2px]" />
                                    <span className="text-[18px] lg:text-[15px] text-dark font-normal">Black</span>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dark/30 ml-1"><path d="m9 18 6-6-6-6" /></svg>
                            </button>

                            <button className="flex items-center gap-3 group outline-none hover:opacity-70 transition-opacity">
                                <span className="text-[18px] lg:text-[15px] text-lightText font-normal">Size:</span>
                                <span className="text-[18px] lg:text-[15px] text-dark font-normal">Select size</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dark/30 ml-1"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>

                        {/* Add to Cart / Select Size CTA text-[#9EA9B5]*/}
                        <button className="w-full py-2 lg:py-4 bg-[#14372F] text-white font-black text-[13px] lg:text-[14px] tracking-[0.25em] uppercase shadow-sm mb-6 lg:mb-8 outline-none">
                            Select Size
                        </button>

                        {/* Product Footer Links */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4 pt-8 lg:pt-10">
                            {['Product Details', 'Size Guide', 'Delivery & Returns'].map((link) => (
                                <button key={link} className="flex items-center gap-2 text-[9px] lg:text-[16px] font-black transition-all group outline-none" style={{fontWeight:"500"}}>
                                    {link}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-lightText group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        @media (max-width: 1024px) {
          .h-screen { height: auto; min-height: 100vh; overflow: auto; }
        }
      `}} />
        </div>
    );
};

export default ProductDetails;