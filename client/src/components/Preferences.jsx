import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { preferenceOptions } from '../constants/preferences';
import SEO from './SEO.jsx';

function Preferences() {
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchPreferences = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().preferences) {
            setSelectedPreferences(userDoc.data().preferences);
          }
        } catch (err) {
          // An unhandled rejection here used to leave the page stuck on "Loading..."
          console.error('Failed to load preferences:', err);
          toast.error('Could not load your preferences.');
        }
      }
      setLoading(false);
    };
    fetchPreferences();
  }, [currentUser]);

  const handleSelect = (preferenceName) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceName)
        ? prev.filter(p => p !== preferenceName)
        : [...prev, preferenceName]
    );
  };

  const handleUpdate = async () => {
    if (!currentUser) return toast.error("You must be logged in.");
    const userDocRef = doc(db, 'users', currentUser.uid);
    setSaving(true);
    try {
      // merge, not updateDoc — the users document may not exist yet.
      await setDoc(userDocRef, { preferences: selectedPreferences }, { merge: true });
      toast.success("Preferences updated successfully!");
    } catch (error) {
      toast.error("Failed to update preferences.");
      console.error("Error updating preferences: ", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <SEO title="Your Preferences" />
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
                  ? 'bg-brand-green text-white shadow-lg transform scale-105' 
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
          disabled={saving}
          className="bg-brand-green text-white font-bold py-3 px-8 rounded-full hover:bg-brand-green-dark transition-transform transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? 'Saving…' : 'Update Preferences'}
        </button>
      </div>
    </div>
  );
}

export default Preferences;