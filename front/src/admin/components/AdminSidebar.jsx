import React from 'react';
import { NavLink } from 'react-router-dom';
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
  MdShoppingCart
} from 'react-icons/md';

const AdminSidebar = () => {
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
      activePatterns: ['/admin/orders', '/admin/order']
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
      name: 'Customers', 
      icon: <MdPeople size={20} />, 
      path: '/admin/customers',
      activePatterns: ['/admin/customers', '/admin/customer']
    },
    { 
      name: 'Settings', 
      icon: <MdSettings size={20} />, 
      path: '/admin/settings',
      activePatterns: ['/admin/settings']
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full transition-all duration-300 ease-in-out md:translate-x-0 -translate-x-full fixed md:relative z-20">
      {/* Sidebar Header */}
      <div className="h-24 flex items-center px-8 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg shadow-black/10">
            <span className="text-white font-black text-2xl tracking-tighter">eo</span>
          </div>
          <div>
            <h1 className="font-extrabold text-2xl tracking-tighter leading-none">EO</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Studio Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
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
                return `flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  active
                    ? 'bg-black text-white font-semibold shadow-xl shadow-black/10'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`;
              }}
            >
              {() => {
                const currentPath = window.location.pathname;
                const active = isItemActive(currentPath);
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 transition-colors'}>
                        {item.icon}
                      </span>
                      <span className="text-sm tracking-wide">{item.name}</span>
                    </div>
                    <MdChevronRight size={14} className={`transition-all duration-300 ${active ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
            <MdPeople size={20} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">admin@bhadpey.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
