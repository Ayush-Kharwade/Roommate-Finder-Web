import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
    collection, query, where, orderBy, limit, onSnapshot,
    doc, updateDoc, deleteDoc, writeBatch
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import ClipLoader from 'react-spinners/ClipLoader';
import SEO from './SEO.jsx';

function timeAgo(timestamp) {
    if (!timestamp?.toDate) return '';
    const then = timestamp.toDate();
    const seconds = Math.floor((Date.now() - then.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

const ICONS = {
    save: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
    message: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
};

function Notifications() {
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                setItems(snap.docs.map(d => ({ ...d.data(), id: d.id })));
                setLoading(false);
            },
            (err) => {
                console.error('Notifications listener error:', err);
                setError(true);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    const handleOpen = async (item) => {
        if (!item.read) {
            updateDoc(doc(db, 'notifications', item.id), { read: true })
                .catch(err => console.error('Failed to mark read:', err));
        }
        navigate(item.link);
    };

    const handleMarkAllRead = async () => {
        const unread = items.filter(i => !i.read);
        if (unread.length === 0) return;

        try {
            const batch = writeBatch(db);
            unread.forEach(i => batch.update(doc(db, 'notifications', i.id), { read: true }));
            await batch.commit();
        } catch (err) {
            console.error('Failed to mark all read:', err);
            toast.error('Could not mark all as read.');
        }
    };

    const handleDismiss = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteDoc(doc(db, 'notifications', id));
        } catch (err) {
            console.error('Failed to dismiss:', err);
            toast.error('Could not dismiss.');
        }
    };

    const unreadCount = items.filter(i => !i.read).length;

    return (
        <div className="flex-grow bg-brand-cream">
            <SEO title="Notifications" />
            <div className="container mx-auto max-w-3xl px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-ink">
                        Notifications
                    </h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm font-semibold text-brand-green hover:underline"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <ClipLoader color="#1B4D3E" size={40} />
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-brand-sand">
                        <h3 className="text-xl font-semibold text-brand-ink mb-2">
                            Couldn't load notifications
                        </h3>
                        <p className="text-gray-500">Check your connection and refresh.</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-brand-sand">
                        <svg className="w-16 h-16 mx-auto text-brand-sand mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="text-xl font-semibold text-brand-ink mb-2">You're all caught up</h3>
                        <p className="text-gray-500 mb-6">
                            We'll let you know when someone messages you or saves your listing.
                        </p>
                        <Link
                            to="/listings"
                            className="inline-block bg-brand-green text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-green-dark transition-colors"
                        >
                            Browse listings
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-brand-sand overflow-hidden">
                        {items.map((item, i) => (
                            <div
                                key={item.id}
                                onClick={() => handleOpen(item)}
                                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-brand-cream ${
                                    i !== items.length - 1 ? 'border-b border-brand-sand' : ''
                                } ${!item.read ? 'bg-brand-sand/30' : ''}`}
                            >
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    item.type === 'save'
                                        ? 'bg-brand-marigold/15 text-brand-marigold'
                                        : 'bg-brand-green/10 text-brand-green'
                                }`}>
                                    {ICONS[item.type] || ICONS.message}
                                </div>

                                <div className="min-w-0 flex-grow">
                                    <p className={`text-brand-ink ${!item.read ? 'font-semibold' : ''}`}>
                                        <span className="font-semibold">{item.actorName}</span>{' '}
                                        {item.type === 'message' ? 'sent you a message' : item.message}
                                    </p>
                                    {item.type === 'message' && (
                                        <p className="text-sm text-gray-500 truncate">{item.message}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">{timeAgo(item.createdAt)}</p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!item.read && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-brand-marigold" />
                                    )}
                                    <button
                                        onClick={(e) => handleDismiss(e, item.id)}
                                        className="p-1 text-gray-300 hover:text-gray-500"
                                        aria-label="Dismiss notification"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications;