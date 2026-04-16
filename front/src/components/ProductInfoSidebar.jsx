import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const ProductInfoSidebar = ({ isOpen, onClose, initialTab = 'Product Details' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const tabs = ['Product Details', 'Size Guide', 'Delivery & Returns'];

    const renderContent = () => {
        switch (activeTab) {
            case 'Product Details':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-[15px] leading-relaxed text-dark">
                            The black and green striped crochet shorts are a soft textured refined design, featuring the house's signature diamond logo. Completed with a ribbed elasticised waistband, drawstring fastening, side pockets, and contrast stripe detail on the legs.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Cotton crochet fabric',
                                '100% cotton',
                                'Diamond logo patch',
                                'Colour: black/green',
                                'Specialised dry clean only',
                                'Made in Morocco',
                                'The model is 188cm / 6\'2 and is wearing size M',
                                'Relaxed fit',
                                'Exclusive to casablancaparis.com'
                            ].map((item, index) => (
                                <li key={index} className="flex items-start gap-3 text-[15px] text-dark">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-dark shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'Size Guide':
                const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
                const topsData = [
                    { label: 'EU', values: [44, 46, 48, 50, 52, 54, 56] },
                    { label: 'Shoulders (cm)', values: [49, 50, 51, 52, 53, 54, 55] },
                    { label: 'Chest (cm)', values: [88, 92, 96, 100, 104, 108, 112] },
                ];
                const conversionData = [
                    { label: 'EU / France', values: [44, 46, 48, 50, 52, 54, 56] },
                    { label: 'Italy', values: [44, 46, 48, 50, 52, 54, 56] },
                    { label: 'UK / AU', values: [34, 36, 38, 40, 42, 44, 46] },
                    { label: 'US', values: [34, 36, 38, 40, 42, 44, 46] },
                    { label: 'Japan', values: [44, 46, 48, 50, 52, 54, 56] },
                ];

                return (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                        {/* Tops Size Guide */}
                        <div>
                            <h3 className="text-[18px] font-bold uppercase tracking-[0.1em] text-dark mb-6">Men's Tops Size Guide</h3>
                            <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-sm">
                                <table className="w-full text-[13px] text-left border-collapse">
                                    <thead className="bg-[#EBEEF0] text-dark transition-colors">
                                        <tr>
                                            <th className="px-5 py-4 border border-gray-100 font-normal">Product info</th>
                                            {sizes.map(s => (
                                                <th key={s} className="px-5 py-4 border border-gray-100 text-center font-normal">{s}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-dark bg-white">
                                        {topsData.map((row, i) => (
                                            <tr key={i}>
                                                <td className="px-5 py-4 border border-gray-100 font-normal text-dark/70">{row.label}</td>
                                                {row.values.map((v, idx) => (
                                                    <td key={idx} className="px-5 py-4 border border-gray-100 text-center font-normal text-dark">{v}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Conversion Chart */}
                        <div>
                            <h3 className="text-[18px] font-bold uppercase tracking-[0.1em] text-dark mb-6">Men's International Conversion Chart</h3>
                            <div className="overflow-x-auto no-scrollbar border border-gray-100 rounded-sm">
                                <table className="w-full text-[13px] text-left border-collapse">
                                    <thead className="bg-[#EBEEF0] text-dark transition-colors">
                                        <tr>
                                            <th className="px-5 py-4 border border-gray-100 font-normal">Product info</th>
                                            {sizes.map(s => (
                                                <th key={s} className="px-5 py-4 border border-gray-100 text-center font-normal">{s}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-dark bg-white">
                                        {conversionData.map((row, i) => (
                                            <tr key={i}>
                                                <td className="px-5 py-4 border border-gray-100 font-normal text-dark/70">{row.label}</td>
                                                {row.values.map((v, idx) => (
                                                    <td key={idx} className="px-5 py-4 border border-gray-100 text-center font-normal text-dark">{v}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'Delivery & Returns':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section>
                            <h4 className="text-[13px] font-bold uppercase tracking-widest text-dark mb-4">DELIVERY</h4>
                            <p className="text-[15px] text-dark leading-relaxed mb-3">
                                EO’S offers complimentary worldwide DHL Express and UPS delivery on all orders.
                                Timings are estimated from the moment your order is dispatched and may vary depending on your delivery destination, as shown at checkout. All orders placed by 3PM CEST are prepared and dispatched on the same day*. Orders placed at weekends or on bank holidays will be dispatched within 48 hours*.
                            </p>

                        </section>
                        <section>
                            <h4 className="text-[13px] font-bold uppercase tracking-widest text-dark mb-4">DUTIES & RETURNS</h4>
                            <p className="text-[15px] text-dark leading-relaxed">
                                Please note that import duties and taxes may apply upon delivery for customers outside the US, EU and UK. We kindly recommend checking with your country's customs office to determine any applicable import duties and taxes before making a purchase.
                            </p>
                            <p className="text-[15px] text-dark leading-relaxed pt-4">
                                You may return your order within 14 days of delivery. For more information, please refer to our FAQs page.
                            </p>
                        </section>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[85%] md:w-[65%] lg:w-[45%] bg-white shadow-2xl z-[110] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.07,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 md:px-10 py-6 sm:py-8 lg:py-10 border-b border-gray-100">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-dark">Product info</h2>
                    <button
                        onClick={onClose}
                        className="group p-2 -mr-2 transition-transform hover:rotate-90 duration-300 outline-none"
                    >
                        <IoClose size={28} className="text-dark/30 group-hover:text-dark transition-colors" />
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex px-2 sm:px-4 md:px-8 border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 sm:px-5 md:px-6 py-4 sm:py-5 lg:py-6 text-[11px] sm:text-[12px] md:text-[13px] font-bold uppercase tracking-widest whitespace-nowrap transition-all relative outline-none ${activeTab === tab ? 'text-dark' : 'text-gray-300 hover:text-dark/60'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-dark animate-in fade-in slide-in-from-left duration-300" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 lg:p-14 color-sidebar-scroll">
                    <div className="max-w-4xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductInfoSidebar;
