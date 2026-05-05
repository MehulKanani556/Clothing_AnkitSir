import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiBell, FiUser, FiMaximize, FiGlobe, FiMinimize, FiCheck, FiTrash2, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../redux/slice/notification.slice';
import { formatDistanceToNow } from 'date-fns';

const AdminHeader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount, loading } = useSelector((state) => state.notification);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Toggle Fullscreen logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes (e.g. via Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Fetch notifications on mount
    dispatch(fetchNotifications());

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch]);

  // Get User Initials
  const getInitials = () => {
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'AD';
  };

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  return (
    <header className="h-20 bg-background border-b border-border sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-lightText group-focus-within:text-primary transition-colors">
            <FiSearch size={18} />
          </span>
          <input
            type="text"
            className="w-full bg-mainBG border border-border rounded-none py-2.5 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm h-11 text-mainText"
            placeholder="Search dashboard, orders, or categories..."
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/"
          className="hidden md:flex items-center gap-2 px-4 py-2 border border-border rounded-none text-sm font-medium text-mainText hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
        >
          <FiGlobe size={16} />
          Switch to User
        </Link>

        <div className="flex items-center gap-1 border-l border-border pl-4 ml-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-lightText hover:bg-mainBG hover:text-mainText rounded-none transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 text-lightText hover:bg-mainBG hover:text-mainText rounded-none transition-colors relative ${showNotifications ? 'bg-mainBG text-primary' : ''}`}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-primary border-2 border-background rounded-none flex items-center justify-center text-[8px] text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-background border border-border rounded-none shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="p-5 border-b border-border flex items-center justify-between bg-mainBG/50 backdrop-blur-sm">
                  <div>
                    <h3 className="font-black text-mainText text-lg tracking-tight">Notifications</h3>
                    <p className="text-lightText text-[10px] font-bold uppercase tracking-widest mt-0.5">You have {unreadCount} unread messages</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-border">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => handleMarkAsRead(notification._id)}
                          className={`p-4 flex gap-4 hover:bg-mainBG transition-colors cursor-pointer relative group ${!notification.isRead ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-none flex-shrink-0 flex items-center justify-center ${!notification.isRead ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-mainBG text-lightText'}`}>
                            <FiBell size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`text-sm font-bold truncate ${!notification.isRead ? 'text-mainText' : 'text-lightText'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-[10px] text-lightText font-medium whitespace-nowrap flex items-center gap-1">
                                <FiClock size={10} />
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: false })}
                              </span>
                            </div>
                            <p className="text-xs text-lightText line-clamp-2 mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification._id)}
                            className="absolute right-4 bottom-4 p-1.5 text-lightText hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-none hover:bg-red-50"
                          >
                            <FiTrash2 size={14} />
                          </button>
                          {!notification.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <div className="w-16 h-16 bg-mainBG rounded-none flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="text-primary/40" size={32} />
                      </div>
                      <h4 className="text-mainText font-bold">All caught up!</h4>
                      <p className="text-lightText text-xs mt-1">No new notifications to show.</p>
                    </div>
                  )}
                </div>

                <Link
                  to="/admin/settings"
                  onClick={() => setShowNotifications(false)}
                  className="p-4 block text-center text-xs font-black text-lightText hover:text-primary transition-colors border-t border-border bg-mainBG/20 uppercase tracking-widest"
                >
                  View Notification Settings
                </Link>
              </div>
            )}
          </div>

          <Link to="/admin/settings" className="flex items-center gap-2 p-1 pl-2 hover:bg-mainBG rounded-none transition-colors group">
            <div className="w-9 h-9 bg-primary text-white rounded-none flex items-center justify-center font-bold text-xs shadow-lg shadow-primary/20">
              {getInitials()}
            </div>
            <div className="hidden lg:block text-left mr-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Admin</p>
              <p className="text-xs font-bold text-mainText truncate max-w-[100px]">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Administrator'}
              </p>
            </div>
            <FiUser size={18} className="text-lightText group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
