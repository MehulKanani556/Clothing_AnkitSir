import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import AccountLayout from './AccountLayout';
import { fetchOrderById, clearCurrentOrder, cancelOrder } from '../../redux/slice/order.slice';
import { HiArrowLeft } from 'react-icons/hi2';
import InvoiceModal from './InvoiceModal';

const CANCEL_REASONS = [
    'Ordered by mistake',
    'Found better price',
    'Delivery is too late',
    'Other',
];

const STATUS_STYLES = {
    'Delivered': 'text-[#009951]',
    'On the way': 'text-gold',
    'Pending': 'text-gold',
    'Cancelled': 'text-[#C00F0C]',
};

function StatusBadge({ status }) {
    const cls = STATUS_STYLES[status] || 'text-gray-500';
    return <span className={`text-sm md:text-base font-bold ${cls}`}>{status}</span>;
}

// Skeleton loader
function Skeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 animate-pulse">
            <div className="space-y-4">
                <div className="bg-white h-64 rounded-sm" />
                <div className="bg-white h-32 rounded-sm" />
            </div>
            <div className="space-y-4">
                <div className="bg-white h-64 rounded-sm" />
                <div className="bg-white h-32 rounded-sm" />
            </div>
        </div>
    );
}

// Cancel confirmation modal
function CancelModal({ onClose, onConfirm, loading, error }) {
    const [selectedReason, setSelectedReason] = useState('');

    const handleConfirm = () => {
        if (!selectedReason) return;
        onConfirm(selectedReason);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-xl mx-4 p-6 relative">

                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xl md:text-2xl font-bold text-primary">Cancel Order?</h2>
                    <button
                        onClick={onClose}
                        className="text-lightText hover:text-dark transition-colors text-xl"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm md:text-base font-medium text-lightText mb-2 md:mb-5">Are you sure you want to cancel this order?</p>

                <p className="text-sm md:text-lg font-semibold text-primary mb-2 md:mb-4">Why are you cancelling?</p>
                <div className="flex flex-col gap-2 md:gap-4 mb-2 md:mb-5">
                    {CANCEL_REASONS.map((reason) => (
                        <label key={reason} className="flex items-center gap-3 cursor-pointer">
                            <span
                                className={`w-4 h-4 md:w-5 md:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${selectedReason === reason ? 'border-dark bg-white' : 'border-dark bg-white'
                                    }`}
                            >
                                {selectedReason === reason && (
                                    <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-dark" />
                                )}
                            </span>
                            <input
                                type="radio"
                                name="cancelReason"
                                value={reason}
                                checked={selectedReason === reason}
                                onChange={() => setSelectedReason(reason)}
                                className="sr-only"
                            />
                            <span className="text-sm md:text-base text-lightText">{reason}</span>
                        </label>
                    ))}
                </div>

                {/* Info banner */}
                <div className="bg-[#EBFFEE] text-[#009951] text-sm md:text-base px-2 md:px-4 py-2 mb-2 md:mb-5">
                    <span className="font-bold">Info:</span> Refund will be processed to your original payment method.
                </div>

                {error && (
                    <p className="text-sm text-red-500 mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={handleConfirm}
                        disabled={loading || !selectedReason}
                        className="flex-1 border border-border text-dark text-xs md:text-sm font-bold py-2 md:py-3 hover:bg-mainBG transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'CANCELLING...' : 'YES, CANCEL'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 font-semibold bg-primary text-white text-xs md:text-sm tracking-wide py-2 md:py-3 hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                        NO, KEEP ORDER
                    </button>
                </div>
            </div>
        </div>
    );
}

// Order cancelled success modal
function CancelledModal({ onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md mx-4 p-8 flex flex-col items-center text-center">
                {/* Cancelled icon */}
                <div className="mb-2 md:mb-4">
                    <img src={require("../../assets/images/order cancel.webp")} alt="Order Cancelled" className='h-20 w-20 md:h-full md:w-full object-cover' />
                </div>

                <h2 className="text-base md:text-2xl font-bold text-primary mb-1 md:mb-2">Order Cancelled</h2>
                <p className="text-sm md:text-lg text-lightText mb-3 md:mb-6">
                    Your order has been cancelled. Refund will be processed within 3–5 business days.
                </p>

                <Link
                    to="/"
                    onClick={onClose}
                    className="text-xs md:text-base font-bold text-primary uppercase flex items-center gap-2 mb-3 md:mb-5 hover:text-primary transition-colors"
                >
                    BACK TO HOME
                    <span className="">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 md:size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                    </span>
                </Link>

                <Link
                    to="/collection/shop"
                    onClick={onClose}
                    className="w-full bg-primary text-white text-xs md:text-base font-bold py-2 md:py-3 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors tracking-wide"
                >
                    VIEW ALL SIGNATURE PIECES
                    <span className="">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 md:size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                    </span>
                </Link>
            </div>
        </div>
    );
}

export default function OrderDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentOrder: order, detailLoading: loading, detailError: error, cancelLoading, cancelError } = useSelector(
        (state) => state.order
    );

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCancelledModal, setShowCancelledModal] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        dispatch(fetchOrderById(id));
        return () => dispatch(clearCurrentOrder());
    }, [dispatch, id]);

    const handleCancelConfirm = async (reason) => {
        const result = await dispatch(cancelOrder({ id: order._id, reason }));
        if (!result.error) {
            setShowCancelModal(false);
            setShowCancelledModal(true);
        }
    };

    const formattedDate = order?.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : '—';

    // Estimated arrival: +7 days from order date
    const arrivalDate = order?.createdAt
        ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
            'en-US',
            { month: 'short', day: 'numeric', year: 'numeric' }
        )
        : null;

    const addr = order?.shippingAddress;
    const subtotal = order?.billingAmount ?? 0;
    const discount = order?.discountAmount ?? 0;
    const shipping = order?.shippingCost ?? 0;
    const total = order?.totalAmount ?? 0;
    const isCancellable = order && !['Delivered', 'Cancelled'].includes(order.orderStatus);

    return (
        <AccountLayout>
            <div className="flex flex-col gap-3 md:gap-6">

                {/* Modals */}
                {showCancelModal && (
                    <CancelModal
                        onClose={() => setShowCancelModal(false)}
                        onConfirm={handleCancelConfirm}
                        loading={cancelLoading}
                        error={cancelError}
                    />
                )}
                {showCancelledModal && (
                    <CancelledModal onClose={() => setShowCancelledModal(false)} />
                )}
                {showInvoice && order && (
                    <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
                )}

                {/* Back link */}
                <Link
                    to="/orders"
                    className="inline-flex items-center gap-2 hover:text-primary transition-colors w-fit text-lg md:text-[28px] font-semibold text-primary"
                >
                    <HiArrowLeft className="text-lg md:text-xl" />
                    Back to Orders
                </Link>

                {loading && <Skeleton />}

                {!loading && error && (
                    <div className="text-center py-20 text-red-500 text-sm">{error}</div>
                )}

                {!loading && !error && order && (
                    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 items-start">
                        {/* ── LEFT COLUMN ── */}
                        <div className="flex flex-col gap-4">
                            {/* Order summary card */}
                            <div className="bg-white p-5 flex flex-col gap-4">
                                {/* Order header */}
                                <div className="flex flex-col sm375:flex-row items-start justify-between gap-2 sm375:gap-0">
                                    <div>
                                        <p className="text-sm md:text-base font-semibold text-mainText uppercase">
                                            #{order.orderId}
                                        </p>
                                        <p className="text-xs md:text-sm text-lightText font-medium mt-0.5">
                                            Placed on {formattedDate}
                                        </p>
                                    </div>
                                    <div className="text-left sm375:text-right">
                                        <StatusBadge status={order.orderStatus} />
                                        {order.orderStatus === 'Cancelled' && order.cancelledAt && (
                                            <p className="text-xs md:text-sm text-mainText font-bold mt-0.5">
                                                on {new Date(order.cancelledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        )}
                                        {arrivalDate && !['Delivered', 'Cancelled'].includes(order.orderStatus) && (
                                            <p className="text-xs md:text-sm font-bold text-mainText mt-0.5">
                                                Arriving by {arrivalDate}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Products list */}
                                <div className="flex flex-col divide-y divide-border">
                                    {order.products?.map((item, idx) => {
                                        const img =
                                            item.productId?.images?.[0] ||
                                            item.variantId?.images?.[0] ||
                                            null;
                                        const name = item.name || item.productId?.name || 'Product';
                                        const color = item.variantId?.color || null;
                                        const size = item.selectedSize || null;
                                        const price = item.price != null ? `$${item.price}` : null;

                                        return (
                                            <div key={idx} className="flex items-start gap-4 py-4 first:pt-0">
                                                {/* Thumbnail */}
                                                <div className="w-[72px] h-[72px] shrink-0 bg-mainBG border border-border overflow-hidden rounded-sm">
                                                    {img ? (
                                                        <img
                                                            src={img}
                                                            alt={name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lightText text-[10px]">
                                                            No img
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm md:text-base font-medium text-dark leading-snug line-clamp-2">
                                                        {name}
                                                    </p>
                                                    <div className="mt-1 space-y-0.5 text-xs md:text-sm text-lightText">
                                                        <div className="flex gap-3">
                                                            {color && <span>Color: {color}</span>}
                                                            {size && <span>Size: {size}</span>}
                                                        </div>
                                                        {price && <p>Price: {price}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer: total + cancel */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm font-extrabold text-lightText">Total Paid</p>
                                        <p className="text-sm mt-1 md:text-lg font-semibold text-primary">${total.toFixed(2)}</p>
                                    </div>
                                    {isCancellable && (
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="border border-[#C00F0C] text-[#C00F0C] text-xs md:text-sm font-semibold px-3 py-1 md:px-5 md:py-2 hover:bg-red-50 transition-colors"
                                        >
                                            CANCEL ORDER
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Delivery address card — hidden when cancelled */}
                            {order.orderStatus !== 'Cancelled' && (
                                <div className="bg-white p-5">
                                    <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3 text-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                        </svg>
                                        <p className="text-base md:text-lg font-semibold text-primary uppercase tracking-normal">
                                            Delivery To
                                        </p>
                                    </div>
                                    <p className="text-sm md:text-base font-medium text-lightText mb-1 md:mb-2">Contact Detail</p>
                                    {addr ? (
                                        <div className="text-sm md:text-base font-semibold text-dark space-y-0.5">
                                            <p className="font-semibold">
                                                {addr.firstName || ''}{' '}
                                                {addr.lastName || ''}
                                            </p>
                                            {addr.phone && <p>{addr.phone}</p>}
                                            <p>
                                                {[addr.aptSuite, addr.street, addr.city, addr.state, addr.postalCode || addr.zipcode]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-lightText">No address on file</p>
                                    )}
                                </div>
                            )}

                            {/* Refund details card — shown only when cancelled */}
                            {order.orderStatus === 'Cancelled' && (
                                <div className="bg-white p-6 flex flex-col gap-6">
                                    <h3 className="text-xs font-bold text-lightText uppercase tracking-[2px]">
                                        Refund Details
                                    </h3>

                                    <div className="space-y-2">
                                        <div className="border-b border-gray-100 pb-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm md:text-base font-semibold text-mainText">Total Refundable Amount</p>
                                                <span className="text-sm md:text-base font-bold text-mainText">${(total - shipping).toFixed(2)}</span>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <p className="text-xs md:text-sm font-medium text-lightText mt-1">
                                                    $ {(total - shipping).toFixed(2)}
                                                </p>
                                                <p className="text-xs md:text-sm font-medium text-lightText mt-1">Added to {order.paymentMethod || 'Payment Method'}
                                                    {order.cardLast4 ? ` — ${order.cardLast4}` : ''}</p>
                                            </div>
                                        </div>

                                        {/* Dynamic Refund Message Based on Status */}
                                        {order.paymentStatus === 'Refunded' ? (
                                            <div className="flex items-center gap-1 text-[#009951] rounded-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                                <p className="text-xs md:text-sm font-medium leading-relaxed">
                                                    The refund has been processed successfully on {new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-3 text-mainText bg-gray-50 border border-gray-100 p-4 rounded-sm font-medium">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 shrink-0 mt-0.5 text-lightText">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                                </svg>
                                                <p className="text-sm leading-relaxed">
                                                    Refunds are processed within 3-5 business days. We will notify you once your refund has been issued. If you have questions, <Link to="/support" className="text-blue-600 underline font-semibold transition-all">contact us</Link>.
                                                </p>
                                            </div>
                                        )}

                                        {/* Shipping Policy Note */}
                                        {order.paymentStatus !== 'Refunded' ? (
                                            <div className="bg-[#FFF1F0] text-[#C00F0C] text-[13px] font-semibold px-4 py-3 rounded-sm border border-[#FFD8D6]">
                                                Note: Shipping fees are non-refundable as per policy.
                                            </div>
                                        ) : (
                                            <div className="text-mainText text-sm font-medium">
                                                If you have questions, <Link to="/contact" className="text-blue-600 underline font-semibold transition-all">contact us</Link> at.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT COLUMN ── */}
                        <div className="flex flex-col gap-4">

                            {/* Payment information card */}
                            <div className="bg-white p-6 flex flex-col gap-3 sm:gap-5">
                                <h3 className="text-xs font-bold text-lightText uppercase tracking-[2px]">
                                    Payment Information
                                </h3>

                                {/* Per-item breakdown */}
                                <div className="space-y-3">
                                    {order.products?.map((item, idx) => {
                                        const name = item.name || item.productId?.name || 'Product';
                                        return (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-lightText font-medium">
                                                    {item.quantity}x {name}
                                                </span>
                                                <span className="text-mainText font-semibold">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-border pt-4 space-y-2.5">
                                    <div className="flex justify-between text-sm text-lightText font-medium">
                                        <span>Subtotal ({order.products?.length} items)</span>
                                        <span className='text-mainText font-semibold'>${subtotal.toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-lightText">Discount</span>
                                            <span className="text-[#009951]">-${discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-lightText font-medium pb-2">
                                        <span>Shipping</span>
                                        <span className='text-mainText font-semibold'>${shipping.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-border pt-4">
                                    <span className="text-sm font-bold text-mainText uppercase">Total Paid :</span>
                                    <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                                </div>

                                {/* Payment method */}
                                {order.paymentMethod && (
                                    <div className="flex items-center gap-3 bg-mainBG p-3 text-mainText text-[13px] font-medium border border-border rounded-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-lightText">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                        </svg>
                                        <span>Paid by {order.paymentMethod} {order.cardDetails?.cardType || ''}</span>
                                    </div>
                                )}

                                {/* Get Invoice */}
                                <button
                                    onClick={() => setShowInvoice(true)}
                                    className="w-full border border-gray-200 text-xs font-bold text-mainText py-3 tracking-widest hover:bg-gray-50 transition-all uppercase rounded-sm"
                                >
                                    GET INVOICE
                                </button>
                            </div>

                            {/* Updates sent to card */}
                            <div className="bg-white p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-lightText">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                    </svg>
                                    <h3 className="text-xs font-bold text-mainText uppercase tracking-normal">
                                        Updates Sent To
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-lightText uppercase mb-1 tracking-wider">Call</p>
                                        <p className="text-sm text-mainText font-semibold tracking-tight">
                                            {order.userId?.mobileNo || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-lightText uppercase mb-1 tracking-wider">Email</p>
                                        <p className="text-sm text-mainText font-semibold break-all leading-tight">
                                            {order.userId?.email || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </AccountLayout>
    );
}
