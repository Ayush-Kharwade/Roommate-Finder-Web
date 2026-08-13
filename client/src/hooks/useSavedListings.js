import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';
import { notifyListingSaved } from '../utils/notifications';

/**
 * Shared store for the current user's savedListings array.
 *
 * The hook is mounted once per PropertyCard, so a 24-card page would otherwise
 * open 24 Firestore listeners on the same document. Instead one module-level
 * subscription fans out to every mounted component, and is torn down when the
 * last one unmounts.
 */
let savedIds = new Set();
let loading = true;
let unsubscribeDoc = null;
let unsubscribeAuth = null;
const subscribers = new Set();

function emit() {
    subscribers.forEach(fn => fn());
}

function watchUser(user) {
    if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
    }

    if (!user) {
        savedIds = new Set();
        loading = false;
        emit();
        return;
    }

    loading = true;
    emit();

    unsubscribeDoc = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
            savedIds = new Set(snap.exists() ? (snap.data().savedListings || []) : []);
            loading = false;
            emit();
        },
        (err) => {
            console.error('Saved listings listener error:', err);
            loading = false;
            emit();
        }
    );
}

function subscribe(fn) {
    subscribers.add(fn);

    // First subscriber starts the auth watcher. Following auth (rather than
    // reading auth.currentUser once) means the list is correct even when a
    // component mounts before Firebase has restored the session.
    if (!unsubscribeAuth) {
        unsubscribeAuth = onAuthStateChanged(auth, watchUser);
    }

    return () => {
        subscribers.delete(fn);
        if (subscribers.size === 0) {
            unsubscribeDoc?.();
            unsubscribeAuth?.();
            unsubscribeDoc = null;
            unsubscribeAuth = null;
            loading = true;
        }
    };
}

export function useSavedListings() {
    const [state, setState] = useState({ savedIds, loading });

    useEffect(() => subscribe(() => setState({ savedIds, loading })), []);

    const toggleSave = useCallback(async (listingId) => {
        const user = auth.currentUser;
        if (!user) {
            toast.error('Please log in to save listings.');
            return;
        }

        const isSaved = savedIds.has(listingId);

        try {
            // setDoc/merge rather than updateDoc: a user who signed up before
            // the users document existed would otherwise hit "No document to
            // update" instead of saving a listing.
            await setDoc(
                doc(db, 'users', user.uid),
                { savedListings: isSaved ? arrayRemove(listingId) : arrayUnion(listingId) },
                { merge: true }
            );

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
        // Reads the module-level store, which is always current — no deps needed.
    }, []);

    return { savedIds: state.savedIds, toggleSave, loading: state.loading };
}
