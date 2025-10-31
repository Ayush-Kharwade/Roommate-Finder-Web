//SeekerCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth } from '../firebase';

function SeekerCard({ seeker, distance, match }) {
  const { id, name, city, budget, profilePicUrl, userId, gender } = seeker;
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Handler for chat button click
  const handleChat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
        return toast.error("Please log in to start a chat.");
    }
    if (currentUser.uid === userId) {
        return toast.error("You cannot start a chat with yourself.");
    }
    const chatId = currentUser.uid > userId ? `${currentUser.uid}_${userId}` : `${userId}_${currentUser.uid}`;
    navigate(`/chat/${chatId}`);
  };

  const handleContact = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Contact feature coming soon!");
  };

  return (
    <Link 
      to={`/seeker/${seeker.userId}`} 
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <img 
            className="h-20 w-20 rounded-full object-cover" 
            src={profilePicUrl || `https://ui-avatars.com/api/?name=${name?.replace(/\s/g, '+')}&background=random`} 
            alt={name} 
          />
        </div>
        <div className="flex-grow">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{city}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-700">
            <div>
              <p className="font-semibold">Budget</p>
              <p className="text-sm">₹{Number(budget).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold">Gender</p>
              <p className="text-sm">{gender || 'Any'}</p>
            </div>
            <div>
              <p className="font-semibold">Looking for</p>
              <p className="text-sm">Room</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-gray-200 pt-3 flex justify-between items-center text-sm">
        <p className="text-gray-500">
          {distance ? `${distance} km from your location` : 'Distance unavailable'}
        </p>
        <div className="flex items-center">
          <span className="text-green-600 font-bold">{match}% Match</span>
          <div className="ml-4 flex space-x-3">
            <button 
              onClick={handleChat}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
            <button 
              onClick={handleContact}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SeekerCard;