import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';
import { notifyListingSaved } from '../utils/notifications';

/**
 * Subscribes to the current user's savedListings array.
 *
 * One listener on the user's own document keeps every heart icon across the
 * app in sync — save on a card, and the detail page reflects it immediately.
 * Returns a Set for O(1) lookups plus a toggle function.
 */
export function useSavedListings() {
    const [savedIds, setSavedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setSavedIds(new Set());
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'users', user.uid),
            (snap) => {
                const ids = snap.exists() ? (snap.data().savedListings || []) : [];
                setSavedIds(new Set(ids));
                setLoading(false);
            },
            (err) => {
                console.error('Saved listings listener error:', err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const toggleSave = useCallback(async (listingId) => {
        const user = auth.currentUser;
        if (!user) {
            toast.error('Please log in to save listings.');
            return;
        }

        const isSaved = savedIds.has(listingId);

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                savedListings: isSaved ? arrayRemove(listingId) : arrayUnion(listingId),
            });
            // Notify the owner — only on save, not un-save
            if (!isSaved) {
                const listingSnap = await getDoc(doc(db, 'properties', listingId));
                if (listingSnap.exists()) {
                    const listing = listingSnap.data();
                    notifyListingSaved({
                        listingId,
                        listingTitle: listing.title,
                        ownerId: listing.ownerId,
                        actor: user,
                    });
                }
            }
            toast.success(isSaved ? 'Removed from saved' : 'Saved');
        } catch (err) {
            console.error('Failed to toggle save:', err);
            toast.error('Could not update saved listings.');
        }
    }, [savedIds]);

    return { savedIds, toggleSave, loading };
}