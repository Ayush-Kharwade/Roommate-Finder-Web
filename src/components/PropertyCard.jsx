//PropertyCard.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { getDistance } from 'geolib'; // 1. Import the calculation function

function PropertyCard({ id, name, location, rent, lookingFor, match, avatarUrl, owner, lat, lng, userLocation }) {
    const [showContact, setShowContact] = useState(false);

    const handleContactClick = () => {
        if (owner && owner.contactNumber) {
            setShowContact(!showContact);
        } else {
            toast.error("Contact information is not available for this listing.");
        }
    };

    // 2. This is the correct distance calculation logic
    let distanceInKm = null;
    if (userLocation && lat && lng) {
        const distanceInMeters = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: lat, longitude: lng }
        );
        distanceInKm = (distanceInMeters / 1000).toFixed(1); // Convert to km
    }

    return (
        <Link 
            to={`/property/${id}`}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <img className="h-20 w-20 rounded-full object-cover" src={avatarUrl} alt={name} />
                </div>
                <div className="flex-grow">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                        <p className="text-sm text-gray-500">{location}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-700">
                        <div><p className="font-semibold">Rent</p><p className="text-sm">₹{rent}</p></div>
                        <div><p className="font-semibold">Looking for</p><p className="text-sm">{lookingFor}</p></div>
                        <div><p className="font-semibold">Looking for</p><p className="text-sm">Roommate</p></div>
                    </div>
                </div>
            </div>
            <div className="mt-4 border-t border-gray-200 pt-3 flex justify-between items-center text-sm">
                {/* 3. This will now display the correct distance or the fallback text */}
                <p className="text-gray-500">
                    {distanceInKm ? `${distanceInKm} km from your location` : 'Distance unavailable'}
                </p>
                <div className="flex items-center">
                    <span className="text-green-600 font-bold">{match}% Match</span>
                    <div className="ml-4 flex space-x-3">
                        {/* 3. FIX THE BUTTONS */}
                        <button 
                            onClick={(e) => {
                                e.preventDefault(); // Stop navigation
                                e.stopPropagation(); // Stop click from bubbling to the Link
                                // Add your chat logic here
                                toast.success("Chat feature coming soon!");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </button>
                        <button 
                            onClick={(e) => {
                                e.preventDefault(); // Stop navigation
                                e.stopPropagation(); // Stop click from bubbling to the Link
                                handleContactClick(); // Run your original function
                            }} 
                            className="text-gray-400 hover:text-gray-600"
                        >
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            {showContact && (
                <div className="mt-3 text-center bg-blue-50 p-2 rounded-lg">
                    <a href={`tel:${owner.contactNumber}`} className="font-semibold text-blue-600">
                        Call: {owner.contactNumber}
                    </a>
                </div>
            )}
        </Link>
    );
}

export default PropertyCard;