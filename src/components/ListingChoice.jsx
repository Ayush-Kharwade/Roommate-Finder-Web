// src/components/ListingChoice.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function ListingChoice() {
  return (
    <div className="bg-gray-50 flex-grow py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">What would you like to do?</h1>
          <p className="mt-2 text-lg text-gray-500">Choose one of the options below to get started.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Option 1: List a Room */}
          <Link 
            to="/add-listing" 
            className="block p-8 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-blue-500">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">List Your Room</h2>
              <p className="mt-2 text-gray-500">You have a vacant room and are looking for a flatmate.</p>
            </div>
          </Link>

          {/* Option 2: Create a Seeker Profile */}
          <Link 
            to="/add-seeker-profile" 
            className="block p-8 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-green-500">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Find a Room</h2>
              <p className="mt-2 text-gray-500">You are looking for a room and want listers to find you.</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default ListingChoice;