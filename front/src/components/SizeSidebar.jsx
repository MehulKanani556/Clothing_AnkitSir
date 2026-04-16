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
    const handleSizeSelect = (sizeOption) => {
        onSelectSize(sizeOption.size);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-500 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.07,1)] ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-7 border-b border-gray-100">
                    <h2 className="text-xl font-bold tracking-tight text-dark uppercase">Choose Size</h2>
                    <button
                        onClick={onClose}
                        className="group p-2 -mr-2 transition-transform hover:rotate-90 duration-300"
                    >
                        <IoClose size={24} className="text-dark/30 group-hover:text-dark transition-colors" />
                    </button>
                </div>

                {/* Size Options Container */}
                <div className="flex flex-col h-[calc(100%-84px)]">
                    <div className="flex-1 p-8 overflow-y-auto color-sidebar-scroll">
                        <div className="space-y-3">
                            {SIZE_OPTIONS.map((sizeOption) => {
                                const isSelected = selectedSize === sizeOption.size;
                                const isAvailable = sizeOption.available;

                                return (
                                    <div
                                        key={sizeOption.size}
                                        onClick={() => handleSizeSelect(sizeOption)}
                                        className={`group relative flex items-center justify-between py-3  ${
                                            isSelected
                                                ? ''
                                                : isAvailable
                                                    ? ''
                                                    : ''
                                        }`}
                                    >
                                        {/* Left side - Custom Radio and Size */}
                                        <div className="flex items-center gap-5">
                                            <div
                                                className={`relative w-4 h-4 rounded-full border transition-all duration-300 ${
                                                    isSelected
                                                        ? 'border-dark'
                                                        : isAvailable 
                                                            ? 'border-black group-hover:border-dark'
                                                            : 'border-gray-300'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute inset-0.5 rounded-full bg-dark animate-in fade-in zoom-in duration-300" />
                                                )}
                                            </div>
                                            <span
                                                className={`text-base font-semibold tracking-wide transition-colors ${
                                                    isSelected ? 'text-dark' : isAvailable ? 'text-dark/80 group-hover:text-dark' : 'text-gray-300'
                                                }`}
                                            >
                                                {sizeOption.size}
                                            </span>
                                        </div>

                                        {/* Right side - Status Label */}
                                        {sizeOption.status && (
                                            <div className="flex flex-col items-end">
                                                <span
                                                    className={`text-[10px] font-bold uppercase tracking-widest ${
                                                        sizeOption.status.includes('Sold Out')
                                                            ? isAvailable ? 'text-red-500' : 'text-red-500/60'
                                                            : 'text-orange-500'
                                                    }`}
                                                >
                                                    {sizeOption.status}
                                                </span>
                                            </div>
                                        )}                                
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SizeSidebar;
