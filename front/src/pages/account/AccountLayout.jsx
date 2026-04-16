import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slice/auth.slice';
import { HiChevronRight } from 'react-icons/hi2';

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

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <div className="min-h-[calc(100vh-10rem)] bg-mainBG">

            {/* Breadcrumb - Sticky below header */}
            <div className="sticky top-[81px] md:top-[114px] z-20 py-6 px-8 text-center bg-background border-b border-border">
                <p className="text-base text-lightText leading-5 uppercase font-semibold">
                    <Link to="/" className="">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-dark">Account</span>
                </p>
            </div>

            {/* Body */}
            <div className="flex min-h-[calc(100vh-9.4rem)] md:min-h-[calc(100vh-11.5rem)] px-0 lg:px-0">

                {/* Left Sidebar - Sticky below breadcrumb */}
                <aside className="sticky top-[183px] hidden md:flex flex-col w-64 2xl:w-96 h-[calc(100vh-192px)] shrink-0 bg-white overflow-y-auto">
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
                        onClick={handleLogout}
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
        </div>
    );
}
