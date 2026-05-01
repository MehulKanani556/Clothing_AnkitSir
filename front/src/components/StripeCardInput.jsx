import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';

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

export default function StripeCardInput({ formik, showSaveCard = true }) {
    return (
        <div className="space-y-4">
            {/* Card Number */}
            <div>
                <div className="w-full px-4 py-3 border border-border text-base text-dark focus-within:border-primary transition-colors">
                    <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="w-full px-4 py-3 border border-border text-base text-dark focus-within:border-primary transition-colors">
                        <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                </div>
                <div>
                    <div className="w-full px-4 py-3 border border-border text-base text-dark focus-within:border-primary transition-colors">
                        <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                </div>
            </div>

            {/* Name on Card */}
            <div>
                <input
                    type="text"
                    name="cardName"
                    placeholder="Name on card"
                    value={formik.values.cardName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-3 border ${
                        formik.touched.cardName && formik.errors.cardName
                            ? 'border-red-400'
                            : 'border-border'
                    } text-base text-dark focus:outline-none focus:border-primary transition-colors`}
                />
                {formik.touched.cardName && formik.errors.cardName && (
                    <p className="text-xs text-red-500 mt-1">{formik.errors.cardName}</p>
                )}
            </div>

            {/* Save Card Checkbox */}
            {showSaveCard && (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="saveCard"
                        checked={formik.values.saveCard}
                        onChange={formik.handleChange}
                        className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm text-gray-700">Save this card for future purchases (max 3 cards)</span>
                </label>
            )}
        </div>
    );
}
