import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../redux/slice/product.slice';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';

const WishlistButton = ({ 
    productId, 
    className = "absolute top-5 right-5 transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 z-20",
    iconSize = 22,
    activeColor = "text-[#14372F]",
    inactiveColor = "text-[#6C757D] hover:text-[#14372F]"
}) => {
    const dispatch = useDispatch();
    const { wishlist } = useSelector((state) => state.product);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const isWishlisted = wishlist.some(item => (item._id || item) === productId);

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;
        dispatch(toggleWishlist(productId));
    };

    return (
        <button
            onClick={handleWishlistToggle}
            className={className}
        >
            {isWishlisted ? (
                <IoHeart size={iconSize} className={activeColor} />
            ) : (
                <IoHeartOutline size={iconSize} strokeWidth={1} className={inactiveColor} />
            )}
        </button>
    );
};

export default WishlistButton;