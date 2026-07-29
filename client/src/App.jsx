import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { db, auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import {  doc, getDoc } from 'firebase/firestore';
import Home from './components/Home.jsx';
import AllListings from './components/AllListings.jsx';
import PropertyDetails from './components/PropertyDetails.jsx';
import Signup from './components/Signup.jsx';
import Login from './components/Login.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AddListing from './components/AddListing.jsx';
import EditListing from './components/EditListing.jsx';
import { Toaster } from 'react-hot-toast';
import ClipLoader from "react-spinners/ClipLoader";
import Profile from './components/Profile.jsx';
import Preferences from './components/Preferences.jsx';
import Notifications from './components/Notifications.jsx';
import NotFound from './components/NotFound';
import AddSeekerProfile from './components/AddSeekerProfile.jsx';
import SeekerDetails from './components/SeekerDetails.jsx';
import ListingChoice from './components/ListingChoice.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MyListings from './components/MyListings.jsx';
import ChatRoom from './components/ChatRoom.jsx';
import ChatList from './components/ChatList.jsx';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          setUserProfile(userDoc.exists() ? userDoc.data() : null);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color={"#3b82f6"} size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={user} userProfile={userProfile} />
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<AllListings  user={user} userProfile={userProfile} />} />
        <Route path="/property/:id" element={<PropertyDetails  user={user} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seeker/:id" element={<SeekerDetails  user={user} />} />
        
        <Route path="/add-listing" element={<ProtectedRoute user={user}><AddListing /></ProtectedRoute>} />
        <Route path="/edit-listing/:id" element={<ProtectedRoute user={user}><EditListing /></ProtectedRoute>} />
        <Route path="/add-seeker-profile" element={<ProtectedRoute user={user}><AddSeekerProfile /></ProtectedRoute>} />
        <Route path="/listing-choice" element={<ProtectedRoute user={user}><ListingChoice /></ProtectedRoute>} />
        <Route path="/preferences" element={<ProtectedRoute user={user}><Preferences /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute user={user}><Notifications /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
        <Route path="/my-listings" element={<ProtectedRoute user={user}><MyListings /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute user={user}><ChatRoom /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute user={user}><ChatList /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;