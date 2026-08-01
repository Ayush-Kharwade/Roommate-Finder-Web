import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { uploadMultipleToCloudinary } from '../utils/cloudinary';
import { primaryName, secondaryName, formatAddress } from '../utils/formatAddress';

// Define the options for the form
const highlightOptions = [
    'Attached washroom', 'Market nearby', 'Attached balcony', 'Close to metro station',
    'Public transport nearby', 'Gated society', 'No Restriction', 'Newly built',
    'Separate washrooms', 'House keeping', 'Park nearby', 'Gym nearby'
];

const amenityOptions = [
    { name: 'TV', emoji: '📺' }, { name: 'Fridge', emoji: '🧊' },
    { name: 'Kitchen', emoji: '🍳' }, { name: 'Wifi', emoji: '📶' },
    { name: 'Machine', emoji: '🧼' }, { name: 'AC', emoji: '❄️' },
    { name: 'Powerbackup', emoji: '🔋' }, { name: 'Cook', emoji: '👨‍🍳' },
    { name: 'Parking', emoji: '🅿️' }
];

function AddListing() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        address: '',
        lookingForGender: 'Any',
        rent: 1,
        occupancy: 'Any',
        highlights: [],
        amenities: [],
        description: '',
        lat: null,
        lng: null,
    });

    // 1. ADD NEW STATE for autocomplete suggestions
    const [suggestions, setSuggestions] = useState([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

    const [imageFiles, setImageFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const currentUser = auth.currentUser;
    const [selectedAddress, setSelectedAddress] = useState('');

    useEffect(() => {
        if (formData.address === selectedAddress) {
            setSuggestions([]);
            return;
        }
        if (formData.address.length < 3) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsFetchingSuggestions(true);
            const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formData.address)}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=5`;

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
            } catch (error) {
                console.error("Autocomplete error:", error);
            } finally {
                setIsFetchingSuggestions(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [formData.address, selectedAddress]); // Re-run when the address input changes

    const handleSuggestionClick = (suggestion) => {
        const label = formatAddress(suggestion);
        setSelectedAddress(label);          // marks this text as "already resolved"
        setFormData(prev => ({
            ...prev,
            address: label,
            lat: suggestion.geometry.lat,
            lng: suggestion.geometry.lng,
        }));
        setSuggestions([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Typing a new address invalidates any previously picked coordinates
        if (name === 'address') {
            setFormData(prev => ({ ...prev, address: value, lat: null, lng: null }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (type, value) => {
        setFormData(prev => {
            const currentTags = prev[type];
            if (currentTags.includes(value)) {
                return { ...prev, [type]: currentTags.filter(tag => tag !== value) };
            } else {
                return { ...prev, [type]: [...currentTags, value] };
            }
        });
    };
    
    const handleImageChange = (e) => {
        if (e.target.files.length > 3) {
            toast.error("You can upload a maximum of 3 photos.");
            return;
        }
        setImageFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ---- Validate BEFORE setting the loading flag ----
        if (!formData.address || !formData.rent || !formData.title) {
            return toast.error("Please fill in all required fields.");
        }

        setIsLoading(true);
        try {
            let submissionData = { ...formData };

            // Geocode only if a suggestion wasn't picked (which would have set lat/lng)
            if (!submissionData.lat || !submissionData.lng) {
                toast("Geocoding your address...");
                const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
                const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(submissionData.address)}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=1`;
                const response = await axios.get(url);

                if (response.data.results?.length > 0) {
                    const best = response.data.results[0];
                    if (best.confidence < 7) {
                        toast.error('That address is too vague. Please pick one from the suggestions.');
                        setIsLoading(false);
                        return;
                    }
                    submissionData.lat = best.geometry.lat;
                    submissionData.lng = best.geometry.lng;
                } else {
                    toast.error('Could not locate that address. Please pick one from the suggestions.');
                    setIsLoading(false);
                    return;
                }
            }

            // Upload images to Cloudinary (if any were selected)
            let imageUrls = [];
            if (imageFiles.length > 0) {
                toast.loading('Uploading photos...', { id: 'upload' });
                try {
                    imageUrls = await uploadMultipleToCloudinary(imageFiles);
                    toast.success('Photos uploaded!', { id: 'upload' });
                } catch (uploadErr) {
                    toast.error('Photo upload failed. Listing not created.', { id: 'upload' });
                    throw uploadErr;
                }
            }

            const newListing = {
                ...submissionData,
                ownerId: currentUser.uid,
                ownerName: currentUser.displayName || 'Anonymous',
                ownerPhotoUrl: currentUser.photoURL || null,
                imageUrls,
                imageUrl: imageUrls[0] || null,
                rent: Number(submissionData.rent) || 0,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'properties'), newListing);
            toast.success("Listing created successfully!");
            navigate('/listings');

        } catch (error) {
            console.error("Error creating listing:", error);
            toast.error(error.message || "Failed to create listing.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-gray-50 flex-grow py-12 px-4">
            <div className="container mx-auto max-w-3xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800">Add your room details</h1>
                <p className="text-center text-gray-500 mt-2 mb-8">Provide details so that other users can contact you.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="e.g., Cozy Room in Hinjewadi" required />
                    </div>

                    {/* Address */}
                    {/* <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Add Your Location*</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="Enter a full, specific address" required />
                    </div> */}

                    {/* 5. UPDATE the Address input to include the dropdown */}
                    <div className="relative">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Add Your Location*</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                            placeholder="Start typing your address..."
                            required
                            autoComplete="off"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();      // don't submit the form from this field
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
                                    <button type="button" key={gender} onClick={() => setFormData({...formData, lookingForGender: gender})} className={`px-4 py-2 rounded-md flex-1 transition-colors ${formData.lookingForGender === gender ? 'bg-brand-green text-white' : 'bg-gray-200'}`}>{gender}</button>
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
                        <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">Approx Rent* (per month)</label>
                        <input type="number" name="rent" id="rent" value={formData.rent} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="e.g., 15000" required />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Photos of your room
                        </label>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            {imageFiles.length === 0 ? (
                                <>
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>

                                        <div className="flex justify-center text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer bg-white font-medium text-brand-green hover:text-brand-green"
                                            >
                                                <span>Upload up to 3 files</span>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    multiple
                                                    onChange={handleImageChange}
                                                    accept="image/png, image/jpeg, image/webp"
                                                />
                                            </label>
                                        </div>

                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, WEBP up to 2MB each
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-3 justify-center flex-wrap mb-4">
                                        {imageFiles.map((file, i) => (
                                            <div key={i} className="relative">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${i + 1}`}
                                                    className="w-24 h-24 object-cover rounded-lg border"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setImageFiles(
                                                            imageFiles.filter((_, idx) => idx !== i)
                                                        )
                                                    }
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer text-brand-green hover:text-brand-green font-medium text-sm"
                                        >
                                            Change photos
                                            <input
                                                id="file-upload"
                                                type="file"
                                                className="sr-only"
                                                multiple
                                                onChange={handleImageChange}
                                                accept="image/png, image/jpeg, image/webp"
                                            />
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Choose highlights for your room</label>
                        <div className="flex flex-wrap gap-2">
                            {highlightOptions.map(highlight => (
                                <button type="button" key={highlight} onClick={() => handleTagToggle('highlights', highlight)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.highlights.includes(highlight) ? 'bg-brand-green/40 text-brand-ink' : 'bg-gray-100 text-gray-600'}`}>{highlight}</button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {amenityOptions.map(amenity => (
                                <button type="button" key={amenity.name} onClick={() => handleTagToggle('amenities', amenity.name)} className={`p-4 flex flex-col items-center gap-2 rounded-lg border-2 transition-colors ${formData.amenities.includes(amenity.name) ? 'border-brand-green bg-brand-sand' : 'border-gray-200'}`}>
                                    <span className="text-3xl">{amenity.emoji}</span>
                                    <span className="text-xs font-medium">{amenity.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                        <textarea name="description" id="description" rows="4" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="I am looking for a roommate for my room." required></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 py-3 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-dark disabled:bg-brand-green/40 transition-colors">
                            {isLoading ? <ClipLoader size={20} color={"#fff"} /> : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddListing;