import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PropertyCard from './PropertyCard.jsx';
import { getDistance } from 'geolib';
import SeekerCard from './SeekerCard.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';

function AllListings({ properties, seekers, user, userProfile }) {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [activeTab, setActiveTab] = useState('rooms');
    const [genderFilter, setGenderFilter] = useState('Any Gender');
    const [suggestions, setSuggestions] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [browserLocation, setBrowserLocation] = useState(null);
    const [searchLocation, setSearchLocation] = useState(null);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [sortedProperties, setSortedProperties] = useState(null);
    
    
    // Maximum distance to show properties (in km)
    const MAX_DISTANCE_KM = 10;

    const displayedProperties = useMemo(() => {
        let filtered = [...properties];

        // Apply gender filter first
        if (genderFilter !== 'Any Gender') {
            filtered = filtered.filter(p => p.lookingForGender === genderFilter);
        }

        // If a proximity search is active, sort by distance and filter
        if (searchLocation) {
            const propertiesWithDistance = filtered.map(property => {
                if (!property.lat || !property.lng) return { ...property, distance: Infinity };
                
                const distanceInMeters = getDistance(
                    searchLocation,
                    { latitude: property.lat, longitude: property.lng }
                );
                return { ...property, distance: distanceInMeters };
            });

            // Filter out properties beyond MAX_DISTANCE_KM
            const nearbyProperties = propertiesWithDistance.filter(p => 
                p.distance !== Infinity && p.distance <= MAX_DISTANCE_KM * 1000
            );

            // Sort by distance
            return nearbyProperties.sort((a, b) => a.distance - b.distance);
        }
        
        // If no proximity search but searchTerm exists (shouldn't happen with new logic)
        if (searchTerm && !searchLocation) {
            return filtered.filter(p =>
                p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Default: return gender-filtered list
        return filtered;

    }, [searchTerm, genderFilter, searchLocation, properties]);

    // Fetch autocomplete suggestions (only for dropdown, not for filtering)
    useEffect(() => {
        // Don't fetch if search term is too short
        if (searchTerm.length < 3) {
            setSuggestions([]);
            return;
        }

        // Only show suggestions if user is actively typing
        if (!showSuggestions) return;

        const handler = setTimeout(async () => {
            setIsFetchingSuggestions(true);
            const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchTerm)}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=5`;

            try {
                const response = await axios.get(url);
                if (response.data.results) {
                    setSuggestions(response.data.results.map(res => ({
                        formatted: res.formatted,
                        geometry: res.geometry,
                    })));
                }
            } catch (error) {
                console.error("Autocomplete error:", error);
            } finally {
                setIsFetchingSuggestions(false);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, showSuggestions]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowSuggestions(true); // Show suggestions as user types
        
        if (value === '') {
            setSearchLocation(null);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const { lat, lng } = suggestion.geometry;
        setSearchTerm(suggestion.formatted);
        setSearchLocation({ latitude: lat, longitude: lng });
        setSuggestions([]);
        setShowSuggestions(false); // Hide suggestions after selection
        
        // Check if any properties exist within range
        const propertiesInRange = properties.filter(p => {
            if (!p.lat || !p.lng) return false;
            const distance = getDistance(
                { latitude: lat, longitude: lng },
                { latitude: p.lat, longitude: p.lng }
            );
            return distance <= MAX_DISTANCE_KM * 1000;
        });

        if (propertiesInRange.length === 0) {
            toast.error(`No properties found within ${MAX_DISTANCE_KM}km of ${suggestion.formatted.split(',')[0]}`);
        } else {
            toast.success(`Found ${propertiesInRange.length} properties near ${suggestion.formatted.split(',')[0]}`);
        }
    };

    const handleSearchSubmit = async () => {
        if (!searchTerm.trim()) {
            toast.error("Please enter a location to search");
            return;
        }

        // Hide suggestions dropdown
        setShowSuggestions(false);

        // If user pressed search button, use the current search term to geocode
        const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchTerm)}&key=${OPENCAGE_API_KEY}&countrycode=in&limit=1`;
    
        try {
            const response = await axios.get(url);
            if (response.data.results.length > 0) {
                const { lat, lng } = response.data.results[0].geometry;
                const locationName = response.data.results[0].formatted;
                setSearchTerm(locationName);
                setSearchLocation({ latitude: lat, longitude: lng });
                
                // Check if any properties exist within range
                const propertiesInRange = properties.filter(p => {
                    if (!p.lat || !p.lng) return false;
                    const distance = getDistance(
                        { latitude: lat, longitude: lng },
                        { latitude: p.lat, longitude: p.lng }
                    );
                    return distance <= MAX_DISTANCE_KM * 1000;
                });

                if (propertiesInRange.length === 0) {
                    toast.error(`No properties found within ${MAX_DISTANCE_KM}km of ${locationName.split(',')[0]}`);
                } else {
                    toast.success(`Found ${propertiesInRange.length} properties near ${locationName.split(',')[0]}`);
                }
            } else {
                toast.error("Could not find that location. Please try another search.");
                setSearchLocation(null);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            toast.error("Failed to search location. Please try again.");
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchLocation(null);
        setSuggestions([]);
        setShowSuggestions(false);
        toast.success("Search cleared");
    };

    const filteredSeekers = seekers
        .filter((seeker) => {
            return seeker.city && seeker.city.toLowerCase().includes(searchTerm.toLowerCase())
        })
        .filter((seeker) => {
            if (genderFilter === 'Any Gender') {
                return true;
            }
            return seeker.gender === genderFilter;
        });

    return (
        <main className="flex-grow bg-white px-4 py-8">
            <div className="container mx-auto max-w-6xl">

                <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <Link to="/" className="hover:underline">Home</Link>
                    <span>/</span>
                    <Link to="/listings" className="hover:underline">Listings</Link>
                    <span>/</span>
                    <span className="font-semibold text-gray-700">{searchLocation ? searchTerm.split(',')[0] : 'All'}</span>
                </div>

                <div className="mt-4 mb-8 border-b border-gray-200">
                    <div className="flex space-x-8">
                        <button onClick={() => setActiveTab('rooms')} className={`py-4 px-1 border-b-2 font-semibold ${activeTab === 'rooms' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Rooms
                        </button>
                        <button onClick={() => setActiveTab('roommates')} className={`py-4 px-1 border-b-2 font-semibold ${activeTab === 'roommates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Roommates
                        </button>
                    </div>
                </div>
                
                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-lg border">
                    {/* Search Input with Autosuggest */}
                    <div className="w-full md:flex-1 relative">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by location..."
                                    className="w-full px-4 py-2 border rounded-md"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit();
                                        }
                                    }}
                                    autoComplete="off"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <li 
                                                key={index} 
                                                onClick={() => handleSuggestionClick(suggestion)} 
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                                            >
                                                {suggestion.formatted}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <button
                                onClick={handleSearchSubmit}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                Search
                            </button>
                            {searchLocation && (
                                <button
                                    onClick={handleClearSearch}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Gender Filter Dropdown */}
                    <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 border rounded-md bg-white"
                    >
                        <option>Any Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                </div>

                {/* Show active search info */}
                {searchLocation && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-blue-800 font-medium">
                                Showing properties within {MAX_DISTANCE_KM}km of {searchTerm.split(',')[0]}
                            </span>
                        </div>
                        <span className="text-blue-600 text-sm">
                            {displayedProperties.length} found
                        </span>
                    </div>
                )}

                {(activeTab === 'rooms') && (
                    <>
                        {displayedProperties.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    {searchLocation ? 'No Properties Found Nearby' : 'No Properties Available'}
                                </h3>
                                <p className="text-gray-500">
                                    {searchLocation 
                                        ? `Try searching for a different location or increase your search radius.` 
                                        : 'Try adjusting your filters or check back later!'}
                                </p>
                                {searchLocation && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {displayedProperties.map((property) => {
                                    const locationToUse = searchLocation || browserLocation;
                                    let distanceInKm = null;

                                    if (locationToUse && property.lat && property.lng) {
                                        const distanceInMeters = getDistance(
                                            locationToUse,
                                            { latitude: property.lat, longitude: property.lng }
                                        );
                                        distanceInKm = (distanceInMeters / 1000).toFixed(1);
                                    }

                                    if (property.distance && property.distance !== Infinity) {
                                        distanceInKm = (property.distance / 1000).toFixed(1);
                                    }

                                    let matchScore = Math.floor(Math.random() * 20) + 30;
                                    if (userProfile?.preferences && property.listingPreferences?.length > 0) {
                                        const userPrefs = new Set(userProfile.preferences);
                                        const listingPrefs = property.listingPreferences;
                                        const commonPrefs = listingPrefs.filter(pref => userPrefs.has(pref));
                                        matchScore = Math.round((commonPrefs.length / listingPrefs.length) * 100);
                                    }

                                    return (
                                        <PropertyCard
                                            key={property.id}
                                            id={property.id}
                                            name={property.title}
                                            location={property.address}
                                            rent={property.rent || 'N/A'}
                                            lookingFor={property.lookingForGender || 'Any'}
                                            match={matchScore}
                                            avatarUrl={property.imageUrl}
                                            lat={property.lat}
                                            lng={property.lng}
                                            userLocation={userLocation}
                                            owner={property.owner}
                                            distance={distanceInKm}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {(activeTab === 'roommates') && (
                    <div>
                        {filteredSeekers.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Roommates Found</h3>
                                <p className="text-gray-500">Try adjusting your filters or check back later!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                                {filteredSeekers.map((seeker) => {
                                    let distanceInKm = null;
                                    if (userLocation && seeker.lat && seeker.lng) {
                                        const distanceInMeters = getDistance(
                                            { latitude: userLocation.latitude, longitude: userLocation.longitude },
                                            { latitude: seeker.lat, longitude: seeker.lng }
                                        );
                                        distanceInKm = (distanceInMeters / 1000).toFixed(1);
                                    }

                                    let matchScore = Math.floor(Math.random() * 20) + 30;
                                    if (userProfile?.preferences && seeker.preferences?.length > 0) {
                                        const userPrefs = new Set(userProfile.preferences);
                                        const seekerPrefs = seeker.preferences;
                                        const commonPrefs = seekerPrefs.filter(pref => userPrefs.has(pref));
                                        matchScore = Math.round((commonPrefs.length / seekerPrefs.length) * 100);
                                    }

                                    return (
                                        <SeekerCard
                                            key={seeker.id}
                                            seeker={seeker}
                                            distance={distanceInKm}
                                            match={matchScore}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default AllListings;