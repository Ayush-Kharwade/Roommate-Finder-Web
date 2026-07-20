import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import ProfileDropdown from './ProfileDropdown.jsx';

// Icons remain the same
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    );

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    );

function Navbar({ user, userProfile }) { // 1. Add userProfile here
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => {
      toast.success('Successfully logged out!');
      navigate('/');
    }).catch((error) => {
      toast.error('Failed to log out.');
    });
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            RoommateFinder
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/listings" className="text-gray-700 font-medium hover:text-blue-600 flex items-center transition-colors">
              <SearchIcon />
              Find My Roommate
            </Link>

            {/* NEW "+ Add Listing" Button */}
            {user && (
                <Link
                    to="/listing-choice"
                    className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Listing
                </Link>
            )}
            
            <div className="border-l border-gray-200 h-8"></div>

            {user ? (
              // 2. Pass userProfile down to the dropdown
              <ProfileDropdown user={user} userProfile={userProfile} handleLogout={handleLogout} />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/signup" className="text-gray-700 font-medium hover:text-blue-600 px-3 py-2">Join Community</Link>
                <Link to="/login" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;