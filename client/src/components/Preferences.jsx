import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

// We can keep the same options
const preferenceOptions = [
  { name: 'Night Owl', emoji: '🦉' },
  { name: 'Early Bird', emoji: '🐦' },
  { name: 'Studious', emoji: '📚' },
  { name: 'Fitness Freak', emoji: '🏋️' },
  { name: 'Sporty', emoji: '⚽' },
  { name: 'Wanderer', emoji: '🚗' },
  { name: 'Party Lover', emoji: '🎉' },
  { name: 'Pet Lover', emoji: '🐾' },
  { name: 'Vegan', emoji: '🌱' },
  { name: 'Non-Alcoholic', emoji: '💧' },
  { name: 'Music Lover', emoji: '🎵' },
  { name: 'Non Smoker', emoji: '🚭' },
];

function Preferences() {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  // Fetching logic remains the same
  useEffect(() => {
    const fetchPreferences = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().preferences) {
          setSelectedPreferences(userDoc.data().preferences);
        }
      }
      setLoading(false);
    };
    fetchPreferences();
  }, [currentUser]);

  // Toggle logic remains the same
  const handleSelect = (preferenceName) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceName)
        ? prev.filter(p => p !== preferenceName)
        : [...prev, preferenceName]
    );
  };

  // Update logic remains the same
  const handleUpdate = async () => {
    if (!currentUser) return toast.error("You must be logged in.");
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { preferences: selectedPreferences });
      toast.success("Preferences updated successfully!");
    } catch (error) {
      toast.error("Failed to update preferences.");
      console.error("Error updating preferences: ", error);
      
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-800">Your Preferences</h1>
      <p className="text-center text-gray-500 mt-2 mb-8">Select the tags that best describe your lifestyle.</p>
      
      {/* New Tag-Based UI */}
      <div className="flex flex-wrap justify-center gap-3 bg-white p-6 rounded-lg shadow-md">
        {preferenceOptions.map((option) => {
          const isSelected = selectedPreferences.includes(option.name);
          return (
            <button
              key={option.name}
              onClick={() => handleSelect(option.name)}
              className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200 text-sm font-semibold
                ${isSelected 
                  ? 'bg-indigo-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <span className="mr-2 text-lg">{option.emoji}</span>
              {option.name}
            </button>
          );
        })}
      </div>
      
      <div className="text-center mt-10">
        <button
          onClick={handleUpdate}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
          Update Preferences
        </button>
      </div>
    </div>
  );
}

export default Preferences;