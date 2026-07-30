import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useSavedListings } from '../hooks/useSavedListings';
import ClipLoader from 'react-spinners/ClipLoader';
import SEO from './SEO.jsx';

function SavedListings() {
    const { savedIds, toggleSave, loading: idsLoading } = useSavedListings();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (idsLoading) return;

        if (savedIds.size === 0) {
            setListings([]);
            setLoading(false);
            return;
        }

        (async () => {
            try {
                // Fetch each saved listing by ID. Some may have been deleted by
                // their owner — those resolve to null and get filtered out.
                const docs = await Promise.all(
                    [...savedIds].map(id => getDoc(doc(db, 'properties', id)))
                );
                setListings(
                    docs
                        .filter(d => d.exists())
                        .map(d => ({ ...d.data(), id: d.id }))
                );
            } catch (err) {
                console.error('Failed to load saved listings:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [savedIds, idsLoading]);

    return (
        <div className="flex-grow bg-brand-cream">
            <SEO title="Saved listings" />
            <div className="container mx-auto max-w-4xl px-4 py-10">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-ink mb-6">
                    Saved listings
                </h1>

                {loading ? (
                    <div className="text-center py-16">
                        <ClipLoader color="#1B4D3E" size={40} />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-brand-sand">
                        <svg className="w-16 h-16 mx-auto text-brand-sand mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-brand-ink mb-2">Nothing saved yet</h3>
                        <p className="text-gray-500 mb-6">
                            Tap the heart on any listing to keep it here for later.
                        </p>
                        <Link
                            to="/listings"
                            className="inline-block bg-brand-green text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-green-dark transition-colors"
                        >
                            Browse listings
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listings.map(listing => (
                            <div key={listing.id} className="bg-white border border-brand-sand rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <Link to={`/property/${listing.id}`}>
                                    <img
                                        src={listing.imageUrl || 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Photo'}
                                        alt={listing.title}
                                        className="w-full h-40 object-cover"
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Photo'; }}
                                    />
                                </Link>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <Link to={`/property/${listing.id}`} className="font-semibold text-brand-ink hover:text-brand-green truncate block min-w-0">
                                            {listing.title}
                                        </Link>
                                        <button
                                            onClick={() => toggleSave(listing.id)}
                                            className="flex-shrink-0 text-brand-marigold hover:text-brand-marigold-dark"
                                            aria-label="Remove from saved"
                                        >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{listing.address}</p>
                                    <p className="text-sm font-semibold text-brand-ink mt-1">₹{listing.rent}/month</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SavedListings;