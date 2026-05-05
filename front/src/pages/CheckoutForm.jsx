import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { placeOrder, confirmPayment } from '../redux/slice/order.slice';
import { applyCoupon, removeCoupon } from '../redux/slice/cart.slice';
import { fetchAddresses, addAddress, selectAddress } from '../redux/slice/address.slice';
import { fetchRecentlyViewed } from '../redux/slice/product.slice';
import { fetchSavedCards } from '../redux/slice/paymentCard.slice';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardNumberElement, CardCvcElement } from '@stripe/react-stripe-js';
import StripeCardInput from '../components/StripeCardInput';

// All API calls now use Redux slices

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

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

const checkoutSchema = Yup.object({
    mobile: Yup.string()
        .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
        .required('Mobile number is required'),
    country: Yup.string().required('Country is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    address: Yup.string().required('Address is required'),
    apartment: Yup.string(),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    postCode: Yup.string().required('Post code is required'),
    addressType: Yup.string().required('Address type is required'),
    saveInfo: Yup.boolean(),
    paymentMethod: Yup.string().required('Payment method is required'),
   
});

const couponSchema = Yup.object({
    code: Yup.string().trim().min(2, 'Enter a valid coupon code').required('Please enter a coupon code'),
});

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Recently Viewed Card ──────────────────────────────────────────
const RecentlyViewedCard = ({ product }) => {
    const navigate = useNavigate();
    const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
    const image = defaultVariant?.images?.[0] || null;

    const getPrice = () => {
        if (!defaultVariant) return null;
        if (defaultVariant.options?.length > 0) {
            const prices = defaultVariant.options.map(o => o.price).filter(Boolean);
            if (!prices.length) return null;
            const min = Math.min(...prices);
            return `$${min}`;
        }
        return defaultVariant.price ? `$${defaultVariant.price}` : null;
    };

    return (
        <div 
            onClick={() => navigate(`/product/${product.slug}`)}
            className="flex flex-col items-center bg-white border border-border/10 cursor-pointer group"
        >
            <div className="w-full aspect-[4/5] bg-[#F9F9F7] overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-lightText/40">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                    </div>
                )}
            </div>
            <div className="py-6 px-4 flex flex-col items-center gap-1">
                <p className="text-[13px] font-medium text-dark text-center tracking-tight">{product.name}</p>
                <p className="text-[12px] font-bold text-lightText">{getPrice()}</p>
            </div>
        </div>
    );
};

function CheckoutFormContent() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const stripe = useStripe();
    const elements = useElements();
    const { cartData, loading: cartLoading } = useSelector((state) => state.cart);
    const { placeOrderLoading, confirmPaymentLoading } = useSelector((state) => state.order);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { addresses, selectedAddressId: storeSelectedAddressId, actionLoading: addressActionLoading } = useSelector((state) => state.address);
    const { cards, loading: cardsLoading } = useSelector((state) => state.payment);
    const { recentlyViewed } = useSelector((state) => state.product);
    const cartItems = cartData?.items || [];
    const isEmpty = !cartLoading && cartItems.length === 0;


    const [showSignIn, setShowSignIn] = useState(false);
    const [selectedSavedCard, setSelectedSavedCard] = useState(null);
    const [showAddNewCard, setShowAddNewCard] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [stripeError, setStripeError] = useState(null);

    const subtotal = cartData?.subtotal || 0;
    const discount = cartData?.discount || 0;
    const shipping = cartData?.shipping || 0;
    const total = cartData?.total || 0;
    const appliedCoupon = cartData?.appliedCoupon;
    const hasCoupon = !!appliedCoupon?.code;

    const formik = useFormik({
        initialValues: {
            mobile: '',
            country: '',
            firstName: '',
            lastName: '',
            address: '',
            apartment: '',
            city: '',
            state: '',
            postCode: '',
            addressType: 'Home',
            saveInfo: false,
            paymentMethod: 'Card',
            cardName: '',
            saveCard: false,
        },
        validationSchema: checkoutSchema,
        onSubmit: async (values) => {
            setStripeError(null);

            // Validate Stripe is loaded
            if (values.paymentMethod === 'Card' && (!stripe || !elements)) {
                toast.error('Stripe is not loaded yet. Please wait a moment and try again.');
                return;
            }

            try {
                // Step 1: Use existing address or create new one
                let addressId = selectedAddressId;
                
                // If no address is selected or user filled in new address details, create new address
                if (!addressId || values.firstName) {
                    try {
                        const result = await dispatch(addAddress({
                            addressData: {
                                firstName: values.firstName,
                                lastName: values.lastName,
                                country: values.country,
                                address: values.address,
                                aptSuite: values.apartment,
                                city: values.city,
                                state: values.state,
                                zipcode: values.postCode,
                                addressType: values.addressType,
                                phone: values.mobile,
                            },
                            setAsDefault: false
                        })).unwrap();
                        
                        console.log('Address response:', result);
                        
                        // Get the newly created address ID from the returned address array
                        const addresses = result?.address || [];
                        if (addresses.length > 0) {
                            addressId = addresses[addresses.length - 1]._id;
                        }
                        
                        console.log('New address ID:', addressId);
                    } catch (addressError) {
                        console.error('Error saving address:', addressError);
                        toast.error(addressError?.message || 'Failed to save shipping address');
                        return;
                    }
                }

                // Step 2: Select the address
                if (addressId) {
                    try {
                        await dispatch(selectAddress(addressId)).unwrap();
                        console.log('Address selected:', addressId);
                    } catch (selectError) {
                        console.error('Error selecting address:', selectError);
                        toast.error('Failed to select shipping address');
                        return;
                    }
                } else {
                    toast.error('No address available. Please add a shipping address.');
                    return;
                }

                // Step 3: Place the order (backend creates payment intent)
                const orderPayload = {
                    paymentMethod: values.paymentMethod,
                    saveCardInfo: values.saveCard && showAddNewCard, // Pass saveCard flag to backend
                };

                // If using saved card
                if (selectedSavedCard && !showAddNewCard) {
                    orderPayload.savedCardId = selectedSavedCard;
                }

                const result = await dispatch(placeOrder(orderPayload)).unwrap();
                
                const { clientSecret, stripePaymentIntentId, _id: orderId } = result?.result || {};

                // Step 4: Confirm payment with Stripe (for Card payment)
                if (values.paymentMethod === 'Card' && clientSecret) {
                    let confirmResult;
                    
                    // Check if using saved card or new card
                    if (selectedSavedCard && !showAddNewCard) {
                        // Using saved card - confirm with payment method already attached
                        console.log('💳 Confirming payment with saved card:', selectedSavedCard);
                        
                        try {
                            const selectedCardObj = cards.find(c => c._id === selectedSavedCard);
                            const stripePMId = selectedCardObj?.stripePaymentMethodId;

                            confirmResult = await stripe.confirmCardPayment(clientSecret, {
                                payment_method: stripePMId
                            });
                            console.log('✅ Payment confirmed with saved card');
                        } catch (error) {
                            console.error('❌ Error confirming saved card payment:', error);
                            toast.error('Failed to process payment with saved card. Please try a different card.');
                            return;
                        }
                        
                    } else {
                        // Using new card - get card element and confirm
                        console.log('💳 Confirming payment with new card');
                        const cardElement = elements.getElement(CardNumberElement);
                        
                        if (!cardElement) {
                            toast.error('Card information is required');
                            return;
                        }

                        try {
                            confirmResult = await stripe.confirmCardPayment(clientSecret, {
                                payment_method: {
                                    card: cardElement,
                                    billing_details: {
                                        name: values.cardName,
                                    },
                                },
                            });
                            console.log('✅ Payment confirmed with new card');
                        } catch (error) {
                            console.error('❌ Error confirming new card payment:', error);
                            toast.error('Failed to process payment. Please check your card details.');
                            return;
                        }
                    }

                    const { error: stripeError, paymentIntent } = confirmResult;

                    if (stripeError) {
                        console.error('❌ Stripe error:', stripeError);
                        setStripeError(stripeError.message);
                        toast.error(stripeError.message);
                        return;
                    }

                    console.log('💰 Payment Intent status:', paymentIntent.status);

                    if (paymentIntent.status === 'succeeded') {
                        // Step 5: Confirm payment on backend
                        try {
                            await dispatch(confirmPayment({
                                paymentIntentId: stripePaymentIntentId,
                                orderId: orderId,
                                saveCard: values.saveCard && showAddNewCard, // Only save if it's a new card
                            })).unwrap();

                            toast.success('Payment successful! Order confirmed.');
                            
                            // Refresh saved cards if card was saved
                            if (values.saveCard && showAddNewCard) {
                                dispatch(fetchSavedCards());
                            }
                            
                            navigate(orderId ? `/orders/${orderId}` : '/checkout');
                        } catch (confirmError) {
                            console.error('Error confirming payment:', confirmError);
                            toast.error('Payment succeeded but order confirmation failed. Please contact support.');
                        }
                    } else if (paymentIntent.status === 'requires_action') {
                        // 3D Secure or other authentication required
                        toast.error('Additional authentication required. Please complete the verification.');
                    } else {
                        toast.error(`Payment status: ${paymentIntent.status}. Please try again.`);
                    }
                } else {
                    // For other payment methods (PayPal, ZipPay, AfterPay)
                    toast.success('Order placed successfully!');
                    navigate(orderId ? `/orders/${orderId}` : '/checkout');
                }
                
            } catch (error) {
                console.error('Order placement error:', error);
                toast.error(error?.message || 'Failed to place order');
            }
        },
    });

    const couponFormik = useFormik({
        initialValues: { code: '' },
        validationSchema: couponSchema,
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                const result = await dispatch(applyCoupon(values.code.trim().toUpperCase())).unwrap();
                toast.success(result?.message || 'Coupon applied!');
            } catch (err) {
                const msg = err?.message || 'Invalid or expired coupon';
                setFieldError('code', msg);
                toast.error(msg);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleRemoveCoupon = async () => {
        try {
            await dispatch(removeCoupon()).unwrap();
            couponFormik.resetForm();
            toast.success('Coupon removed');
        } catch {
            toast.error('Failed to remove coupon');
        }
    };

    // Fetch saved cards and addresses
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchSavedCards());
            dispatch(fetchAddresses());
            dispatch(fetchRecentlyViewed());
        }
    }, [isAuthenticated, dispatch]);

    // Auto-select first card if available
    useEffect(() => {
        if (cards.length > 0) {
            setSelectedSavedCard(cards[0]._id);
            setShowAddNewCard(false);
        } else {
            setShowAddNewCard(true);
        }
    }, [cards]);

    // Auto-select first address or use store's selected address
    useEffect(() => {
        if (storeSelectedAddressId) {
            setSelectedAddressId(storeSelectedAddressId);
        } else if (addresses.length > 0) {
            setSelectedAddressId(addresses[0]._id);
        }
    }, [addresses, storeSelectedAddressId]);

    // Get card brand from card number
    const getCardBrand = (cardNumber) => {
        // Handle both full and masked card numbers
        const cleanNumber = cardNumber.replace(/\s/g, '').replace(/\*/g, '');
        const firstDigit = cleanNumber.charAt(0);
        if (firstDigit === '4') return 'visa';
        if (firstDigit === '5') return 'mastercard';
        if (firstDigit === '3') return 'amex';
        return 'card';
    };

    // Card brand logo component
    const CardBrandLogo = ({ brand }) => {
        if (brand === 'visa') {
            return (
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                </div>
            );
        }
        if (brand === 'mastercard') {
            return (
                <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center relative overflow-hidden">
                    <div className="absolute w-5 h-5 rounded-full bg-red-500 left-1"></div>
                    <div className="absolute w-5 h-5 rounded-full bg-orange-400 right-1"></div>
                </div>
            );
        }
        return (
            <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-600 text-xs font-bold">CARD</span>
            </div>
        );
    };

    if (!isAuthenticated) {
        navigate('/auth');
        return null;
    }

    if (isEmpty && !cartLoading) {
        return (
            <div className="bg-white flex flex-col">
                {/* Empty Cart Section */}
                <div className="flex flex-col items-center justify-center px-6 py-24">
                    <div className="w-full max-w-4xl flex flex-col items-center">
                        <div className="w-full bg-white p-16 text-center border border-dashed border-border/40 rounded-lg flex flex-col items-center justify-center">
                            <p className="text-xl font-bold text-primary mb-8 tracking-wider">
                                YOUR CART IS EMPTY
                            </p>
                            <Link
                                to="/"
                                className="inline-block bg-primary text-white text-[13px] font-bold uppercase tracking-[3px] px-12 py-5 hover:bg-primary/90 transition-all shadow-lg"
                            >
                                continue shopping
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recently Viewed Section */}
                {recentlyViewed && recentlyViewed.length > 0 && (
                    <section className="bg-white border-t border-border/20">
                        <div className="max-w-7xl mx-auto px-6 py-24">
                            <div className="flex flex-col items-center text-center mb-16 gap-3">
                                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-dark/60">
                                    THE ARCHIVE OF YOUR SEARCH
                                </p>
                                <h2 className="text-[32px] md:text-[48px] font-bold uppercase text-primary leading-tight tracking-tight">
                                    RECENTLY VIEWED PRODUCTS
                                </h2>
                                <p className="text-[14px] text-lightText max-w-2xl leading-relaxed">
                                    Don't let a favorite piece slip away. Re-access your latest searches and pick up your exploration exactly where you left off.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-border/10">
                                {recentlyViewed.slice(0, 4).map((product) => (
                                    <div key={product._id} className="border-r border-b border-border/10">
                                        <RecentlyViewedCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side - Forms */}
                    <div className="space-y-8">
                        {/* Contact Section */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base md:text-2xl font-bold text-primary">Contact</h2>
                                {!isAuthenticated && (
                                    <button
                                        onClick={() => setShowSignIn(!showSignIn)}
                                        className="text-sm text-gold font-semibold hover:underline"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>
                            <input
                                type="tel"
                                name="mobile"
                                placeholder="Mobile Number"
                                value={formik.values.mobile}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full px-4 py-3 border ${
                                    formik.touched.mobile && formik.errors.mobile
                                        ? 'border-red-400'
                                        : 'border-border'
                                } text-base focus:outline-none text-dark focus:border-primary transition-colors`}
                            />
                            {formik.touched.mobile && formik.errors.mobile && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.mobile}</p>
                            )}
                        </div>

                        {/* Delivery Section */}
                        <div>
                            <h2 className="text-base md:text-2xl font-bold text-primary  mb-6">Delivery</h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Country"
                                    value={formik.values.country}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border ${
                                        formik.touched.country && formik.errors.country
                                            ? 'border-red-400'
                                            : 'border-border'
                                    } text-base focus:outline-none text-dark focus:border-primary transition-colors`}
                                />
                                {formik.touched.country && formik.errors.country && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.country}</p>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            value={formik.values.firstName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full px-4 py-3 border ${
                                                formik.touched.firstName && formik.errors.firstName
                                                    ? 'border-red-400'
                                                    : 'border-border'
                                            } text-base focus:outline-none text-dark focus:border-primary transition-colors`}
                                        />
                                        {formik.touched.firstName && formik.errors.firstName && (
                                            <p className="text-xs text-red-500 mt-1">{formik.errors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Last Name"
                                            value={formik.values.lastName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full px-4 py-3 border ${
                                                formik.touched.lastName && formik.errors.lastName
                                                    ? 'border-red-400'
                                                    : 'border-border'
                                            } text-base text-dark focus:outline-none  focus:border-primary transition-colors`}
                                        />
                                        {formik.touched.lastName && formik.errors.lastName && (
                                            <p className="text-xs text-red-500 mt-1">{formik.errors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address Type Radio Buttons */}
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="addressType"
                                            value="Home"
                                            checked={formik.values.addressType === 'Home'}
                                            onChange={formik.handleChange}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="text-sm md:text-lg text-lightText">Home</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="addressType"
                                            value="Office"
                                            checked={formik.values.addressType === 'Office'}
                                            onChange={formik.handleChange}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="text-sm md:text-lg text-lightText">Office</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="addressType"
                                            value="Other"
                                            checked={formik.values.addressType === 'Other'}
                                            onChange={formik.handleChange}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="text-sm md:text-lg text-lightText">Other</span>
                                    </label>
                                </div>

                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border ${
                                        formik.touched.address && formik.errors.address
                                            ? 'border-red-400'
                                            : 'border-border'
                                    } text-base text-dark  focus:outline-none focus:border-primary transition-colors`}
                                />
                                {formik.touched.address && formik.errors.address && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.address}</p>
                                )}

                                <input
                                    type="text"
                                    name="apartment"
                                    placeholder="Apt, suite, etc"
                                    value={formik.values.apartment}
                                    onChange={formik.handleChange}
                                    className="w-full text-dark px-4 py-3 border border-border text-base focus:outline-none focus:border-primary transition-colors"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="City"
                                            value={formik.values.city}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full px-4 py-3 border ${
                                                formik.touched.city && formik.errors.city
                                                    ? 'border-red-400'
                                                    : 'border-border'
                                            } text-base text-dark  focus:outline-none focus:border-primary transition-colors`}
                                        />
                                        {formik.touched.city && formik.errors.city && (
                                            <p className="text-xs text-red-500 mt-1">{formik.errors.city}</p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            name="state"
                                            placeholder="State"
                                            value={formik.values.state}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full px-4 py-3 border ${
                                                formik.touched.state && formik.errors.state
                                                    ? 'border-red-400'
                                                    : 'border-border'
                                            } text-base text-dark focus:outline-none focus:border-primary transition-colors`}
                                        />
                                        {formik.touched.state && formik.errors.state && (
                                            <p className="text-xs text-red-500 mt-1">{formik.errors.state}</p>
                                        )}
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    name="postCode"
                                    placeholder="Post code"
                                    value={formik.values.postCode}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 border ${
                                        formik.touched.postCode && formik.errors.postCode
                                            ? 'border-red-400'
                                            : 'border-border'
                                    } text-base text-dark focus:outline-none focus:border-primary transition-colors`}
                                />
                                {formik.touched.postCode && formik.errors.postCode && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.postCode}</p>
                                )}

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="saveInfo"
                                        checked={formik.values.saveInfo}
                                        onChange={formik.handleChange}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-base text-mainText">Save this information for next time</span>
                                </label>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div>
                            <h2 className="text-base md:text-2xl font-bold text-primary mb-6">Payment</h2>
                            <div className=" border border-border px-8">
                                {/* Card Payment Option */}
                                <div className="border-b border-border py-5">
                                    <label className="flex items-center gap-3 cursor-pointer ">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Card"
                                            checked={formik.values.paymentMethod === 'Card'}
                                            onChange={formik.handleChange}
                                            className="w-5 h-5 text-primary"
                                        />
                                        <span className="text-base font-semibold text-dark">Card</span>
                                    </label>

                                    {formik.values.paymentMethod === 'Card' && (
                                        <div className="space-y-4 mt-4 ">
                                            {/* Stripe Error Display */}
                                            {stripeError && (
                                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                                    {stripeError}
                                                </div>
                                            )}

                                            {/* Saved Cards List */}
                                            {cards.length > 0 && (
                                                <div className="space-y-3">
                                                    {cards.map((card) => {
                                                        // Handle missing data gracefully
                                                        const brand = card.brand || 'card';
                                                        const last4 = card.last4 || '****';
                                                        const displayNumber = card.displayNumber || `•••• •••• •••• ${last4}`;
                                                        
                                                        // Format expiry date
                                                        let expiryDate = card.expiryDate;
                                                        if (!expiryDate && card.expiryMonth && card.expiryYear) {
                                                            expiryDate = `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`;
                                                        }
                                                        
                                                        // Skip invalid cards (missing required data)
                                                        if (!card.last4 || !card.brand || !card.expiryMonth || !card.expiryYear) {
                                                            console.warn('Skipping invalid saved card:', card._id);
                                                            return null;
                                                        }
                                                        
                                                        return (
                                                            <label
                                                                key={card._id}
                                                                className="flex items-center gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:border-primary transition-colors"
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="savedCard"
                                                                    value={card._id}
                                                                    checked={selectedSavedCard === card._id && !showAddNewCard}
                                                                    onChange={() => {
                                                                        setSelectedSavedCard(card._id);
                                                                        setShowAddNewCard(false);
                                                                        formik.setFieldValue('cardName', '');
                                                                        formik.setFieldValue('saveCard', false);
                                                                    }}
                                                                    className="w-4 h-4 text-primary"
                                                                />
                                                                <CardBrandLogo brand={brand} />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-dark">
                                                                        {displayNumber}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Expires {expiryDate || 'N/A'}
                                                                    </p>
                                                                    {card.cardHolderName && (
                                                                        <p className="text-xs text-gray-500">
                                                                            {card.cardHolderName}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        );
                                                    })}

                                                    {/* Add New Card Option */}
                                                    {cards.length < 3 && (
                                                        <label className="flex items-center gap-3 p-3 border border-dashed border-gray-400 rounded cursor-pointer hover:border-primary transition-colors">
                                                            <input
                                                                type="radio"
                                                                name="savedCard"
                                                                value="new"
                                                                checked={showAddNewCard}
                                                                onChange={() => {
                                                                    setShowAddNewCard(true);
                                                                    setSelectedSavedCard(null);
                                                                }}
                                                                className="w-4 h-4 text-primary"
                                                            />
                                                            <span className="text-sm font-medium text-primary">+ Add New Card</span>
                                                        </label>
                                                    )}
                                                </div>
                                            )}

                            {/* New Card Form - Show if no saved cards OR "Add New Card" selected */}
                                            {(cards.length === 0 || showAddNewCard) && (
                                                <StripeCardInput 
                                                    formik={formik}
                                                    showSaveCard={cards.length < 3}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* PayPal Option */}
                                <div className="border-b border-border py-5">
                                    <label className="flex items-center gap-3 cursor-pointer ">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="PayPal"
                                            checked={formik.values.paymentMethod === 'PayPal'}
                                            onChange={formik.handleChange}
                                            className="w-5 h-5 text-primary"
                                        />
                                        <span className="text-base font-semibold text-dark">PayPal</span>
                                    </label>

                                    {formik.values.paymentMethod === 'PayPal' && (
                                        <div className="space-y-4 mt-4 ">
                                            <div className="bg-gray-50 p-4 rounded">
                                                <p className="text-sm text-gray-700 mb-3">
                                                    You will be redirected to PayPal to complete your purchase securely.
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-20 h-8" viewBox="0 0 124 33" fill="none">
                                                        <text x="0" y="20" className="text-2xl font-bold fill-[#003087]">PayPal</text>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Zip Pay Option */}
                                <div className="border-b border-border py-5">
                                    <label className="flex items-center gap-3 cursor-pointer ">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="ZipPay"
                                            checked={formik.values.paymentMethod === 'ZipPay'}
                                            onChange={formik.handleChange}
                                            className="w-5 h-5 text-primary"
                                        />
                                        <span className="text-base font-semibold text-dark">Zip Pay</span>
                                    </label>

                                    {formik.values.paymentMethod === 'ZipPay' && (
                                        <div className="space-y-4 mt-4 ">
                                            <div className="bg-gray-50 p-4 rounded">
                                                <p className="text-sm text-gray-700 mb-2">
                                                    Buy now, pay later with Zip.
                                                </p>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    Split your purchase into 4 interest-free payments.
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-white px-3 py-1 rounded border border-gray-300">
                                                        <span className="text-sm font-bold text-gray-900">zip</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* After Pay Option */}
                                <div className="border-b border-border py-5">
                                    <label className="flex items-center gap-3 cursor-pointer ">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="AfterPay"
                                            checked={formik.values.paymentMethod === 'AfterPay'}
                                            onChange={formik.handleChange}
                                            className="w-5 h-5 text-primary"
                                        />
                                        <span className="text-base font-semibold text-dark">After Pay</span>
                                    </label>

                                    {formik.values.paymentMethod === 'AfterPay' && (
                                        <div className="space-y-4 mt-4 ">
                                            <div className="bg-gray-50 p-4 rounded">
                                                <p className="text-sm text-gray-700 mb-2">
                                                    Pay in 4 interest-free installments.
                                                </p>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    First payment due at checkout. Remaining payments automatically charged every 2 weeks.
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-black px-3 py-1 rounded">
                                                        <span className="text-sm font-bold text-white">afterpay</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pay Now Button */}
                        <div className="mt-8">
                            <button
                                type="button"
                                onClick={formik.handleSubmit}
                                disabled={placeOrderLoading}
                                className="w-full h-14 bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {placeOrderLoading ? 'Processing...' : 'PAY NOW'}
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Order Summary */}
                    <div className="lg:pl-8">
                        <div className="sticky top-4 space-y-6">
                            {/* Cart Items */}
                            <div className="space-y-4">
                                {cartItems.map((item) => {
                                    const variant = item.productVariantId;
                                    let itemPrice = 0;
                                    if (variant?.options && variant.options.length > 0 && item.selectedSize) {
                                        const sizeObj = variant.options.find((s) => s.size === item.selectedSize);
                                        itemPrice = sizeObj?.price || 0;
                                    } else {
                                        itemPrice = variant?.price || 0;
                                    }

                                    return (
                                        <div key={item._id} className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={variant?.images?.[0] || '/images/product.png'}
                                                    alt={item?.productId?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm md:text-base font-medium text-primary capitalize">
                                                    {item?.productId?.name}
                                                </h4>
                                                <p className="text-xs text-lightText font-medium">
                                                    Qty: {item?.quantity || 1}
                                                </p>
                                            </div>
                                            <span className="text-sm md:text-base font-medium text-lightText">
                                                ${fmt(itemPrice * item.quantity)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Coupon */}
                            <form onSubmit={couponFormik.handleSubmit} noValidate>
                                <div className="flex gap-0 mb-1">
                                    <input
                                        type="text"
                                        name="code"
                                        value={couponFormik.values.code}
                                        onChange={(e) => couponFormik.setFieldValue('code', e.target.value.toUpperCase())}
                                        onBlur={couponFormik.handleBlur}
                                        placeholder="Discount code"
                                        disabled={hasCoupon}
                                        className={`flex-1 border border-r-0 ${couponFormik.touched.code && couponFormik.errors.code
                                            ? 'border-red-400'
                                            : 'border-[#D8D8D8]'
                                            } px-4 py-3 text-sm text-primary placeholder:text-lightText/40 outline-none focus:border-primary/50 transition-colors disabled:bg-transparent disabled:cursor-not-allowed bg-white`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={couponFormik.isSubmitting || hasCoupon || !couponFormik.values.code.trim()}
                                        className="bg-primary text-white text-[12px] font-bold uppercase tracking-widest px-8 py-3 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {couponFormik.isSubmitting ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponFormik.touched.code && couponFormik.errors.code && (
                                    <p className="text-xs text-red-500 mt-1">{couponFormik.errors.code}</p>
                                )}
                            </form>

                            {!hasCoupon && (
                                <p className="text-sm md:text-base text-lightText font-medium">Use code SALE20 for 20% off your order</p>
                            )}

                            {hasCoupon && (
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-2 border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-primary uppercase">
                                        {appliedCoupon.code}
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-lightText hover:text-red-500 transition-colors"
                                        >
                                            <IoClose size={14} />
                                        </button>
                                    </span>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="space-y-3 pt-4">
                                <div className="flex justify-between text-sm md:text-base ">
                                    <span className="text-mainText">
                                        Subtotal • {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                                    </span>
                                    <span className="font-medium text-mainText">${fmt(subtotal)}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-sm md:text-base">
                                        <span className="text-mainText">Discount</span>
                                        <span className="font-medium text-mainText">-${fmt(discount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm md:text-base">
                                    <span className="text-mainText">Shipping</span>
                                    <span className="font-medium text-mainText">
                                        {shipping === 0 ? 'FREE' : `$${fmt(shipping)}`}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pt-3 ">
                                    <span className="text-base md:text-2xl font-bold text-dark">Total</span>
                                    <span className="text-base md:text-2xl font-bold text-dark">${fmt(total)}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            {/* <button
                                onClick={formik.handleSubmit}
                                disabled={placeOrderLoading}
                                className="w-full h-14 bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {placeOrderLoading ? 'Processing...' : 'Place Order'}
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wrapper component with Stripe Elements provider
export default function CheckoutForm() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutFormContent />
        </Elements>
    );
}
