import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';

// Size options with availability status
export const SIZE_OPTIONS = [
    { size: 'XS', available: false, status: 'Sold Out - Notify Me' },
    { size: 'S', available: true, status: null },
    { size: 'M', available: true, status: null },
    { size: 'L', available: false, status: 'Sold Out - Notify Me' },
    { size: 'XL', available: true, status: 'Low Stock' },
    { size: 'XXL', available: true, status: null },
    { size: 'XXXL', available: true, status: 'Low Stock' }
];

const SizeSidebar = ({ isOpen, onClose, selectedSize, onSelectSize }) => {
    const [hoveredSize, setHoveredSize] = useState(null);

    const handleSizeSelect = (sizeOption) => {
        if (sizeOption.available) {
            onSelectSize(sizeOption.size);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-dark">Choose Size</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors outline-none"
                    >
                        <IoClose size={24} className="text-dark" />
                    </button>
                </div>

                {/* Size Options */}
                <div className="p-6 overflow-y-auto h-[calc(100%-80px)] color-sidebar-scroll">
                    <div className="space-y-4">
                        {SIZE_OPTIONS.map((sizeOption) => (
                            <div
                                key={sizeOption.size}
                                onClick={() => handleSizeSelect(sizeOption)}
                                onMouseEnter={() => setHoveredSize(sizeOption.size)}
                                onMouseLeave={() => setHoveredSize(null)}
                                className={`flex items-center justify-between p-4 border rounded-lg transition-all cursor-pointer ${
                                    selectedSize === sizeOption.size
                                        ? 'border-dark bg-gray-50'
                                        : sizeOption.available
                                        ? 'border-gray-300 hover:border-gray-400'
                                        : 'border-gray-200 opacity-60 cursor-not-allowed'
                                }`}
                            >
                                {/* Left side - Radio button and size */}
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedSize === sizeOption.size
                                                ? 'border-dark'
                                                : sizeOption.available
                                                ? 'border-gray-400'
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        {selectedSize === sizeOption.size && (
                                            <div className="w-3 h-3 rounded-full bg-dark" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-lg font-medium ${
                                            sizeOption.available ? 'text-dark' : 'text-gray-400'
                                        }`}
                                    >
                                        {sizeOption.size}
                                    </span>
                                </div>

                                {/* Right side - Status */}
                                {sizeOption.status && (
                                    <span
                                        className={`text-sm font-medium ${
                                            sizeOption.status.includes('Sold Out')
                                                ? 'text-red-500'
                                                : 'text-orange-500'
                                        }`}
                                    >
                                        {sizeOption.status}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Size Guide Link */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <button className="flex items-center gap-2 text-dark hover:opacity-70 transition-opacity">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <span className="text-sm font-medium">View Size Guide</span>
                        </button>
                    </div>

                    {/* Notify Me Info */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-dark">Sold Out?</span> Click "Notify Me" to receive an email when this size is back in stock.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SizeSidebar;
