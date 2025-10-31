import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

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
        rent: '',
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

    useEffect(() => {
        if (formData.address.length < 3) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            setIsFetchingSuggestions(true);
            const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formData.address)}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=5`;

            try {
                const response = await axios.get(url);
                if (response.data.results) {
                    setSuggestions(response.data.results);
                }
            } catch (error) {
                console.error("Autocomplete error:", error);
            } finally {
                setIsFetchingSuggestions(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [formData.address]); // Re-run when the address input changes

    const handleSuggestionClick = (suggestion) => {
        setFormData({
            ...formData,
            address: suggestion.formatted,
            lat: suggestion.geometry.lat,
            lng: suggestion.geometry.lng,
        });
        setSuggestions([]); // Hide suggestions after selection
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        if (!formData.address || !formData.rent || !formData.title) {
            return toast.error("Please fill in all required fields.");
        }
        
        setIsLoading(true);
        toast.info("Image uploads are currently paused pending billing setup. Proceeding without images.");

        // Geocode the address to get coordinates
        const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formData.address)}&key=${OPENCAGE_API_KEY}`;

        try {
            // const response = await axios.get(url);
            // let coordinates = { lat: null, lng: null };
            let submissionData = { ...formData };

            // if (response.data.results.length > 0) {
            //     coordinates = response.data.results[0].geometry;
            // } else {
            //     throw new Error("Could not find coordinates for this address.");
            // }

            if (!submissionData.lat || !submissionData.lng) {
                toast.info("Geocoding your address...");
                const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
                const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(submissionData.address)}&key=${OPENCAGE_API_KEY}&limit=1`;
                const response = await axios.get(url);
                if (response.data.results.length > 0) {
                    submissionData.lat = response.data.results[0].geometry.lat;
                    submissionData.lng = response.data.results[0].geometry.lng;
                } else {
                    throw new Error("Could not find coordinates for this address.");
                }
            }
            
            // In a real implementation, you would upload images to Firebase Storage here
            // and get back the download URLs.

            const newListing = {
                ...submissionData,
                ownerId: auth.currentUser.uid,
                imageUrls: [],
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
                                            {suggestion.formatted}
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
                                    <button type="button" key={gender} onClick={() => setFormData({...formData, lookingForGender: gender})} className={`px-4 py-2 rounded-md flex-1 transition-colors ${formData.lookingForGender === gender ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{gender}</button>
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
                        <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">Approx Rent* (per month)</label>
                        <input type="number" name="rent" id="rent" value={formData.rent} onChange={handleChange} className="w-full px-4 py-2 border rounded-md" placeholder="e.g., 15000" required />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photos of your room</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"><span>Upload up to 3 files</span><input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleImageChange} accept="image/png, image/jpeg" /></label>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG up to 2MB each</p>
                            </div>
                        </div>
                        {imageFiles.length > 0 && <p className="text-sm text-gray-500 mt-2">{imageFiles.length} file(s) selected.</p>}
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Choose highlights for your room</label>
                        <div className="flex flex-wrap gap-2">
                            {highlightOptions.map(highlight => (
                                <button type="button" key={highlight} onClick={() => handleTagToggle('highlights', highlight)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.highlights.includes(highlight) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>{highlight}</button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {amenityOptions.map(amenity => (
                                <button type="button" key={amenity.name} onClick={() => handleTagToggle('amenities', amenity.name)} className={`p-4 flex flex-col items-center gap-2 rounded-lg border-2 transition-colors ${formData.amenities.includes(amenity.name) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
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
                        <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                            {isLoading ? <ClipLoader size={20} color={"#fff"} /> : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddListing;