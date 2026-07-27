import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, addDoc, query, getDocs, serverTimestamp, orderBy, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import ClipLoader from 'react-spinners/ClipLoader';
import SEO from './SEO.jsx';

const preferenceOptions = [
    { name: 'Night Owl', emoji: '🦉' }, { name: 'Early Bird', emoji: '🐦' },
    { name: 'Studious', emoji: '📚' }, { name: 'Fitness Freak', emoji: '🏋️' },
    { name: 'Sporty', emoji: '⚽' }, { name: 'Wanderer', emoji: '🚗' },
    { name: 'Party Lover', emoji: '🎉' }, { name: 'Pet Lover', emoji: '🐾' },
    { name: 'Vegan', emoji: '🌱' }, { name: 'Non-Alcoholic', emoji: '💧' },
    { name: 'Music Lover', emoji: '🎵' }, { name: 'Non Smoker', emoji: '🚭' },
];

// Sample highlights - you can customize these based on your property data structure
const highlightsList = [
    'Attached washroom', 'Market nearby', 'Attached balcony', 'Close to metro station',
    'Public transport nearby', 'Gated society', 'No Restriction', 'Newly built',
    'Separate washrooms', 'House keeping', 'Park nearby', 'Gym nearby'
];

function PropertyDetails({ properties, user }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [loadingProperty, setLoadingProperty] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showContact, setShowContact] = useState(false);
    const [ownerData, setOwnerData] = useState(null);
    const [loadingContact, setLoadingContact] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'properties', id));
                if (snap.exists()) {
                    setProperty({ ...snap.data(), id: snap.id });
                }
            } catch (err) {
                console.error('Failed to load property:', err);
            } finally {
                setLoadingProperty(false);
            }
        })();
    }, [id]);

    const handleChat = () => {
        if (!user) return toast.error('Please log in to start a chat.');
        if (!property.ownerId) return toast.error('Owner information is not available.');
        if (user.uid === property.ownerId) return toast.error('You cannot start a chat with yourself.');
        const chatId = user.uid > property.ownerId
            ? `${user.uid}_${property.ownerId}`
            : `${property.ownerId}_${user.uid}`;
        navigate(`/chat/${chatId}`);
    };

    const handleEdit = () => {
        navigate(`/edit-listing/${property.id}`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return;
        try {
            await deleteDoc(doc(db, 'properties', property.id));
            toast.success('Listing deleted.');
            navigate(`/profile/${user.uid}`);
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error('Could not delete listing.');
        }
    };
    
    const handleContactClick = async () => {
        // Gate behind login — marketplace convention + Firestore rules require it
        if (!user) {
            toast.error('Please log in to view contact details.');
            navigate('/login');
            return;
        }

        // Already fetched — just toggle
        if (ownerData) {
            setShowContact((s) => !s);
            return;
        }

        if (!property.ownerId) {
            toast.error('Owner information is not available.');
            return;
        }

        setLoadingContact(true);
        try {
            const ownerSnap = await getDoc(doc(db, 'users', property.ownerId));
            if (ownerSnap.exists()) {
                setOwnerData(ownerSnap.data());
                setShowContact(true);
            } else {
                toast.error('Owner profile not found.');
            }
        } catch (err) {
            console.error('Failed to fetch owner contact:', err);
            toast.error('Could not load contact details.');
        } finally {
            setLoadingContact(false);
        }
    };

    if (loadingProperty) {
        return <div className="text-center p-8"><ClipLoader color="#3b82f6" size={40} /></div>;
    }
    if (!property) {
        return <div className="text-center text-red-500 text-2xl p-8">Property not found!</div>;
    }

    const propertyPreferences = property.listingPreferences?.map(prefName => {
        return preferenceOptions.find(opt => opt.name === prefName);
    }).filter(Boolean);

    // Create array of images (if you have multiple, otherwise just use the main image)
    const propertyImages = property.imageUrls?.length
        ? property.imageUrls
        : property.imageUrl
            ? [property.imageUrl]
            : [];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
    };

    return (
        <div className="bg-gray-50 min-h-screen">

            {/*SEO*/}
            <SEO
                title={property.title}
                description={`${property.title} in ${property.address} — ₹${property.rent}/month. ${property.description?.slice(0, 100) || ''}`}
                image={property.imageUrl}
            />

            <div className="container mx-auto max-w-7xl py-8 px-4">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6 flex items-center space-x-2">
                    <Link to="/" className="hover:underline">Home</Link>
                    <span>/</span>
                    <Link to="/listings" className="hover:underline">Looking for Roommate</Link>
                    <span>/</span>
                    <span className="font-semibold text-gray-700">{property.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Owner card — public info from denormalized fields, contact gated */}
                        {property.ownerId && (
                            <div className="bg-white rounded-xl shadow-md p-6 text-center">
                                <img
                                    src={property.ownerPhotoUrl || `https://ui-avatars.com/api/?name=${(property.ownerName || 'User').replace(/\s/g, '+')}&background=random`}
                                    alt={property.ownerName || 'Owner'}
                                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-100"
                                />
                                <h3 className="text-xl font-bold text-gray-900">{property.ownerName || 'Anonymous'}</h3>
                                <p className="text-gray-500 text-sm mt-1">{property.address}</p>

                                <div className="mt-6 space-y-3">
                                    {user && property.ownerId === user.uid ? (
                                        // Owner sees management actions
                                        <>
                                            <button
                                                onClick={handleEdit}
                                                className="w-full bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit Listing
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete Listing
                                            </button>
                                        </>
                                    ) : (
                                        // Everyone else sees contact actions
                                        <>
                                            <button
                                                onClick={handleChat}
                                                className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                Chat
                                            </button>
                                            <button
                                                onClick={handleContactClick}
                                                disabled={loadingContact}
                                                className="w-full border-2 border-green-500 text-green-500 font-semibold py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {loadingContact ? 'Loading...' : user ? 'Call' : 'Log in to Call'}
                                            </button>
                                        </>
                                    )}
                                </div>

                                {showContact && ownerData?.contactNumber && (
                                    <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                                        <a href={`tel:${ownerData.contactNumber}`} className="font-semibold text-blue-600">
                                            {ownerData.contactNumber}
                                        </a>
                                    </div>
                                )}
                                {showContact && ownerData && !ownerData.contactNumber && (
                                    <p className="mt-4 text-sm text-gray-500">This user hasn't added a phone number.</p>
                                )}
                            </div>
                        )}

                        {/* Basic Info Card */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold mb-4 pb-3 border-b">Basic Info</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Gender</span>
                                    <span className="font-semibold text-gray-900">
                                        {property.lookingForGender || 'Any'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Approx Rent</span>
                                    <span className="font-semibold text-gray-900">₹{property.rent}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Occupancy</span>
                                    <span className="font-semibold text-gray-900">{property.vacancies || 'Any'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Looking For</span>
                                    <span className="font-semibold text-gray-900">Roommate</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Location */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-3">Location</h2>
                            <div className="flex items-start gap-2 text-gray-600">
                                <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <p>{property.address}</p>
                            </div>
                        </div>

                        {/* Pictures */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Pictures</h2>
                            <div className="relative">
                                {propertyImages.length > 0 ? (
                                    <>
                                        <img 
                                            src={propertyImages[currentImageIndex]} 
                                            alt={property.title} 
                                            className="w-full h-96 object-cover rounded-lg"
                                        />
                                        {propertyImages.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                                {/* Image indicators */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    {propertyImages.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                            className={`w-2 h-2 rounded-full transition-all ${
                                                                index === currentImageIndex ? 'bg-white w-8' : 'bg-white bg-opacity-50'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-400">No image available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preferences */}
                        {propertyPreferences && propertyPreferences.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold mb-4">Preferences</h2>
                                <div className="flex flex-wrap gap-6">
                                    {propertyPreferences.map(pref => (
                                        <div key={pref.name} className="flex flex-col items-center">
                                            <div className="text-4xl mb-2">{pref.emoji}</div>
                                            <span className="text-sm font-medium text-gray-700">{pref.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Highlights */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Highlights</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {highlightsList.map((highlight) => (
                                    <div key={highlight} className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">{highlight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Amenities</h2>
                            {property.amenities?.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {property.amenities.map(amenity => (
                                        <div key={amenity} className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                                <span className="text-2xl">✓</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 text-center">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No amenities listed.</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Description</h2>
                            {property.description ? (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {property.description}
                                </p>
                            ) : (
                                <p className="text-gray-500">No description provided.</p>
                            )}
                        </div>

                        {/* Report Section */}
                        <div className="text-center py-4">
                            <button className="text-gray-500 text-sm hover:text-gray-700">
                                Found wrong information? <span className="text-blue-600 font-semibold">Report Listing</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetails;