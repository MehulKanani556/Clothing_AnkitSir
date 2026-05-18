import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuSearch } from "react-icons/lu";
import { HiArrowUpRight } from "react-icons/hi2";
import { supportCategories, allFaqs } from '../utils/supportData';

// Shared Components
import SupportBreadcrumb from '../components/support/SupportBreadcrumb';
import FAQItem from '../components/support/FAQItem';
import SupportContact from '../components/support/SupportContact';

const SupportHero = ({ searchQuery, setSearchQuery }) => (
    <section className="pt-12 pb-12 md:pt-20 md:pb-20 px-4 md:px-10 lg:px-20 text-center max-w-5xl mx-auto">
        <p className="text-[10px] md:text-lg font-semibold uppercase text-mainText mb-4 animate-fade-in">
            NEED HELP?
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-primary mb-4">
            HOW CAN WE HELP YOU?
        </h1>
        <p className="text-sm md:text-lg text-lightText font-light mb-8 mx-auto">
            Find answers or contact our support team.
        </p>

        <div className="relative max-w-3xl mx-auto group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <LuSearch className="text-xl md:text-2xl text-mainText group-focus-within:text-primary transition-colors" />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help (orders, payments, account)"
                className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-6 bg-mainBG border-none text-sm md:text-lg text-mainText focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
        </div>
    </section>
);

const CategoryCard = ({ cat }) => (
    <div className="bg-mainBG p-6 md:p-10 lg:p-14 text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-border/10 rounded-sm">
        <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white group-hover:scale-110 transition-transform duration-500 overflow-hidden">
            <img src={cat.icon} alt={cat.title} className="w-full h-full object-cover p-2" />
        </div>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-2 uppercase tracking-tight">
            {cat.title}
        </h3>
        <p className="text-[10px] md:text-lg font-semibold uppercase text-mainText mb-2">
            {cat.subtitle}
        </p>
        <p className="text-sm md:text-xl text-lightText mb-6 font-medium">
            {cat.desc}
        </p>
        <Link
            to={`/support/${cat.id}`}
            className="inline-flex items-center gap-2 text-sm md:text-lg font-bold uppercase text-primary group-hover:text-gold transition-colors border-b border-transparent hover:border-gold pb-1"
        >
            {cat.link}
            <HiArrowUpRight className="text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
    </div>
);

export default function Support() {
    const [openFaq, setOpenFaq] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = useMemo(() => {
        const baseFaqs = allFaqs.slice(0, 10);
        if (!searchQuery) return baseFaqs;

        return allFaqs.filter(faq =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 10);
    }, [searchQuery]);

    return (
        <div className="bg-background min-h-screen">
            <SupportBreadcrumb />

            <SupportHero
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <section className="pb-16 md:pb-24 px-4 md:px-10 lg:px-20 max-w-7xl mx-auto">
                <div className="block lg:hidden">
                    <div className="flex flex-col">
                        {faqs.length > 0 ? (
                            faqs.map((faq, index) => (
                                <FAQItem
                                    key={`faq-mobile-${index}`}
                                    faq={faq}
                                    index={index}
                                    isOpen={openFaq === index}
                                    onToggle={toggleFaq}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10 text-lightText">
                                No matching questions found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:grid lg:grid-cols-2 gap-x-16 items-start">
                    {faqs.length > 0 ? (
                        <>
                            <div className="flex flex-col">
                                {faqs.map((faq, index) => index % 2 === 0 && (
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
                                {faqs.map((faq, index) => index % 2 !== 0 && (
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
                        <div className="col-span-full text-center py-10 text-lightText">
                            No matching questions found.
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-background px-4 md:px-10 lg:px-20">
                <div className="max-w-7xl mx-auto text-center mb-8 md:mb-12 lg:mb-16">
                    <p className="text-[10px] md:text-lg font-semibold uppercase text-mainText mb-4 animate-fade-in">
                        FIND YOUR ANSWER
                    </p>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-primary mb-4">
                        BROWSE BY CATEGORY
                    </h1>
                    <p className="text-sm md:text-lg text-lightText font-light mb-8 mx-auto">
                        Find help based on what you need.
                    </p>
                </div>

                <div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {supportCategories.map((cat) => (
                        <CategoryCard key={cat.id} cat={cat} />
                    ))}
                </div>
            </section>

            <SupportContact />
        </div>
    );
}

