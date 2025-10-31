import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function ProfileDropdown({ user, userProfile, handleLogout }) {
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
        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 overflow-hidden"
      >
        <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-4 z-20">
          <div className="px-6 mb-4">
            <p className="text-lg font-semibold text-gray-800">Hi, {greetingName}</p>
          </div>

          <Link to="/preferences" className="block px-6 py-2 text-md text-green-500 font-semibold hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            My Preferences
          </Link>
          <Link to="/notifications" className="block px-6 py-2 text-md text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            My Notifications
          </Link>
          <Link to={`/profile/${user.uid}`} className="block px-6 py-2 text-md text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
            My Profile
          </Link>
          <Link to="#" className="block px-6 py-2 text-md text-gray-700 hover:bg-gray-100">
            Need Help?
          </Link>
          
          <div className="border-t my-2 mx-4"></div>

          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full text-left block px-6 py-2 text-md text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;