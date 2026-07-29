import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot,  } from 'firebase/firestore';
import ClipLoader from 'react-spinners/ClipLoader';
import SEO from './SEO.jsx';
import { isUnread } from '../utils/chat';

/** Turns a Firestore timestamp into a short relative label. */
function timeAgo(timestamp) {
    if (!timestamp?.toDate) return '';
    const then = timestamp.toDate();
    const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return then.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function ChatList() {
    const currentUser = auth.currentUser;

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        // Chats without lastMessageAt are omitted by orderBy — which is what we
        // want: threads created by a Chat click but never used stay hidden.
        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', currentUser.uid),
            orderBy('lastMessageAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                setChats(snap.docs.map(d => ({ ...d.data(), id: d.id })));
                setLoading(false);
            },
            (err) => {
                console.error('Failed to load conversations:', err);
                setError(true);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="flex-grow bg-brand-cream">
            <SEO title="Messages" />
            <div className="container mx-auto max-w-3xl px-4 py-10">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-ink mb-6">
                    Messages
                </h1>

                {loading ? (
                    <div className="text-center py-16">
                        <ClipLoader color="#1B4D3E" size={40} />
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-brand-sand">
                        <h3 className="text-xl font-semibold text-brand-ink mb-2">
                            Couldn't load your messages
                        </h3>
                        <p className="text-gray-500">Check your connection and refresh.</p>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-brand-sand">
                        <svg className="w-16 h-16 mx-auto text-brand-sand mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-brand-ink mb-2">No messages yet</h3>
                        <p className="text-gray-500 mb-6">
                            Find a room or flatmate you like, then hit Chat to start talking.
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
                        {chats.map((chat, i) => {
                            const otherUid = chat.participants.find(uid => uid !== currentUser.uid);
                            const otherName = chat.participantNames?.[otherUid] || 'User';
                            const otherPhoto = chat.participantPhotos?.[otherUid];
                            const sentByMe = chat.lastMessageSender === currentUser.uid;
                            const unread = isUnread(chat, currentUser.uid);

                            return (
                                <Link
                                    key={chat.id}
                                    to={`/chat/${chat.id}`}
                                    className={`flex items-center gap-4 p-4 hover:bg-brand-cream transition-colors ${
                                        i !== chats.length - 1 ? 'border-b border-brand-sand' : ''
                                    }`}
                                >
                                    <img
                                        src={otherPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=1B4D3E&color=fff`}
                                        alt={otherName}
                                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-grow">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className={`truncate ${unread ? 'font-bold text-brand-ink' : 'font-semibold text-brand-ink'}`}>
                                                {otherName}
                                            </p>
                                            <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-2">
                                                {timeAgo(chat.lastMessageAt)}
                                                {unread && <span className="w-2.5 h-2.5 rounded-full bg-brand-marigold" />}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${unread ? 'text-brand-ink font-medium' : 'text-gray-500'}`}>
                                            {sentByMe && <span className="text-gray-400">You: </span>}
                                            {chat.lastMessage}
                                        </p>
                                        {chat.propertyTitle && (
                                            <p className="text-xs text-brand-green truncate mt-0.5">
                                                {chat.propertyTitle}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatList;