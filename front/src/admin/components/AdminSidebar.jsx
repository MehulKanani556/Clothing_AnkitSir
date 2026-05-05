import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MdDashboard,
  MdLayers,
  MdShoppingBag,
  MdPeople,
  MdSettings,
  MdChevronRight,
  MdGridView,
  MdFolder,
  MdAccountTree,
  MdShoppingCart,
  MdLocalOffer,
  MdChat,
  MdSupport,
  MdMail,
  MdHistory,
  MdPayments
} from 'react-icons/md';

const AdminSidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.order);
  const { contacts, support } = useSelector((state) => state.contact);
  const { subscribers } = useSelector((state) => state.newsletter);

  // Filter pending/active items for badges
  const pendingOrders = orders?.filter(o => o.orderStatus === 'Pending')?.length || 0;
  const contactCount = contacts?.length || 0;
  const supportCount = support?.length || 0;
  const subscriberCount = subscribers?.length || 0;

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <MdDashboard size={20} />,
      path: '/admin',
      exact: true,
      activePatterns: ['/admin']
    },
    {
      name: 'Orders',
      icon: <MdShoppingCart size={20} />,
      path: '/admin/orders',
      activePatterns: ['/admin/orders', '/admin/order'],
      badge: pendingOrders
    },
    {
      name: 'Main Category',
      icon: <MdLayers size={20} />,
      path: '/admin/main-category',
      activePatterns: ['/admin/main-category']
    },
    {
      name: 'Category',
      icon: <MdGridView size={20} />,
      path: '/admin/category',
      activePatterns: ['/admin/category']
    },
    {
      name: 'Sub Category',
      icon: <MdFolder size={20} />,
      path: '/admin/sub-category',
      activePatterns: ['/admin/sub-category']
    },
    {
      name: 'Inside Sub Category',
      icon: <MdAccountTree size={20} />,
      path: '/admin/inside-sub-category',
      activePatterns: ['/admin/inside-sub-category']
    },
    {
      name: 'Products',
      icon: <MdShoppingBag size={20} />,
      path: '/admin/product',
      activePatterns: ['/admin/product']
    },
    {
      name: 'Lookbook',
      icon: <MdLayers size={20} />,
      path: '/admin/lookbook',
      activePatterns: ['/admin/lookbook']
    },
    {
      name: 'Coupons',
      icon: <MdLocalOffer size={20} />,
      path: '/admin/coupons',
      activePatterns: ['/admin/coupons']
    },
    {
      name: 'Customers',
      icon: <MdPeople size={20} />,
      path: '/admin/customers',
      activePatterns: ['/admin/customers', '/admin/customer']
    },
    {
      name: 'Contacts',
      icon: <MdChat size={20} />,
      path: '/admin/contacts',
      activePatterns: ['/admin/contacts'],
      badge: contactCount
    },
    {
      name: 'Support',
      icon: <MdSupport size={20} />,
      path: '/admin/support',
      activePatterns: ['/admin/support'],
      badge: supportCount
    },
    {
      name: 'Newsletter',
      icon: <MdMail size={20} />,
      path: '/admin/newsletter',
      activePatterns: ['/admin/newsletter'],
      badge: subscriberCount
    },
    {
      name: 'Payments',
      icon: <MdPayments size={20} />,
      path: '/admin/payments',
      activePatterns: ['/admin/payments']
    },
    {
      name: 'Settings',
      icon: <MdSettings size={20} />,
      path: '/admin/settings',
      activePatterns: ['/admin/settings']
    },
  ];

  const getInitials = () => {
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'AD';
  };

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col h-full transition-all duration-300 ease-in-out md:translate-x-0 -translate-x-full fixed md:relative z-20">
      {/* Sidebar Header */}
      <div className="h-24 flex items-center px-8 border-b border-mainBG">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-black text-2xl tracking-tighter">
              {getInitials()}
            </span>
          </div>
          <div>
            <h1 className="font-extrabold text-2xl tracking-tighter leading-none text-mainText">EO</h1>
            <p className="text-[10px] text-lightText font-black tracking-widest uppercase mt-1">Studio Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 custom-scrollbar">
        {menuItems.map((item) => {
          const isItemActive = (pathname) => {
            if (item.exact) {
              return pathname === item.path;
            }
            return item.activePatterns.some(pattern => pathname.startsWith(pattern));
          };

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => {
                const currentPath = window.location.pathname;
                const active = isItemActive(currentPath);
                return `flex items-center justify-between px-5 py-3 rounded-none transition-all duration-300 group ${active
                  ? 'bg-primary text-white font-bold shadow-xl shadow-primary/10 scale-[1.02]'
                  : 'text-lightText hover:bg-mainBG hover:text-mainText'
                  }`;
              }}
            >
              {() => {
                const currentPath = window.location.pathname;
                const active = isItemActive(currentPath);
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={`${active ? 'text-white' : 'text-lightText group-hover:text-primary'} transition-colors duration-300`}>
                        {item.icon}
                      </span>
                      <span className="text-sm tracking-tight">{item.name}</span>
                    </div>
                    {item.badge > 0 ? (
                      <span className={`px-2 py-0.5 rounded-none text-[10px] font-black tracking-tighter ${active ? 'bg-white text-primary' : 'bg-primary text-white shadow-lg shadow-primary/10'}`}>
                        {item.badge}
                      </span>
                    ) : (
                      <MdChevronRight size={14} className={`transition-all duration-300 ${active ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    )}
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-mainBG">
        <div className="bg-mainBG rounded-none p-4 flex items-center gap-3 border border-border/50 group cursor-pointer hover:bg-white transition-all">
          <div className="w-10 h-10 rounded-none bg-primary text-white flex items-center justify-center overflow-hidden font-black text-sm shadow-md group-hover:scale-110 transition-transform">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-mainText truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Administrator'}
            </p>
            <p className="text-[10px] text-lightText font-bold truncate uppercase tracking-tight">
              {user?.email || 'admin@studio.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
