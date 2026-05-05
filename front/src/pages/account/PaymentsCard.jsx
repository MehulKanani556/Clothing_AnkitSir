import React, { useState, useEffect } from 'react'
import AccountLayout from './AccountLayout'
import { FaPlus, FaRegCreditCard } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'
import PaymentSidebar from './PaymentCardSidebar'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSavedCards, deleteSavedCard, selectCard } from '../../redux/slice/paymentCard.slice'
import { RiVisaLine, RiMastercardLine } from 'react-icons/ri'
import { SiAmericanexpress } from 'react-icons/si'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from '../../utils/stripe'

export default function PaymentsCard() {
    const dispatch = useDispatch();
    const { cards, selectedCardId, loading, error, actionLoading } = useSelector((state) => state.payment);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);
    const [cardToRemove, setCardToRemove] = useState(null);

    useEffect(() => {
        dispatch(fetchSavedCards());
    }, [dispatch]);

    const handleOpenAdd = () => {
        setSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    const handleOpenRemove = (card) => {
        setCardToRemove(card);
        setRemoveModalOpen(true);
    };

    const handleCloseRemove = () => {
        setCardToRemove(null);
        setRemoveModalOpen(false);
    };

    const handleConfirmRemove = async () => {
        if (cardToRemove) {
            await dispatch(deleteSavedCard(cardToRemove._id));
            handleCloseRemove();
        }
    };

    const handleSetDefault = (cardId) => {
        dispatch(selectCard(cardId));
    };

    const getCardIcon = (cardNumber) => {
        // Very basic logic since we only store masked numbers usually
        if (cardNumber.includes('Visa')) return <RiVisaLine className="text-3xl text-blue-700" />;
        if (cardNumber.includes('Mastercard')) return <RiMastercardLine className="text-3xl text-orange-500" />;
        if (cardNumber.includes('American Express')) return <SiAmericanexpress className="text-3xl text-blue-500" />;
        return <FaRegCreditCard className="text-2xl text-primary" />;
    };

    return (
        <AccountLayout>
            <div className="flex flex-col min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-17rem)]">

                {/* Page title & Add button */}
                <div className="flex justify-between items-center md:mb-8 mb-4">
                    <h1 className="text-lg sm:text-2xl md:text-[28px] font-semibold text-primary">Payments</h1>
                    {cards.length > 0 && (
                        <button
                            onClick={handleOpenAdd}
                            className="inline-flex items-center gap-2 bg-primary text-white text-[10px] md:text-[13px] font-bold md:px-5 px-3 py-2.5 hover:bg-primary/95 transition-all uppercase tracking-wider"
                        >
                            <FaPlus className="text-[10px]" />
                            Add Payment Method
                        </button>
                    )}
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2].map((n) => (
                            <div
                                key={n}
                                className="bg-white border border-border rounded-sm p-6 animate-pulse h-40"
                            />
                        ))}
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="flex-1 flex items-center justify-center text-red-500 text-sm italic">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && cards.length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 min-h-[50vh] gap-3 text-center">
                        <p className="text-xl font-bold text-dark">No payment methods added yet</p>
                        <p className="text-sm font-medium text-lightText max-w-xs leading-relaxed">
                            Add a card to make fast and secure payments
                        </p>
                        <button
                            onClick={handleOpenAdd}
                            className="mt-4 inline-flex items-center gap-2 bg-primary text-white text-[13px] font-bold px-8 py-3.5 hover:bg-primary/90 transition-all uppercase tracking-widest"
                        >
                            <FaPlus className="text-[11px]" />
                            Add Payment Method
                        </button>
                    </div>
                )}

                {/* Cards grid */}
                {!loading && !error && cards.length > 0 && (
                    <div className="md:space-y-6 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            {cards.map((card) => {
                                // const isDefault = card._id === selectedCardId;
                                return (
                                    <div
                                        key={card._id}
                                        className="bg-white md:p-6 p-4 flex flex-col justify-between"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-8 flex items-center justify-center">
                                                    {getCardIcon(card.cardType || '')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="md:text-base text-sm font-bold text-dark">{card.cardType || 'Card'}</span>
                                                    {card.isDefault && (
                                                        <>
                                                            <div className="border-l border-border h-5 w-px"></div>
                                                            <span className="md:text-base text-sm text-lightText font-semibold tracking-widest uppercase">
                                                                (Default)
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleOpenRemove(card)}
                                                className="text-sm font-medium text-lightText hover:text-red-500 transition-colors tracking-widest"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="">
                                            <p className="md:text-base text-sm font-semibold text-mainText tracking-widest">{card.cardNumber}</p>
                                            <p className="md:text-base text-sm font-semibold text-mainText mt-1">{card.cardHolderName}</p>
                                            <div className="flex items-center gap-2 justify-between">
                                                <p className="md:text-base text-sm font-medium text-lightText mt-1">Expires {card.expiryDate}</p>
                                                {!card.isDefault && (
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => handleSetDefault(card._id)}
                                                            className="text-sm font-medium text-primary hover:underline transition-all tracking-wide"
                                                        >
                                                            Set as default
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Security Footer Note */}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="md:text-base text-sm font-medium text-primary">Your card details are safe and secure</span>
                        </div>
                    </div>
                )}

                {/* Add Card Sidebar */}
                <Elements stripe={stripePromise}>
                    <PaymentSidebar
                        isOpen={sidebarOpen}
                        onClose={handleCloseSidebar}
                    />
                </Elements>

                {/* Remove Card Confirmation Modal */}
                {removeModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40" onClick={handleCloseRemove} />
                        <div className="relative bg-white w-full max-w-md p-8 shadow-2xl">

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base md:text-xl font-bold text-primary">Remove Card</h3>
                                <button
                                    onClick={handleCloseRemove}
                                    className="text-lightText"
                                >
                                    <IoClose size={24} />
                                </button>
                            </div>
                            <p className="md:text-base text-sm font-medium text-lightText mb-8 leading-relaxed tracking-wide">
                                Are you sure you want to remove this saved card ending in {cardToRemove?.cardNumber?.slice(-4)}? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCloseRemove}
                                    className="flex-1 bg-white font-semibold text-dark md:text-sm text-xs md:py-4 py-2 uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRemove}
                                    disabled={actionLoading}
                                    className="flex-1 bg-primary text-white md:text-sm text-xs font-semibold md:py-4 py-2 uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? 'Removing...' : 'Yes, Remove'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AccountLayout>
    )
}