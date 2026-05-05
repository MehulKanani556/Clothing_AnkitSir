import React, { useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { addSavedCardStripe } from '../../redux/slice/paymentCard.slice';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#1a1a1a',
            fontFamily: 'inherit',
            '::placeholder': {
                color: '#9ca3af',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
};

export default function PaymentCardSidebar({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const stripe = useStripe();
    const elements = useElements();
    
    const { actionLoading } = useSelector((state) => state.payment);
    const [cardHolderName, setCardHolderName] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error('Stripe has not loaded yet.');
            return;
        }

        if (!cardHolderName.trim()) {
            toast.error('Please enter card holder name');
            return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardNumberElement,
                billing_details: {
                    name: cardHolderName,
                },
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            await dispatch(addSavedCardStripe(paymentMethod.id)).unwrap();
            onClose();
            setCardHolderName('');
            setIsDefault(false);
            
            // Clear stripe elements
            cardNumberElement.clear();
            elements.getElement(CardExpiryElement).clear();
            elements.getElement(CardCvcElement).clear();

        } catch (err) {
            toast.error(err.message || 'Failed to save card');
        }
    };

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-[60]"
                onClick={onClose}
            />
            <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white z-[70] flex flex-col shadow-2xl transition-transform duration-300">

                <div className="flex items-center justify-between px-7 pt-7 pb-5">
                    <h2 className="text-xl font-bold text-dark">
                        Add Card
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-dark hover:opacity-60 transition-opacity"
                        aria-label="Close"
                    >
                        <IoClose className="text-2xl" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-7 pb-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-primary">
                                Card Holder Name
                            </label>
                            <input
                                type="text"
                                value={cardHolderName}
                                onChange={(e) => setCardHolderName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full border-b border-border py-2 text-base font-semibold text-dark placeholder:text-lightText focus:outline-none focus:border-primary bg-transparent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-primary">
                                Card Number
                            </label>
                            <div className="py-3 border-b border-border focus-within:border-primary transition-colors">
                                <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-primary">
                                    Expiry Date
                                </label>
                                <div className="py-3 border-b border-border focus-within:border-primary transition-colors">
                                    <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-primary">
                                    CVV
                                </label>
                                <div className="py-3 border-b border-border focus-within:border-primary transition-colors">
                                    <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                                </div>
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer group pt-2">
                            <span
                                className={`mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors ${isDefault
                                    ? 'border-primary bg-primary'
                                    : 'border-dark bg-white'
                                    }`}
                            >
                                {isDefault && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 10 8">
                                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </span>
                            <input
                                type="checkbox"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="sr-only"
                            />
                            <div>
                                <p className="text-sm font-semibold text-dark">Set as default card</p>
                                <p className="text-xs font-medium text-lightText mt-0.5">Used as your primary payment method</p>
                            </div>
                        </label>
                    </form>
                </div>

                <div className="px-7 py-4 flex items-center justify-center gap-2 text-lightText">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs font-medium">Your card details are safe and secure</span>
                </div>

                <div className="px-7 py-5">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={actionLoading}
                        className="w-full bg-primary text-white text-sm font-bold py-4 tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {actionLoading ? 'Saving...' : 'Add Card'}
                    </button>
                </div>
            </div>
        </>
    )
}