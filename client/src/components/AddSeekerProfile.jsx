import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

// Define the options for the form's tag inputs
const highlightOptions = [
    'Working full time', 'College student', '25+ age', '<25 age',
    'Working night shifts', 'Have 2 wheeler', 'Have 4 wheeler', 'Will shift immediately',
    'Have pets', 'Need no furnishing', 'Pure vegetarian'
];

function AddSeekerProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        location: '',
        gender: 'Any',
        budget: '',
        occupancy: 'Single',
        highlights: [],
        interestedInPG: false,
        mobileVisible: false,
        bio: '',
        lat: null,
        lng: null,
    });
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Effect for debounced autocomplete API call for the location
    useEffect(() => {
        if (formData.location.length < 3) {
            setSuggestions([]);
            return;
        }
        const handler = setTimeout(async () => {
            const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formData.location)}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=5`;
            try {
                const response = await axios.get(url);
                if (response.data.results) setSuggestions(response.data.results);
            } catch (error) {
                console.error("Autocomplete error:", error);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [formData.location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData({
            ...formData,
            location: suggestion.formatted,
            lat: suggestion.geometry.lat,
            lng: suggestion.geometry.lng,
        });
        setSuggestions([]);
    };

    const handleTagToggle = (value) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.includes(value)
                ? prev.highlights.filter(h => h !== value)
                : [...prev.highlights, value]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            return toast.error("You must be logged in to create a profile.");
        }
        if (!formData.location || !formData.budget) {
            return toast.error("Please fill in all required fields.");
        }
        
        setIsLoading(true);

        try {
            // A user's seeker profile should have the same ID as their auth ID for a 1-to-1 relationship.
            const seekerDocRef = doc(db, 'seekers', user.uid);

            const seekerProfileData = {
                ...formData,
                userId: user.uid,
                name: user.displayName, // Pull from auth
                email: user.email,     // Pull from auth
                profilePicUrl: user.photoURL || null,
                city: formData.location.split(',')[0], // Extract city from full address
                createdAt: serverTimestamp(),
            };

            // Use setDoc to create or overwrite the user's single seeker profile
            await setDoc(seekerDocRef, seekerProfileData);

            toast.success("Seeker profile created successfully!");
            navigate('/listings');
        } catch (error) {
            console.error("Error creating seeker profile:", error);
            toast.error("Failed to create profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 flex-grow py-12 px-4">
            <div className="container mx-auto max-w-3xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800">Add your requirement</h1>
                <p className="text-center text-gray-500 mt-2 mb-8">so that other users can contact you.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Location */}
                    <div className="relative">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Add Your Location*</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="Start typing your preferred location..." required autoComplete="off" />
                        {suggestions.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                {suggestions.map((s, i) => (
                                    <li key={i} onClick={() => handleSuggestionClick(s)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">{s.formatted}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    {/* Gender & Occupancy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Gender</label>
                            <div className="flex gap-2">
                                {['Female', 'Male', 'Any'].map(gender => (
                                    <button type="button" key={gender} onClick={() => setFormData({...formData, gender})} className={`px-4 py-2 rounded-md flex-1 transition-colors ${formData.gender === gender ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{gender}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy</label>
                            <div className="flex gap-2">
                                {['Single', 'Shared', 'Any'].map(type => (
                                    <button type="button" key={type} onClick={() => setFormData({...formData, occupancy: type})} className={`px-4 py-2 rounded-md flex-1 transition-colors ${formData.occupancy === type ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{type}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Approx Rent */}
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Approx Rent* (per month)</label>
                        <input type="number" name="budget" id="budget" value={formData.budget} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="e.g., 5000" required />
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Choose highlights for your profile</label>
                        <div className="flex flex-wrap gap-2">
                            {highlightOptions.map(highlight => (
                                <button type="button" key={highlight} onClick={() => handleTagToggle(highlight)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.highlights.includes(highlight) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>{highlight}</button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                        <textarea name="bio" id="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="Briefly describe yourself and what you're looking for in a roommate." required></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                            {isLoading ? <ClipLoader size={20} color={"#fff"} /> : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSeekerProfile;