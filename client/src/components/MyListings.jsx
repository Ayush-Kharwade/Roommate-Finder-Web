import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import ClipLoader from 'react-spinners/ClipLoader';
import SEO from './SEO.jsx';

function MyListings() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [seekerProfile, setSeekerProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }
        (async () => {
            try {
                // A user can have room listings, a roommate profile, or both.
                // Only the listings were shown here, which left the roommate
                // profile with no way to be edited or taken down.
                // Seekers are matched on userId, not document ID — older
                // profiles were created with addDoc and have a random ID.
                const [propertySnap, seekerSnap] = await Promise.all([
                    getDocs(query(collection(db, 'properties'), where('ownerId', '==', user.uid))),
                    getDocs(query(collection(db, 'seekers'), where('userId', '==', user.uid), limit(1))),
                ]);
                setListings(propertySnap.docs.map(d => ({ ...d.data(), id: d.id })));
                setSeekerProfile(
                    seekerSnap.empty
                        ? null
                        : { ...seekerSnap.docs[0].data(), id: seekerSnap.docs[0].id }
                );
            } catch (err) {
                console.error('Failed to load your listings:', err);
                toast.error('Could not load your listings.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleDeleteSeeker = async () => {
        if (!window.confirm(
            'Remove your roommate profile? It will stop appearing in search straight away.'
        )) return;
        try {
            await deleteDoc(doc(db, 'seekers', seekerProfile.id));
            setSeekerProfile(null);
            toast.success('Your roommate profile has been removed.');
        } catch (err) {
            console.error('Failed to remove seeker profile:', err);
            toast.error('Could not remove your profile.');
        }
    };

    const handleDelete = async (listingId) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        try {
            await deleteDoc(doc(db, 'properties', listingId));
            setListings(prev => prev.filter(l => l.id !== listingId));
            toast.success('Listing deleted.');
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error('Could not delete listing.');
        }
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 flex-grow">
            <SEO title="My Listings" />
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>
                <Link to="/listing-choice" className="bg-brand-green text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-green-dark">
                    + Add New
                </Link>
            </div>

            {!loading && seekerProfile && (
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">My roommate profile</h2>
                    <div className="bg-white border rounded-lg shadow-sm p-5 flex flex-wrap items-center gap-4 justify-between">
                        <div className="min-w-0">
                            <Link
                                to={`/seeker/${seekerProfile.id}`}
                                className="font-semibold text-gray-900 hover:text-brand-green"
                            >
                                Looking for a room in {seekerProfile.city || 'your area'}
                            </Link>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Budget ₹{Number(seekerProfile.budget || 0).toLocaleString()}/month
                                {seekerProfile.occupancy ? ` · ${seekerProfile.occupancy}` : ''}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => navigate('/add-seeker-profile')}
                                className="bg-yellow-500 text-white text-sm px-4 py-2 rounded hover:bg-yellow-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDeleteSeeker}
                                className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <ClipLoader color="#3b82f6" size={40} />
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No room listings yet</h3>
                    <p className="text-gray-500 mb-4">
                        {seekerProfile
                            ? 'You have a roommate profile above. Post a room too if you have one going spare.'
                            : 'Post your first room or roommate profile to get started.'}
                    </p>
                    <Link to="/listing-choice" className="inline-block bg-brand-green text-white font-semibold px-6 py-2 rounded-lg hover:bg-brand-green-dark">
                        Create a Listing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listings.map(listing => (
                        <div key={listing.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <Link to={`/property/${listing.id}`}>
                                <img
                                    src={listing.imageUrl || 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Photo'}
                                    alt={listing.title}
                                    className="w-full h-40 object-cover"
                                    onError={(e) => { e.target.src = 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Photo'; }}
                                />
                            </Link>
                            <div className="p-4">
                                <Link to={`/property/${listing.id}`} className="font-semibold text-gray-900 hover:text-brand-green truncate block">
                                    {listing.title}
                                </Link>
                                <p className="text-sm text-gray-500 truncate">{listing.address}</p>
                                <p className="text-sm font-semibold text-gray-700 mt-1">₹{listing.rent}/month</p>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => navigate(`/edit-listing/${listing.id}`)} className="flex-1 bg-yellow-500 text-white text-sm py-2 rounded hover:bg-yellow-600">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(listing.id)} className="flex-1 bg-red-500 text-white text-sm py-2 rounded hover:bg-red-600">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyListings;