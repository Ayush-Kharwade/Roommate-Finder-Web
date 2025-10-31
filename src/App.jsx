import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { db, auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

function App() {
  const [properties, setProperties] = useState([]);
  const [seekers, setSeekers] = useState([]); // <-- 2. ADDED STATE
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Combined useEffect to handle auth and data fetching in the correct order
  useEffect(() => {
    const initializeApp = async (currentUser) => {
      try {
        // 1. Fetch user profile if a user is logged in
        let fetchedUserProfile = null;
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            fetchedUserProfile = userDoc.data();
            setUserProfile(fetchedUserProfile);
          }
        } else {
          setUserProfile(null);
        }

        // 2. Fetch all properties
        const propertiesCollection = collection(db, 'properties');
        const propertiesSnapshot = await getDocs(propertiesCollection);
        const propertiesList = propertiesSnapshot.docs.map(doc => ({  ...doc.data(), id: doc.id }));

        // 3. Fetch all users to create a map
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersMap = {};
        usersSnapshot.forEach(doc => {
          usersMap[doc.id] = doc.data();
        });

        // 4. Combine properties with their owner's data
        const combinedProperties = propertiesList.map(property => ({
          ...property,
          owner: usersMap[property.ownerId] || null,
        }));

        // 5. Fetch all seekers <-- 3. ADDED THIS BLOCK
        const seekersCollection = collection(db, 'seekers');
        const seekersSnapshot = await getDocs(seekersCollection);
        const seekersList = seekersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        setProperties(combinedProperties);
        setSeekers(seekersList); // <-- 3. SET SEEKERS STATE

      } catch (error) {
        console.error("Error initializing app:", error);
        // Handle error appropriately, maybe set an error state
      } finally {
        setLoading(false); // Stop loading after all data is fetched or error
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      initializeApp(currentUser); // Run the main data fetch function after auth state is known
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []); // This effect runs once on initial load

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color={"#3b82f6"} size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={user} />
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home properties={properties} user={user} />} />
        {/* 5. PASS 'seekers' PROP TO ALLLISTINGS */}
        <Route path="/listings" element={<AllListings properties={properties} seekers={seekers} user={user} userProfile={userProfile} />} />
        <Route path="/property/:id" element={<PropertyDetails properties={properties} user={user} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-listing" element={<AddListing />} />
        <Route path="/edit-listing/:id" element={<EditListing />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/add-seeker-profile" element={<AddSeekerProfile />} /> 
        <Route path="/seeker/:id" element={<SeekerDetails  user={user} />} />
        <Route path="/listing-choice" element={<ListingChoice />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;