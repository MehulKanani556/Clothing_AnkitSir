import React from 'react'

export default function DeliveryReturns() {
    return (
        <div className="bg-mainBG min-h-screen pt-12 pb-12 md:pb-24 px-6 md:px-10 font-urbanist">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-xl md:text-3xl font-semibold text-primary tracking-wide">Delivery & Returns</h1>
                </div>

                <h2 className="text-base font-semibold uppercase tracking-normal text-mainText">
                    The EO Service Commitment
                </h2>
                {/* Section 1: Digital Concierge */}
                <section className="mt-6">
                    <h3 className="text-sm md:text-lg font-semibold text-primary mb-1">
                        1. Shipping & Delivery
                    </h3>
                    <p className="text-sm text-lightText font-medium leading-relaxed mb-1">
                        We offer a range of delivery options tailored to your location and urgency. All EO orders are shipped in our Signature Sustainable Packaging, designed to protect your garments while respecting the environment.
                    </p>
                    <p className="text-base text-primary font-medium leading-relaxed mb-1">
                        International
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Global Express (DHL/FedEx): 5–7 business days. Shipping calculated at checkout based on destination.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Duties & Taxes: For international orders, duties and taxes are calculated and collected at checkout (DDP) to ensure no surprise charges upon delivery.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Note: All shipments require a signature upon delivery to ensure the security of your purchase.</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Visit Our Studio */}
                <section className="mt-6 pt-6 md:pt-8 border-t border-border">
                    <h3 className="text-sm md:text-lg font-semibold text-primary mb-1">
                        2. Returns & Exchanges
                    </h3>
                    <p className="text-sm text-lightText font-medium max-w-2xl leading-relaxed mb-2">
                        If your selection is not the perfect fit, we offer a 14-day return window from the date of delivery.
                    </p>
                    <div>
                        <h4 className="text-sm md:text-base font-bold text-primary mb-2">Return Conditions</h4>
                        <p className="text-sm text-lightText font-medium leading-relaxed mb-1">To be eligible for a return, your item must meet the following criteria:</p>
                        <div className="space-y-2 pl-1.5 md:pl-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Items must be in their original condition (unworn, unwashed, unaltered).</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">All EO security tags and branded packaging must be intact.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Luxe Care products and intimate apparel are non-returnable for hygiene reasons.</p>
                            </div>
                        </div>
                    </div>
                    <div className='mt-3'>
                        <h4 className="text-sm md:text-base font-bold text-primary mb-2">The Process</h4>
                        <div className="space-y-2 pl-1.5 md:pl-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Request: Log in to your Account and select the order you wish to return.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Authorization: Once approved, you will receive a pre-paid shipping label via email.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Pickup: Schedule a complimentary courier pickup at your convenience.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                                <p className="text-xs md:text-sm text-lightText font-medium">Refund: After our Atelier inspects the return, your refund will be processed to the original payment method within 7–10 business days.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Specialized Inquiries */}
                <section className="mt-6 pt-6 md:pt-8 border-t border-border">
                    <h3 className="text-sm md:text-lg font-semibold text-primary mb-1">
                        3. Exchanges
                    </h3>
                    <p className="text-sm text-lightText font-medium leading-relaxed mb-2">
                        We offer size exchanges subject to stock availability. To initiate an exchange, please contact our Concierge Team or visit the "Exchange" section in your Order History.
                    </p>
                </section>

                {/* Section 4: Need Assistance? */}
                <section className="mt-6 pt-6 md:pt-8 border-t border-border">
                    <h3 className="text-sm md:text-lg font-semibold text-primary mb-1">
                        4. Need Assistance?
                    </h3>
                    <p className="text-sm text-lightText font-medium leading-relaxed mb-2">
                        Our dedicated support team is available to assist with any questions regarding your delivery or return.
                    </p>
                    <div className="space-y-2 pl-1.5 md:pl-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Email: support@eo-essentials.com</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">WhatsApp / Concierge: +91 [Insert Number]</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Hours: Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
                        </div>
                    </div>
                </section>

                {/* Design Tip for your Framer Site: */}
                <section className="mt-6 pt-6 md:pt-8 border-t border-border">
                    <h3 className="text-sm md:text-lg font-semibold text-primary mb-1">
                        Design Tip for your Framer Site:
                    </h3>
                    <div className="space-y-2 pl-1.5 md:pl-2">
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Use an Accordion (Dropdown) style for the "Shipping" and "Returns" sections to keep the page looking minimal and clean.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lightText bg-lightText h-1 w-1 rounded-full"></span>
                            <p className="text-xs md:text-sm text-lightText font-medium">Add a small icon of your Signature Box next to the shipping section to emphasize the luxury unboxing experience.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}