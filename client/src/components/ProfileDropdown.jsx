import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function ProfileDropdown({ user, userProfile, handleLogout, unreadCount, unreadNotifications }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  if (!user) return null;

  const greetingName = userProfile?.name || user.displayName || user.email;
  const avatarSrc = userProfile?.profilePicUrl || `https://ui-avatars.com/api/?name=${greetingName.replace(/\s/g, '+')}&background=random`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-10 h-10 rounded-full bg-brand-sand flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green overflow-hidden"
      >
        <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />

        {(unreadCount + unreadNotifications) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-marigold rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-4 z-20">
          <div className="px-6 mb-4">
            <p className="text-lg font-semibold text-brand-ink">Hi, {greetingName}</p>
          </div>

          <Link to="/preferences" className="block px-6 py-2 text-md text-brand-green font-semibold hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            My Preferences
          </Link>
          <Link to="/notifications" className="flex items-center justify-between px-6 py-2 text-md text-brand-ink hover:bg-brand-cream" onClick={() => setIsOpen(false)}>
              <span>My Notifications</span>
              {unreadNotifications > 0 && (
                  <span className="bg-brand-marigold text-brand-ink text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadNotifications}
                  </span>
              )}
          </Link>
          <Link to={`/profile/${user.uid}`} className="block px-6 py-2 text-md text-brand-ink hover:bg-brand-cream" onClick={() => setIsOpen(false)}>
            My Profile
          </Link>
          <Link to="/my-listings" className="block px-6 py-2 text-md text-brand-ink hover:bg-brand-cream" onClick={() => setIsOpen(false)}>
              My Listings
          </Link>
          <Link to="/saved" className="block px-6 py-2 text-md text-brand-ink hover:bg-brand-cream" onClick={() => setIsOpen(false)}>
            Saved
          </Link>
          <Link to="/chats" className="flex items-center justify-between px-6 py-2 text-md text-brand-ink hover:bg-brand-cream" onClick={() => setIsOpen(false)}>
              <span>Messages</span>
              {unreadCount > 0 && (
                  <span className="bg-brand-marigold text-brand-ink text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                  </span>
              )}
          </Link>
          <Link to="#" className="block px-6 py-2 text-md text-brand-ink hover:bg-brand-cream">
            Need Help?
          </Link>
          
          <div className="border-t my-2 mx-4"></div>

          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full text-left block px-6 py-2 text-md text-red-600 hover:bg-brand-cream"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;