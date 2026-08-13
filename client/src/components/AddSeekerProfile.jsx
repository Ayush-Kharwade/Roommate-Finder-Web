import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, doc, getDocs, limit, query, setDoc, serverTimestamp, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { primaryName, secondaryName, formatAddress } from '../utils/formatAddress';
import { preferenceOptions } from '../constants/preferences';
import { seekerHighlightOptions } from '../constants/listings';

function AddSeekerProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        location: '',
        gender: 'Any',
        budget: '',
        occupancy: 'Single',
        highlights: [],
        preferences: [],
        bio: '',
        lat: null,
        lng: null,
    });
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isExisting, setIsExisting] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const createdAtRef = useRef(null);
    const docIdRef = useRef(null);

    // This form is both "create" and "edit" — a user has exactly one profile.
    // Load it first, or a returning user is shown a blank form and silently
    // wipes what they wrote last time.
    //
    // Lookup is by the userId field rather than by document ID: newer profiles
    // use the uid as their ID, but earlier ones were created with addDoc and
    // have a random one. Reading by ID alone would show those members an empty
    // form and then write a second, duplicate profile.
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setIsLoadingProfile(false);
            return;
        }
        (async () => {
            try {
                const existing = await getDocs(
                    query(collection(db, 'seekers'), where('userId', '==', user.uid), limit(1))
                );
                if (!existing.empty) {
                    const snap = existing.docs[0];
                    const data = snap.data();
                    docIdRef.current = snap.id;
                    setFormData({
                        location: data.location || data.city || '',
                        gender: data.gender || 'Any',
                        budget: data.budget ?? '',
                        occupancy: data.occupancy || 'Single',
                        highlights: data.highlights || [],
                        preferences: data.preferences || [],
                        bio: data.bio || '',
                        lat: data.lat ?? null,
                        lng: data.lng ?? null,
                    });
                    setSelectedAddress(data.location || data.city || '');
                    createdAtRef.current = data.createdAt ?? null;
                    setIsExisting(true);
                }
            } catch (err) {
                console.error('Failed to load your seeker profile:', err);
                toast.error('Could not load your existing profile.');
            } finally {
                setIsLoadingProfile(false);
            }
        })();
    }, []);

    // Effect for debounced autocomplete API call for the location
    // Effect for debounced autocomplete API call for the location
    useEffect(() => {

        // Don't search again after the user selected a suggestion
        if (formData.location === selectedAddress) {
            setSuggestions([]);
            return;
        }

        // Don't search until at least 3 characters are entered
        if (formData.location.length < 3) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
                formData.location
            )}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=5`;

            try {
                const res = await axios.get(url);
                const results = res.data.results || [];

                // Remove duplicate suggestions
                const seen = new Set();

                const unique = results.filter(r => {
                    const label = formatAddress(r);

                    if (seen.has(label)) return false;

                    seen.add(label);
                    return true;
                });

                setSuggestions(unique);

            } catch (error) {
                console.error("Autocomplete error:", error);
                setSuggestions([]);
            }

        }, 500);

        return () => clearTimeout(handler);

    }, [formData.location, selectedAddress]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Typing a new location invalidates any previously picked coordinates
        if (name === 'location') {
            setFormData(prev => ({ ...prev, location: value, lat: null, lng: null }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSuggestionClick = (suggestion) => {
        const label = formatAddress(suggestion);
        setSelectedAddress(label);          // marks this text as "already resolved"
        setFormData(prev => ({
            ...prev,
            location: label,
            lat: suggestion.geometry.lat,
            lng: suggestion.geometry.lng,
        }));
        setSuggestions([]);
    };

    const handleTagToggle = (type, value) => {
        setFormData(prev => {
            const currentTags = prev[type];
            return currentTags.includes(value)
                ? { ...prev, [type]: currentTags.filter(tag => tag !== value) }
                : { ...prev, [type]: [...currentTags, value] };
        });
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
        if (!formData.lat || !formData.lng) {
            toast.error('Please pick an address from the suggestions.');
            return;
        }
        
        setIsLoading(true);

        try {
            // New profiles use the uid as the document ID, giving a clean 1-to-1
            // relationship. An existing profile is written back to whatever ID
            // it already has, so editing an older addDoc-created profile updates
            // it instead of leaving a duplicate behind.
            const seekerDocRef = doc(db, 'seekers', docIdRef.current || user.uid);

            // NOTE: this document is publicly readable (the Roommates tab lists
            // every seeker), so it must never carry contact details — no email,
            // no phone number. Contact happens through chat.
            const seekerProfileData = {
                ...formData,
                budget: Number(formData.budget) || 0,
                userId: user.uid,
                name: user.displayName || 'User',
                profilePicUrl: user.photoURL || null,
                city: formData.location.split(',')[0].trim(), // Extract city from full address
                updatedAt: serverTimestamp(),
            };

            // This setDoc deliberately overwrites rather than merges: a full
            // rewrite is what strips stale fields (older profiles carried an
            // `email` that should never have been in a public collection).
            // That means createdAt has to be carried forward by hand.
            seekerProfileData.createdAt = createdAtRef.current ?? serverTimestamp();

            // Use setDoc to create or overwrite the user's single seeker profile
            await setDoc(seekerDocRef, seekerProfileData);

            toast.success(isExisting ? "Profile updated!" : "Seeker profile created successfully!");
            navigate(`/seeker/${user.uid}`);
        } catch (error) {
            console.error("Error creating seeker profile:", error);
            toast.error("Failed to create profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex justify-center items-center py-24">
                <ClipLoader color="#1B4D3E" size={40} />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex-grow py-12 px-4">
            <div className="container mx-auto max-w-3xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    {isExisting ? 'Edit your requirement' : 'Add your requirement'}
                </h1>
                <p className="text-center text-gray-500 mt-2 mb-8">so that other users can contact you.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Location */}
                    <div className="relative">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Add Your Location*</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="Start typing your preferred location..." required autoComplete="off"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();      // don't submit the form from this field
                                        setSuggestions([]);
                                    }
                                }}
                                onBlur={() => setTimeout(() => setSuggestions([]), 200)} />
                        {suggestions.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                {suggestions.map((s, i) => (
                                    <li key={i} onClick={() => handleSuggestionClick(s)}
                                        className="px-4 py-2 cursor-pointer hover:bg-brand-cream border-b last:border-b-0">
                                        <p className="text-brand-ink font-medium truncate">{primaryName(s) || s.formatted}</p>
                                        {secondaryName(s) && <p className="text-xs text-gray-500 truncate">{secondaryName(s)}</p>}
                                    </li>
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
                                    <button type="button" key={gender} onClick={() => setFormData({...formData, gender})} className={`px-4 py-2 rounded-md flex-1 transition-colors ${formData.gender === gender ? 'bg-brand-green text-white' : 'bg-gray-200'}`}>{gender}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy</label>
                            <div className="flex gap-2">
                                {['Single', 'Shared', 'Any'].map(type => (
                                    <button type="button" key={type} onClick={() => setFormData({...formData, occupancy: type})} className={`px-4 py-2 rounded-md flex-1 transition-colors ${formData.occupancy === type ? 'bg-brand-green text-white' : 'bg-gray-200'}`}>{type}</button>
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
                            {seekerHighlightOptions.map(highlight => (
                                <button type="button" key={highlight} onClick={() => handleTagToggle('highlights', highlight)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.highlights.includes(highlight) ? 'bg-brand-green/40 text-brand-ink' : 'bg-gray-100 text-gray-600'}`}>{highlight}</button>
                            ))}
                        </div>
                    </div>

                    {/* Lifestyle preferences — powers the compatibility % match shown to room owners */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your lifestyle (helps us show a compatibility match)</label>
                        <div className="flex flex-wrap gap-2">
                            {preferenceOptions.map(option => (
                                <button
                                    type="button"
                                    key={option.name}
                                    onClick={() => handleTagToggle('preferences', option.name)}
                                    className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.preferences.includes(option.name) ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    <span className="mr-1.5">{option.emoji}</span>
                                    {option.name}
                                </button>
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
                        <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 py-3 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-dark disabled:bg-brand-green/40 transition-colors">
                            {isLoading ? <ClipLoader size={20} color={"#fff"} /> : isExisting ? 'Save Changes' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSeekerProfile;