import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Menu, X } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown.jsx';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

function Navbar({ user, userProfile }) {
  const auth = getAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth).then(() => {
      toast.success('Successfully logged out!');
      setMenuOpen(false);
      navigate('/');
    }).catch(() => {
      toast.error('Failed to log out.');
    });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="text-xl md:text-2xl font-bold text-blue-600" onClick={closeMenu}>
            RoommateFinder
          </Link>

          {/* ---- DESKTOP NAV (hidden on mobile) ---- */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/listings" className="text-gray-700 font-medium hover:text-blue-600 flex items-center transition-colors">
              <SearchIcon />
              Find My Roommate
            </Link>

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

          {/* ---- MOBILE HAMBURGER (hidden on desktop) ---- */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* ---- MOBILE MENU PANEL ---- */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <Link
              to="/listings"
              onClick={closeMenu}
              className="block px-3 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
            >
              Find My Roommate
            </Link>

            {user && (
              <Link
                to="/listing-choice"
                onClick={closeMenu}
                className="block px-3 py-3 bg-green-500 text-white font-semibold rounded-lg text-center hover:bg-green-600"
              >
                + Add Listing
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to={`/profile/${user.uid}`}
                  onClick={closeMenu}
                  className="block px-3 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
                >
                  My Profile
                </Link>
                <Link
                  to="/preferences"
                  onClick={closeMenu}
                  className="block px-3 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
                >
                  Preferences
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="block px-3 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg"
                >
                  Join Community
                </Link>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block px-3 py-3 bg-blue-600 text-white font-semibold rounded-lg text-center hover:bg-blue-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;