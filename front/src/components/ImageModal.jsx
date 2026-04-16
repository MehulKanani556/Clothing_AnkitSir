import React, { useState, useEffect } from 'react';
import { IoClose, IoAdd, IoRemove } from 'react-icons/io5';

const ImageModal = ({ isOpen, onClose, images, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setZoom(100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialIndex]);

    if (!isOpen) return null;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 w-full px-5 sm:px-8 md:px-10 py-4 sm:py-6 lg:py-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-1 sm:gap-4 md:gap-6">
                    <div className="flex items-center gap-0.5 sm:gap-2 px-1 sm:px-4 py-1 sm:py-2">
                        <button
                            onClick={handleZoomOut}
                            className="text-dark hover:opacity-50 transition-opacity p-2"
                        >
                            <IoRemove size={window.innerWidth < 480 ? 16 : 22} />
                        </button>
                        <span className="text-[11px] sm:text-sm font-bold min-w-[30px] sm:min-w-[45px] text-center tracking-tight">
                            {zoom}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="text-dark hover:opacity-50 transition-opacity p-2"
                        >
                            <IoAdd size={window.innerWidth < 480 ? 16 : 22} />
                        </button>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-all active:scale-95 outline-none"
                    aria-label="Close modal"
                >
                    <IoClose size={window.innerWidth < 480 ? 24 : 32} className="text-dark" />
                </button>
            </div>

            {/* Main Image Container */}
            <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-8 md:p-12 overflow-hidden select-none">
                <div
                    className="relative transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.07,1)] cursor-zoom-in"
                    style={{ transform: `scale(${zoom / 100})` }}
                >
                    <img
                        src={images[currentIndex]?.src}
                        alt={images[currentIndex]?.alt}
                        className="max-w-[90vw] max-h-[55vh] sm:max-h-[65vh] lg:max-h-[70vh] object-contain transition-opacity duration-300"
                    />
                </div>
            </div>

            {/* Thumbnails Footer */}
            <div className="w-full pb-6 sm:pb-10 lg:pb-12 px-4 sm:px-6 flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                {images.map((img, idx) => (
                    <button
                        key={img.id}
                        onClick={() => {
                            setCurrentIndex(idx);
                            setZoom(100);
                        }}
                        className={`w-[70px] h-[70px] sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-white border-[1px] sm:border-2 transition-all duration-300 flex-shrink-0 relative group ${
                            currentIndex === idx 
                                ? 'border-dark' 
                                : 'border-gray-100 hover:border-gray-300'
                        }`}
                    >
                        <img
                            src={img?.src}
                            alt={img?.alt}
                            className={`w-full h-full object-cover duration-300 ${
                                currentIndex === idx ? '' : 'group-hover:opacity-100'
                            }`}
                        />
                        {currentIndex === idx && (
                            <div className="absolute inset-0 bg-dark/5 pointer-events-none" />
                        )}
                    </button>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `
            }} />
        </div>
    );
};

export default ImageModal;
