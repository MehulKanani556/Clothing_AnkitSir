import { useState, useEffect, useRef, useCallback } from 'react'
import { CgProfile } from "react-icons/cg";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { LuSearch } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMainCategories, fetchCategories, fetchSubCategories } from '../redux/slice/category.slice';
import { logout } from '../redux/slice/auth.slice';
import { logSearch, fetchPopularSearches, fetchRecentSearches, fetchTrendingProducts, searchProducts, clearSearchResults } from '../redux/slice/search.slice';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiArrowUpRight, HiOutlineBell } from 'react-icons/hi2';
import { ReactComponent as EoLogo } from '../assets/images/eo.svg';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '../redux/slice/notification.slice';
import { formatDistanceToNow } from 'date-fns';

const ACCOUNT_MENU = [
    { label: 'Profile', href: '/profile' },
    { label: 'Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Addresses', href: '/addresses' },
    { label: 'Payments', href: '/payments' },
    { label: 'Settings', href: '/settings' },
    { label: 'Support', href: '/support' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [megaMenuVisible, setMegaMenuVisible] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Mobile menu navigation state
    const [menuStack, setMenuStack] = useState([]); // [{type: 'main'|'category', id: string, name: string}]
    const debounceTimer = useRef(null);
    const megaMenuTimer = useRef(null);
    const navRef = useRef(null);
    const headerRef = useRef(null);

    // Dynamically detect current input type — updates instantly when user switches
    // between mouse and touch without needing a page refresh
    const [isTouchDevice, setIsTouchDevice] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );

    useEffect(() => {
        const mouseQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
        const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');

        const update = () => {
            setIsTouchDevice(touchQuery.matches);
            if (mouseQuery.matches) closeMegaMenu();
        };

        mouseQuery.addEventListener('change', update);
        touchQuery.addEventListener('change', update);
        return () => {
            mouseQuery.removeEventListener('change', update);
            touchQuery.removeEventListener('change', update);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Open mega menu with animation
    const openMegaMenu = useCallback((categoryId) => {
        clearTimeout(megaMenuTimer.current);
        setHoveredCategory(categoryId);
        // Small RAF delay so the element mounts before we trigger the visible class
        requestAnimationFrame(() => setMegaMenuVisible(true));
    }, []);
    // Close mega menu — fade out first, then unmount
    const closeMegaMenu = useCallback(() => {
        setMegaMenuVisible(false);
        megaMenuTimer.current = setTimeout(() => setHoveredCategory(null), 300);
    }, []);

    // Touch: first tap opens menu, second tap on same category navigates
    const handleNavTouchOrClick = useCallback((e, categoryId) => {
        if (!isTouchDevice) return; // mouse devices use onMouseEnter/Leave
        if (hoveredCategory === categoryId) {
            // Already open — let the link navigate naturally (don't prevent default)
            closeMegaMenu();
            return;
        }
        // First tap — open the mega menu, block navigation
        e.preventDefault();
        openMegaMenu(categoryId);
    }, [isTouchDevice, hoveredCategory, openMegaMenu, closeMegaMenu]);

    // Close mega menu when tapping outside the entire header (touch devices)
    useEffect(() => {
        if (!isTouchDevice) return;
        const handleOutside = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                closeMegaMenu();
            }
        };
        document.addEventListener('touchstart', handleOutside);
        document.addEventListener('mousedown', handleOutside);
        return () => {
            document.removeEventListener('touchstart', handleOutside);
            document.removeEventListener('mousedown', handleOutside);
        };
    }, [isTouchDevice, closeMegaMenu]);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { mainCategories, categories, subCategories } = useSelector((state) => state.category);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { popularSearches, recentSearches, trendingProducts, searchResults, searchLoading } = useSelector((state) => state.search);
    const { notifications, unreadCount, loading: notificationsLoading } = useSelector((state) => state.notification);

    // Check if we're on the home page
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const isLocked = isAccountOpen || isMenuOpen;
        document.body.style.overflow = isLocked ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isAccountOpen, isMenuOpen]);

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsAccountOpen(false); // Close sidebar before showing modal
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        dispatch(logout());
        setIsLogoutModalOpen(false);
        navigate('/');
    };

    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
    };

    useEffect(() => {
        dispatch(fetchMainCategories());
        dispatch(fetchCategories());
        dispatch(fetchSubCategories());
        if (isAuthenticated) {
            dispatch(fetchNotifications());
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close all menus when location changes
    useEffect(() => {
        closeMegaMenu();
        setIsMenuOpen(false);
        setMenuStack([]);
        setIsAccountOpen(false);
    }, [location.pathname, closeMegaMenu]);

    useEffect(() => {
        if (isSearchOpen) {
            dispatch(fetchPopularSearches());
            dispatch(fetchRecentSearches());
            dispatch(fetchTrendingProducts());
        } else {
            dispatch(clearSearchResults());
            setSearchQuery('');
        }
    }, [isSearchOpen, dispatch]);

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            dispatch(logSearch(searchQuery.trim()));
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
            dispatch(clearSearchResults());
        }
    };

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchQuery(value);
        clearTimeout(debounceTimer.current);
        if (value.trim().length > 0) {
            debounceTimer.current = setTimeout(() => {
                dispatch(searchProducts(value.trim()));
            }, 400);
        } else {
            dispatch(clearSearchResults());
        }
    }, [dispatch]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMenuOpen(false);
                setMenuStack([]);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const resetMobileMenu = () => {
        setIsMenuOpen(false);
        setMenuStack([]);
    };

    const handleMenuBack = () => {
        setMenuStack(prev => prev.slice(0, -1));
    };

    const handleMainCategoryClick = (category) => {
        const subCats = getCategoriesForMainCategory(category._id);
        if (subCats.length > 0) {
            setMenuStack([{ type: 'main', id: category._id, name: category.mainCategoryName }]);
        } else {
            navigate(`/collection/${category.slug || category.mainCategoryName?.toLowerCase().replace(' ', '-')}`);
            setIsMenuOpen(false);
        }
    };

    const handleCategoryClick = (category, mainCategory) => {
        const subSubCats = getSubCategoriesForCategory(category._id);
        if (subSubCats.length > 0) {
            setMenuStack([
                { type: 'main', id: mainCategory.id, name: mainCategory.name },
                { type: 'category', id: category._id, name: category.categoryName }
            ]);
        } else {
            navigate(`/collection/${mainCategory.name.toLowerCase()}/${category.slug}`);
            setIsMenuOpen(false);
        }
    };

    // Get categories and subcategories for a specific main category
    const getCategoriesForMainCategory = (mainCategoryId) => {
        return categories.filter(cat => {
            // Handle both populated and non-populated mainCategoryId
            const catMainId = typeof cat.mainCategoryId === 'object' ? cat.mainCategoryId._id : cat.mainCategoryId;
            return catMainId === mainCategoryId;
        });
    };

    const getSubCategoriesForCategory = (categoryId) => {
        return subCategories.filter(sub => {
            // Handle both populated and non-populated categoryId
            const subCatId = typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId;
            return subCatId === categoryId;
        });
    };

    // Mock data for mega menu content (replace with actual data from your backend)
    const getMegaMenuContent = (mainCategory) => {
        const categoryList = getCategoriesForMainCategory(mainCategory._id);

        // Group categories into columns (you can customize this logic)
        const columns = [];
        const itemsPerColumn = Math.ceil(categoryList.length / 3);

        for (let i = 0; i < categoryList.length; i += itemsPerColumn) {
            columns.push(categoryList.slice(i, i + itemsPerColumn));
        }

        return {
            columns,
            featuredImage: mainCategory.mainCategoryImage || '/men_archive.png',
            featuredTitle: `${mainCategory.mainCategoryName.toUpperCase()} COLLECTION`,
            featuredLink: `/collection/${mainCategory.slug}`
        };
    };


    return (
        <>
            {/* Main Header Container - Fixed at top */}
            <div ref={headerRef} className={`${isHomePage ? "fixed" : "sticky"} top-0 left-0 w-full z-50 transition-shadow duration-300`}>
                {/* Promo Bar */}
                <div className={`hidden md:block border-b transition-colors duration-300 ${isScrolled || hoveredCategory ? 'bg-primary border-primary/10' : 'bg-primary border-white/5'}`}>
                    <p className='text-white text-center text-[10px] sm:text-xs py-2 font-medium tracking-[0.25em] opacity-80 uppercase'>
                        Orders over $250 ship free | Extended returns available through Jun 15.
                    </p>
                </div>
                {/* Header Content */}
                <header className={`transition-all duration-300 ${isHomePage
                    ? (isScrolled || hoveredCategory || isMenuOpen ? 'bg-white text-dark border-b border-border' : 'bg-transparent text-white')
                    : 'bg-white text-dark border-b border-border'
                    }`}>
                    <div className="mx-auto px-4 lg:px-10">
                        <div className="flex items-center h-[clamp(60px,8vw,80px)] relative transition-all duration-300">

                            {/* Left: Mobile Menu & Desktop Nav */}
                            <div ref={navRef} className="flex items-center w-1/4 lg:w-auto lg:flex-1">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={`lg:hidden p-2 -ml-2 hover:opacity-70 transition-all z-[70] relative ${isHomePage ? (isScrolled || hoveredCategory || isMenuOpen ? 'text-dark' : 'text-white') : 'text-dark'}`}
                                    aria-label="Toggle Menu"
                                >
                                    {isMenuOpen ? (
                                        <IoClose className="text-2xl" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                                    )}
                                </button>

                                <nav className="hidden lg:flex items-center space-x-[clamp(1rem,2vw,2.5rem)] transition-all">
                                    {(mainCategories && mainCategories.length > 0) ? (
                                        mainCategories.map((category) => (
                                            <div
                                                key={category._id}
                                                className="relative group"
                                                onMouseEnter={() => !isTouchDevice && openMegaMenu(category._id)}
                                                onMouseLeave={() => !isTouchDevice && closeMegaMenu()}
                                            >
                                                <Link
                                                    to={`/collection/${category.slug || category.mainCategoryName?.toLowerCase().replace(' ', '-')}`}
                                                    onClick={(e) => handleNavTouchOrClick(e, category._id)}
                                                    className={`text-[clamp(0.875rem,1.1vw,1rem)] font-medium text-nowrap transition-all duration-300 relative uppercase ${hoveredCategory === category._id
                                                        ? 'opacity-100'
                                                        : 'opacity-60 hover:opacity-100'
                                                        } ${isHomePage
                                                            ? (isScrolled || hoveredCategory ? 'text-dark' : 'text-white')
                                                            : 'text-dark'
                                                        }`}
                                                >
                                                    {category.mainCategoryName}
                                                    <span className={`absolute -bottom-1 left-0 h-[1px] transition-all duration-300 ${hoveredCategory === category._id ? 'w-full' : 'w-0 group-hover:w-full'
                                                        } ${isHomePage
                                                            ? (isScrolled || hoveredCategory ? 'bg-dark' : 'bg-white')
                                                            : 'bg-dark'
                                                        }`}></span>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        ['SHOP', 'MEN', 'WOMEN', 'LUX CARE'].map((item) => (
                                            <Link key={item} to="#" className={`text-[clamp(0.875rem,1.1vw,1rem)] font-medium uppercase transition-colors opacity-60 hover:opacity-100 ${isHomePage
                                                ? (isScrolled || hoveredCategory ? 'text-dark' : 'text-white')
                                                : 'text-dark'
                                                }`}>{item}</Link>
                                        ))
                                    )}
                                </nav>
                            </div>

                            {/* Center: Logo */}
                            <div className="flex-1 flex justify-center z-[60]">
                                <Link to="/" className="hover:opacity-80 transition-opacity duration-300 outline-none">
                                    <EoLogo
                                        className={`h-[clamp(1.5rem,4vw,2rem)] w-auto transition-all duration-300 ${isHomePage
                                            ? (isScrolled || hoveredCategory || isMenuOpen ? '[&_path]:fill-primary' : '[&_path]:fill-white')
                                            : '[&_path]:fill-primary'
                                            }`}
                                    />
                                </Link>
                            </div>

                            {/* Right: Icons */}
                            <div className="flex items-center justify-end w-1/4 lg:w-auto lg:flex-1 space-x-0 xs:space-x-1 sm:space-x-[clamp(0.25rem,1.5vw,1rem)] transition-all">
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className={`p-1.5 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 ${isHomePage
                                        ? (isScrolled || hoveredCategory || isMenuOpen ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                        : 'hover:bg-mainBG text-dark'
                                        }`}
                                >
                                    <LuSearch className='text-[clamp(1.1rem,2.5vw,1.4rem)]' />
                                </button>
                                <button className={`p-1.5 lg:block hidden rounded-full transition-all duration-300 opacity-70 hover:opacity-100 ${isHomePage
                                    ? (isScrolled || hoveredCategory || isMenuOpen ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                    : 'hover:bg-mainBG text-dark'
                                    }`}>
                                    <FaRegHeart className='text-[clamp(1.1rem,2.5vw,1.4rem)]' />
                                </button>
                                <button className={`p-1.5 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 relative ${isHomePage
                                    ? (isScrolled || hoveredCategory || isMenuOpen ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                    : 'hover:bg-mainBG text-dark'
                                    }`}>
                                    <HiOutlineShoppingBag className='text-[clamp(1.1rem,2.5vw,1.4rem)]' />
                                </button>
                                {user && (
                                    <button
                                        onClick={() => setIsNotificationsOpen(true)}
                                        className={`p-1.5 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 relative ${isHomePage
                                            ? (isScrolled || hoveredCategory || isMenuOpen ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                            : 'hover:bg-mainBG text-dark'
                                            }`}
                                    >
                                        <HiOutlineBell className='text-[clamp(1.1rem,2.5vw,1.4rem)]' />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                )}
                                {user ? (
                                    <button
                                        onClick={() => setIsAccountOpen(true)}
                                        className={`flex gap-2 items-center ${isHomePage
                                            ? (isScrolled || hoveredCategory || isMenuOpen ? 'text-dark' : 'text-white')
                                            : 'text-dark'
                                            }`}>
                                        <div className="h-7 w-7 xs:h-8 xs:w-8 bg-primary uppercase rounded-full flex items-center justify-center font-bold text-white text-[10px] transition-all flex-shrink-0">
                                            {user?.firstName?.slice(0, 1) || 'U'}
                                        </div>
                                        <span className='capitalize font-semibold tracking-wide hidden md:block'>{user?.firstName}</span>
                                    </button>
                                ) : (
                                    <Link to="/auth" className={`p-1.5 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 ${isHomePage
                                        ? (isScrolled || hoveredCategory || isMenuOpen ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                        : 'hover:bg-mainBG text-dark'
                                        }`}>
                                        <CgProfile className='text-[clamp(1.1rem,2.5vw,1.4rem)]' />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Navigation Menu Overflow */}
                <div
                    className={`fixed inset-x-0 bottom-0 top-[60px] md:top-[95px] bg-dark lg:hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[40] ${isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                >
                    <div className="flex flex-col h-full overflow-hidden border-none outline-none">
                        <div className="overflow-y-auto h-full px-6 py-8 relative border-none scrollbar-hide">
                            {/* Level 0: Main Categories */}
                            <div className={`transition-all duration-500 flex flex-col space-y-4 ${menuStack.length === 0 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute inset-y-0 left-0 w-full px-6 py-8 pointer-events-none'
                                }`}>
                                {mainCategories && mainCategories.map((category, index) => (
                                    <div
                                        key={category._id}
                                        onClick={() => handleMainCategoryClick(category)}
                                        className={`flex items-center justify-between text-[clamp(1.1rem,4vw,1.5rem)] font-semibold tracking-[0.1em] text-white hover:text-white/70 uppercase cursor-pointer transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                                            }`}
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                    >
                                        <span>{category.mainCategoryName}</span>
                                        {getCategoriesForMainCategory(category._id).length > 0 && (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Level 1: Categories */}
                            <div className={`transition-all h-full duration-500  flex-col space-y-4 absolute inset-y-0 left-0 w-full px-6 py-8 flex ${menuStack.length === 1 && menuStack[0].type === 'main' ? 'translate-x-0 opacity-100 ' : 'translate-x-full hidden opacity-0 pointer-events-none'
                                }`}>
                                {menuStack.length > 0 && (
                                    <button onClick={handleMenuBack} className="flex items-center gap-2 text-white/50 mb-6 uppercase text-xs font-bold tracking-widest outline-none">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                        Back to {menuStack[0].type === 'main' ? 'Menu' : menuStack[0].name}
                                    </button>
                                )}
                                {menuStack.length > 0 && getCategoriesForMainCategory(menuStack[0].id).map((category, index) => (
                                    <div
                                        key={category._id}
                                        onClick={() => handleCategoryClick(category, menuStack[0])}
                                        className="flex items-center justify-between text-[clamp(1rem,3.5vw,1.25rem)] font-medium tracking-[0.05em] text-white/90 hover:text-white uppercase cursor-pointer"
                                    >
                                        <span>{category.categoryName}</span>
                                        {getSubCategoriesForCategory(category._id).length > 0 && (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Level 2: Subcategories */}
                            <div className={`transition-all h-full duration-500 flex  flex-col space-y-4 absolute inset-y-0 left-0 w-full px-6 py-8 ${menuStack.length === 2 && menuStack[1].type === 'category' ? 'translate-x-0 opacity-100' : 'translate-x-[200%] hidden opacity-0 pointer-events-none'
                                }`}>
                                {menuStack.length > 1 && (
                                    <button onClick={handleMenuBack} className="flex items-center gap-2 text-white/50 mb-6 uppercase text-xs font-bold tracking-widest outline-none">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                        Back to {menuStack[0].name}
                                    </button>
                                )}
                                {menuStack.length > 1 && getSubCategoriesForCategory(menuStack[1].id).map((subCat) => {
                                    const mainSlug = menuStack[0].name.toLowerCase().replace(' ', '-');
                                    const catSlug = menuStack[1].name.toLowerCase().replace(' ', '-');
                                    return (
                                        <Link
                                            key={subCat._id}
                                            to={`/collection/${mainSlug}/${catSlug}/${subCat.slug}`}
                                            onClick={() => resetMobileMenu()}
                                            className="flex items-center justify-between text-[clamp(0.875rem,3vw,1.1rem)] font-normal text-white/80 hover:text-white uppercase"
                                        >
                                            {subCat.subCategoryName}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Menu Footer */}
                        <div className={`px-10 pb-12 pt-6 flex flex-col mt-10 border-t-2 border-white/10 space-y-6 bg-dark transition-all duration-500 delay-100 border-none outline-none ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}>
                            {/* Horizontal Line as per design */}
                            <div className="w-full h-px bg-white/10" />
                            <Link to="/account" onClick={() => resetMobileMenu()} className="text-[13px] font-semibold tracking-[0.1em] text-[#ADB5BD] hover:text-white uppercase transition-colors">Account</Link>
                            <Link to="/wishlist" onClick={() => resetMobileMenu()} className="text-[13px] font-semibold tracking-[0.1em] text-[#ADB5BD] hover:text-white uppercase transition-colors">Wishlist</Link>
                            <Link to="/support" onClick={() => resetMobileMenu()} className="text-[13px] font-semibold tracking-[0.1em] text-[#ADB5BD] hover:text-white uppercase transition-colors">Customer Care</Link>
                        </div>
                    </div>
                </div>

                {/* Mega Menu Dropdown */}
                {hoveredCategory && (
                    <>
                        {/* Invisible bridge to prevent menu from closing on mouse */}
                        <div
                            className="hidden lg:block absolute top-[80px] left-0 w-full h-[10px] z-40"
                            onMouseEnter={() => !isTouchDevice && openMegaMenu(hoveredCategory)}
                        />
                        <div
                            className={`hidden lg:block absolute top-[90px] left-0 w-full bg-white text-dark z-50 shadow-lg
                                transition-[opacity,transform] duration-300 ease-out
                                ${megaMenuVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}
                            `}
                            onMouseEnter={() => !isTouchDevice && openMegaMenu(hoveredCategory)}
                            onMouseLeave={() => !isTouchDevice && closeMegaMenu()}
                        >
                            {mainCategories.map((mainCategory) => {
                                if (mainCategory._id !== hoveredCategory) return null;

                                const menuContent = getMegaMenuContent(mainCategory);
                                const categoryList = getCategoriesForMainCategory(mainCategory._id);

                                // Split categories into up to 3 columns
                                const col1 = categoryList.slice(0, Math.ceil(categoryList.length / 3));
                                const col2 = categoryList.slice(Math.ceil(categoryList.length / 3), Math.ceil(categoryList.length / 3) * 2);
                                const col3 = categoryList.slice(Math.ceil(categoryList.length / 3) * 2);
                                const columns = [col1, col2, col3].filter(c => c.length > 0);

                                return (
                                    <div key={mainCategory._id} className="flex flex-row items-start p-8 w-full">
                                        {categoryList.length > 0 ? (
                                            <>
                                                {/* Category Columns (1–3) */}
                                                {columns.map((colCategories, colIdx) => (
                                                    <div
                                                        key={colIdx}
                                                        className="flex flex-col items-start gap-6 flex-1 pr-8 self-stretch"
                                                    >
                                                        {colCategories.map((category) => {
                                                            const subCats = getSubCategoriesForCategory(category._id);
                                                            return (
                                                                <div key={category._id} className="flex flex-col items-start gap-4 w-full">
                                                                    {/* Column Title */}
                                                                    <h3
                                                                        className="w-full uppercase text-primary"
                                                                        style={{
                                                                            fontFamily: 'Urbanist, sans-serif',
                                                                            fontWeight: 800,
                                                                            fontSize: '14px',
                                                                            lineHeight: '16px',
                                                                        }}
                                                                    >
                                                                        {category.categoryName}
                                                                    </h3>
                                                                    {/* Options */}
                                                                    {subCats.length > 0 ? (
                                                                        <ul className="flex flex-col items-start gap-4 w-full">
                                                                            {subCats.map((subCat) => (
                                                                                <li key={subCat._id} className="w-full">
                                                                                    <Link
                                                                                        to={`/collection/${mainCategory.slug}/${category.slug}/${subCat.slug}`}
                                                                                        onClick={closeMegaMenu}
                                                                                        className="block w-full transition-colors duration-200 hover:text-gold"
                                                                                        style={{
                                                                                            fontFamily: 'Urbanist, sans-serif',
                                                                                            fontWeight: 500,
                                                                                            fontSize: '16px',
                                                                                            lineHeight: '22px',
                                                                                            color: '#343A40',
                                                                                        }}
                                                                                    >
                                                                                        {subCat.subCategoryName}
                                                                                    </Link>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <p className="text-sm text-lightText italic">No subcategories</p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}

                                                {/* Column 4 — Featured Image + CTAs */}
                                                <div className="flex flex-col items-start gap-6 flex-1 self-stretch">
                                                    {/* Section title */}
                                                    <h3
                                                        className="w-full uppercase text-primary"
                                                        style={{
                                                            fontFamily: 'Urbanist, sans-serif',
                                                            fontWeight: 800,
                                                            fontSize: '14px',
                                                            lineHeight: '16px',
                                                        }}
                                                    >
                                                        {mainCategory.mainCategoryName}
                                                    </h3>
                                                    {/* Featured Image */}
                                                    <div className="w-full" style={{ height: '400px' }}>
                                                        <img
                                                            src={menuContent.featuredImage}
                                                            alt={menuContent.featuredTitle}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {/* CTA Buttons */}
                                                    <Link
                                                        to={menuContent.featuredLink}
                                                        onClick={closeMegaMenu}
                                                        className="flex flex-row items-center gap-3 hover:opacity-70 transition-opacity"
                                                    >
                                                        <span
                                                            style={{
                                                                fontFamily: 'Urbanist, sans-serif',
                                                                fontWeight: 600,
                                                                fontSize: '18px',
                                                                lineHeight: '22px',
                                                                textTransform: 'uppercase',
                                                                color: '#1B1B1B',
                                                            }}
                                                        >
                                                            Shop {mainCategory.mainCategoryName}
                                                        </span>
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        to={`${menuContent.featuredLink}/new-arrivals`}
                                                        className="flex flex-row items-center gap-3 hover:opacity-70 transition-opacity"
                                                        onClick={closeMegaMenu}
                                                    >
                                                        <span
                                                            style={{
                                                                fontFamily: 'Urbanist, sans-serif',
                                                                fontWeight: 600,
                                                                fontSize: '18px',
                                                                lineHeight: '22px',
                                                                textTransform: 'uppercase',
                                                                color: '#1B1B1B',
                                                            }}
                                                        >
                                                            New Arrivals
                                                        </span>
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-8 text-center w-full">
                                                <p className="text-lightText">No categories available for {mainCategory.mainCategoryName}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Search Overlay */}
                {isSearchOpen && (
                    <div
                        className="fixed top-0 left-0 w-full bg-white z-[100] shadow-2xl"
                        style={{ minHeight: '520px' }}
                    >
                        {/* Close button row */}
                        <div className="flex items-center justify-end px-6 md:px-10 pt-4">
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="p-2 hover:bg-mainBG rounded-full transition-colors"
                            >
                                <IoClose className="text-2xl text-dark" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Left Sidebar */}
                            <div className="hidden md:flex flex-col gap-10 w-64 shrink-0 px-8 pb-10 pt-2 border-r border-border">
                                <div>
                                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase mb-4 text-dark">
                                        Popular Searches
                                    </h3>
                                    <ul className="space-y-3">
                                        {(popularSearches && popularSearches.length > 0
                                            ? popularSearches
                                            : ['Leather clothing', 'Sculptural Cross-body Bags', 'Oxford Shoes', 'Vitamin C Brightening Elixirs']
                                        ).map((s, i) => (
                                            <li key={i}>
                                                <button
                                                    onClick={() => {
                                                        dispatch(logSearch(s));
                                                        navigate(`/search?q=${encodeURIComponent(s)}`);
                                                        setIsSearchOpen(false);
                                                    }}
                                                    className="text-sm text-mainText hover:text-gold transition-colors text-left w-full"
                                                >
                                                    {s}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase mb-4 text-dark">
                                        {recentSearches?.length > 0 ? 'Recent Searches' : 'Suggestions'}
                                    </h3>
                                    <ul className="space-y-3">
                                        {(recentSearches?.length > 0
                                            ? recentSearches
                                            : ['Barbara bag', 'Gifts for her', 'Gifts for him', "Men's new arrivals", "Women's new arrivals"]
                                        ).map((s, i) => (
                                            <li key={i}>
                                                <button
                                                    onClick={() => {
                                                        navigate(`/search?q=${encodeURIComponent(s)}`);
                                                        setIsSearchOpen(false);
                                                    }}
                                                    className="text-sm text-mainText hover:text-gold transition-colors text-left w-full"
                                                >
                                                    {s}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right Content */}
                            <div className="flex-1 flex flex-col px-6 md:px-10 pb-10 pt-2 overflow-y-auto">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 border border-border px-4 py-3 mb-8 bg-[#F9F9F9]">
                                    <LuSearch className="text-lg text-primary/40 shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleSearchSubmit}
                                        placeholder="Search our global archive for objects of rarity.."
                                        className="flex-1 text-sm text-dark placeholder:text-primary/30 outline-none bg-transparent"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(''); dispatch(clearSearchResults()); }}>
                                            <IoClose className="text-lg text-primary/40 hover:text-dark transition-colors" />
                                        </button>
                                    )}
                                </div>

                                {/* Live Results or Trending */}
                                {searchQuery.trim().length > 0 ? (
                                    <div>
                                        <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase mb-6 text-dark">
                                            {searchLoading ? 'Searching...' : `Results for "${searchQuery}"`}
                                        </h3>
                                        {searchLoading ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="animate-pulse">
                                                        <div className="aspect-[3/4] bg-mainBG mb-3"></div>
                                                        <div className="h-3 bg-mainBG w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-mainBG w-1/4"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                {searchResults.slice(0, 8).map((product) => (
                                                    <Link
                                                        key={product._id}
                                                        to={`/product/${product.slug}`}
                                                        onClick={() => setIsSearchOpen(false)}
                                                        className="group cursor-pointer"
                                                    >
                                                        <div className="relative mb-3 bg-[#F9F9F9] aspect-[3/4] overflow-hidden">
                                                            <img
                                                                src={product.variants?.[0]?.images?.[0] || "/images/product.png"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                            />
                                                            {product.badge && (
                                                                <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase text-lightText bg-white px-1.5 py-0.5">
                                                                    {product.badge}
                                                                </span>
                                                            )}
                                                            <button className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm">
                                                                <FaRegHeart className="text-xs" />
                                                            </button>
                                                        </div>
                                                        <h4 className="text-sm font-medium text-dark group-hover:text-gold transition-colors leading-snug">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-sm text-lightText mt-0.5">
                                                            ${product.variants?.[0]?.price || '0.00'}
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-lightText">No products found for "{searchQuery}"</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase mb-6 text-dark">
                                            Trending Products
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            {trendingProducts && trendingProducts.length > 0 ? (
                                                trendingProducts.map((product) => (
                                                    <Link
                                                        key={product._id}
                                                        to={`/product/${product.slug}`}
                                                        onClick={() => setIsSearchOpen(false)}
                                                        className="group cursor-pointer"
                                                    >
                                                        <div className="relative mb-3 bg-[#F9F9F9] aspect-[3/4] overflow-hidden">
                                                            <img
                                                                src={product.variants?.[0]?.images?.[0] || "/images/product.png"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                            />
                                                            {product.badge && (
                                                                <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase text-lightText bg-white px-1.5 py-0.5">
                                                                    {product.badge}
                                                                </span>
                                                            )}
                                                            <button className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm">
                                                                <FaRegHeart className="text-xs" />
                                                            </button>
                                                        </div>
                                                        <h4 className="text-sm font-medium text-dark group-hover:text-gold transition-colors leading-snug">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-sm text-lightText mt-0.5">
                                                            ${product.variants?.[0]?.price || '0.00'}
                                                        </p>
                                                    </Link>
                                                ))
                                            ) : (
                                                [1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="animate-pulse">
                                                        <div className="aspect-[3/4] bg-mainBG mb-3"></div>
                                                        <div className="h-3 bg-mainBG w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-mainBG w-1/4"></div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Backdrop overlay when search is open */}
                {isSearchOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-[90]"
                        onClick={() => setIsSearchOpen(false)}
                    />
                )}
            </div>

            {/* Account Sidebar Backdrop */}
            {isAccountOpen && (
                <div
                    className="fixed inset-0 z-[80] bg-black/30"
                    onClick={() => setIsAccountOpen(false)}
                />
            )}

            {/* Account Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white z-[90] shadow-xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isAccountOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <span className="text-2xl font-bold text-dark tracking-wide">Account</span>
                    <button
                        onClick={() => setIsAccountOpen(false)}
                        className="text-dark transition-colors"
                        aria-label="Close account menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 flex flex-col px-6 pt-4">
                    {ACCOUNT_MENU.map((item) => (
                        <Link
                            key={item.label}
                            to={item.href}
                            onClick={() => setIsAccountOpen(false)}
                            className="group p-6 text-lg text-mainText font-medium hover:bg-mainBG transition-colors tracking-wide hover:ring-1 hover:ring-border flex items-center justify-between"
                        >
                            {item.label}
                            <HiArrowUpRight className='text-lightText font-bold opacity-0 group-hover:opacity-100 transition-opacity' />
                        </Link>
                    ))}
                    <button
                        onClick={handleLogoutClick}
                        className="p-6 text-lg text-mainText font-medium hover:bg-mainBG transition-colors tracking-wide hover:ring-1 hover:ring-border text-left"
                    >
                        Logout
                    </button>
                </nav>
            </div>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={cancelLogout}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-2xl font-bold text-dark ">Log out?</h3>
                            {/* Close button */}
                            <button
                                onClick={cancelLogout}
                                className="absolute top-6 right-6 text-lightText hover:text-dark transition-colors"
                            >
                                <IoClose size={28} />
                            </button>
                        </div>

                        <p className="text-base font-medium text-lightText mb-6 leading-relaxed">
                            Are you sure you want to log out of your account?
                        </p>

                        <div className="flex gap-5">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 bg-white border border-border text-dark text-sm font-semibold py-3 uppercase tracking-widest hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 bg-primary text-white text-sm font-semibold py-3 uppercase tracking-widest hover:bg-primary/90 transition-colors"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[110] shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-dark tracking-tighter uppercase">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">
                                {unreadCount} NEW
                            </span>
                        )}
                    </div>
                    <button onClick={() => setIsNotificationsOpen(false)} className="p-2 hover:bg-mainBG rounded-full transition-colors">
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-border/40">
                            <div className="p-4 flex justify-between bg-mainBG/30">
                                <button onClick={() => dispatch(markAllAsRead())} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Mark all as read</button>
                                <button className="text-[10px] font-bold text-lightText/60 uppercase tracking-widest hover:underline">Clear all</button>
                            </div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-6 transition-colors relative group/noti ${!notification.isRead ? 'bg-primary/5' : 'hover:bg-mainBG'}`}
                                    onClick={() => dispatch(markAsRead(notification._id))}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-primary pulse-small'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold text-dark truncate pr-4">{notification.title}</h4>
                                                <span className="text-[10px] text-lightText/40 font-medium whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-lightText leading-relaxed mb-3 line-clamp-2">{notification.message}</p>
                                            {notification.metadata?.orderId && (
                                                <Link
                                                    to={`/orders`}
                                                    onClick={() => setIsNotificationsOpen(false)}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest hover:gap-2 transition-all"
                                                >
                                                    View Order Details <HiArrowUpRight />
                                                </Link>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(deleteNotification(notification._id));
                                            }}
                                            className="opacity-0 group-hover/noti:opacity-100 p-2 text-lightText hover:text-red-500 transition-all"
                                        >
                                            <IoClose size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-20 h-20 bg-mainBG rounded-full flex items-center justify-center mb-6">
                                <HiOutlineBell className="text-4xl text-lightText/30" />
                            </div>
                            <h4 className="text-xl font-bold text-dark mb-2">No new notifications</h4>
                            <p className="text-sm text-lightText/60 leading-relaxed">We'll notify you when something important happens, like order updates or exclusive offers.</p>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-border bg-mainBG/20">
                    <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="w-full py-4 bg-dark text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary transition-colors shadow-lg"
                    >
                        Close Panel
                    </button>
                </div>
            </div>

            {/* Notification Backdrop */}
            {isNotificationsOpen && (
                <div
                    className="fixed inset-0 z-[105] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsNotificationsOpen(false)}
                />
            )}
        </>
    )
}




