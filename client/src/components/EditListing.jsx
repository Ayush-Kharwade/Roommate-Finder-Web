// src/components/EditListing.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import toast from 'react-hot-toast';
import ClipLoader from 'react-spinners/ClipLoader';
import { primaryName, secondaryName, formatAddress } from '../utils/formatAddress';
import { preferenceOptions } from '../constants/preferences';
import { highlightOptions, amenityOptions } from '../constants/listings';

function EditListing() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');

    // Fetch the existing listing once on mount
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'properties', id));
                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Firestore rules reject the write anyway, but bouncing here
                    // means a non-owner never sees someone else's listing loaded
                    // into an editable form.
                    if (data.ownerId !== auth.currentUser?.uid) {
                        toast.error("You can only edit your own listings.");
                        navigate('/my-listings');
                        return;
                    }

                    setProperty({
                        title: data.title || '',
                        address: data.address || '',
                        lookingForGender: data.lookingForGender || 'Any',
                        rent: data.rent ?? 0,
                        occupancy: data.occupancy || 'Any',
                        highlights: data.highlights || [],
                        amenities: data.amenities || [],
                        listingPreferences: data.listingPreferences || [],
                        description: data.description || '',
                        imageUrl: data.imageUrl || '',
                        lat: data.lat ?? null,
                        lng: data.lng ?? null,
                    });
                    setSelectedAddress(data.address || '');
                } else {
                    toast.error('Listing not found.');
                    navigate('/my-listings');
                }
            } catch (err) {
                console.error('Failed to load listing:', err);
                toast.error('Could not load this listing.');
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id, navigate]);

    // Address autocomplete — mirrors AddListing's debounced OpenCage lookup
    const address = property?.address;
    useEffect(() => {
        if (address == null) return;
        if (address === selectedAddress) {
            setSuggestions([]);
            return;
        }
        if (address.length < 3) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsFetchingSuggestions(true);
            const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=5`;
            try {
                const res = await axios.get(url);
                const results = res.data.results || [];
                const seen = new Set();
                const unique = results.filter(r => {
                    const label = formatAddress(r);
                    if (seen.has(label)) return false;
                    seen.add(label);
                    return true;
                });
                setSuggestions(unique);
            } catch (err) {
                console.error('Autocomplete error:', err);
            } finally {
                setIsFetchingSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [address, selectedAddress]);

    const handleSuggestionClick = (suggestion) => {
        const label = formatAddress(suggestion);
        setSelectedAddress(label);
        setProperty(prev => ({
            ...prev,
            address: label,
            lat: suggestion.geometry.lat,
            lng: suggestion.geometry.lng,
        }));
        setSuggestions([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'address') {
            // Typing a new address invalidates any previously picked coordinates
            setProperty(prev => ({ ...prev, address: value, lat: null, lng: null }));
            return;
        }
        setProperty(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (type, value) => {
        setProperty(prev => {
            const currentTags = prev[type];
            return currentTags.includes(value)
                ? { ...prev, [type]: currentTags.filter(tag => tag !== value) }
                : { ...prev, [type]: [...currentTags, value] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!property.address || !property.rent || !property.title) {
            return toast.error('Please fill in all required fields.');
        }

        setIsSaving(true);
        try {
            let updateData = { ...property };

            // Re-geocode only if the address was hand-typed without picking a suggestion
            if (!updateData.lat || !updateData.lng) {
                toast('Geocoding your address...');
                const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
                const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(updateData.address)}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=1`;
                const response = await axios.get(url);

                if (response.data.results?.length > 0) {
                    const best = response.data.results[0];
                    if (best.confidence < 7) {
                        toast.error('That address is too vague. Please pick one from the suggestions.');
                        setIsSaving(false);
                        return;
                    }
                    updateData.lat = best.geometry.lat;
                    updateData.lng = best.geometry.lng;
                } else {
                    toast.error('Could not locate that address. Please pick one from the suggestions.');
                    setIsSaving(false);
                    return;
                }
            }

            await updateDoc(doc(db, 'properties', id), {
                ...updateData,
                rent: Number(updateData.rent) || 0,
            });
            toast.success('Listing updated successfully!');
            navigate(`/property/${id}`);
        } catch (error) {
            console.error('Error updating listing:', error);
            toast.error('Failed to update listing.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <ClipLoader color="#3b82f6" size={40} />
            </div>
        );
    }

    if (!property) return null;

    return (
        <div className="bg-gray-50 flex-grow py-12 px-4">
            <div className="container mx-auto max-w-3xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800">Edit your room details</h1>
                <p className="text-center text-gray-500 mt-2 mb-8">Update the details below.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                        <input type="text" name="title" id="title" value={property.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
                    </div>

                    {/* Address */}
                    <div className="relative">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            value={property.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                            required
                            autoComplete="off"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    setSuggestions([]);
                                }
                            }}
                            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                {isFetchingSuggestions ? (
                                    <li className="px-4 py-2 text-gray-500">Searching...</li>
                                ) : (
                                    suggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-brand-ink font-medium truncate">{primaryName(suggestion) || suggestion.formatted}</p>
                                                {secondaryName(suggestion) && (
                                                    <p className="text-xs text-gray-500 truncate">{secondaryName(suggestion)}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Looking For & Occupancy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Looking For</label>
                            <div className="flex gap-2">
                                {['Female', 'Male', 'Any'].map(gender => (
                                    <button type="button" key={gender} onClick={() => setProperty({ ...property, lookingForGender: gender })} className={`px-4 py-2 rounded-md flex-1 transition-colors ${property.lookingForGender === gender ? 'bg-brand-green text-white' : 'bg-gray-200'}`}>{gender}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy</label>
                            <div className="flex gap-2">
                                {['Single', 'Shared', 'Any'].map(type => (
                                    <button type="button" key={type} onClick={() => setProperty({ ...property, occupancy: type })} className={`px-4 py-2 rounded-md flex-1 transition-colors ${property.occupancy === type ? 'bg-brand-green text-white' : 'bg-gray-200'}`}>{type}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Rent */}
                    <div>
                        <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">Approx Rent* (per month)</label>
                        <input type="number" name="rent" id="rent" value={property.rent} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required />
                    </div>

                    {/* Image URL — quick edit; use "Add Listing" flow for a fresh multi-photo upload */}
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                        <input type="url" name="imageUrl" id="imageUrl" value={property.imageUrl} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="https://..." />
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Highlights</label>
                        <div className="flex flex-wrap gap-2">
                            {highlightOptions.map(highlight => (
                                <button type="button" key={highlight} onClick={() => handleTagToggle('highlights', highlight)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${property.highlights.includes(highlight) ? 'bg-brand-green/40 text-brand-ink' : 'bg-gray-100 text-gray-600'}`}>{highlight}</button>
                            ))}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {amenityOptions.map(amenity => (
                                <button type="button" key={amenity.name} onClick={() => handleTagToggle('amenities', amenity.name)} className={`p-4 flex flex-col items-center gap-2 rounded-lg border-2 transition-colors ${property.amenities.includes(amenity.name) ? 'border-brand-green bg-brand-sand' : 'border-gray-200'}`}>
                                    <span className="text-3xl">{amenity.emoji}</span>
                                    <span className="text-xs font-medium">{amenity.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lifestyle preferences — powers the compatibility % match shown to seekers */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your lifestyle (helps us show a compatibility match)</label>
                        <div className="flex flex-wrap gap-2">
                            {preferenceOptions.map(option => (
                                <button
                                    type="button"
                                    key={option.name}
                                    onClick={() => handleTagToggle('listingPreferences', option.name)}
                                    className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${property.listingPreferences.includes(option.name) ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    <span className="mr-1.5">{option.emoji}</span>
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                        <textarea name="description" id="description" rows="4" value={property.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" required></textarea>
                    </div>

                    {/* Submit */}
                    <div className="text-center">
                        <button type="submit" disabled={isSaving} className="w-full md:w-auto px-12 py-3 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-dark disabled:bg-brand-green/40 transition-colors">
                            {isSaving ? <ClipLoader size={20} color={"#fff"} /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditListing;
