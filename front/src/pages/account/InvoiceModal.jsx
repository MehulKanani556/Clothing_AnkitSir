import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function InvoiceModal({ order, onClose }) {
    const invoiceRef = useRef();
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const element = invoiceRef.current;
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const usableWidth = pageWidth;
            const imgHeightMm = (canvas.height * usableWidth) / canvas.width;

            if (imgHeightMm <= pageHeight + 2) {
                pdf.addImage(imgData, 'PNG', 0, 0, usableWidth, imgHeightMm);
            } else {
                let yOffset = 0;
                while (yOffset < imgHeightMm - 1) {
                    if (yOffset > 0) pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, -yOffset, usableWidth, imgHeightMm);
                    yOffset += pageHeight;
                }
            }

            pdf.save(`Invoice-${order.userId?.firstName || 'User'}-${order?._id?.slice(0, 6)?.toUpperCase()}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    const addr = order.shippingAddress;
    const subtotal = order.billingAmount ?? 0;
    const discount = order.discountAmount ?? 0;
    const shipping = order.shippingCost ?? 0;
    const total = order.totalAmount ?? 0;

    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    const statusColor =
        order.orderStatus === 'Delivered' ? 'text-green-600' :
            order.orderStatus === 'Cancelled' ? 'text-red-600' : 'text-amber-600';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] flex flex-col rounded shadow-xl overflow-hidden">

                {/* Toolbar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Document Preview</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="bg-[#14372F] text-white text-[11px] font-medium px-6 py-2 rounded hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 uppercase tracking-wider"
                        >
                            {downloading ? 'Preparing...' : 'Download PDF'}
                        </button>
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 bg-gray-100/50 p-8">
                    {/* The Invoice Container - Fixed A4 Pixels for Export Consistency */}
                    <div
                        ref={invoiceRef}
                        className="bg-white mx-auto shadow-sm flex flex-col font-sans"
                        style={{
                            width: '794px',
                            minHeight: '1122px',
                            padding: '60px 50px',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Simple Logo Header */}
                        <div className="mb-10">
                            <h1 className="text-2xl font-semibold tracking-normal text-gray-800 uppercase m-0">ELORA</h1>
                            <div className="h-0.5 w-8 bg-[#D4AF37] mt-2" />
                        </div>

                        {/* Top Metadata Bar */}
                        <div className="flex justify-between border-b border-gray-100 pb-5 mb-10">
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Order Identifier</p>
                                <p className="text-sm font-medium text-gray-800 uppercase">#{order.orderId}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Date Issued</p>
                                <p className="text-sm font-medium text-gray-800">{formattedDate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Current Status</p>
                                <p className={`text-[11px] font-bold uppercase ${statusColor}`}>{order.orderStatus}</p>
                            </div>
                        </div>

                        {/* Address & Payment Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div className="bg-gray-50/50 p-6 border-l-2 border-[#14372F]">
                                <h3 className="text-[11px] font-bold uppercase text-gray-500 mb-3 tracking-wide">Shipping Address</h3>
                                {addr ? (
                                    <div className="text-sm leading-relaxed text-gray-700">
                                        <p className="font-semibold text-gray-900 mb-1">{addr.firstName} {addr.lastName}</p>
                                        <p>{addr.aptSuite}, {addr.street}</p>
                                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                                    </div>
                                ) : <p className="text-gray-400">—</p>}
                            </div>
                            <div className="bg-gray-50/50 p-6 border-l-2 border-[#14372F]">
                                <h3 className="text-[11px] font-bold uppercase text-gray-500 mb-3 tracking-wide">Payment Summary</h3>
                                <div className="space-y-1.5">
                                    <p className="text-xs text-gray-500">Method: <span className="text-gray-900 font-medium">{order.paymentMethod}</span></p>
                                    {order.appliedCoupon?.code && (
                                        <p className="text-xs text-gray-500 font-medium">Coupon: <span className="text-[#D4AF37]">{order.appliedCoupon.code}</span></p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <table className="w-full mb-10 border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left py-3 text-[10px] font-bold uppercase text-gray-600">Product Details</th>
                                    <th className="text-center py-3 text-[10px] font-bold uppercase text-gray-600 w-16">Qty</th>
                                    <th className="text-right py-3 text-[10px] font-bold uppercase text-gray-600 w-24">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {order.products?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-4">
                                            <div className="font-medium text-[13px] text-gray-900">{item.name || item.productId?.name}</div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {[item.variantId?.color, item.selectedSize].filter(Boolean).join(' / ')}
                                            </div>
                                        </td>
                                        <td className="text-center text-sm text-gray-600">{item.quantity}</td>
                                        <td className="text-right text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Calculation Section */}
                        <div className="mt-auto">
                            <div className="flex justify-end mb-10">
                                <div className="w-56 space-y-2">
                                    <div className="flex justify-between text-xs text-gray-600 font-medium">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-xs font-semibold text-green-600">
                                            <span>Discount</span>
                                            <span>-${discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs text-gray-600 font-medium pb-3 border-b border-gray-50">
                                        <span>Delivery</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3">
                                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Total</span>
                                        <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-6 border-t border-gray-100 text-center">
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">
                                    Authorized Transaction Receipt · Thank you for shopping with Us
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}