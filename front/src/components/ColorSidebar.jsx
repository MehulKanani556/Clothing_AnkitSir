import React from 'react';

const COLOR_VARIANTS = [
    { id: 1, name: "Tennis Crochet Shorts", price: "$180", color: "White", hex: "#F5F0E8", img: "/images/product.png" },
    { id: 2, name: "Tennis Crochet Shorts", price: "$180", color: "Cream", hex: "#EDE8D8", img: "/images/product.png" },
    { id: 3, name: "Tennis Crochet Shorts", price: "$180", color: "Black", hex: "#1a1a1a", img: "/images/product.png" },
    { id: 4, name: "Tennis Crochet Shorts", price: "$180", color: "Grey", hex: "#9E9E9E", img: "/images/product.png" },
    { id: 5, name: "Black Striped Crochet Short", price: "$180", color: "Black/Green", hex: "#1a1a1a", img: "/images/product.png" },
    { id: 6, name: "Cotton Tennis Crochet Shorts", price: "$180", color: "Sky Blue", hex: "#BFDBF7", img: "/images/product.png" },
    { id: 7, name: "Cotton Tennis Crochet Shorts", price: "$180", color: "Olive", hex: "#6B7C4D", img: "/images/product.png" },
    { id: 8, name: "Cotton Tennis Crochet Shorts", price: "$180", color: "Navy", hex: "#1B2A4A", img: "/images/product.png" },
    { id: 9, name: "Cotton Tennis Crochet Shorts", price: "$180", color: "Charcoal", hex: "#3A3A3A", img: "/images/product.png" },
    { id: 10, name: "Stripe Crochet Shorts", price: "$180", color: "Green/White", hex: "#D4E8C2", img: "/images/product.png" },
    { id: 11, name: "Stripe Knitted Shorts", price: "$180", color: "White/Blue", hex: "#EEF4FB", img: "/images/product.png" },
];

export { COLOR_VARIANTS };

export default function ColorSidebar({ isOpen, onClose, selectedVariant, onSelectVariant }) {
    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-[80] bg-black/50 transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Sidebar Panel */}
            <div
                className={`fixed top-0 right-0 h-full z-[90] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col w-full sm:w-[480px] md:w-[600px] lg:w-[721px] max-w-[95vw]`}
                style={{
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                }}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
                    <h2 className="text-sm sm:text-[15px] font-semibold text-dark tracking-[0.05em]">Choose Color</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors outline-none"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Grid — table-style with border lines between cells */}
                <div className="flex-1 overflow-y-auto color-sidebar-scroll">
                    <div
                        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 p-4 sm:p-6 lg:p-8 gap-0"
                        style={{ borderTop: '1px solid #e2e2e2', borderLeft: '1px solid #e2e2e2' }}
                    >
                        {COLOR_VARIANTS.map((variant) => {
                            const isSelected = selectedVariant.id === variant.id;
                            return (
                                <button
                                    key={variant.id}
                                    onClick={() => onSelectVariant(variant)}
                                    className="flex flex-col text-left outline-none transition-all duration-200 group"
                                    style={{ border: '1px solid #e9ecef' }}
                                >
                                    {/* Product Image Area */}
                                    <div
                                        className="p-3 sm:p-4 lg:p-[18px] flex items-center justify-center w-full overflow-hidden transition-colors duration-300"
                                        style={{
                                            aspectRatio: '1 / 1',
                                            backgroundColor: isSelected ? '#F8F9FA' : '',
                                        }}
                                    >
                                        <img
                                            src={variant.img}
                                            alt={variant.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                    {/* Product Info */}
                                    <div
                                        className='w-full px-2 sm:px-3 lg:px-[12px] py-2 sm:py-3 lg:py-[14px] flex flex-col justify-center items-center text-center transition-colors duration-300'
                                        style={{ backgroundColor: isSelected ? '#F8F9FA' : '#fff' }}
                                    >
                                        <p className="text-xs sm:text-sm lg:text-[14px] text-[#1a1a1a] font-normal mb-[2px] sm:mb-[3px] leading-tight">
                                            {variant.name}
                                        </p>
                                        <p className="text-xs sm:text-sm lg:text-[14px] font-normal">
                                            {variant.price}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .color-sidebar-scroll::-webkit-scrollbar { width: 4px; }
                    .color-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                    .color-sidebar-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 99px; }
                    .color-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }
                    
                    @media (max-width: 475px) {
                        .grid-cols-1.xs\\:grid-cols-2 {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }
                    }
                `
            }} />
        </>
    );
}
