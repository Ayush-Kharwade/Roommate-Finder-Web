// src/components/SeekerDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ClipLoader from "react-spinners/ClipLoader";

// This preference data is still needed
const preferenceOptions = [
    { name: 'Night Owl', emoji: '🦉' }, { name: 'Early Bird', emoji: '🐦' },
    { name: 'Studious', emoji: '📚' }, { name: 'Fitness Freak', emoji: '🏋️' },
    { name: 'Sporty', emoji: '⚽' }, { name: 'Wanderer', emoji: '🚗' },
    { name: 'Party Lover', emoji: '🎉' }, { name: 'Pet Lover', emoji: '🐾' },
    { name: 'Vegan', emoji: '🌱' }, { name: 'Non-Alcoholic', emoji: '💧' },
    { name: 'Music Lover', emoji: '🎵' }, { name: 'Non Smoker', emoji: '🚭' },
];

const seekerHighlights = [
    'Working Professional', 'Student', 'Early Riser',
    'Night Owl', 'Clean & Tidy', 'Social', 'Quiet',
    'Non-Smoker', 'Pet Friendly', 'Vegetarian'
];

function SeekerDetails({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [seeker, setSeeker] = useState(null);
    const [loading, setLoading] = useState(true);

    // This data fetching logic is correct and does not need to change
    useEffect(() => {
        const fetchSeeker = async () => {
            setLoading(true);
            try {
                const seekersRef = collection(db, 'seekers');
                const q = query(seekersRef, where("userId", "==", id));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const seekerDoc = querySnapshot.docs[0];
                    setSeeker({ ...seekerDoc.data(), id: seekerDoc.id });
                } else {
                    console.log("No such seeker document!");
                    setSeeker(null);
                }
            } catch (error) {
                console.error("Error fetching seeker details:", error);
                toast.error("Could not load profile.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSeeker();
        }
    }, [id]);

    const handleChat = () => {
        if (!user) return toast.error("Please log in to start a chat.");
        if (!seeker?.id) return toast.error("Seeker information is not available.");
        if (user.uid === seeker.id) return toast.error("You cannot start a chat with yourself.");
        const chatId = user.uid > seeker.id ? `${user.uid}_${seeker.id}` : `${seeker.id}_${user.uid}`;
        navigate(`/chat/${chatId}`);
    };
    
    const handleContactClick = () => {
        toast.error("Contact information is private. Please use the chat feature to connect.");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <ClipLoader color={"#3b82f6"} size={50} />
            </div>
        );
    }

    if (!seeker) {
        return <div className="text-center text-red-500 text-2xl p-8">Seeker profile not found!</div>;
    }

    const seekerPreferences = seeker.preferences?.map(prefName => {
        return preferenceOptions.find(opt => opt.name === prefName);
    }).filter(Boolean);

    const displayedHighlights = seeker.highlights 
        ? seekerHighlights.filter(h => seeker.highlights.includes(h))
        : [];

    

    // ======================= NEW JSX LAYOUT STARTS HERE =======================
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto max-w-7xl py-8 px-4">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:underline">Home</Link> / 
                    <Link to="/listings" className="hover:underline"> Listings</Link> / 
                    <span className="font-semibold text-gray-700"> {seeker.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar: Main Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6 text-center">
                            <img 
                                src={seeker.profilePicUrl || `https://ui-avatars.com/api/?name=${seeker.name.replace(/\s/g, '+')}&background=random&size=128`} 
                                alt={seeker.name} 
                                className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-100 shadow-sm"
                            />
                            <h2 className="text-2xl font-bold text-gray-900">{seeker.name}</h2>
                            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                {seeker.city}
                            </p>
                            
                            <div className="mt-6 flex gap-4">
                                <button 
                                    onClick={handleChat}
                                    className="flex-1 bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Chat
                                </button>
                                <button 
                                    onClick={handleContactClick}
                                    className="flex-1 border-2 border-green-500 text-green-500 font-semibold py-3 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                    Call
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area: Detailed Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Basic Info</h3>
                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Gender</span>
                                    <p className="font-semibold text-gray-900">{seeker.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Approx Budget</span>
                                    <p className="font-semibold text-gray-900">₹{seeker.budget || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Occupancy</span>
                                    <p className="font-semibold text-gray-900">Single</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Looking For</span>
                                    <p className="font-semibold text-gray-900">A Room</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. ADD THE HIGHLIGHTS CARD HERE */}
                        {displayedHighlights.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Highlights</h3>
                                <div className="flex flex-wrap gap-3">
                                    {displayedHighlights.map((highlight) => (
                                        <div key={highlight} className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-full">
                                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        

                        {/* Preferences Card */}
                        {seekerPreferences && seekerPreferences.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-xl font-bold mb-5 text-gray-800">Preferences</h3>
                                <div className="flex flex-wrap gap-x-8 gap-y-6">
                                    {seekerPreferences.map(pref => (
                                        <div key={pref.name} className="flex flex-col items-center text-center w-16">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                                <span className="text-3xl">{pref.emoji}</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">{pref.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bio / Description Card */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-bold mb-3 text-gray-800">About Me</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {seeker.bio || "This user hasn't written a bio yet."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SeekerDetails;