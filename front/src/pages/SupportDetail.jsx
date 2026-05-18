import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { LuSearch } from "react-icons/lu";
import { supportCategories } from '../utils/supportData';

// Shared Components
import SupportBreadcrumb from '../components/support/SupportBreadcrumb';
import FAQItem from '../components/support/FAQItem';
import SupportContact from '../components/support/SupportContact';

const DetailHero = ({ category, searchQuery, setSearchQuery }) => (
    <section className="pt-20 pb-12 px-4 md:px-10 lg:px-20 text-center max-w-5xl mx-auto">
        <p className="text-xs md:text-lg font-semibold uppercase text-mainText mb-4">
            SUPPORT
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-4 uppercase">
            {category.title} HELP
        </h1>
        <p className="text-sm md:text-lg text-lightText font-light mb-8 max-w-2xl mx-auto">
            {category.desc}
        </p>

        <div className="relative max-w-3xl mx-auto group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <LuSearch className="text-xl md:text-2xl text-mainText group-focus-within:text-primary transition-colors" />
            </div>
            <input
                type="text"
                placeholder={`Search for ${category.title.toLowerCase()} help...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 md:py-6 bg-[#F9F9F9] border-none text-sm md:text-lg text-mainText focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
        </div>
    </section>
);

export default function SupportDetail() {
    const { id } = useParams();
    const [openFaq, setOpenFaq] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const category = useMemo(() => 
        supportCategories.find(cat => cat.id === id)
    , [id]);

    const filteredFaqs = useMemo(() => {
        if (!category) return [];
        return category.faqs.filter(faq => 
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [category, searchQuery]);

    if (!category) {
        return <Navigate to="/support" replace />;
    }

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="bg-white min-h-screen">
            <SupportBreadcrumb categoryTitle={category.title} />

            <DetailHero 
                category={category} 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
            />

            <section className="pb-10 md:pb-24 px-4 md:px-10 lg:px-20 max-w-7xl mx-auto">
                <div className="block lg:hidden">
                    <div className="flex flex-col">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => (
                                <FAQItem 
                                    key={`faq-mobile-${index}`}
                                    faq={faq}
                                    index={index}
                                    isOpen={openFaq === index}
                                    onToggle={toggleFaq}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 text-lightText">
                                No questions found matching your search.
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:grid lg:grid-cols-2 gap-x-16 items-start">
                    {filteredFaqs.length > 0 ? (
                        <>
                            <div className="flex flex-col">
                                {filteredFaqs.map((faq, index) => index % 2 === 0 && (
                                    <FAQItem 
                                        key={`faq-left-${index}`}
                                        faq={faq}
                                        index={index}
                                        isOpen={openFaq === index}
                                        onToggle={toggleFaq}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-col">
                                {filteredFaqs.map((faq, index) => index % 2 !== 0 && (
                                    <FAQItem 
                                        key={`faq-right-${index}`}
                                        faq={faq}
                                        index={index}
                                        isOpen={openFaq === index}
                                        onToggle={toggleFaq}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="col-span-full text-center py-20 text-lightText">
                            No questions found matching your search.
                        </div>
                    )}
                </div>
            </section>

            <div className="border-t border-border/20">
                <SupportContact />
            </div>
        </div>
    );
}
