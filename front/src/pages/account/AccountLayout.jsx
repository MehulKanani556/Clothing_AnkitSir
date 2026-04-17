import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../redux/slice/auth.slice';
import { HiChevronRight } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';

const NAV_ITEMS = [
    { label: 'Profile', href: '/profile' },
    { label: 'Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Addresses', href: '/addresses' },
    { label: 'Payments', href: '/payments' },
    { label: 'Settings', href: '/settings' },
    { label: 'Support', href: '/support' },
];

export default function AccountLayout({ children }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        dispatch(logout());
        navigate('/');
        setIsLogoutModalOpen(false);
    };

    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
    };

    return (
        <div className="min-h-[calc(100vh-10rem)] bg-mainBG">

            {/* Breadcrumb - Sticky below header */}
            <div className="sticky top-[61px] md:top-[94px] lg:top-[114px] z-20 py-3 md:py-6 px-4 md:px-8 text-center bg-background border-b border-border">
                <p className="text-sm md:text-base text-lightText leading-5 uppercase font-semibold">
                    <Link to="/" className="">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-dark">Account</span>
                </p>
            </div>

            {/* Body */}
            <div className="flex min-h-[calc(100vh-6.4rem)] md:min-h-[calc(100vh-10.5rem)] lg:min-h-[calc(100vh-11.5rem)] px-0 lg:px-0">
                {/* Left Sidebar - Sticky below breadcrumb */}
                <aside className="sticky top-[168px] lg:top-[187px] hidden md:flex flex-col w-64 2xl:w-96 h-[calc(100vh-192px)] shrink-0 bg-white overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center justify-between font-medium p-6 text-lg transition-colors ${isActive
                                    ? 'bg-primary text-white'
                                    : 'text-dark hover:bg-mainBG'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span>{item.label}</span>
                                    {isActive && <HiChevronRight className="text-white text-base" />}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center p-6 text-lg font-medium text-dark hover:bg-mainBG transition-colors text-left"
                    >
                        Logout
                    </button>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-10">
                    {children}
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
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
        </div>
    );
}
