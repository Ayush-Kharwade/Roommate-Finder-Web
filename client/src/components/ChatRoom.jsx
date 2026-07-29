import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
    doc, getDoc, collection, query, orderBy, onSnapshot,
    addDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import ClipLoader from 'react-spinners/ClipLoader';
import SEO from './SEO.jsx';


function ChatRoom() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    // ---- ALL HOOKS FIRST ----
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const bottomRef = useRef(null);

    // Load the chat document once (participants, names, property context)
    useEffect(() => {
        if (!chatId || !currentUser) {
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'chats', chatId));
                if (!snap.exists()) {
                    setAccessDenied(true);
                    return;
                }
                const data = snap.data();
                if (!data.participants?.includes(currentUser.uid)) {
                    setAccessDenied(true);
                    return;
                }
                setChat({ ...data, id: snap.id });
            } catch (err) {
                console.error('Failed to load chat:', err);
                setAccessDenied(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [chatId, currentUser]);

    // Subscribe to messages in real time
    useEffect(() => {
        if (!chatId || !chat) return;

        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                setMessages(snap.docs.map(d => ({ ...d.data(), id: d.id })));
            },
            (err) => {
                console.error('Message stream error:', err);
                toast.error('Lost connection to this chat.');
            }
        );

        return () => unsubscribe();
    }, [chatId, chat]);

    // Keep the newest message in view
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark this chat read whenever it's open and new messages arrive
    useEffect(() => {
        if (!chatId || !chat || !currentUser) return;
        updateDoc(doc(db, 'chats', chatId), {
            [`lastReadBy.${currentUser.uid}`]: serverTimestamp(),
        }).catch(err => console.error('Failed to mark read:', err));
    }, [chatId, chat, messages.length, currentUser]);

    // ---- HANDLERS ----
    const handleSend = async (e) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || sending) return;

        setSending(true);
        setNewMessage(''); // clear immediately so typing feels responsive

        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                senderId: currentUser.uid,
                text,
                createdAt: serverTimestamp(),
            });

            // Update the parent so the conversations list can show a preview
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: text,
                lastMessageAt: serverTimestamp(),
                lastMessageSender: currentUser.uid,
            });
        } catch (err) {
            console.error('Failed to send message:', err);
            toast.error('Message not sent. Try again.');
            setNewMessage(text); // restore what they typed
        } finally {
            setSending(false);
        }
    };

    // ---- EARLY RETURNS ----
    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center py-20">
                <ClipLoader color="#1B4D3E" size={40} />
            </div>
        );
    }

    if (accessDenied || !chat) {
        return (
            <div className="flex-grow flex items-center justify-center py-20 px-4">
                <div className="text-center">
                    <h2 className="font-serif text-2xl font-bold text-brand-ink mb-2">
                        Conversation not available
                    </h2>
                    <p className="text-gray-500 mb-6">
                        This chat doesn't exist, or you're not part of it.
                    </p>
                    <Link
                        to="/chats"
                        className="inline-block bg-brand-green text-white font-semibold px-6 py-2 rounded-lg hover:bg-brand-green-dark"
                    >
                        Back to messages
                    </Link>
                </div>
            </div>
        );
    }

    // Work out who the other person is
    const otherUid = chat.participants.find(uid => uid !== currentUser.uid);
    const otherName = chat.participantNames?.[otherUid] || 'User';
    const otherPhoto = chat.participantPhotos?.[otherUid];

    return (
        <div className="flex-grow flex flex-col bg-brand-cream">
            <SEO title={`Chat with ${otherName}`} />

            {/* Header */}
            <div className="bg-white border-b border-brand-sand sticky top-0 z-10">
                <div className="container mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/chats')}
                        className="p-2 -ml-2 text-brand-ink hover:text-brand-green"
                        aria-label="Back to messages"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <img
                        src={otherPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=1B4D3E&color=fff`}
                        alt={otherName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                        <p className="font-semibold text-brand-ink truncate">{otherName}</p>
                        {chat.propertyTitle && (
                            <Link
                                to={`/property/${chat.propertyId}`}
                                className="text-xs text-brand-green hover:underline truncate block"
                            >
                                About: {chat.propertyTitle}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto">
                <div className="container mx-auto max-w-3xl px-4 py-6 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-500">
                                No messages yet — say hello to {otherName}.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMine = msg.senderId === currentUser.uid;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                                            isMine
                                                ? 'bg-brand-green text-white rounded-br-sm'
                                                : 'bg-white text-brand-ink border border-brand-sand rounded-bl-sm'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                        <p className={`text-[11px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                                            {msg.createdAt?.toDate
                                                ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : 'Sending...'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Composer */}
            <div className="bg-white border-t border-brand-sand sticky bottom-0">
                <form onSubmit={handleSend} className="container mx-auto max-w-3xl px-4 py-3 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 rounded-xl border border-brand-sand focus:outline-none focus:ring-2 focus:ring-brand-green text-brand-ink"
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-brand-marigold text-brand-ink font-bold px-6 py-3 rounded-xl hover:bg-brand-marigold-dark transition-colors disabled:opacity-40"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatRoom;